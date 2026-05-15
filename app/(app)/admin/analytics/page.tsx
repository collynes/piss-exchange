import { redirect } from 'next/navigation'
import { Activity, AlertTriangle, BarChart3, Clock, FileText, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatKES, formatNumber } from '@/lib/utils'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-label-warning text-warning',
  paid: 'bg-label-primary text-primary',
  confirmed: 'bg-label-primary text-primary',
  shipped: 'bg-label-warning text-warning',
  delivered: 'bg-label-success text-success',
  cancelled: 'bg-label-danger text-danger',
  disputed: 'bg-label-danger text-danger',
}

type LogRow = {
  id: string
  event: string
  level: string
  source: string
  distinct_id: string | null
  properties: Record<string, unknown> | null
  created_at: string
}

type LogQueryResult = { data: LogRow[] | null; error: { message: string } | null }
type LogQueryClient = {
  from: (table: 'app_event_logs') => {
    select: (columns: string) => {
      order: (column: string, options: { ascending: boolean }) => {
        limit: (count: number) => Promise<LogQueryResult>
      }
    }
  }
}

function startOfDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function StatCard({
  label, value, sub, Icon, tone = 'primary',
}: {
  label: string
  value: string
  sub?: string
  Icon: React.ElementType
  tone?: 'primary' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <span className="small fw-semibold text-muted text-uppercase">{label}</span>
          <span className={`avatar-initial rounded bg-label-${tone}`}>
            <Icon className={`w-4 h-4 text-${tone}`} />
          </span>
        </div>
        <h4 className="mb-1">{value}</h4>
        {sub && <small className="text-muted">{sub}</small>}
      </div>
    </div>
  )
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const adminSupabase = createAdminClient()
  const now = new Date()
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const [
    { data: orders },
    { data: trades },
    { data: listings },
    { data: payments },
    { data: users },
    logResult,
  ] = await Promise.all([
    supabase.from('orders').select('id, status, escrow_status, total_amount, created_at').order('created_at', { ascending: false }).limit(500),
    supabase.from('trades').select('id, qty, total_amount, executed_at, drugs(generic_name)').order('executed_at', { ascending: false }).limit(200),
    supabase.from('listings').select('id, status, qty_remaining, qty_available, price_per_unit, created_at, drugs(generic_name)').order('created_at', { ascending: false }).limit(500),
    supabase.from('payments').select('id, status, amount, created_at, updated_at').order('created_at', { ascending: false }).limit(500),
    supabase.from('profiles').select('id, role, verified, created_at').order('created_at', { ascending: false }).limit(500),
    (adminSupabase as unknown as LogQueryClient)
      .from('app_event_logs')
      .select('id, event, level, source, distinct_id, properties, created_at')
      .order('created_at', { ascending: false })
      .limit(80),
  ])

  const logs: LogRow[] = logResult?.error ? [] : (logResult?.data ?? [])
  const deliveredOrders = (orders ?? []).filter(o => o.status === 'delivered')
  const failedPayments = (payments ?? []).filter(p => p.status === 'failed')
  const pendingOrders = (orders ?? []).filter(o => o.status === 'pending')
  const stalePending = pendingOrders.filter(o => now.getTime() - new Date(o.created_at as string).getTime() > 30 * 60 * 1000)
  const lowStock = (listings ?? []).filter(l => l.status === 'active' && l.qty_available > 0 && l.qty_remaining / l.qty_available <= 0.15)

  const totalGMV = deliveredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
  const tradeCount = trades?.length ?? 0
  const activeListings = (listings ?? []).filter(l => l.status === 'active').length
  const verifiedUsers = (users ?? []).filter(u => u.verified).length
  const verificationRate = users?.length ? Math.round((verifiedUsers / users.length) * 100) : 0

  const orderStatusCounts = (orders ?? []).reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1
    return acc
  }, {})

  const userRoleCounts = (users ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.role] = (acc[row.role] ?? 0) + 1
    return acc
  }, {})

  const sevenDays = Array.from({ length: 7 }, (_, index) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - index))
    return startOfDayKey(d)
  })

  const dailyOrders = sevenDays.map(day => ({
    day,
    count: (orders ?? []).filter(order => startOfDayKey(new Date(order.created_at as string)) === day).length,
    total: (orders ?? [])
      .filter(order => startOfDayKey(new Date(order.created_at as string)) === day)
      .reduce((sum, order) => sum + Number(order.total_amount), 0),
  }))
  const maxDailyCount = Math.max(...dailyOrders.map(d => d.count), 1)

  const recentEvents = logs.slice(0, 20)

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <h4 className="mb-1">Analytics & Logs</h4>
          <p className="text-muted mb-0">Operational telemetry, order health, and audit trail</p>
        </div>
        <span className={`badge rounded-pill ${logs.length ? 'bg-label-success text-success' : 'bg-label-warning text-warning'}`}>
          {logs.length ? 'Logging active' : 'Migration pending'}
        </span>
      </div>

      <div className="row g-4">
        <div className="col-6 col-xl-3">
          <StatCard label="Delivered GMV" value={formatKES(totalGMV)} sub="released orders" Icon={BarChart3} tone="success" />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Active Listings" value={formatNumber(activeListings)} sub={`${lowStock.length} low-stock · ${tradeCount} trades`} Icon={Activity} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Verification Rate" value={`${verificationRate}%`} sub={`${verifiedUsers}/${users?.length ?? 0} users`} Icon={ShieldCheck} />
        </div>
        <div className="col-6 col-xl-3">
          <StatCard label="Needs Attention" value={formatNumber(stalePending.length + failedPayments.length)} sub="stale orders + failed payments" Icon={AlertTriangle} tone={stalePending.length || failedPayments.length ? 'danger' : 'success'} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">7-Day Order Volume</h5>
              <small className="text-muted">Count and value by day</small>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-end gap-3" style={{ minHeight: 180 }}>
                {dailyOrders.map(day => (
                  <div key={day.day} className="flex-fill d-flex flex-column align-items-center gap-2">
                    <div className="w-100 rounded bg-label-primary position-relative" style={{ height: 140 }}>
                      <div
                        className="position-absolute bottom-0 start-0 end-0 rounded bg-primary"
                        style={{ height: `${Math.max((day.count / maxDailyCount) * 100, day.count ? 8 : 0)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="fw-semibold text-heading">{day.count}</div>
                      <small className="text-muted">{day.day.slice(5)}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">System Health</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <tbody>
                  {[
                    ['Failed payments', failedPayments.length, failedPayments.length ? 'danger' : 'success'],
                    ['Pending > 30 min', stalePending.length, stalePending.length ? 'warning' : 'success'],
                    ['Low stock listings', lowStock.length, lowStock.length ? 'warning' : 'success'],
                    ['Audit events', logs.length, logs.length ? 'success' : 'warning'],
                  ].map(([label, value, tone]) => (
                    <tr key={label as string}>
                      <td className="fw-semibold text-heading">{label}</td>
                      <td className="text-end">
                        <span className={`badge rounded-pill bg-label-${tone} text-${tone}`}>{value}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Order Status Mix</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Status</th>
                    <th className="text-end">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(orderStatusCounts).map(([status, count]) => (
                    <tr key={status}>
                      <td><span className={`badge rounded-pill text-capitalize ${STATUS_COLOR[status] ?? 'bg-label-secondary text-muted'}`}>{status}</span></td>
                      <td className="text-end fw-semibold">{formatNumber(count)}</td>
                    </tr>
                  ))}
                  {Object.keys(orderStatusCounts).length === 0 && (
                    <tr><td colSpan={2} className="text-center text-muted py-5">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Users by Role</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Role</th>
                    <th className="text-end">Users</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(userRoleCounts).map(([role, count]) => (
                    <tr key={role}>
                      <td className="text-capitalize fw-semibold text-heading">{role}</td>
                      <td className="text-end fw-semibold">{formatNumber(count)}</td>
                    </tr>
                  ))}
                  {Object.keys(userRoleCounts).length === 0 && (
                    <tr><td colSpan={2} className="text-center text-muted py-5">No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Telemetry Logs</h5>
          <div className="d-flex align-items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <small className="text-muted">{recentEvents.length} recent events</small>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Event</th>
                <th>Level</th>
                <th>Actor</th>
                <th>Properties</th>
                <th className="text-end">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map(log => (
                <tr key={log.id}>
                  <td className="fw-semibold text-heading">{log.event}</td>
                  <td><span className={`badge rounded-pill bg-label-${log.level === 'error' ? 'danger' : log.level === 'warning' ? 'warning' : 'primary'} text-${log.level === 'error' ? 'danger' : log.level === 'warning' ? 'warning' : 'primary'}`}>{log.level}</span></td>
                  <td className="text-muted font-monospace small">{log.distinct_id?.slice(0, 8) ?? 'system'}</td>
                  <td className="text-muted small">{Object.keys(log.properties ?? {}).slice(0, 4).join(', ') || 'none'}</td>
                  <td className="text-end text-muted small">
                    <Clock className="w-3 h-3 d-inline me-1" />
                    {new Date(log.created_at).toLocaleString('en-KE')}
                  </td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-5">
                    No internal logs yet. Apply the app_event_logs migration to persist telemetry here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
