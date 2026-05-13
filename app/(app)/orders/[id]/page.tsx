import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'

const STATUS_STEPS = ['pending', 'paid', 'confirmed', 'shipped', 'delivered']
const CARD = { boxShadow: '0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)' } as const

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

  const drug    = order.drugs as { generic_name: string; slug: string; strength: string; dosage_form: string } | null
  const listing = order.listings as { brand_name: string; origin_country: string } | null
  const payment = (order.payments as { amount: number; method: string; mpesa_ref: string | null; status: string; escrow_released_at: string | null }[] | null)?.[0]

  const currentStep = STATUS_STEPS.indexOf(order.status)

  const { data: orderIds } = await supabase.from('orders').select('buyer_id').eq('id', id).single()
  const isBuyer = orderIds?.buyer_id === user.id

  const orderRows = [
    { label: 'Drug',        value: drug ? `${drug.generic_name} ${drug.strength} ${drug.dosage_form}` : '—' },
    { label: 'Brand',       value: listing ? `${listing.brand_name} · ${listing.origin_country}` : '—' },
    { label: 'Quantity',    value: `${order.qty.toLocaleString()} units` },
    { label: 'Price / unit',value: `KES ${Number(order.price_per_unit).toFixed(2)}` },
    { label: 'Total',       value: formatKES(Number(order.total_amount)), bold: true },
    { label: 'Placed',      value: new Date(order.created_at as string).toLocaleString('en-KE') },
  ]

  const paymentRows = payment ? [
    { label: 'Method',          value: payment.method.toUpperCase() },
    { label: 'Amount',          value: formatKES(Number(payment.amount)) },
    { label: 'Status',          value: payment.status },
    ...(payment.mpesa_ref       ? [{ label: 'M-Pesa Ref',      value: payment.mpesa_ref }] : []),
    ...(payment.escrow_released_at ? [{ label: 'Escrow Released', value: new Date(payment.escrow_released_at).toLocaleString('en-KE') }] : []),
  ] : []

  return (
    <div className="max-w-2xl space-y-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/orders" className="hover:text-text transition-colors">Orders</Link>
        <span>·</span>
        <span className="font-mono">{id.slice(0, 8)}…</span>
      </div>

      {/* Status stepper */}
      <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-sm font-bold text-text">Order Status</h2>
        </div>
        <div className="px-5 py-5">
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
                  <div className={`flex-1 h-0.5 mx-2 mb-3 ${i < currentStep ? 'bg-green' : 'bg-surface2'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order details */}
      <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-sm font-bold text-text">Order Details</h2>
        </div>
        <table className="w-full">
          <tbody>
            {orderRows.map(({ label, value, bold }, i) => (
              <tr key={label}
                style={{ borderBottom: i < orderRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                <td className="px-5 py-3 text-xs text-muted uppercase tracking-wider w-1/3">{label}</td>
                <td className={`px-5 py-3 text-right text-[13px] ${bold ? 'font-bold text-text text-base' : 'text-text'}`}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment */}
      {payment && (
        <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-sm font-bold text-text">Payment</h2>
          </div>
          <table className="w-full">
            <tbody>
              {paymentRows.map(({ label, value }, i) => (
                <tr key={label}
                  style={{ borderBottom: i < paymentRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                  <td className="px-5 py-3 text-xs text-muted uppercase tracking-wider w-1/3">{label}</td>
                  <td className="px-5 py-3 text-right text-[13px] text-text capitalize">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delivery */}
      {order.status === 'shipped' && isBuyer && (
        <div className="rounded-2xl px-5 py-4" style={{
          background: 'rgba(8,153,129,0.06)',
          border: '1px solid rgba(8,153,129,0.2)',
        }}>
          <div className="text-sm font-bold text-text mb-0.5">Your order has been shipped</div>
          <div className="text-xs text-muted mb-4">Confirm receipt to release payment to the seller.</div>
          <form action={`/api/orders/${id}/confirm-delivery`} method="POST">
            <button type="submit"
              className="px-5 py-2.5 font-bold text-sm text-white rounded-xl transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #089981, #05705f)' }}>
              Confirm Delivery & Release Payment
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
