'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Ask } from '@/components/market/OrderBook'

interface BuyModalProps {
  ask: Ask
  drugId: string
  drugName: string
  onClose: () => void
}

export function BuyModal({ ask, drugId, drugName, onClose }: BuyModalProps) {
  const router = useRouter()
  const [qty, setQty] = useState(ask.min_order_qty)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'confirm' | 'payment'>('confirm')

  const total = qty * Number(ask.price_per_unit)

  const handleConfirm = async () => {
    if (qty < ask.min_order_qty) {
      setError(`Minimum order quantity is ${ask.min_order_qty}`)
      return
    }
    if (qty > ask.qty_remaining) {
      setError(`Only ${ask.qty_remaining} units available`)
      return
    }
    if (total <= 0) {
      setError('Invalid order total')
      return
    }
    setError(null)
    setStep('payment')
  }

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be logged in'); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    if (!profile) { setError('Profile not found'); setLoading(false); return }

    // Create the order
    const { data: order, error: orderErr } = await supabase.from('orders').insert({
      listing_id: ask.id,
      drug_id: drugId,
      buyer_id: user.id,
      seller_id: ask.seller_id,
      qty,
      price_per_unit: ask.price_per_unit,
      total_amount: total,
      status: 'pending',
      escrow_status: 'holding',
    }).select().single()

    if (orderErr || !order) {
      setError(orderErr?.message ?? 'Order creation failed')
      setLoading(false)
      return
    }

    // Trigger M-Pesa STK push via Edge Function
    const res = await fetch('/api/mpesa/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, phone, amount: total }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'M-Pesa request failed')
      setLoading(false)
      return
    }

    onClose()
    router.push(`/orders/${order.id}`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-border2 rounded w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-white font-semibold text-sm">
            {step === 'confirm' ? `Buy ${ask.brand_name}` : 'Pay via M-Pesa'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-white text-lg leading-none">×</button>
        </div>
        <div className="p-5">
          {step === 'confirm' ? (
            <>
              <div className="bg-bg rounded p-3 mb-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Drug</span>
                  <span className="text-white">{drugName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Brand</span>
                  <span className="text-white">{ask.brand_name} · {ask.origin_country}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Price/unit</span>
                  <span className="text-red font-semibold">KES {Number(ask.price_per_unit).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Available</span>
                  <span className="text-white">{ask.qty_remaining.toLocaleString()} units</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-muted uppercase tracking-wider mb-1">
                  Quantity (min {ask.min_order_qty})
                </label>
                <input
                  type="number"
                  min={ask.min_order_qty}
                  max={ask.qty_remaining}
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="w-full bg-bg border border-border2 rounded px-3 py-2 text-sm text-white focus:border-blue transition-colors"
                />
              </div>

              {error && <div className="text-red text-xs mb-3">{error}</div>}

              <div className="flex justify-between items-center mb-4">
                <span className="text-muted text-xs">Total</span>
                <span className="text-white font-bold text-lg">KES {total.toFixed(2)}</span>
              </div>

              <button onClick={handleConfirm} className="w-full bg-blue text-white font-semibold py-2.5 rounded text-sm hover:bg-blue/90 transition-colors">
                Confirm Order →
              </button>
            </>
          ) : (
            <>
              <div className="bg-bg rounded p-3 mb-4 flex justify-between items-center">
                <span className="text-muted text-xs">Total to pay</span>
                <span className="text-white font-bold text-lg">KES {total.toFixed(2)}</span>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-muted uppercase tracking-wider mb-1">
                  M-Pesa Phone Number <span className="text-red">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+254700000000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-bg border border-border2 rounded px-3 py-2 text-sm text-white placeholder:text-muted focus:border-blue transition-colors"
                />
                <p className="text-[10px] text-muted mt-1">You will receive an M-Pesa push notification to confirm payment.</p>
              </div>

              {error && <div className="text-red text-xs mb-3">{error}</div>}

              <button onClick={handlePay} disabled={loading || !phone}
                className="w-full bg-green text-white font-semibold py-2.5 rounded text-sm hover:bg-green/90 transition-colors disabled:opacity-50">
                {loading ? 'Sending M-Pesa request…' : 'Pay with M-Pesa'}
              </button>
              <p className="text-[10px] text-muted text-center mt-2">Funds held in escrow until delivery confirmed</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
