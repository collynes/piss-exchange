import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES, formatNumber } from '@/lib/utils'

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 16px 40px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
} as const

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
      .limit(10),
    supabase.from('trades')
      .select('id, qty, price_per_unit, executed_at, drugs(generic_name)')
      .order('executed_at', { ascending: false })
      .limit(8),
  ])

  const totalDeals = totals?.reduce((s, r) => s + (r.deals_today ?? 0), 0) ?? 0
  const totalTurnover = totals?.reduce((s, r) => s + Number(r.turnover_today ?? 0), 0) ?? 0

  const stats = [
    { label: 'Users', value: formatNumber(userCount ?? 0) },
    { label: 'Pending', value: formatNumber(pendingCount ?? 0), alert: (pendingCount ?? 0) > 0 },
    { label: 'Listings', value: formatNumber(listingCount ?? 0) },
    { label: 'Orders', value: formatNumber(orderCount ?? 0) },
    { label: "Today's Deals", value: formatNumber(totalDeals) },
    { label: "Today's Turnover", value: formatKES(totalTurnover) },
  ]

  return (
    <div className="max-w-5xl space-y-6">

      {/* Stats bar — TV style */}
      <div className="flex items-center gap-8 px-4 py-3 rounded-xl overflow-x-auto" style={GLASS}>
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted">{s.label}</span>
            <span className={`text-sm font-bold tabular-nums ${s.alert ? 'text-red' : 'text-text'}`}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending verifications */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-muted uppercase tracking-wider">
              Pending Verification
              {(pendingCount ?? 0) > 0 && (
                <span className="ml-2 text-red">({pendingCount})</span>
              )}
            </div>
            <Link href="/admin/users" className="text-xs text-blue hover:underline">All users →</Link>
          </div>
          <div className="rounded-xl overflow-hidden" style={GLASS}>
            <table className="w-full">
              <thead className="bg-surface2/40">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-text uppercase tracking-wider">Org</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {(pendingUsers ?? []).length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-5 text-center text-muted text-xs">No pending verifications</td></tr>
                )}
                {(pendingUsers ?? []).map((u, i) => (
                  <tr key={u.id} className={`hover:bg-surface2 transition-colors ${i % 2 === 1 ? 'bg-surface2/30' : ''}`}>
                    <td className="px-4 py-2.5">
                      <div className="text-sm font-semibold text-text">{u.org_name}</div>
                      <div className="text-xs text-muted">{u.license_no ?? 'No license'}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted capitalize">{u.role}</td>
                    <td className="px-4 py-2.5 text-right">
                      <form action={`/api/admin/users/${u.id}/verify`} method="POST" className="inline">
                        <button type="submit"
                          className="text-xs px-2.5 py-1 bg-green/10 text-green rounded hover:bg-green/20 transition-colors font-semibold"
                          style={{ border: '1px solid rgba(8,153,129,0.3)' }}>
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
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-muted uppercase tracking-wider">Recent Orders</div>
            <Link href="/admin/orders" className="text-xs text-blue hover:underline">All orders →</Link>
          </div>
          <div className="rounded-xl overflow-hidden" style={GLASS}>
            <table className="w-full">
              <thead className="bg-surface2/40">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-text uppercase tracking-wider">Drug</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Total</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders ?? []).length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-5 text-center text-muted text-xs">No orders yet</td></tr>
                )}
                {(recentOrders ?? []).map((order, i) => {
                  const drug = order.drugs as { generic_name: string } | null
                  return (
                    <tr key={order.id} className={`hover:bg-surface2 transition-colors ${i % 2 === 1 ? 'bg-surface2/30' : ''}`}>
                      <td className="px-4 py-2.5">
                        <Link href={`/orders/${order.id}`} className="text-sm text-text hover:text-blue transition-colors">
                          {drug?.generic_name ?? '—'}
                        </Link>
                        <div className="text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-text tabular-nums">
                        {formatKES(Number(order.total_amount))}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="text-xs text-muted capitalize bg-surface2 px-2 py-0.5 rounded">{order.status}</span>
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
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Recent Trades</div>
        <div className="rounded-xl overflow-hidden" style={GLASS}>
          <table className="w-full">
            <thead className="bg-surface2/40">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-text uppercase tracking-wider">Drug</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Qty</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Price</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Total</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {(recentTrades ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-5 text-center text-muted text-xs">No trades yet</td></tr>
              )}
              {(recentTrades ?? []).map((trade, i) => {
                const drug = trade.drugs as { generic_name: string } | null
                return (
                  <tr key={trade.id} className={`hover:bg-surface2 transition-colors ${i % 2 === 1 ? 'bg-surface2/30' : ''}`}>
                    <td className="px-4 py-2.5 text-sm font-semibold text-text">{drug?.generic_name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{trade.qty.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{Number(trade.price_per_unit).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-green tabular-nums">
                      {formatKES(trade.qty * Number(trade.price_per_unit))}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted">
                      {new Date(trade.executed_at as string).toLocaleString('en-KE', { hour: '2-digit', minute: '2-digit' })}
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
