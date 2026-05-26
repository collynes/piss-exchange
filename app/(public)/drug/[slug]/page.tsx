import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DrugStats } from '@/components/market/DrugStats'
import { OrderBookClient } from './OrderBookClient'
import { ChangeBadge } from '@/components/ui/Badge'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export default async function DrugPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: drug } = await supabase
    .from('drugs')
    .select('id, generic_name, slug, dosage_form, strength, atc_code, category')
    .eq('slug', slug)
    .single()

  if (!drug) notFound()

  const [{ data: md }, { data: asks }, { data: bids }, { data: trades }] = await Promise.all([
    supabase.from('market_data').select('*').eq('drug_id', drug.id).maybeSingle(),
    supabase.from('listings')
      .select('id, seller_id, brand_name, origin_country, qty_remaining, price_per_unit, min_order_qty')
      .eq('drug_id', drug.id).eq('status', 'active')
      .order('price_per_unit', { ascending: true }),
    supabase.from('bids')
      .select('id, qty, price_per_unit, created_at')
      .eq('drug_id', drug.id).eq('status', 'open')
      .order('price_per_unit', { ascending: false }),
    supabase.from('trades')
      .select('id, qty, price_per_unit, executed_at')
      .eq('drug_id', drug.id)
      .order('executed_at', { ascending: false })
      .limit(50),
  ])

  return (
    <div className="flex flex-col md:h-[calc(100vh-68px)] md:overflow-hidden">
      {/* Drug header */}
      <div className="px-5 py-3 bg-surface flex items-center justify-between flex-shrink-0 min-w-0 gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-base font-bold text-text break-words min-w-0">{drug.generic_name}</h1>
            {md?.last_price ? (
              <>
                <span className="text-xl font-bold text-text tabular-nums">
                  {Number(md.last_price).toFixed(2)}
                  <span className="text-xs text-muted font-normal ml-1">KES</span>
                </span>
                <ChangeBadge pct={Number(md?.change_pct ?? 0)} />
              </>
            ) : (
              <span className="text-sm text-muted">No trades yet</span>
            )}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {drug.strength} · {drug.dosage_form} · {drug.category}
            {drug.atc_code && ` · ATC: ${drug.atc_code}`}
          </div>
        </div>
        <Link href="/market" className="text-xs text-muted hover:text-text transition-colors">
          ← Market
        </Link>
      </div>

      {/* Stats bar */}
      <DrugStats
        last_price={md?.last_price ? Number(md.last_price) : null}
        prev_price={md?.prev_price ? Number(md.prev_price) : null}
        change_pct={Number(md?.change_pct ?? 0)}
        volume_today={md?.volume_today ?? 0}
        vwap={md?.vwap ? Number(md.vwap) : null}
        deals_today={md?.deals_today ?? 0}
        turnover_today={Number(md?.turnover_today ?? 0)}
      />

      {/* Order book + trades (realtime) */}
      <div className="flex-1 flex flex-col md:overflow-hidden">
        <OrderBookClient
          drugId={drug.id}
          drugName={drug.generic_name}
          initialAsks={asks ?? []}
          initialBids={bids ?? []}
          initialTrades={trades ?? []}
          isAuthenticated={!!user}
          prevPrice={md?.prev_price ? Number(md.prev_price) : null}
        />
      </div>
    </div>
  )
}
