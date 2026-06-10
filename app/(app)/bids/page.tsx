import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MyBidsClient, type MyBid } from './MyBidsClient'

export const revalidate = 0

interface BidRow {
  id: string
  qty: number
  price_per_unit: number
  status: string
  expires_at: string
  created_at: string | null
  drugs: unknown
}

function toMyBids(bids: BidRow[], orderByBid: Map<string, string>): MyBid[] {
  const now = Date.now()
  return bids.map(b => {
    const drug = b.drugs as { generic_name: string; slug: string; strength: string; dosage_form: string } | null
    // An "open" bid past expires_at is effectively expired even if the
    // status column hasn't been flipped yet
    const effectiveStatus = b.status === 'open' && new Date(b.expires_at).getTime() < now
      ? 'expired'
      : b.status
    return {
      id: b.id,
      qty: b.qty,
      price_per_unit: Number(b.price_per_unit),
      status: effectiveStatus,
      expires_at: b.expires_at,
      created_at: b.created_at,
      drug_name: drug ? `${drug.generic_name} ${drug.strength} ${drug.dosage_form}` : '—',
      drug_slug: drug?.slug ?? '',
      order_id: orderByBid.get(b.id) ?? null,
    }
  })
}

export default async function MyBidsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/bids')

  const { data: bids } = await supabase
    .from('bids')
    .select('id, qty, price_per_unit, status, expires_at, created_at, accepted_at, drugs(generic_name, slug, strength, dosage_form)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  // Accepted bids → find the orders they produced so we can link straight to them
  const acceptedIds = (bids ?? []).filter(b => b.status === 'accepted').map(b => b.id)
  const orderByBid = new Map<string, string>()
  if (acceptedIds.length > 0) {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, bid_id')
      .in('bid_id', acceptedIds)
    for (const o of orders ?? []) {
      if (o.bid_id) orderByBid.set(o.bid_id, o.id)
    }
  }

  const rows = toMyBids(bids ?? [], orderByBid)

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-text">My Bids</h1>
          <p className="text-xs text-muted mt-0.5">
            Bids you have placed — when a seller accepts one, an order is created automatically.
          </p>
        </div>
        <span className="text-xs text-muted flex-shrink-0">
          {rows.filter(r => r.status === 'open').length} open
        </span>
      </div>

      <MyBidsClient bids={rows} />
    </div>
  )
}
