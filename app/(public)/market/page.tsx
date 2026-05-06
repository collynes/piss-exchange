import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DrugSidebar } from '@/components/layout/DrugSidebar'
import { MarketTable } from '@/components/market/MarketTable'
import { formatNumber, formatKES } from '@/lib/utils'

export const revalidate = 10

interface PageProps {
  searchParams: Promise<{ cat?: string; filter?: string }>
}

export default async function MarketPage({ searchParams }: PageProps) {
  const { cat, filter } = await searchParams
  const supabase = await createClient()

  const { data: sidebarData } = await supabase
    .from('market_data')
    .select('drug_id, last_price, change_pct, drugs(generic_name, slug, dosage_form)')
    .order('deals_today', { ascending: false })
    .limit(20)

  let query = supabase
    .from('drugs')
    .select(`
      id, generic_name, slug, dosage_form, strength, atc_code, category,
      market_data(last_price, change_pct, volume_today, deals_today),
      listings(price_per_unit),
      bids(price_per_unit)
    `)
    .eq('active', true)
    .eq('listings.status', 'active')
    .eq('bids.status', 'open')

  if (cat && cat !== 'All') query = (query as typeof query).eq('category', cat)
  const { data: drugs } = await query.order('generic_name')

  const { data: totals } = await supabase
    .from('market_data')
    .select('deals_today, turnover_today')

  const totalDeals = totals?.reduce((s, r) => s + (r.deals_today ?? 0), 0) ?? 0
  const totalTurnover = totals?.reduce((s, r) => s + Number(r.turnover_today ?? 0), 0) ?? 0

  const sidebarDrugs = (sidebarData ?? []).map(r => {
    const drug = r.drugs as { generic_name: string; slug: string; dosage_form: string } | null
    return {
      slug: drug?.slug ?? '',
      generic_name: drug?.generic_name ?? '',
      dosage_form: drug?.dosage_form ?? '',
      last_price: r.last_price ? Number(r.last_price) : null,
      change_pct: r.change_pct ? Number(r.change_pct) : null,
    }
  }).filter(d => d.slug)

  const rows = (drugs ?? []).map(drug => {
    const md = drug.market_data as unknown as { last_price: number | null; change_pct: number; volume_today: number; deals_today: number } | null
    const askPrices = (drug.listings as { price_per_unit: number }[] ?? []).map(l => l.price_per_unit)
    const bidPrices = (drug.bids as { price_per_unit: number }[] ?? []).map(b => b.price_per_unit)
    return {
      drug_id: drug.id,
      slug: drug.slug,
      generic_name: drug.generic_name,
      dosage_form: drug.dosage_form,
      strength: drug.strength,
      atc_code: drug.atc_code,
      last_price: md?.last_price ?? null,
      change_pct: md?.change_pct ?? 0,
      best_ask: askPrices.length ? Math.min(...askPrices) : null,
      best_bid: bidPrices.length ? Math.max(...bidPrices) : null,
      volume_today: md?.volume_today ?? 0,
      deals_today: md?.deals_today ?? 0,
      seller_count: askPrices.length,
    }
  })

  let filtered = rows
  if (filter === 'gainers') filtered = rows.filter(r => r.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct)
  else if (filter === 'losers') filtered = rows.filter(r => r.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct)
  else if (filter === 'active') filtered = [...rows].sort((a, b) => b.deals_today - a.deals_today)

  return (
    <div className="flex h-[calc(100vh-62px)]">
      <div className="w-48 flex-shrink-0">
        <Suspense>
          <DrugSidebar drugs={sidebarDrugs} />
        </Suspense>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-sm font-semibold text-white">Market Board</div>
            <div className="text-xs text-muted mt-0.5">{drugs?.length ?? 0} drugs · Updated every trade</div>
          </div>
          <div className="flex gap-1.5">
            {[
              { label: 'All', f: undefined },
              { label: 'Gainers', f: 'gainers' },
              { label: 'Losers', f: 'losers' },
              { label: 'Most Active', f: 'active' },
            ].map(({ label, f }) => (
              <a key={label}
                href={f ? `/market?filter=${f}${cat ? `&cat=${cat}` : ''}` : `/market${cat ? `?cat=${cat}` : ''}`}
                className={`px-2.5 py-1 text-xs rounded border transition-colors
                  ${filter === f || (!filter && !f)
                    ? 'bg-surface2 text-white border-border2'
                    : 'border-border2 text-muted hover:text-white'
                  }`}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <MarketTable rows={filtered} />

        <div className="border-t border-border px-5 py-1.5 flex items-center gap-5 flex-shrink-0 text-[10.5px]">
          <span className="text-muted">Drugs: <span className="text-text">{drugs?.length ?? 0}</span></span>
          <span className="text-muted">Deals today: <span className="text-text">{formatNumber(totalDeals)}</span></span>
          <span className="text-muted">Turnover: <span className="text-text">{formatKES(totalTurnover)}</span></span>
          <span className="ml-auto flex items-center gap-1.5 text-green">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Live · EAT
          </span>
        </div>
      </div>
    </div>
  )
}
