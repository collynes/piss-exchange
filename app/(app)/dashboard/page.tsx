import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:   'bg-muted/20 text-muted',
  paid:      'bg-blue/10 text-blue',
  confirmed: 'bg-blue/10 text-blue',
  shipped:   'bg-green/10 text-green',
  delivered: 'bg-green/10 text-green',
  cancelled: 'bg-red/10 text-red',
  disputed:  'bg-red/10 text-red',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const { registered } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, org_name, verified')
    .eq('id', user.id)
    .single()

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, drug_id, qty, price_per_unit, total_amount, status, created_at, drugs(generic_name, slug)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-5xl">
      {registered && (
        <div className="bg-green/10 border border-green/30 text-green text-sm p-4 rounded mb-6">
          Account created! Your account is pending verification. You will receive an email once approved.
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-text">{profile?.org_name}</h1>
          <div className="text-xs text-muted mt-0.5 flex items-center gap-2">
            <span className="capitalize">{profile?.role}</span>
            {profile?.verified
              ? <span className="bg-green/10 text-green text-[10px] px-1.5 py-0.5 rounded font-semibold">Verified</span>
              : <span className="bg-muted/10 text-muted text-[10px] px-1.5 py-0.5 rounded font-semibold">Pending Verification</span>
            }
          </div>
        </div>
        <Link href="/market" className="px-3 py-1.5 bg-blue text-white text-xs font-semibold rounded hover:bg-blue/90 transition-colors">
          Browse Market
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { href: '/market', label: 'Browse Drugs', desc: 'View live order books' },
          { href: '/orders', label: 'My Orders', desc: 'Track all your orders' },
          { href: '/profile', label: 'My Profile', desc: 'Account & verification' },
        ].concat(
          profile?.role === 'seller' || profile?.role === 'admin' ? [
            { href: '/seller/listings/new', label: '+ List Drug', desc: 'Add stock to exchange' },
            { href: '/seller/listings', label: 'My Listings', desc: 'Manage active stock' },
            { href: '/seller/orders', label: 'Incoming Orders', desc: 'Confirm & ship' },
          ] : []
        ).map(link => (
          <Link key={link.href} href={link.href}
            className="bg-surface border border-border rounded p-4 hover:border-blue/40 transition-colors group">
            <div className="text-sm font-semibold text-text group-hover:text-blue transition-colors">{link.label}</div>
            <div className="text-xs text-muted mt-0.5">{link.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-text">Recent Orders</span>
          <Link href="/orders" className="text-xs text-blue hover:underline">All orders →</Link>
        </div>
        <div className="bg-surface border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border bg-surface2/40">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-text uppercase tracking-wider">Drug</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Qty</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Total</th>
                <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders ?? []).map((order, i) => {
                const drug = order.drugs as { generic_name: string; slug: string } | null
                return (
                  <tr key={order.id} className={`hover:bg-surface2 transition-colors ${i % 2 === 1 ? 'bg-surface2/30' : ''}`}>
                    <td className="px-4 py-2.5">
                      <Link href={`/orders/${order.id}`} className="text-sm text-text hover:text-blue transition-colors">
                        {drug?.generic_name ?? '—'}
                      </Link>
                      <div className="text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{order.qty.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums font-semibold">{formatKES(Number(order.total_amount))}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${ORDER_STATUS_COLOR[order.status] ?? 'text-muted'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {(recentOrders ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted text-sm">No orders yet. <Link href="/market" className="text-blue hover:underline">Browse the market →</Link></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
