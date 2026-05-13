'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface BidModalProps {
  drugId: string
  drugName: string
  onClose: () => void
}

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
} as const

const INPUT_CLASS = 'w-full bg-bg/80 rounded-lg px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all'
const INPUT_STYLE = { border: '1px solid rgba(255,255,255,0.08)' }

export function BidModal({ drugId, drugName, onClose }: BidModalProps) {
  const router = useRouter()
  const [price, setPrice] = useState('')
  const [qty, setQty] = useState('')
  const [days, setDays] = useState('7')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = Number(price) * Number(qty)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be logged in'); setLoading(false); return }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + Number(days))

    const { error: bidErr } = await supabase.from('bids').insert({
      drug_id: drugId,
      buyer_id: user.id,
      qty: Number(qty),
      price_per_unit: Number(price),
      expires_at: expiresAt.toISOString(),
      status: 'open',
    })

    if (bidErr) { setError(bidErr.message); setLoading(false); return }
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="rounded-2xl w-full max-w-sm overflow-hidden" style={GLASS} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-surface2/50 border-b border-white/5">
          <div>
            <div className="text-sm font-bold text-text">Place Bid</div>
            <div className="text-xs text-muted mt-0.5">{drugName}</div>
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
            <input type="number" min="1" required value={qty}
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
            <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-bg/60" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs text-muted">Total bid value</span>
              <span className="text-lg font-black text-green tabular-nums">KES {total.toFixed(2)}</span>
            </div>
          )}

          {error && <div className="text-red text-xs bg-red/8 rounded-lg px-3 py-2">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full font-bold py-3 rounded-xl text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #089981, #05705f)', boxShadow: '0 0 20px rgba(8,153,129,0.25)' }}>
            {loading ? 'Placing bid…' : 'Place Bid'}
          </button>
          <p className="text-xs text-muted text-center">Your bid appears in the live order book. A seller can accept it directly.</p>
        </form>
      </div>
    </div>
  )
}
