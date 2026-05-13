import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'

const STATUS_STEPS = ['pending', 'paid', 'confirmed', 'shipped', 'delivered']

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 20px 48px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
} as const

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, qty, price_per_unit, total_amount, status, escrow_status, notes, created_at, updated_at,
      drugs(generic_name, slug, strength, dosage_form),
      listings(brand_name, origin_country),
      payments(amount, method, mpesa_ref, status, escrow_released_at)
    `)
    .eq('id', id)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .single()

  if (!order) notFound()

  const drug = order.drugs as { generic_name: string; slug: string; strength: string; dosage_form: string } | null
  const listing = order.listings as { brand_name: string; origin_country: string } | null
  const payment = (order.payments as { amount: number; method: string; mpesa_ref: string | null; status: string; escrow_released_at: string | null }[] | null)?.[0]

  const currentStep = STATUS_STEPS.indexOf(order.status)

  const { data: orderIds } = await supabase
    .from('orders').select('buyer_id').eq('id', id).single()
  const isBuyer = orderIds?.buyer_id === user.id

  const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
      <span className={bold ? 'text-text font-bold text-base' : 'text-sm text-text'}>{value}</span>
    </div>
  )

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="text-xs text-muted hover:text-text transition-colors">← Orders</Link>
        <span className="text-border2">·</span>
        <span className="text-xs text-muted font-mono">{id.slice(0, 8)}…</span>
      </div>

      {/* Status timeline */}
      <div className="rounded-2xl p-5 mb-4" style={GLASS}>
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Order Status</div>
        <div className="flex items-center">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                  ${i < currentStep ? 'bg-green text-white' : i === currentStep ? 'bg-blue text-white' : 'bg-surface2 text-muted'}`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <div className="text-[9px] text-muted capitalize hidden sm:block">{step}</div>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-3 ${i < currentStep ? 'bg-green' : 'bg-border2'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order details */}
      <div className="rounded-2xl p-5 mb-4" style={GLASS}>
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Order Details</div>
        <div className="space-y-0">
          <Row label="Drug" value={drug ? `${drug.generic_name} ${drug.strength} ${drug.dosage_form}` : '—'} />
          <Row label="Brand" value={listing ? `${listing.brand_name} · ${listing.origin_country}` : '—'} />
          <Row label="Quantity" value={order.qty.toLocaleString() + ' units'} />
          <Row label="Price / unit" value={`KES ${Number(order.price_per_unit).toFixed(2)}`} />
          <div className="border-t border-white/5 mt-1 pt-1">
            <Row label="Total" value={formatKES(Number(order.total_amount))} bold />
          </div>
          <Row label="Placed" value={new Date(order.created_at as string).toLocaleString('en-KE')} />
        </div>
      </div>

      {/* Payment */}
      {payment && (
        <div className="rounded-2xl p-5 mb-4" style={GLASS}>
          <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Payment</div>
          <div className="space-y-0">
            {[
              { label: 'Method', value: payment.method.toUpperCase() },
              { label: 'Amount', value: formatKES(Number(payment.amount)) },
              { label: 'Status', value: payment.status },
              payment.mpesa_ref ? { label: 'M-Pesa Ref', value: payment.mpesa_ref } : null,
              payment.escrow_released_at ? { label: 'Escrow Released', value: new Date(payment.escrow_released_at).toLocaleString('en-KE') } : null,
            ].filter(Boolean).map((item) => {
              const i = item as { label: string; value: string }
              return <Row key={i.label} label={i.label} value={i.value} />
            })}
          </div>
        </div>
      )}

      {/* Confirm delivery */}
      {order.status === 'shipped' && isBuyer && (
        <div className="rounded-2xl p-5" style={{
          background: 'linear-gradient(160deg, rgba(8,153,129,0.15) 0%, rgba(8,153,129,0.05) 100%)',
          boxShadow: '0 16px 40px -8px rgba(8,153,129,0.15), 0 0 0 1px rgba(8,153,129,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          <div className="text-sm font-bold text-text mb-1">Your order has been shipped</div>
          <div className="text-xs text-muted mb-4">Confirm receipt to release payment to the seller.</div>
          <form action={`/api/orders/${id}/confirm-delivery`} method="POST">
            <button type="submit"
              className="px-5 py-2.5 font-bold text-sm text-white rounded-xl transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #089981, #05705f)', boxShadow: '0 0 20px rgba(8,153,129,0.3)' }}>
              Confirm Delivery & Release Payment
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
