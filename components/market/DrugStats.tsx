import { formatNumber, formatKES } from '@/lib/utils'

interface DrugStatsProps {
  last_price: number | null
  prev_price: number | null
  change_pct: number
  volume_today: number
  vwap: number | null
  deals_today: number
  turnover_today: number
}

export function DrugStats(props: DrugStatsProps) {
  const stats = [
    { label: 'Prev Close', value: props.prev_price ? Number(props.prev_price).toFixed(2) : '—' },
    {
      label: 'Change',
      value: `${props.change_pct > 0 ? '+' : ''}${Number(props.change_pct).toFixed(2)}%`,
      className: props.change_pct > 0 ? 'text-green' : props.change_pct < 0 ? 'text-red' : 'text-text',
    },
    { label: 'Volume', value: formatNumber(props.volume_today) },
    { label: 'Deals', value: formatNumber(props.deals_today) },
    { label: 'VWAP', value: props.vwap ? Number(props.vwap).toFixed(2) : '—' },
    { label: 'Turnover', value: formatKES(props.turnover_today) },
  ]
  return (
    <div className="flex gap-6 px-4 py-2 border-b border-border bg-surface overflow-x-auto flex-shrink-0">
      {stats.map(s => (
        <div key={s.label} className="flex-shrink-0">
          <div className="text-[10px] text-muted uppercase tracking-wider">{s.label}</div>
          <div className={`text-xs font-semibold mt-0.5 tabular-nums ${s.className ?? 'text-white'}`}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
