'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface BidModalProps {
  drugId: string
  drugName: string
  onClose: () => void
}

export function BidModal({ drugId, drugName, onClose }: BidModalProps) {
  const router = useRouter()
  const [price, setPrice] = useState('')
  const [qty, setQty] = useState('')
  const [days, setDays] = useState('7')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    if (bidErr) {
      setError(bidErr.message)
      setLoading(false)
      return
    }

    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-border2 rounded w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-text font-semibold text-sm">Place Bid — {drugName}</h2>
          <button onClick={onClose} className="text-muted hover:text-text text-lg leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1">
              Bid Price (KES/unit) <span className="text-red">*</span>
            </label>
            <input type="number" step="0.01" min="0.01" required value={price} onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-bg border border-border2 rounded px-3 py-2 text-sm text-text placeholder:text-muted focus:border-blue transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1">
              Quantity <span className="text-red">*</span>
            </label>
            <input type="number" min="1" required value={qty} onChange={e => setQty(e.target.value)}
              placeholder="100"
              className="w-full bg-bg border border-border2 rounded px-3 py-2 text-sm text-text placeholder:text-muted focus:border-blue transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1">Valid for (days)</label>
            <select value={days} onChange={e => setDays(e.target.value)}
              className="w-full bg-bg border border-border2 rounded px-3 py-2 text-sm text-text focus:border-blue transition-colors">
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>

          {price && qty && (
            <div className="bg-bg rounded p-2 flex justify-between text-xs">
              <span className="text-muted">Total bid value</span>
              <span className="text-green font-semibold">KES {(Number(price) * Number(qty)).toFixed(2)}</span>
            </div>
          )}

          {error && <div className="text-red text-xs">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full bg-green text-white font-semibold py-2.5 rounded text-sm hover:bg-green/90 transition-colors disabled:opacity-50">
            {loading ? 'Placing bid…' : 'Place Bid'}
          </button>
          <p className="text-[10px] text-muted text-center">Your bid appears in the order book. Seller can accept it directly.</p>
        </form>
      </div>
    </div>
  )
}
