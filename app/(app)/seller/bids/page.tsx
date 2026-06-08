import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SellerBidsClient, type OpenBid } from './SellerBidsClient'

export const revalidate = 0

export default async function SellerBidsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, verified').eq('id', user.id).single()
  if (profile?.role === 'buyer') redirect('/dashboard')
  const isAdmin = profile?.role === 'admin'

  // Open bids are visible platform-wide so any verified seller can fulfil them —
  // pull via the admin client to also resolve the buyer's org name for context.
  const adminSupabase = createAdminClient()
  const { data: bids } = await adminSupabase
    .from('bids')
    .select(`
      id, qty, price_per_unit, expires_at, created_at,
      drugs(generic_name, slug, strength, dosage_form),
      buyer:profiles!bids_buyer_id_fkey(org_name)
    `)
    .eq('status', 'open')
    .gt('expires_at', new Date().toISOString())
    .order('price_per_unit', { ascending: false })
    .limit(200)

  const rows: OpenBid[] = (bids ?? []).map(b => {
    const drug = b.drugs as { generic_name: string; slug: string; strength: string; dosage_form: string } | null
    const buyer = b.buyer as { org_name: string } | null
    return {
      id: b.id,
      qty: b.qty,
      price_per_unit: Number(b.price_per_unit),
      expires_at: b.expires_at,
      created_at: b.created_at,
      drug_name: drug ? `${drug.generic_name} ${drug.strength} ${drug.dosage_form}` : '—',
      buyer_org: buyer?.org_name ?? 'Anonymous Buyer',
    }
  })

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-text">Open Bids</h1>
          <p className="text-xs text-muted mt-0.5">
            {isAdmin
              ? 'Platform-wide open buy bids — accept on behalf of a supplier to create a confirmed order.'
              : 'Accept a bid directly to create a confirmed order — no buyer action needed. Dawahub settles the payment.'}
          </p>
        </div>
        <span className="text-xs text-muted flex-shrink-0">{rows.length} open</span>
      </div>

      <SellerBidsClient bids={rows} canAccept={profile?.verified === true || isAdmin} />
    </div>
  )
}
