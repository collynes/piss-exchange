import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { ListingActions } from './ListingActions'

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

export default async function SellerListingsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const listingsQuery = supabase
    .from('listings')
    .select('id, brand_name, origin_country, qty_available, qty_remaining, price_per_unit, status, listing_expiry, expiry_date, created_at, drugs(generic_name, slug, strength, dosage_form)')
    .order('created_at', { ascending: false })
  const { data: allListings } = await (isAdmin ? listingsQuery : listingsQuery.eq('seller_id', user.id))

  const term = q?.trim().toLowerCase()
  const listings = term
    ? (allListings ?? []).filter(l => {
        const drug = l.drugs as { generic_name: string } | null
        return l.brand_name.toLowerCase().includes(term) ||
          (drug?.generic_name.toLowerCase().includes(term) ?? false) ||
          (l.origin_country?.toLowerCase().includes(term) ?? false)
      })
    : allListings

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="text-lg font-bold text-text">{isAdmin ? 'All Listings' : 'My Listings'}</h1>
        <div className="flex items-center gap-2">
          <form method="GET" className="d-flex gap-1">
            <input name="q" defaultValue={q ?? ''} placeholder="Search brand, generic, origin…"
              className="form-control form-control-sm" style={{ width: 220 }} />
            <button type="submit" className="btn btn-sm btn-outline-secondary flex-shrink-0">
              <i className="bx bx-search" />
            </button>
          </form>
          <Link href="/seller/listings/new"
            className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all flex-shrink-0"
            style={{ background: '#7367f0' }}>
            + List Drug
          </Link>
        </div>
      </div>

      {term && (
        <div className="mb-3 text-xs text-muted">
          {listings?.length ?? 0} of {allListings?.length ?? 0} listings match &quot;{q}&quot;
          {' · '}<Link href="/seller/listings" className="text-blue hover:underline">Clear</Link>
        </div>
      )}

      <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
              {['Drug', 'Brand / Origin', 'Price/unit', 'Qty Rem.', 'Status', 'Expires', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3.5 text-[11px] font-bold text-muted uppercase tracking-wider ${i > 1 && h !== '' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map((l, i) => {
              const drug = l.drugs as { generic_name: string; slug: string; strength: string; dosage_form: string } | null
              return (
                <tr key={l.id} className="hover:bg-surface2 transition-colors"
                  style={{ borderBottom: i < (listings?.length ?? 0) - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                  <td className="px-5 py-3.5" style={{ maxWidth: '200px' }}>
                    <Link href={`/drug/${encodeURIComponent(drug?.slug ?? '')}`} className="text-[13px] font-semibold text-text hover:text-blue transition-colors truncate block">
                      {drug?.generic_name ?? '—'}
                    </Link>
                    <div className="text-xs text-muted">{drug?.strength} · {drug?.dosage_form}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-text" style={{ maxWidth: '160px' }}>
                    <div className="truncate">{l.brand_name} · <span className="text-muted">{l.origin_country}</span></div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-text font-bold tabular-nums">
                    {formatKES(Number(l.price_per_unit))}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-nowrap">
                    <span className="text-[13px] font-semibold text-text">{l.qty_remaining.toLocaleString()}</span>
                    <span className="text-xs text-muted"> of {l.qty_available.toLocaleString()}</span>
                    <div className="h-1 rounded-full bg-surface2 mt-1.5" style={{ minWidth: 70 }}>
                      <div className="h-1 rounded-full bg-green"
                        style={{ width: `${l.qty_available > 0 ? Math.round((l.qty_remaining / l.qty_available) * 100) : 0}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`badge rounded-pill text-capitalize
                      ${l.status === 'active' ? 'bg-label-success text-success'
                        : l.status === 'filled' ? 'bg-label-primary text-primary'
                        : 'bg-muted/10 text-muted'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-muted">
                    {l.listing_expiry ? new Date(l.listing_expiry).toLocaleDateString('en-KE') : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="d-inline-flex align-items-center gap-2">
                      {l.status === 'active' && <ListingActions listingId={l.id} />}
                      <Link href={`/drug/${encodeURIComponent(drug?.slug ?? '')}`} className="text-muted hover:text-text transition-colors inline-flex">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {(listings ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">
                {term
                  ? <>No listings match &quot;{q}&quot;. <Link href="/seller/listings" className="text-blue hover:underline">Show all</Link></>
                  : <>No listings yet. <Link href="/seller/listings/new" className="text-blue hover:underline">List your first drug →</Link></>}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
