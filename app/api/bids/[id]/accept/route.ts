import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureServerEvent } from '@/lib/posthog'

// Lets a verified seller (or admin) accept an open bid directly — creating an
// order without the buyer needing to find and buy a listing first. Used for
// negotiated / bulk procurement deals where Dawahub settles the payment
// out-of-band rather than routing it through the buyer's M-Pesa escrow.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verified')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  if (!isAdmin && (profile?.role !== 'seller' || !profile.verified)) {
    return NextResponse.json({ error: 'Only verified sellers can accept bids' }, { status: 403 })
  }

  const adminSupabase = createAdminClient()
  const { data: bid } = await adminSupabase
    .from('bids')
    .select('id, drug_id, buyer_id, qty, price_per_unit, expires_at, status')
    .eq('id', id)
    .single()

  if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
  if (bid.buyer_id === user.id) {
    return NextResponse.json({ error: 'You cannot accept your own bid' }, { status: 400 })
  }
  if (bid.status !== 'open') {
    return NextResponse.json({ error: 'Bid is no longer open' }, { status: 400 })
  }
  if (new Date(bid.expires_at).getTime() < Date.now()) {
    await adminSupabase.from('bids').update({ status: 'expired' }).eq('id', id).eq('status', 'open')
    return NextResponse.json({ error: 'Bid has expired' }, { status: 400 })
  }

  const price = Number(bid.price_per_unit)
  const total = Number((bid.qty * price).toFixed(2))

  // Atomically flip the bid to 'accepted' — guards against two sellers racing on the same bid
  const { data: claimedBid } = await adminSupabase
    .from('bids')
    .update({ status: 'accepted', accepted_by: user.id, accepted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'open')
    .select('id')
    .single()

  if (!claimedBid) {
    return NextResponse.json({ error: 'Bid was just accepted by someone else' }, { status: 409 })
  }

  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      bid_id: bid.id,
      drug_id: bid.drug_id,
      buyer_id: bid.buyer_id,
      seller_id: user.id,
      qty: bid.qty,
      price_per_unit: price,
      total_amount: total,
      status: 'confirmed',
      escrow_status: 'holding',
      settlement_method: 'dawahub_credit',
    })
    .select('id')
    .single()

  if (orderError || !order) {
    // Roll back the bid claim so it isn't stuck in limbo
    await adminSupabase.from('bids').update({ status: 'open', accepted_by: null, accepted_at: null }).eq('id', id)
    return NextResponse.json({ error: orderError?.message ?? 'Failed to create order' }, { status: 500 })
  }

  captureServerEvent(user.id, {
    event: 'bid_accepted',
    props: { bid_id: bid.id, order_id: order.id, drug_id: bid.drug_id, qty: bid.qty, price },
  })

  return NextResponse.json({ orderId: order.id })
}
