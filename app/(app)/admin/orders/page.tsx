import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 16px 40px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
} as const

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-muted/20 text-muted',
  paid:      'bg-blue/10 text-blue',
  confirmed: 'bg-blue/10 text-blue',
  shipped:   'bg-green/10 text-green',
  delivered: 'bg-green/20 text-green',
  cancelled: 'bg-red/10 text-red',
  disputed:  'bg-red/10 text-red',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, qty, price_per_unit, total_amount, status, escrow_status, created_at,
      drugs(generic_name),
      buyer:profiles!orders_buyer_id_fkey(org_name),
      seller:profiles!orders_seller_id_fkey(org_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-base font-bold text-text">All Orders</h1>
        <span className="text-xs text-muted">{orders?.length ?? 0} orders</span>
      </div>

      <div className="rounded-xl overflow-hidden" style={GLASS}>
        <table className="w-full min-w-[700px]">
          <thead className="bg-surface2/40">
            <tr>
              {['Drug', 'Buyer', 'Seller', 'Qty', 'Total', 'Status', 'Escrow', 'Date', ''].map(h => (
                <th key={h} className={`px-4 py-2.5 text-xs font-bold text-text uppercase tracking-wider ${h === 'Drug' || h === 'Buyer' || h === 'Seller' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted text-sm">No orders yet</td></tr>
            )}
            {(orders ?? []).map((order, i) => {
              const drug = order.drugs as { generic_name: string } | null
              const buyer = order.buyer as { org_name: string } | null
              const seller = order.seller as { org_name: string } | null
              return (
                <tr key={order.id} className={`hover:bg-surface2 transition-colors ${i % 2 === 1 ? 'bg-surface2/30' : ''}`}>
                  <td className="px-4 py-2.5 text-sm font-semibold text-text">{drug?.generic_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-muted">{buyer?.org_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-muted">{seller?.org_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{order.qty.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-sm font-semibold text-text tabular-nums">{formatKES(Number(order.total_amount))}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted capitalize">{order.escrow_status}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/orders/${order.id}`} className="text-sm text-muted hover:text-text transition-colors">→</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
