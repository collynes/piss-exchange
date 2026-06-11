import { createClient } from '@/lib/supabase/server'
import { MarketTable } from '@/components/market/MarketTable'
import { formatNumber, formatKES } from '@/lib/utils'

export const revalidate = 10

interface PageProps {
  searchParams: Promise<{ cat?: string; filter?: string; q?: string }>
}

export default async function MarketPage({ searchParams }: PageProps) {
  const { cat, filter, q } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Any verified account (buyer or seller) can place bids
  let canBid = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, verified')
      .eq('id', user.id)
      .maybeSingle()
    canBid = profile?.role === 'admin' || profile?.verified === true
  }

  // All categories, independent of the current ?cat filter, so the
  // category dropdown always offers the full list
  const { data: catRows } = await supabase
    .from('drugs')
    .select('category')
    .eq('active', true)

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
    .or(`listing_expiry.is.null,listing_expiry.gte.${new Date().toISOString().slice(0, 10)}`, { referencedTable: 'listings' })
    .eq('bids.status', 'open')
    .gt('bids.expires_at', new Date().toISOString())

  if (cat && cat !== 'All') query = (query as typeof query).eq('category', cat)
  const { data: drugs } = await query.order('generic_name')

  const { data: totals } = await supabase
    .from('market_data')
    .select('deals_today, turnover_today')

  const totalDeals = totals?.reduce((s, r) => s + (r.deals_today ?? 0), 0) ?? 0
  const totalTurnover = totals?.reduce((s, r) => s + Number(r.turnover_today ?? 0), 0) ?? 0

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
  if (q) {
    const term = q.toLowerCase()
    filtered = filtered.filter(r =>
      r.generic_name.toLowerCase().includes(term) ||
      (r.atc_code?.toLowerCase().includes(term) ?? false))
  }
  if (filter === 'gainers') filtered = filtered.filter(r => r.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct)
  else if (filter === 'losers') filtered = filtered.filter(r => r.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct)
  else if (filter === 'active') filtered = [...filtered].sort((a, b) => b.deals_today - a.deals_today)

  // Derive categories from actual drug data — no hardcoding
  const CATEGORIES = ['All', ...Array.from(new Set(
    (catRows ?? []).map(d => d.category).filter((c): c is string => Boolean(c))
  )).sort()]

  const filterHref = (f?: string) => {
    const params = new URLSearchParams()
    if (f) params.set('filter', f)
    if (cat && cat !== 'All') params.set('cat', cat)
    if (q) params.set('q', q)
    const qs = params.toString()
    return qs ? `/market?${qs}` : '/market'
  }

  return (
    <div className="card">
        {/* Toolbar */}
        <div className="card-header d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <div>
            <h5 className="mb-0">Market Board</h5>
            <small className="text-muted d-none d-sm-block">
            {q ? `${filtered.length} of ${drugs?.length ?? 0} drugs` : `${drugs?.length ?? 0} drugs`}
            {' · Updated every trade'}
          </small>
          </div>

          {/* Search + category — plain GET form, server filters via ?q / ?cat */}
          <form method="GET" action="/market" className="d-flex align-items-center gap-1 flex-grow-1 flex-md-grow-0" style={{ maxWidth: 480 }}>
            {filter && <input type="hidden" name="filter" value={filter} />}
            <input name="q" defaultValue={q ?? ''} placeholder="Search drug…"
              className="form-control form-control-sm" style={{ minWidth: 140 }} />
            <select name="cat" defaultValue={cat ?? 'All'}
              className="form-select form-select-sm w-auto flex-shrink-0">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="btn btn-sm btn-primary flex-shrink-0">
              <i className="bx bx-search" />
            </button>
            {(q || (cat && cat !== 'All')) && (
              <a href="/market" className="btn btn-sm btn-text-secondary flex-shrink-0">Clear</a>
            )}
          </form>

          <div className="btn-group flex-shrink-0" role="group">
            {[
              { label: 'All', f: undefined },
              { label: 'Gainers', f: 'gainers' },
              { label: 'Losers', f: 'losers' },
              { label: 'Active', f: 'active' },
            ].map(({ label, f }) => (
              <a key={label}
                href={filterHref(f)}
                className={`btn btn-sm
                  ${filter === f || (!filter && !f)
                    ? 'btn-primary'
                    : 'btn-outline-secondary'}`}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <MarketTable rows={filtered} canBid={canBid} />

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
  )
}
