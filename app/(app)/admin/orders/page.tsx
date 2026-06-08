import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-label-warning text-warning',
  paid:      'bg-label-primary text-primary',
  confirmed: 'bg-label-primary text-primary',
  shipped:   'bg-label-warning text-warning',
  delivered: 'bg-label-success text-success',
  cancelled: 'bg-label-danger text-danger',
  disputed:  'bg-label-danger text-danger',
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
      id, qty, price_per_unit, total_amount, status, escrow_status, settlement_method, created_at,
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

      <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
              {['Drug', 'Buyer', 'Seller', 'Qty', 'Total', 'Status', 'Settlement', 'Date', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3.5 text-[11px] font-bold text-muted uppercase tracking-wider ${i < 3 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).length === 0 && (
              <tr><td colSpan={9} className="px-5 py-10 text-center text-muted text-sm">No orders yet</td></tr>
            )}
            {(orders ?? []).map((order, i) => {
              const drug = order.drugs as { generic_name: string } | null
              const buyer = order.buyer as { org_name: string } | null
              const seller = order.seller as { org_name: string } | null
              return (
                <tr key={order.id}
                  className="hover:bg-surface2 transition-colors"
                  style={{ borderBottom: i < (orders?.length ?? 0) - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-text" style={{ maxWidth: '200px' }}>
                    <div className="truncate">{drug?.generic_name ?? '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted" style={{ maxWidth: '140px' }}>
                    <div className="truncate">{buyer?.org_name ?? '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted" style={{ maxWidth: '140px' }}>
                    <div className="truncate">{seller?.org_name ?? '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-text tabular-nums">{order.qty.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-bold text-text tabular-nums">{formatKES(Number(order.total_amount))}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`badge rounded-pill text-capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`badge rounded-pill text-capitalize ${order.settlement_method === 'dawahub_credit' ? 'bg-label-warning text-warning' : 'bg-label-secondary text-muted'}`}>
                      {order.settlement_method === 'dawahub_credit' ? 'Dawahub Credit' : 'M-Pesa'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {order.settlement_method === 'dawahub_credit' && order.escrow_status !== 'released'
                        && ['confirmed', 'shipped', 'delivered'].includes(order.status) && (
                        <form action={`/api/orders/${order.id}/settle`} method="POST" className="inline" onClick={e => e.stopPropagation()}>
                          <button type="submit"
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-label-warning text-warning hover:bg-warning/20 transition-colors">
                            Settle
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
          </tbody>
        </table>
      </div>
    </div>
  )
}
