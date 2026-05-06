import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'

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
        <h1 className="text-lg font-bold text-white">My Listings</h1>
        <Link href="/seller/listings/new"
          className="px-3 py-1.5 bg-blue text-white text-xs font-semibold rounded hover:bg-blue/90 transition-colors">
          + List Drug
        </Link>
      </div>

      <div className="bg-surface border border-border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Drug', 'Brand / Origin', 'Price/unit', 'Qty Rem.', 'Status', 'Expires', ''].map(h => (
                <th key={h} className={`px-4 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider border-b border-border ${h !== 'Drug' && h !== 'Brand / Origin' && h !== '' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).map(l => {
              const drug = l.drugs as { generic_name: string; slug: string; strength: string; dosage_form: string } | null
              return (
                <tr key={l.id} className="border-b border-border/30 hover:bg-bg transition-colors">
                  <td className="px-4 py-2.5">
                    <Link href={`/drug/${drug?.slug}`} className="text-sm font-semibold text-white hover:text-blue transition-colors">
                      {drug?.generic_name ?? '—'}
                    </Link>
                    <div className="text-[10px] text-muted">{drug?.strength} · {drug?.dosage_form}</div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-text">
                    {l.brand_name} · <span className="text-muted">{l.origin_country}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm text-red font-semibold tabular-nums">
                    {formatKES(Number(l.price_per_unit))}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">
                    {l.qty_remaining.toLocaleString()} / {l.qty_available.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize
                      ${l.status === 'active' ? 'bg-green/10 text-green'
                        : l.status === 'filled' ? 'bg-blue/10 text-blue'
                        : 'bg-muted/10 text-muted'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted">
                    {l.listing_expiry ? new Date(l.listing_expiry).toLocaleDateString('en-KE') : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/drug/${drug?.slug}`} className="text-xs text-blue hover:underline">View</Link>
                  </td>
                </tr>
              )
            })}
            {(listings ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted text-sm">
                No listings yet. <Link href="/seller/listings/new" className="text-blue hover:underline">List your first drug →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
