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
      <div className="bg-surface border-b border-border h-8 flex items-center px-4">
        <span className="text-xs text-muted">No trades yet — market opens when first listing is placed</span>
      </div>
    )
  }

  return (
    <div className="bg-surface border-b border-border h-8 overflow-hidden flex items-center">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => {
          const drug = item.drugs
          if (!drug) return null
          const pct = Number(item.change_pct ?? 0)
          return (
            <div key={i} className="inline-flex items-center gap-2 px-5 border-r border-border h-8 text-xs shrink-0">
              <span className="text-muted">{drug.generic_name} {drug.strength}</span>
              <span className="text-white font-semibold">
                {item.last_price ? `KES ${Number(item.last_price).toFixed(2)}` : '—'}
              </span>
              <span className={changeClass(pct)}>{formatChange(pct)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
