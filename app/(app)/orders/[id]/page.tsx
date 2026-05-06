import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'

const STATUS_STEPS = ['pending', 'paid', 'confirmed', 'shipped', 'delivered']

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
  const isBuyer = true // simplified — in production check against user.id

  const handleConfirmDelivery = async () => {
    'use server'
    // Server action to confirm delivery and release escrow
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="text-xs text-muted hover:text-white">← Orders</Link>
        <span className="text-muted">·</span>
        <span className="text-xs text-muted font-mono">{id.slice(0, 8)}…</span>
      </div>

      {/* Status timeline */}
      <div className="bg-surface border border-border rounded p-5 mb-4">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Order Status</div>
        <div className="flex items-center gap-0">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                ${i < currentStep ? 'bg-green text-white' : i === currentStep ? 'bg-blue text-white' : 'bg-surface2 text-muted'}`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <div className="ml-1 text-[10px] text-muted capitalize hidden sm:block">{step}</div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-green' : 'bg-border2'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order details */}
      <div className="bg-surface border border-border rounded p-5 mb-4 space-y-3">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Order Details</div>
        {[
          { label: 'Drug', value: drug ? `${drug.generic_name} ${drug.strength} ${drug.dosage_form}` : '—' },
          { label: 'Brand', value: listing ? `${listing.brand_name} · ${listing.origin_country}` : '—' },
          { label: 'Quantity', value: order.qty.toLocaleString() + ' units' },
          { label: 'Price/unit', value: `KES ${Number(order.price_per_unit).toFixed(2)}` },
          { label: 'Total', value: formatKES(Number(order.total_amount)), bold: true },
          { label: 'Placed', value: new Date(order.created_at as string).toLocaleString('en-KE') },
        ].map(({ label, value, bold }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted">{label}</span>
            <span className={bold ? 'text-white font-bold' : 'text-white'}>{value}</span>
          </div>
        ))}
      </div>

      {/* Payment */}
      {payment && (
        <div className="bg-surface border border-border rounded p-5 mb-4">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Payment</div>
          <div className="space-y-2">
            {[
              { label: 'Method', value: payment.method.toUpperCase() },
              { label: 'Amount', value: formatKES(Number(payment.amount)) },
              { label: 'Status', value: payment.status },
              payment.mpesa_ref && { label: 'M-Pesa Ref', value: payment.mpesa_ref },
              payment.escrow_released_at && { label: 'Escrow Released', value: new Date(payment.escrow_released_at as string).toLocaleString('en-KE') },
            ].filter(Boolean).map((item) => {
              const i = item as { label: string; value: string }
              return (
                <div key={i.label} className="flex justify-between text-sm">
                  <span className="text-muted">{i.label}</span>
                  <span className="text-white capitalize">{i.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Confirm delivery */}
      {order.status === 'shipped' && (
        <div className="bg-green/10 border border-green/30 rounded p-5">
          <div className="text-sm font-semibold text-white mb-1">Your order has been shipped</div>
          <div className="text-xs text-muted mb-4">Confirm receipt to release payment to the seller.</div>
          <form action={`/api/orders/${id}/confirm-delivery`} method="POST">
            <button type="submit"
              className="px-4 py-2 bg-green text-white text-sm font-semibold rounded hover:bg-green/90 transition-colors">
              Confirm Delivery & Release Payment
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
