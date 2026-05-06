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
      <h1 className="text-lg font-bold text-white mb-6">Incoming Orders</h1>
      <div className="bg-surface border border-border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Drug', 'Qty', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className={`px-4 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider border-b border-border ${h === 'Drug' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map(order => {
              const drug = order.drugs as { generic_name: string } | null
              const payment = (order.payments as { status: string }[] | null)?.[0]
              return (
                <tr key={order.id} className="border-b border-border/30 hover:bg-bg transition-colors">
                  <td className="px-4 py-2.5 text-sm text-white">{drug?.generic_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{order.qty.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-white font-semibold tabular-nums">{formatKES(Number(order.total_amount))}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${payment?.status === 'completed' ? 'bg-green/10 text-green' : 'bg-muted/10 text-muted'}`}>
                      {payment?.status ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-[10px] text-muted capitalize bg-surface2 px-1.5 py-0.5 rounded">{order.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted">
                    {new Date(order.created_at).toLocaleDateString('en-KE')}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex gap-1 justify-end">
                      {order.status === 'paid' && (
                        <form action={`/api/orders/${order.id}/confirm`} method="POST">
                          <button type="submit" className="text-[10px] px-2 py-0.5 bg-blue/10 text-blue border border-blue/30 rounded hover:bg-blue/20 transition-colors">
                            Confirm
                          </button>
                        </form>
                      )}
                      {order.status === 'confirmed' && (
                        <form action={`/api/orders/${order.id}/ship`} method="POST">
                          <button type="submit" className="text-[10px] px-2 py-0.5 bg-green/10 text-green border border-green/30 rounded hover:bg-green/20 transition-colors">
                            Mark Shipped
                          </button>
                        </form>
                      )}
                      <Link href={`/orders/${order.id}`} className="text-[10px] text-muted hover:text-white transition-colors px-1">
                        View
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
