'use client'

export interface Ask {
  id: string; seller_id: string; brand_name: string
  origin_country: string; qty_remaining: number
  price_per_unit: number; min_order_qty: number
}
export interface Bid {
  id: string; qty: number; price_per_unit: number; created_at: string | null
}

interface OrderBookProps {
  asks: Ask[]; bids: Bid[]; isAuthenticated: boolean
  onBuyClick: (ask: Ask) => void; onBidClick: () => void
}

export function OrderBook({ asks, bids, isAuthenticated, onBuyClick, onBidClick }: OrderBookProps) {
  const sortedAsks = [...asks].sort((a, b) => a.price_per_unit - b.price_per_unit)
  const sortedBids = [...bids].sort((a, b) => b.price_per_unit - a.price_per_unit)
  const maxAskQty = Math.max(...asks.map(a => a.qty_remaining), 1)
  const maxBidQty = Math.max(...bids.map(b => b.qty), 1)

  const bestAsk = sortedAsks[0]?.price_per_unit
  const bestBid = sortedBids[0]?.price_per_unit
  const spread = bestAsk && bestBid ? (bestAsk - bestBid).toFixed(2) : null
  const spreadPct = bestAsk && bestBid ? (((bestAsk - bestBid) / bestBid) * 100).toFixed(2) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
      {/* Asks */}
      <div className="border-b md:border-b-0 md:border-r border-border flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 bg-surface2/40">
          <span className="text-xs font-bold text-red uppercase tracking-wider">Asks</span>
          <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-text w-48 text-right">
            <span>Price (KES)</span><span>Qty</span><span>Brand</span>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {asks.length === 0 && (
            <div className="text-[12px] text-muted text-center py-6">No asks</div>
          )}
          {sortedAsks.map(ask => (
            <div key={ask.id} className="relative flex items-center px-3 py-1 hover:bg-surface2 group cursor-pointer"
              onClick={() => isAuthenticated && onBuyClick(ask)}>
              <div className="absolute inset-y-0 right-0 bg-red/8"
                style={{ width: `${(ask.qty_remaining / maxAskQty) * 100}%` }} />
              <span className="relative text-red font-semibold tabular-nums text-sm w-24">{Number(ask.price_per_unit).toFixed(2)}</span>
              <span className="relative text-text tabular-nums text-sm w-20 text-right">{ask.qty_remaining.toLocaleString()}</span>
              <span className="relative text-muted text-xs flex-1 text-right truncate">{ask.brand_name}</span>
              {isAuthenticated && (
                <button className="relative ml-2 px-2 py-0.5 bg-blue text-white text-[10px] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Buy
                </button>
              )}
              {!isAuthenticated && (
                <a href="/login" className="relative ml-2 text-[10px] text-muted hover:text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  Login
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bids */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 bg-surface2/40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-green uppercase tracking-wider">Bids</span>
            {spread && (
              <span className="text-xs text-muted">
                Spread: <span className="text-text">{spread}</span>
                <span className="ml-1 text-muted">({spreadPct}%)</span>
              </span>
            )}
          </div>
          {isAuthenticated && (
            <button onClick={onBidClick}
              className="px-2 py-0.5 text-xs font-semibold text-green border border-green/30 rounded hover:bg-green/10 transition-colors">
              + Bid
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {bids.length === 0 && (
            <div className="text-[12px] text-muted text-center py-6">No bids</div>
          )}
          {sortedBids.map(bid => (
            <div key={bid.id} className="relative flex items-center px-3 py-1 hover:bg-surface2">
              <div className="absolute inset-y-0 right-0 bg-green/8"
                style={{ width: `${(bid.qty / maxBidQty) * 100}%` }} />
              <span className="relative text-green font-semibold tabular-nums text-sm w-24">{Number(bid.price_per_unit).toFixed(2)}</span>
              <span className="relative text-text tabular-nums text-sm w-20 text-right">{bid.qty.toLocaleString()}</span>
              <span className="relative text-muted text-xs flex-1 text-right">
                {bid.created_at ? new Date(bid.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
