import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'

export default async function SellerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, qty, total_amount, status, created_at, drugs(generic_name), payments(status)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-text mb-6">Incoming Orders</h1>
      <div className="overflow-x-auto rounded-xl"
        style={{
          background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
          boxShadow: '0 20px 48px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
        <table className="w-full min-w-[600px]">
          <thead className="border-b border-border bg-surface2/40">
            <tr>
              {['Drug', 'Qty', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className={`px-4 py-2.5 text-xs font-bold text-text uppercase tracking-wider ${h === 'Drug' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order, i) => {
              const drug = order.drugs as { generic_name: string } | null
              const payment = (order.payments as { status: string }[] | null)?.[0]
              return (
                <tr key={order.id} className={`hover:bg-surface2 transition-colors ${i % 2 === 1 ? 'bg-surface2/30' : ''}`}>
                  <td className="px-4 py-2.5 text-sm text-text">{drug?.generic_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{order.qty.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-text font-semibold tabular-nums">{formatKES(Number(order.total_amount))}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${payment?.status === 'completed' ? 'bg-green/10 text-green' : 'bg-muted/10 text-muted'}`}>
                      {payment?.status ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-xs text-muted capitalize bg-surface2 px-1.5 py-0.5 rounded">{order.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted">
                    {new Date(order.created_at as string).toLocaleDateString('en-KE')}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex gap-1 justify-end">
                      {order.status === 'paid' && (
                        <form action={`/api/orders/${order.id}/confirm`} method="POST">
                          <button type="submit" className="text-xs px-2 py-0.5 bg-blue/10 text-blue border border-blue/30 rounded hover:bg-blue/20 transition-colors">
                            Confirm
                          </button>
                        </form>
                      )}
                      {order.status === 'confirmed' && (
                        <form action={`/api/orders/${order.id}/ship`} method="POST">
                          <button type="submit" className="text-xs px-2 py-0.5 bg-green/10 text-green border border-green/30 rounded hover:bg-green/20 transition-colors">
                            Mark Shipped
                          </button>
                        </form>
                      )}
                      <Link href={`/orders/${order.id}`} className="text-sm text-muted hover:text-text transition-colors px-1">
                        →
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {(orders ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted text-sm">No incoming orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
