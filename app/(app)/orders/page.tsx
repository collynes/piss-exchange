import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-muted/20 text-muted',
  paid:      'bg-blue/10 text-blue',
  confirmed: 'bg-blue/10 text-blue',
  shipped:   'bg-green/10 text-green',
  delivered: 'bg-green/20 text-green font-bold',
  cancelled: 'bg-red/10 text-red',
  disputed:  'bg-red/10 text-red',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, qty, price_per_unit, total_amount, status, escrow_status, created_at, drugs(generic_name, slug)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-text mb-6">My Orders</h1>
      <div className="overflow-x-auto rounded-xl"
        style={{
          background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
          boxShadow: '0 20px 48px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-border bg-surface2/40">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-bold text-text uppercase tracking-wider">Drug</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Qty</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Price/unit</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Total</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Escrow</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-text uppercase tracking-wider">Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order, i) => {
              const drug = order.drugs as { generic_name: string; slug: string } | null
              return (
                <tr key={order.id} className={`hover:bg-surface2 transition-colors ${i % 2 === 1 ? 'bg-surface2/30' : ''}`}>
                  <td className="px-4 py-2.5">
                    <Link href={`/drug/${drug?.slug}`} className="text-sm text-text hover:text-blue transition-colors">
                      {drug?.generic_name ?? '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{order.qty.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{Number(order.price_per_unit).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-text font-semibold tabular-nums">{formatKES(Number(order.total_amount))}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted capitalize">{order.escrow_status}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/orders/${order.id}`} className="text-xs text-blue hover:underline">View</Link>
                  </td>
                </tr>
              )
            })}
            {(orders ?? []).length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-muted text-sm">
                No orders yet. <Link href="/market" className="text-blue hover:underline">Browse the market →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
