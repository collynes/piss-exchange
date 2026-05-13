import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES, formatNumber } from '@/lib/utils'
import { Users, Package, ShoppingBag, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'

const CARD = { boxShadow: '0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)' } as const

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-muted/15 text-muted',
  paid:      'bg-blue/12 text-blue',
  confirmed: 'bg-blue/12 text-blue',
  shipped:   'bg-green/12 text-green',
  delivered: 'bg-green/15 text-green',
  cancelled: 'bg-red/12 text-red',
  disputed:  'bg-red/12 text-red',
}

function StatCard({
  label, value, sub, Icon, color, alert,
}: {
  label: string; value: string; sub?: string
  Icon: React.ElementType; color: { bg: string; text: string }; alert?: boolean
}) {
  return (
    <div className="rounded-2xl p-5 bg-surface" style={CARD}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color.bg }}>
          <Icon className="w-4 h-4" style={{ color: color.text }} />
        </div>
      </div>
      <div className={`text-2xl font-black tabular-nums ${alert ? 'text-red' : 'text-text'}`}>{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
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
    <div className="max-w-5xl space-y-6">

      {/* Welcome */}
      <div>
        <h1 className="text-lg font-bold text-text">Admin Overview</h1>
        <div className="text-xs text-muted mt-0.5">Platform management and monitoring</div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={formatNumber(userCount ?? 0)}
          sub="registered accounts"
          Icon={Users}
          color={{ bg: 'rgba(41,98,255,0.15)', text: '#2962ff' }}
        />
        <StatCard
          label="Pending KYC"
          value={formatNumber(pendingCount ?? 0)}
          sub="need verification"
          Icon={AlertCircle}
          color={{ bg: 'rgba(242,54,69,0.12)', text: '#f23645' }}
          alert={(pendingCount ?? 0) > 0}
        />
        <StatCard
          label="Active Listings"
          value={formatNumber(listingCount ?? 0)}
          sub="live on exchange"
          Icon={Package}
          color={{ bg: 'rgba(8,153,129,0.15)', text: '#089981' }}
        />
        <StatCard
          label="Total Orders"
          value={formatNumber(orderCount ?? 0)}
          sub="all time"
          Icon={ShoppingBag}
          color={{ bg: 'rgba(124,58,237,0.15)', text: '#a78bfa' }}
        />
      </div>

      {/* Today's trading summary */}
      <div className="rounded-2xl px-5 py-3.5 bg-surface flex items-center gap-8 overflow-x-auto" style={CARD}>
        <div>
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Today&apos;s Deals</div>
          <div className="text-sm font-black text-text tabular-nums">{formatNumber(totalDeals)}</div>
        </div>
        <div className="w-px h-8 bg-white/5 flex-shrink-0" />
        <div>
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Today&apos;s Turnover</div>
          <div className="text-sm font-black text-green tabular-nums">{formatKES(totalTurnover)}</div>
        </div>
        <div className="ml-auto flex-shrink-0">
          <Link href="/market" className="text-xs text-blue flex items-center gap-1 hover:underline">
            View Market <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending verifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-text">Pending Verification</h2>
              {(pendingCount ?? 0) > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red/12 text-red">{pendingCount}</span>
              )}
            </div>
            <Link href="/admin/users" className="text-xs text-blue flex items-center gap-1 hover:underline">
              All users <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden bg-surface" style={CARD}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-muted uppercase tracking-wider">Organisation</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {(pendingUsers ?? []).length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-muted text-sm">No pending verifications</td></tr>
                )}
                {(pendingUsers ?? []).map((u, i) => (
                  <tr key={u.id}
                    className="hover:bg-surface2/30 transition-colors"
                    style={{ borderBottom: i < (pendingUsers?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                    <td className="px-5 py-3">
                      <div className="text-[13px] font-semibold text-text">{u.org_name}</div>
                      <div className="text-xs text-muted">{u.license_no ?? 'No license on file'}</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted/15 text-muted capitalize">{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={`/api/admin/users/${u.id}/verify`} method="POST" className="inline">
                        <button type="submit"
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green/12 text-green hover:bg-green/20 transition-colors">
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

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-blue flex items-center gap-1 hover:underline">
              All orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden bg-surface" style={CARD}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-muted uppercase tracking-wider">Drug</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders ?? []).length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-muted text-sm">No orders yet</td></tr>
                )}
                {(recentOrders ?? []).map((order, i) => {
                  const drug = order.drugs as { generic_name: string } | null
                  return (
                    <tr key={order.id}
                      className="hover:bg-surface2/30 transition-colors"
                      style={{ borderBottom: i < (recentOrders?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                      <td className="px-5 py-3">
                        <Link href={`/orders/${order.id}`} className="text-[13px] font-semibold text-text hover:text-blue transition-colors">
                          {drug?.generic_name ?? '—'}
                        </Link>
                        <div className="text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</div>
                      </td>
                      <td className="px-5 py-3 text-right text-[13px] font-bold text-text tabular-nums">
                        {formatKES(Number(order.total_amount))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
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

      {/* Recent trades */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text">Recent Trades</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="text-xs text-muted">Live</span>
          </div>
        </div>
        <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
          <table className="w-full min-w-[540px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Drug', 'Qty', 'Price/unit', 'Total', 'Time'].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-[11px] font-bold text-muted uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentTrades ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted text-sm">No trades yet</td></tr>
              )}
              {(recentTrades ?? []).map((trade, i) => {
                const drug = trade.drugs as { generic_name: string } | null
                return (
                  <tr key={trade.id}
                    className="hover:bg-surface2/30 transition-colors"
                    style={{ borderBottom: i < (recentTrades?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                    <td className="px-5 py-3 text-[13px] font-semibold text-text">{drug?.generic_name ?? '—'}</td>
                    <td className="px-5 py-3 text-right text-[13px] text-text tabular-nums">{trade.qty.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-[13px] text-text tabular-nums">{Number(trade.price_per_unit).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-[13px] font-bold text-green tabular-nums">
                      {formatKES(trade.qty * Number(trade.price_per_unit))}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted">
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
