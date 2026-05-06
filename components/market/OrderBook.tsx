'use client'

export interface Ask {
  id: string
  seller_id: string
  brand_name: string
  origin_country: string
  qty_remaining: number
  price_per_unit: number
  min_order_qty: number
}

export interface Bid {
  id: string
  qty: number
  price_per_unit: number
  created_at: string
}

interface OrderBookProps {
  asks: Ask[]
  bids: Bid[]
  isAuthenticated: boolean
  onBuyClick: (ask: Ask) => void
  onBidClick: () => void
}

export function OrderBook({ asks, bids, isAuthenticated, onBuyClick, onBidClick }: OrderBookProps) {
  const maxAskQty = Math.max(...asks.map(a => a.qty_remaining), 1)
  const maxBidQty = Math.max(...bids.map(b => b.qty), 1)

  return (
    <div className="grid grid-cols-2 gap-0 overflow-auto">
      {/* Asks */}
      <div className="border-r border-border p-3">
        <div className="text-[10px] font-bold text-red uppercase tracking-wider mb-2 pb-2 border-b border-border">
          Asks — Sellers
        </div>
        <div className="grid grid-cols-4 text-[10px] text-muted mb-1 px-1">
          <span>Price (KES)</span>
          <span className="text-right">Qty</span>
          <span className="text-right col-span-2">Brand / Origin</span>
        </div>
        {asks.length === 0 && <div className="text-xs text-muted text-center py-4">No asks</div>}
        {[...asks].sort((a, b) => a.price_per_unit - b.price_per_unit).map(ask => (
          <div key={ask.id} className="relative grid grid-cols-4 items-center text-xs px-1 py-1 rounded hover:bg-surface2 group">
            <div className="absolute inset-y-0 left-0 bg-red/6 rounded"
              style={{ width: `${(ask.qty_remaining / maxAskQty) * 100}%` }} />
            <span className="relative text-red font-semibold tabular-nums">{Number(ask.price_per_unit).toFixed(2)}</span>
            <span className="relative text-right text-text tabular-nums">{ask.qty_remaining.toLocaleString()}</span>
            <span className="relative text-right text-muted text-[10px] col-span-1">{ask.brand_name} · {ask.origin_country}</span>
            {isAuthenticated ? (
              <button onClick={() => onBuyClick(ask)}
                className="relative ml-auto px-2 py-0.5 bg-blue text-white text-[10px] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Buy
              </button>
            ) : (
              <span className="relative text-[10px] text-muted text-right">
                <a href="/login" className="hover:text-blue">Login to buy</a>
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Bids */}
      <div className="p-3">
        <div className="text-[10px] font-bold text-green uppercase tracking-wider mb-2 pb-2 border-b border-border flex items-center justify-between">
          <span>Bids — Buyers</span>
          {isAuthenticated && (
            <button onClick={onBidClick}
              className="px-2 py-0.5 bg-green/10 text-green border border-green/30 text-[10px] font-semibold rounded hover:bg-green/20 transition-colors">
              + Place Bid
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 text-[10px] text-muted mb-1 px-1">
          <span>Price (KES)</span><span className="text-right">Qty</span><span className="text-right">Time</span>
        </div>
        {bids.length === 0 && <div className="text-xs text-muted text-center py-4">No bids</div>}
        {[...bids].sort((a, b) => b.price_per_unit - a.price_per_unit).map(bid => (
          <div key={bid.id} className="relative grid grid-cols-3 text-xs px-1 py-1 rounded hover:bg-surface2">
            <div className="absolute inset-y-0 left-0 bg-green/6 rounded"
              style={{ width: `${(bid.qty / maxBidQty) * 100}%` }} />
            <span className="relative text-green font-semibold tabular-nums">{Number(bid.price_per_unit).toFixed(2)}</span>
            <span className="relative text-right text-text tabular-nums">{bid.qty.toLocaleString()}</span>
            <span className="relative text-right text-muted text-[10px]">
              {new Date(bid.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
