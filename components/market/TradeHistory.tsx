interface Trade { id: string; qty: number; price_per_unit: number; executed_at: string }
interface TradeHistoryProps { trades: Trade[]; prevPrice: number | null }

export function TradeHistory({ trades, prevPrice }: TradeHistoryProps) {
  return (
    <div className="flex-shrink-0 bg-surface">
      <div className="flex items-center justify-between px-3 py-2 bg-surface2/40">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">Recent Trades</span>
        <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-text w-52 text-right">
          <span>Price</span><span>Qty</span><span>Time</span>
        </div>
      </div>
      <div className="overflow-y-auto max-h-48">
        {trades.length === 0 && (
          <div className="text-sm text-muted text-center py-4">No trades yet</div>
        )}
        {trades.map((trade, i) => {
          const prev = trades[i + 1]
          const isUp = prev
            ? trade.price_per_unit >= prev.price_per_unit
            : trade.price_per_unit >= (prevPrice ?? 0)
          return (
            <div key={trade.id}
              className="flex items-center px-3 py-1 hover:bg-surface2/40 transition-colors"
              style={{ borderBottom: i < trades.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
              <span className={`font-semibold tabular-nums text-sm w-24 flex items-center gap-1 ${isUp ? 'text-green' : 'text-red'}`}>
                {isUp ? '▲' : '▼'} {Number(trade.price_per_unit).toFixed(2)}
              </span>
              <span className="text-text tabular-nums text-sm w-20 text-right">{trade.qty.toLocaleString()}</span>
              <span className="text-muted text-xs flex-1 text-right">
                {new Date(trade.executed_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
