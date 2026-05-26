'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BidModalProps {
  drugId: string
  drugName: string
  onClose: () => void
}

const GLASS = {
  background: 'var(--bs-card-bg, #fff)',
  border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))',
  boxShadow: '0 18px 48px -20px rgba(47,43,61,.35)',
} as const

const INPUT_CLASS = 'w-full bg-bg/80 rounded-lg px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all'
const INPUT_STYLE = { border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))' }

export function BidModal({ drugId, drugName, onClose }: BidModalProps) {
  const router = useRouter()
  const [price, setPrice] = useState('')
  const [qty, setQty] = useState('')
  const [days, setDays] = useState('7')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = Number(price) * Number(qty)

  const ALLOWED_DAYS = [1, 3, 7, 14, 30]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const priceNum = Number(price)
    const qtyNum = Number(qty)
    const daysNum = Number(days)

    if (!Number.isFinite(priceNum) || priceNum < 0.01) { setError('Price must be at least KES 0.01'); return }
    if (!Number.isInteger(qtyNum) || qtyNum < 1) { setError('Quantity must be a whole number of at least 1'); return }
    if (!ALLOWED_DAYS.includes(daysNum)) { setError('Invalid validity period'); return }

    setLoading(true)

    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drugId,
        qty: qtyNum,
        price: priceNum,
        days: daysNum,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Bid failed')
      setLoading(false)
      return
    }

    setPrice('')
    setQty('')
    setDays('7')
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-sm overflow-hidden" style={GLASS} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-surface2 border-b border-border">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider">Place Bid</div>
            <div className="text-2xl font-bold text-text leading-tight mt-1 truncate">{drugName}</div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-surface2 text-muted hover:text-text transition-colors text-base leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              Bid Price (KES / unit) <span className="text-red">*</span>
            </label>
            <input type="number" step="0.01" min="0.01" required value={price}
              onChange={e => setPrice(e.target.value)} placeholder="0.00"
              className={INPUT_CLASS} style={INPUT_STYLE} />
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">
              Quantity <span className="text-red">*</span>
            </label>
            <input type="number" step="1" min="1" required value={qty}
              onChange={e => setQty(e.target.value)} placeholder="100"
              className={INPUT_CLASS} style={INPUT_STYLE} />
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">Valid for</label>
            <select value={days} onChange={e => setDays(e.target.value)}
              className={INPUT_CLASS} style={INPUT_STYLE}>
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>

          {price && qty && (
            <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-bg" style={{ border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))' }}>
              <span className="text-xs text-muted">Total bid value</span>
              <span className="text-lg font-black text-green tabular-nums">KES {total.toFixed(2)}</span>
            </div>
          )}

          {error && <div className="text-red text-xs bg-red/8 rounded-lg px-3 py-2">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full font-bold py-3 rounded-xl text-sm text-white bg-blue transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            style={{ boxShadow: '0 0.5rem 1rem rgba(var(--bs-primary-rgb), .22)' }}>
            {loading ? 'Placing bid…' : 'Place Bid'}
          </button>
          <p className="text-xs text-muted text-center">Your bid appears in the live order book. A seller can accept it directly.</p>
        </form>
      </div>
    </div>
  )
}
