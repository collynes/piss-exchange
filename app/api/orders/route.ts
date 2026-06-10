import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureServerEvent } from '@/lib/posthog'

interface CreateOrderBody {
  listingId: string
  qty: number
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as CreateOrderBody | null
  const listingId = body?.listingId
  const qty = Number(body?.qty)

  if (!listingId || !Number.isInteger(qty) || qty <= 0) {
    return NextResponse.json({ error: 'Invalid order request' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verified')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  if (!isAdmin && !profile?.verified) {
    return NextResponse.json({ error: 'Only verified accounts can place orders' }, { status: 403 })
  }

  const adminSupabase = createAdminClient()
  const { data: listing, error: listingError } = await adminSupabase
    .from('listings')
    .select('id, drug_id, seller_id, qty_remaining, price_per_unit, min_order_qty, status, listing_expiry')
    .eq('id', listingId)
    .single()

  if (listingError || !listing || listing.status !== 'active') {
    return NextResponse.json({ error: 'Listing is not available' }, { status: 404 })
  }

  if (listing.listing_expiry && new Date(listing.listing_expiry).getTime() < Date.now()) {
    return NextResponse.json({ error: 'This listing has expired' }, { status: 410 })
  }

  if (listing.seller_id === user.id) {
    return NextResponse.json({ error: 'You cannot buy your own listing' }, { status: 400 })
  }

  if (qty < listing.min_order_qty) {
    return NextResponse.json({ error: `Minimum order is ${listing.min_order_qty} units` }, { status: 400 })
  }

  if (qty > listing.qty_remaining) {
    return NextResponse.json({ error: `Only ${listing.qty_remaining} units available` }, { status: 409 })
  }

  const price = Number(listing.price_per_unit)
  const total = Number((qty * price).toFixed(2))

  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      listing_id: listing.id,
      drug_id: listing.drug_id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      qty,
      price_per_unit: price,
      total_amount: total,
      status: 'pending',
      escrow_status: 'holding',
    })
    .select('id, total_amount')
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? 'Order failed' }, { status: 500 })
  }

  captureServerEvent(user.id, {
    event: 'order_created',
    props: { order_id: order.id, drug_id: listing.drug_id, total, source: 'listing' },
  })

  return NextResponse.json({ orderId: order.id, total: Number(order.total_amount) })
}
