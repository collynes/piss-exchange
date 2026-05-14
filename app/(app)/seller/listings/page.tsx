import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

export default async function SellerListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listings } = await supabase
    .from('listings')
    .select('id, brand_name, origin_country, qty_available, qty_remaining, price_per_unit, status, listing_expiry, expiry_date, created_at, drugs(generic_name, slug, strength, dosage_form)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-text">My Listings</h1>
        <Link href="/seller/listings/new"
          className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all"
          style={{ background: '#7367f0' }}>
          + List Drug
        </Link>
      </div>

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
                  <td className="px-5 py-3.5">
                    <Link href={`/drug/${drug?.slug}`} className="text-[13px] font-semibold text-text hover:text-blue transition-colors">
                      {drug?.generic_name ?? '—'}
                    </Link>
                    <div className="text-xs text-muted">{drug?.strength} · {drug?.dosage_form}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-text">
                    {l.brand_name} · <span className="text-muted">{l.origin_country}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-red font-bold tabular-nums">
                    {formatKES(Number(l.price_per_unit))}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-text tabular-nums">
                    {l.qty_remaining.toLocaleString()} / {l.qty_available.toLocaleString()}
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
                    <Link href={`/drug/${drug?.slug}`} className="text-muted hover:text-text transition-colors inline-flex">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(listings ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">
                No listings yet. <Link href="/seller/listings/new" className="text-blue hover:underline">List your first drug →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
