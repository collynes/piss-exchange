interface Trade {
  id: string
  qty: number
  price_per_unit: number
  executed_at: string
}

interface TradeHistoryProps {
  trades: Trade[]
  prevPrice: number | null
}

export function TradeHistory({ trades, prevPrice }: TradeHistoryProps) {
  return (
    <div className="border-t border-border flex-shrink-0">
      <div className="px-4 py-2 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-border">
        Recent Trades
      </div>
      <div className="grid grid-cols-3 text-[10px] text-muted px-4 py-1 border-b border-border/50">
        <span>Price (KES)</span><span className="text-right">Qty</span><span className="text-right">Time</span>
      </div>
      <div className="overflow-y-auto max-h-40">
        {trades.length === 0 && (
          <div className="text-xs text-muted text-center py-4">No trades yet</div>
        )}
        {trades.map((trade, i) => {
          const prevTrade = trades[i + 1]
          const isUp = prevTrade
            ? trade.price_per_unit >= prevTrade.price_per_unit
            : trade.price_per_unit >= (prevPrice ?? 0)
          return (
            <div key={trade.id} className="grid grid-cols-3 text-xs px-4 py-1 border-b border-border/30 hover:bg-surface2">
              <span className={`tabular-nums font-semibold ${isUp ? 'text-green' : 'text-red'}`}>
                {Number(trade.price_per_unit).toFixed(2)}
              </span>
              <span className="text-right text-text tabular-nums">{trade.qty.toLocaleString()}</span>
              <span className="text-right text-muted text-[10px]">
                {new Date(trade.executed_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
