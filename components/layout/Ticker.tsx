import { createClient } from '@/lib/supabase/server'
import { formatChange, changeClass } from '@/lib/utils'

type MarketRow = {
  drug_id: string
  last_price: number | null
  change_pct: number | null
  drugs: { generic_name: string; strength: string; dosage_form: string } | null
}

export async function Ticker() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('market_data')
    .select('drug_id, last_price, change_pct, drugs(generic_name, strength, dosage_form)')
    .not('last_price', 'is', null)
    .order('deals_today', { ascending: false })
    .limit(20)

  const items = (data as MarketRow[] | null) ?? []
  const doubled = [...items, ...items]

  if (doubled.length === 0) {
    return (
      <div className="bg-bg border-b border-border h-7 flex items-center px-4">
        <span className="text-[11px] text-muted">No trades yet — market opens when first listing is placed</span>
      </div>
    )
  }

  return (
    <div className="bg-bg border-b border-border h-7 overflow-hidden flex items-center">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => {
          const drug = item.drugs
          if (!drug) return null
          const pct = Number(item.change_pct ?? 0)
          const isUp = pct >= 0
          return (
            <div key={i} className="inline-flex items-center gap-2 px-4 h-7 text-[11px] shrink-0">
              <span className="text-muted font-medium">{drug.generic_name} {drug.strength}</span>
              <span className="text-text font-semibold tabular-nums">
                {item.last_price ? Number(item.last_price).toFixed(2) : '—'}
              </span>
              <span className={`font-semibold tabular-nums ${isUp ? 'text-green' : 'text-red'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
              </span>
              <span className="text-border2 text-[8px]">●</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
