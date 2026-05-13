import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-muted/15 text-muted',
  paid:      'bg-blue/12 text-blue',
  confirmed: 'bg-blue/12 text-blue',
  shipped:   'bg-green/12 text-green',
  delivered: 'bg-green/15 text-green',
  cancelled: 'bg-red/12 text-red',
  disputed:  'bg-red/12 text-red',
}

const CARD = { boxShadow: '0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)' } as const

export default async function SellerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, qty, total_amount, status, created_at, drugs(generic_name, slug), payments(status)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-text">Incoming Orders</h1>
        <span className="text-xs text-muted">{orders?.length ?? 0} orders</span>
      </div>

      <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Drug', 'Qty', 'Total', 'Payment', 'Status', 'Date', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3.5 text-[11px] font-bold text-muted uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order, i) => {
              const drug = order.drugs as { generic_name: string; slug: string } | null
              const payment = (order.payments as { status: string }[] | null)?.[0]
              return (
                <tr key={order.id}
                  className="hover:bg-surface2/30 transition-colors"
                  style={{ borderBottom: i < (orders?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-text">{drug?.generic_name ?? '—'}</div>
                    <div className="text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-text tabular-nums">{order.qty.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-bold text-text tabular-nums">{formatKES(Number(order.total_amount))}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                      payment?.status === 'completed' ? 'bg-green/12 text-green' : 'bg-muted/15 text-muted'
                    }`}>
                      {payment?.status ?? 'unpaid'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-muted">
                    {new Date(order.created_at as string).toLocaleDateString('en-KE')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {order.status === 'paid' && (
                        <form action={`/api/orders/${order.id}/confirm`} method="POST" className="inline">
                          <button type="submit"
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue/12 text-blue hover:bg-blue/20 transition-colors">
                            Confirm
                          </button>
                        </form>
                      )}
                      {order.status === 'confirmed' && (
                        <form action={`/api/orders/${order.id}/ship`} method="POST" className="inline">
                          <button type="submit"
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green/12 text-green hover:bg-green/20 transition-colors">
                            Ship
                          </button>
                        </form>
                      )}
                      <Link href={`/orders/${order.id}`} className="text-muted hover:text-text transition-colors inline-flex">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {(orders ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">No incoming orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
