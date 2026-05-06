import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_name, verified, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'buyer') redirect('/dashboard')

  const [{ data: listings }, { data: orders }] = await Promise.all([
    supabase.from('listings').select('id, status, qty_remaining, qty_available, price_per_unit, drugs(generic_name)')
      .eq('seller_id', user.id).eq('status', 'active'),
    supabase.from('orders').select('id, total_amount, status, created_at, drugs(generic_name), buyer_id')
      .eq('seller_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  const activeListings = listings?.length ?? 0
  const pendingOrders = orders?.filter(o => ['pending', 'paid', 'confirmed'].includes(o.status)).length ?? 0
  const revenue = orders?.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0) ?? 0

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-white">{profile?.org_name}</h1>
          <div className="text-xs text-muted">Seller Dashboard</div>
        </div>
        <Link href="/seller/listings/new" className="px-3 py-1.5 bg-blue text-white text-xs font-semibold rounded hover:bg-blue/90 transition-colors">
          + List Drug
        </Link>
      </div>

      {!profile?.verified && (
        <div className="bg-blue/5 border border-blue/20 rounded p-4 text-xs text-muted mb-6">
          Your account is pending verification. You cannot list drugs until approved by admin.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Active Listings', value: activeListings.toString() },
          { label: 'Pending Orders', value: pendingOrders.toString() },
          { label: 'Total Revenue', value: formatKES(revenue) },
        ].map(card => (
          <div key={card.label} className="bg-surface border border-border rounded p-4">
            <div className="text-xs text-muted uppercase tracking-wider mb-1">{card.label}</div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { href: '/seller/listings/new', label: 'List a Drug', desc: 'Add stock to the exchange' },
          { href: '/seller/listings', label: 'My Listings', desc: 'Manage active listings' },
          { href: '/seller/orders', label: 'Incoming Orders', desc: 'Confirm and ship' },
        ].map(link => (
          <Link key={link.href} href={link.href}
            className="bg-surface border border-border rounded p-4 hover:border-blue/40 transition-colors group">
            <div className="text-sm font-semibold text-white group-hover:text-blue transition-colors">{link.label}</div>
            <div className="text-xs text-muted mt-0.5">{link.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent incoming orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Recent Orders</span>
          <Link href="/seller/orders" className="text-xs text-blue hover:underline">All incoming orders →</Link>
        </div>
        <div className="bg-surface border border-border rounded overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-[10.5px] font-semibold text-muted uppercase tracking-wider">Drug</th>
                <th className="px-4 py-2 text-right text-[10.5px] font-semibold text-muted uppercase tracking-wider">Total</th>
                <th className="px-4 py-2 text-right text-[10.5px] font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-right text-[10.5px] font-semibold text-muted uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map(order => {
                const drug = order.drugs as { generic_name: string } | null
                return (
                  <tr key={order.id} className="border-b border-border/30 hover:bg-bg transition-colors">
                    <td className="px-4 py-2.5 text-sm text-white">{drug?.generic_name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right text-sm text-white font-semibold">{formatKES(Number(order.total_amount))}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-[10px] text-muted capitalize bg-surface2 px-1.5 py-0.5 rounded">{order.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</td>
                  </tr>
                )
              })}
              {(orders ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted text-sm">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
