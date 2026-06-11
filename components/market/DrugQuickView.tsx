'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { OrderBook, type Ask, type Bid } from './OrderBook'
import { BidModal } from './BidModal'
import { BuyModal } from '@/app/(public)/drug/[slug]/BuyModal'

const GLASS = {
  background: 'var(--bs-card-bg, #fff)',
  border: '1px solid var(--bs-border-color, rgba(47,43,61,.14))',
  boxShadow: '0 18px 48px -20px rgba(47,43,61,.35)',
} as const

export interface QuickViewDrug {
  drug_id: string
  slug: string
  generic_name: string
  strength: string
  dosage_form: string
  last_price: number | null
}

interface DrugQuickViewProps {
  drug: QuickViewDrug
  canBid: boolean
  onClose: () => void
}

// In-place order book popup for a market row — browse, bid and buy without
// leaving the market board. The chevron/full page remains at /drug/[slug].
export function DrugQuickView({ drug, canBid, onClose }: DrugQuickViewProps) {
  const [asks, setAsks] = useState<Ask[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [buyAsk, setBuyAsk] = useState<Ask | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  // Bumped after a bid/buy closes so the book refetches
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    const today = new Date().toISOString().slice(0, 10)
    Promise.all([
      supabase.from('listings')
        .select('id, seller_id, brand_name, origin_country, qty_remaining, price_per_unit, min_order_qty')
        .eq('drug_id', drug.drug_id).eq('status', 'active')
        .or(`listing_expiry.is.null,listing_expiry.gte.${today}`)
        .order('price_per_unit', { ascending: true }),
      supabase.from('bids')
        .select('id, qty, price_per_unit, created_at')
        .eq('drug_id', drug.drug_id).eq('status', 'open')
        .gt('expires_at', new Date().toISOString())
        .order('price_per_unit', { ascending: false }),
    ]).then(([{ data: askData }, { data: bidData }]) => {
      if (cancelled) return
      setAsks(askData ?? [])
      setBids(bidData ?? [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [drug.drug_id, reloadKey])

  const bestAsk = asks.length ? Math.min(...asks.map(a => Number(a.price_per_unit))) : null
  const bestBid = bids.length ? Math.max(...bids.map(b => Number(b.price_per_unit))) : null

  return (
    // zIndex must beat Bootstrap's .sticky-top (1020) used by the market table header
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 1090 }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        style={{ ...GLASS, maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-surface2 border-b border-border flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-muted uppercase tracking-wider">Order Book</div>
            <div className="text-xl font-bold text-text leading-tight mt-0.5 truncate">{drug.generic_name}</div>
            <div className="text-xs text-muted mt-0.5">
              {drug.strength} · {drug.dosage_form}
              {drug.last_price != null && <> · Last {Number(drug.last_price).toFixed(2)} KES</>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={`/drug/${encodeURIComponent(drug.slug)}`}
              className="btn btn-sm btn-outline-secondary text-nowrap">
              Full page
            </Link>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-surface2 text-muted hover:text-text transition-colors text-base leading-none">
              ×
            </button>
          </div>
        </div>

        {/* Order book */}
        <div className="flex-1 overflow-auto" style={{ minHeight: 220 }}>
          {loading ? (
            <div className="py-10 text-center text-muted text-sm">Loading order book…</div>
          ) : (
            <OrderBook asks={asks} bids={bids} canBid={canBid} canAcceptBid={false}
              onBuyClick={setBuyAsk} onBidClick={() => setShowBidModal(true)} />
          )}
        </div>

        {/* Nested modals live inside the stopPropagation panel so their
            backdrop clicks don't bubble up and close the quick view too */}
        {buyAsk && (
          <BuyModal ask={buyAsk} drugName={drug.generic_name}
            onClose={() => { setBuyAsk(null); setReloadKey(k => k + 1) }} />
        )}
        {showBidModal && (
          <BidModal drugId={drug.drug_id} drugName={drug.generic_name}
            bestBid={bestBid} bestAsk={bestAsk} lastPrice={drug.last_price}
            onClose={() => { setShowBidModal(false); setReloadKey(k => k + 1) }} />
        )}
      </div>
    </div>
  )
}
