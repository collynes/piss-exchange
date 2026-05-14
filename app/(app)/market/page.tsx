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

  // Derive categories from actual drug data — no hardcoding
  const CATEGORIES = ['All', ...Array.from(new Set(
    (drugs ?? []).map(d => d.category).filter((c): c is string => Boolean(c))
  )).sort()]

  return (
    <div className="row g-4">
      {/* Sidebar — desktop only */}
      <div className="col-xl-3 col-lg-4 d-none d-lg-block">
        <Suspense>
          <DrugSidebar drugs={sidebarDrugs} categories={CATEGORIES} />
        </Suspense>
      </div>

      <div className="col-xl-9 col-lg-8">
        <div className="card">
        {/* Mobile category strip */}
        <div className="d-lg-none card-body border-bottom d-flex align-items-center gap-2 overflow-auto">
          {CATEGORIES.map(c => (
            <a key={c}
              href={c === 'All' ? '/market' : `/market?cat=${c}`}
              className={`btn btn-sm flex-shrink-0
                ${(cat ?? 'All') === c
                  ? 'btn-primary'
                  : 'btn-outline-secondary'}`}>
              {c}
            </a>
          ))}
        </div>

        {/* Toolbar */}
        <div className="card-header d-flex align-items-center justify-content-between gap-3">
          <div>
            <h5 className="mb-0">Market Board</h5>
            <small className="text-muted d-none d-sm-block">{drugs?.length ?? 0} drugs · Updated every trade</small>
          </div>
          <div className="btn-group flex-shrink-0" role="group">
            {[
              { label: 'All', f: undefined },
              { label: 'Gainers', f: 'gainers' },
              { label: 'Losers', f: 'losers' },
              { label: 'Active', f: 'active' },
            ].map(({ label, f }) => (
              <a key={label}
                href={f ? `/market?filter=${f}${cat ? `&cat=${cat}` : ''}` : `/market${cat ? `?cat=${cat}` : ''}`}
                className={`btn btn-sm
                  ${filter === f || (!filter && !f)
                    ? 'btn-primary'
                    : 'btn-outline-secondary'}`}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <MarketTable rows={filtered} />

        <div className="card-footer d-flex align-items-center flex-wrap gap-3">
          <small className="text-muted">Drugs: <span className="fw-semibold text-heading">{drugs?.length ?? 0}</span></small>
          <small className="text-muted d-none d-sm-inline">Deals today: <span className="fw-semibold text-heading">{formatNumber(totalDeals)}</span></small>
          <small className="text-muted d-none d-sm-inline">Turnover: <span className="fw-semibold text-heading">{formatKES(totalTurnover)}</span></small>
          <small className="ms-auto d-flex align-items-center gap-2 text-success">
            <span className="badge badge-dot bg-success" />
            Live
          </small>
        </div>
        </div>
      </div>
    </div>
  )
}
