import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createUserClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createUserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify buyer owns this order
  const { data: order } = await supabase
    .from('orders')
    .select('id, seller_id, total_amount')
    .eq('id', id)
    .eq('buyer_id', user.id)
    .eq('status', 'shipped')
    .single()

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

  return NextResponse.redirect(new URL(`/orders/${id}`, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
