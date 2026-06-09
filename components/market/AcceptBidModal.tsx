'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatKES } from '@/lib/utils'

const GLASS = {
  background: 'var(--bs-card-bg, #fff)',
  border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))',
  boxShadow: '0 18px 48px -20px rgba(47,43,61,.35)',
} as const

interface AcceptBidModalProps {
  bidId: string
  drugName: string
  qty: number
  pricePerUnit: number
  onClose: () => void
}

export function AcceptBidModal({ bidId, drugName, qty, pricePerUnit, onClose }: AcceptBidModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const total = qty * pricePerUnit

  async function handleAccept() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/bids/${bidId}/accept`, { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.error ?? 'Failed to accept bid')
        setLoading(false)
        return
      }
      router.push(`/orders/${body.orderId}`)
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  return (
    // zIndex must beat Bootstrap's .sticky-top (1020) used by the market table header
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 1100 }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-sm overflow-hidden" style={GLASS} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-surface2 border-b border-border">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider">Accept Bid</div>
            <div className="text-2xl font-bold text-text leading-tight mt-1 truncate">{drugName}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-surface2 text-muted hover:text-text transition-colors text-base leading-none">×</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="rounded-xl bg-bg overflow-hidden" style={{ border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))' }}>
            {[
              { label: 'Quantity', value: `${qty.toLocaleString()} units` },
              { label: 'Price / unit', value: `KES ${pricePerUnit.toFixed(2)}` },
              { label: 'Total value', value: formatKES(total), bold: true },
              { label: 'Settlement', value: 'Dawahub Credit' },
            ].map(({ label, value, bold }, i, arr) => (
              <div key={label}
                className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
                <span className={`text-sm tabular-nums ${bold ? 'font-black text-green' : 'font-semibold text-text'}`}>{value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted">
            Accepting creates a confirmed order immediately — no buyer action needed. Dawahub pays
            you directly and settles with the buyer separately.
          </p>

          {error && <div className="text-red text-xs bg-red/8 rounded-lg px-3 py-2">{error}</div>}

          <div className="flex gap-2">
            <button onClick={onClose} disabled={loading}
              className="flex-1 font-semibold py-3 rounded-xl text-sm text-muted border border-border hover:bg-surface2 transition-all disabled:opacity-40">
              Cancel
            </button>
            <button onClick={handleAccept} disabled={loading}
              className="flex-1 font-bold py-3 rounded-xl text-sm text-white bg-green transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40">
              {loading ? 'Accepting…' : 'Accept & Create Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
