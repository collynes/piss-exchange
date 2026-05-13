import { formatNumber, formatKES } from '@/lib/utils'

interface DrugStatsProps {
  last_price: number | null; prev_price: number | null; change_pct: number
  volume_today: number; vwap: number | null; deals_today: number; turnover_today: number
}

export function DrugStats(props: DrugStatsProps) {
  const isUp = props.change_pct >= 0
  const stats = [
    { label: 'Prev Close', value: props.prev_price ? Number(props.prev_price).toFixed(2) : '—' },
    {
      label: 'Change',
      value: `${isUp ? '+' : ''}${Number(props.change_pct).toFixed(2)}%`,
      className: isUp ? 'text-green' : 'text-red',
    },
    { label: 'Volume', value: formatNumber(props.volume_today) },
    { label: 'Deals', value: formatNumber(props.deals_today) },
    { label: 'VWAP', value: props.vwap ? Number(props.vwap).toFixed(2) : '—' },
    { label: 'Turnover', value: formatKES(props.turnover_today) },
  ]
  return (
    <div className="flex items-center gap-6 px-4 py-1.5 border-b border-border bg-surface overflow-x-auto flex-shrink-0">
      {stats.map(s => (
        <div key={s.label} className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-muted">{s.label}</span>
          <span className={`text-[13px] font-semibold tabular-nums ${s.className ?? 'text-text'}`}>{s.value}</span>
        </div>
      ))}
    </div>
  )
}
