import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-label-warning text-warning',
  paid:      'bg-label-primary text-primary',
  confirmed: 'bg-label-info text-info',
  shipped:   'bg-label-warning text-warning',
  delivered: 'bg-label-success text-success',
  cancelled: 'bg-label-danger text-danger',
  disputed:  'bg-label-danger text-danger',
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
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="mb-0">My Orders</h4>
        <span className="badge bg-label-secondary">{orders?.length ?? 0} orders</span>
      </div>

      <div className="card">
        <div className="table-responsive text-nowrap">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              {['Drug', 'Qty', 'Price/unit', 'Total', 'Status', 'Escrow', 'Date', ''].map((h, i) => (
                <th key={i} className={i === 0 ? '' : 'text-end'}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order, i) => {
              const drug = order.drugs as { generic_name: string; slug: string } | null
              return (
                <tr key={order.id}
                  className="cursor-pointer">
                  <td>
                    <Link href={`/drug/${drug?.slug}`} className="fw-semibold text-heading">
                      {drug?.generic_name ?? '—'}
                    </Link>
                  </td>
                  <td className="text-end">{order.qty.toLocaleString()}</td>
                  <td className="text-end">{Number(order.price_per_unit).toFixed(2)}</td>
                  <td className="text-end fw-bold">{formatKES(Number(order.total_amount))}</td>
                  <td className="text-end">
                    <span className={`badge rounded-pill text-capitalize ${STATUS_COLOR[order.status] ?? 'bg-label-secondary'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-end text-muted text-capitalize">{order.escrow_status}</td>
                  <td className="text-end text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</td>
                  <td className="text-end">
                    <Link href={`/orders/${order.id}`} className="btn btn-sm btn-icon btn-text-secondary rounded-pill">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(orders ?? []).length === 0 && (
              <tr><td colSpan={8} className="p-5 text-center text-muted">
                No orders yet. <Link href="/market" className="text-blue hover:underline">Browse the market →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
