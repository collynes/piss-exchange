import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES, formatNumber } from '@/lib/utils'
import { Users, Package, ShoppingBag, AlertCircle, ArrowRight } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-label-warning text-warning',
  paid:      'bg-label-primary text-primary',
  confirmed: 'bg-label-primary text-primary',
  shipped:   'bg-label-warning text-warning',
  delivered: 'bg-label-success text-success',
  cancelled: 'bg-label-danger text-danger',
  disputed:  'bg-label-danger text-danger',
}

function StatCard({
  label, value, sub, Icon, color, alert,
}: {
  label: string; value: string; sub?: string
  Icon: React.ElementType; color: { bg: string; text: string }; alert?: boolean
}) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <span className="small fw-semibold text-muted text-uppercase">{label}</span>
          <span className="avatar-initial rounded bg-label-primary">
            <Icon className="w-4 h-4" style={{ color: color.text }} />
          </span>
        </div>
        <h4 className={`mb-1 ${alert ? 'text-danger' : ''}`}>{value}</h4>
        {sub && <small className="text-muted">{sub}</small>}
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [
    { count: userCount },
    { count: pendingCount },
    { count: listingCount },
    { count: orderCount },
    { data: totals },
    { data: pendingUsers },
    { data: recentOrders },
    { data: recentTrades },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified', false),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('market_data').select('deals_today, turnover_today'),
    supabase.from('profiles')
      .select('id, org_name, role, license_no, created_at')
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('orders')
      .select('id, qty, total_amount, status, created_at, drugs(generic_name)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('trades')
      .select('id, qty, price_per_unit, executed_at, drugs(generic_name)')
      .order('executed_at', { ascending: false })
      .limit(6),
  ])

  const totalTurnover = totals?.reduce((s, r) => s + Number(r.turnover_today ?? 0), 0) ?? 0
  const totalDeals = totals?.reduce((s, r) => s + (r.deals_today ?? 0), 0) ?? 0

  return (
    <div className="d-flex flex-column gap-4">

      {/* Page header */}
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <h4 className="mb-1">Admin Overview</h4>
          <p className="text-muted mb-0">Platform management and monitoring</p>
        </div>
        {/* Today's trading — inline, no card */}
        <div className="text-end d-none d-sm-block">
          <div className="small fw-semibold text-muted text-uppercase">Today</div>
          <div className="d-flex align-items-center gap-4 mt-1">
            <div>
              <span className="small text-muted">Deals </span>
              <span className="fw-bold text-heading">{formatNumber(totalDeals)}</span>
            </div>
            <div>
              <span className="small text-muted">Turnover </span>
              <span className="fw-bold text-success">{formatKES(totalTurnover)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="row g-4">
        <div className="col-6 col-md-3">
        <StatCard
          label="Total Users"
          value={formatNumber(userCount ?? 0)}
          sub="registered accounts"
          Icon={Users}
          color={{ bg: 'rgba(115,103,240,.15)', text: '#7367f0' }}
        />
        </div>
        <div className="col-6 col-md-3">
        <StatCard
          label="Pending KYC"
          value={formatNumber(pendingCount ?? 0)}
          sub="need verification"
          Icon={AlertCircle}
          color={{ bg: 'rgba(234,84,85,.12)', text: '#ea5455' }}
          alert={(pendingCount ?? 0) > 0}
        />
        </div>
        <div className="col-6 col-md-3">
        <StatCard
          label="Active Listings"
          value={formatNumber(listingCount ?? 0)}
          sub="live on exchange"
          Icon={Package}
          color={{ bg: 'rgba(40,199,111,.15)', text: '#28c76f' }}
        />
        </div>
        <div className="col-6 col-md-3">
        <StatCard
          label="Total Orders"
          value={formatNumber(orderCount ?? 0)}
          sub="all time"
          Icon={ShoppingBag}
          color={{ bg: 'rgba(124,58,237,0.15)', text: '#a78bfa' }}
        />
        </div>
      </div>

      {/* Tables row */}
      <div className="row g-4">

        {/* Pending verifications */}
        <div className="col-lg-6">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <h5 className="mb-0">Pending Verification</h5>
              {(pendingCount ?? 0) > 0 && (
                <span className="badge rounded-pill bg-label-danger text-danger">{pendingCount}</span>
              )}
            </div>
            <Link href="/admin/users" className="btn btn-sm btn-text-primary d-inline-flex align-items-center gap-1">
              All users <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Organisation</th>
                <th className="text-end">Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(pendingUsers ?? []).length === 0 && (
                <tr><td colSpan={3} className="p-5 text-center text-muted">No pending verifications</td></tr>
              )}
              {(pendingUsers ?? []).map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="fw-semibold text-heading">{u.org_name}</div>
                    <small className="text-muted">{u.license_no ?? 'No license on file'}</small>
                  </td>
                  <td className="text-end">
                    <span className="badge rounded-pill bg-label-secondary text-muted text-capitalize">{u.role}</span>
                  </td>
                  <td className="text-end">
                    <form action={`/api/admin/users/${u.id}/verify`} method="POST" className="inline">
                      <button type="submit"
                        className="btn btn-sm btn-primary">
                        Verify
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        </div>

        {/* Recent orders */}
        <div className="col-lg-6">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Recent Orders</h5>
            <Link href="/admin/orders" className="btn btn-sm btn-text-primary d-inline-flex align-items-center gap-1">
              All orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Drug</th>
                <th className="text-end">Total</th>
                <th className="text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders ?? []).length === 0 && (
                <tr><td colSpan={3} className="p-5 text-center text-muted">No orders yet</td></tr>
              )}
              {(recentOrders ?? []).map(order => {
                const drug = order.drugs as { generic_name: string } | null
                return (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/orders/${order.id}`} className="fw-semibold text-heading">
                        {drug?.generic_name ?? '—'}
                      </Link>
                      <small className="d-block text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</small>
                    </td>
                    <td className="text-end fw-bold">
                      {formatKES(Number(order.total_amount))}
                    </td>
                    <td className="text-end">
                      <span className={`badge rounded-pill text-capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
        </div>

      </div>

      {/* Recent trades */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Recent Trades</h5>
          <div className="d-flex align-items-center gap-2">
            <span className="badge badge-dot bg-success" />
            <small className="text-muted">Live</small>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                {['Drug', 'Qty', 'Price/unit', 'Total', 'Time'].map((h, i) => (
                  <th key={i} className={i === 0 ? '' : 'text-end'}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentTrades ?? []).length === 0 && (
                <tr><td colSpan={5} className="p-5 text-center text-muted">No trades yet</td></tr>
              )}
              {(recentTrades ?? []).map(trade => {
                const drug = trade.drugs as { generic_name: string } | null
                return (
                  <tr key={trade.id}>
                    <td className="fw-semibold text-heading">{drug?.generic_name ?? '—'}</td>
                    <td className="text-end">{trade.qty.toLocaleString()}</td>
                    <td className="text-end">{Number(trade.price_per_unit).toFixed(2)}</td>
                    <td className="text-end fw-bold text-success">
                      {formatKES(trade.qty * Number(trade.price_per_unit))}
                    </td>
                    <td className="text-end text-muted">
                      {new Date(trade.executed_at as string).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
