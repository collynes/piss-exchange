'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Ask } from '@/components/market/OrderBook'

interface BuyModalProps {
  ask: Ask
  drugName: string
  onClose: () => void
}

const GLASS = {
  background: 'var(--bs-card-bg, #fff)',
  border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))',
  boxShadow: '0 18px 48px -20px rgba(47,43,61,.35)',
} as const

function DetailRow({ label, value, valueClass = 'text-text' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}

export function BuyModal({ ask, drugName, onClose }: BuyModalProps) {
  const router = useRouter()
  const [qty, setQty] = useState(ask.min_order_qty)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'confirm' | 'payment'>('confirm')

  const total = qty * Number(ask.price_per_unit)

  const handleConfirm = async () => {
    if (qty < ask.min_order_qty) { setError(`Minimum order is ${ask.min_order_qty} units`); return }
    if (qty > ask.qty_remaining) { setError(`Only ${ask.qty_remaining} units available`); return }
    if (total <= 0) { setError('Invalid total'); return }
    setError(null)
    setStep('payment')
  }

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: ask.id, qty }),
    })

    const order = await orderRes.json().catch(() => ({}))
    if (!orderRes.ok || !order.orderId) {
      setError(order.error ?? 'Order failed')
      setLoading(false)
      return
    }

    const res = await fetch('/api/mpesa/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.orderId, phone, amount: order.total }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'M-Pesa request failed')
      setLoading(false)
      return
    }

    onClose()
    router.push(`/orders/${order.orderId}`)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-sm overflow-hidden" style={GLASS} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-surface2 border-b border-border">
          <div>
            <div className="text-xs font-semibold text-muted uppercase tracking-wider">
              {step === 'confirm' ? 'Buy' : 'Pay via M-Pesa'}
            </div>
            <div className="text-2xl font-bold text-text leading-tight mt-1">
              {step === 'confirm' ? ask.brand_name : `KES ${total.toFixed(2)}`}
            </div>
            <div className="text-xs text-muted mt-0.5">{step === 'confirm' ? drugName : 'Amount due'}</div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-surface2 text-muted hover:text-text transition-colors text-base leading-none">
            ×
          </button>
        </div>

        <div className="px-5 py-5">
          {step === 'confirm' ? (
            <>
              {/* Drug detail rows */}
              <div className="space-y-0 mb-5">
                <DetailRow label="Drug" value={drugName} />
                <DetailRow label="Brand" value={`${ask.brand_name} · ${ask.origin_country}`} />
                <DetailRow label="Price / unit" value={`KES ${Number(ask.price_per_unit).toFixed(2)}`} valueClass="text-red font-semibold" />
                <DetailRow label="Available" value={`${ask.qty_remaining.toLocaleString()} units`} />
              </div>

              {/* Qty input */}
              <div className="mb-5">
                <label className="block text-xs text-muted uppercase tracking-wider mb-2">
                  Quantity <span className="text-muted normal-case tracking-normal">(min {ask.min_order_qty})</span>
                </label>
                <input
                  type="number"
                  min={ask.min_order_qty}
                  max={ask.qty_remaining}
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="w-full bg-bg/80 rounded-lg px-4 py-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all"
                  style={{ border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))' }}
                />
              </div>

              {error && <div className="text-red text-xs mb-4 bg-red/8 rounded-lg px-3 py-2">{error}</div>}

              {/* Total + CTA */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-muted uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-text tabular-nums">KES {total.toFixed(2)}</span>
              </div>

              <button onClick={handleConfirm}
                className="w-full font-bold py-3 rounded-xl text-sm text-white bg-blue transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ boxShadow: '0 0.5rem 1rem rgba(var(--bs-primary-rgb), .22)' }}>
                Confirm Order →
              </button>
            </>
          ) : (
            <>
              {/* Total summary */}
              <div className="flex justify-between items-center py-3 mb-5 rounded-xl px-4 bg-bg" style={{ border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))' }}>
                <span className="text-xs text-muted">Total to pay</span>
                <span className="text-2xl font-black text-text tabular-nums">KES {total.toFixed(2)}</span>
              </div>

              {/* Phone input */}
              <div className="mb-5">
                <label className="block text-xs text-muted uppercase tracking-wider mb-2">
                  M-Pesa Number <span className="text-red">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+254700000000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-bg/80 rounded-lg px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-green/50 transition-all"
                  style={{ border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))' }}
                />
                <p className="text-xs text-muted mt-2">You&apos;ll receive a push notification to confirm.</p>
              </div>

              {error && <div className="text-red text-xs mb-4 bg-red/8 rounded-lg px-3 py-2">{error}</div>}

              <button onClick={handlePay} disabled={loading || !phone}
                className="w-full font-bold py-3 rounded-xl text-sm text-white bg-blue transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                style={{ boxShadow: '0 0.5rem 1rem rgba(var(--bs-primary-rgb), .22)' }}>
                {loading ? 'Sending request…' : 'Pay with M-Pesa'}
              </button>
              <p className="text-xs text-muted text-center mt-3">Funds held in escrow until delivery confirmed</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
