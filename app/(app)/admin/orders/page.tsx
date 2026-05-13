import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const CARD = { boxShadow: '0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)' } as const

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-muted/15 text-muted',
  paid:      'bg-blue/12 text-blue',
  confirmed: 'bg-blue/12 text-blue',
  shipped:   'bg-green/12 text-green',
  delivered: 'bg-green/15 text-green',
  cancelled: 'bg-red/12 text-red',
  disputed:  'bg-red/12 text-red',
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

      <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
        <table className="w-full min-w-[700px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Drug', 'Buyer', 'Seller', 'Qty', 'Total', 'Status', 'Escrow', 'Date', ''].map((h, i) => (
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
                  className="hover:bg-surface2/30 transition-colors"
                  style={{ borderBottom: i < (orders?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-text">{drug?.generic_name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-muted">{buyer?.org_name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-muted">{seller?.org_name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-text tabular-nums">{order.qty.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-bold text-text tabular-nums">{formatKES(Number(order.total_amount))}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-muted capitalize">{order.escrow_status}</td>
                  <td className="px-5 py-3.5 text-right text-xs text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/orders/${order.id}`} className="text-muted hover:text-text transition-colors inline-flex">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
