import { NextResponse } from 'next/server'
import { createClient as createUserClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureServerEvent } from '@/lib/posthog'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminSupabase = createAdminClient()
  const { id } = await params
  const supabase = await createUserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  // Verify buyer owns this order; admin can confirm delivery on any order
  const orderBaseQuery = supabase
    .from('orders')
    .select('id, seller_id, total_amount')
    .eq('id', id)
    .eq('status', 'shipped')
  const { data: order } = await (isAdmin ? orderBaseQuery : orderBaseQuery.eq('buyer_id', user.id)).single()

  if (!order) return NextResponse.json({ error: 'Order not found or not in shipped state' }, { status: 404 })

  const now = new Date().toISOString()

  // Update order to delivered + escrow released
  await adminSupabase.from('orders').update({
    status: 'delivered',
    escrow_status: 'released',
    updated_at: now,
  }).eq('id', id)

  // Update payment escrow_released_at
  await adminSupabase.from('payments').update({
    escrow_released_at: now,
    updated_at: now,
  }).eq('order_id', id)

  // Record the trade
  const { data: orderFull } = await adminSupabase
    .from('orders')
    .select('drug_id, buyer_id, seller_id, qty, price_per_unit, total_amount')
    .eq('id', id)
    .single()

  if (orderFull) {
    await adminSupabase.from('trades').insert({
      order_id: id,
      drug_id: orderFull.drug_id,
      buyer_id: orderFull.buyer_id,
      seller_id: orderFull.seller_id,
      qty: orderFull.qty,
      price_per_unit: orderFull.price_per_unit,
      total_amount: orderFull.total_amount,
    })
  }

  captureServerEvent(user.id, { event: 'order_delivered', props: { order_id: id } })

  return NextResponse.redirect(new URL(`/orders/${id}`, request.url))
}
