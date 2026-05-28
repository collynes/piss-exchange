import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-label-warning text-warning',
  paid:      'bg-label-primary text-primary',
  confirmed: 'bg-label-primary text-primary',
  shipped:   'bg-label-warning text-warning',
  delivered: 'bg-label-success text-success',
  cancelled: 'bg-label-danger text-danger',
  disputed:  'bg-label-danger text-danger',
}

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

export default async function SellerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const ordersQuery = supabase
    .from('orders')
    .select('id, qty, total_amount, status, created_at, drugs(generic_name, slug), payments(status)')
    .order('created_at', { ascending: false })
  const { data: orders } = await (isAdmin ? ordersQuery : ordersQuery.eq('seller_id', user.id))

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-text">{isAdmin ? 'All Incoming Orders' : 'Incoming Orders'}</h1>
        <span className="text-xs text-muted">{orders?.length ?? 0} orders</span>
      </div>

      <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
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
                  className="hover:bg-surface2 transition-colors"
                  style={{ borderBottom: i < (orders?.length ?? 0) - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-semibold text-text">{drug?.generic_name ?? '—'}</div>
                    <div className="text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-text tabular-nums">{order.qty.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-bold text-text tabular-nums">{formatKES(Number(order.total_amount))}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`badge rounded-pill text-capitalize ${
                      payment?.status === 'completed' ? 'bg-label-success text-success' : 'bg-label-secondary text-muted'
                    }`}>
                      {payment?.status ?? 'unpaid'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`badge rounded-pill text-capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
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
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-label-primary text-primary hover:bg-blue/20 transition-colors">
                            Confirm
                          </button>
                        </form>
                      )}
                      {order.status === 'confirmed' && (
                        <form action={`/api/orders/${order.id}/ship`} method="POST" className="inline">
                          <button type="submit"
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-label-success text-success hover:bg-green/20 transition-colors">
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
