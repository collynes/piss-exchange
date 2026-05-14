import { createClient } from '@/lib/supabase/server'

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
      <div className="bg-menu-theme border-bottom px-4 py-2">
        <span className="small text-muted">No trades yet — market opens when first listing is placed</span>
      </div>
    )
  }

  return (
    <div className="bg-menu-theme border-bottom overflow-hidden py-2">
      <div className="d-flex ticker-track">
        {doubled.map((item, i) => {
          const drug = item.drugs
          if (!drug) return null
          const pct = Number(item.change_pct ?? 0)
          const isUp = pct >= 0
          return (
            <div key={i} className="inline-flex items-center gap-2 px-4 h-7 text-[11px] shrink-0">
              <span className="text-muted fw-medium">{drug.generic_name} {drug.strength}</span>
              <span className="text-heading fw-semibold">
                {item.last_price ? Number(item.last_price).toFixed(2) : '—'}
              </span>
              <span className={`fw-semibold ${isUp ? 'text-success' : 'text-danger'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
              </span>
              <span className="text-muted">•</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
