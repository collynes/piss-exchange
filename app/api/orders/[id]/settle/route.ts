import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureServerEvent } from '@/lib/posthog'

// Admin-only: marks a Dawahub-credit order as settled — i.e. Dawahub has paid
// the seller directly (off-platform) and is settling with the buyer separately.
// This bypasses the buyer M-Pesa escrow flow entirely: releases escrow, records
// a completed 'dawahub_credit' payment, and writes the trade to history.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const adminSupabase = createAdminClient()
  const { data: order } = await adminSupabase
    .from('orders')
    .select('id, drug_id, buyer_id, seller_id, qty, price_per_unit, total_amount, status, escrow_status, settlement_method')
    .eq('id', id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.settlement_method !== 'dawahub_credit') {
    return NextResponse.json({ error: 'Order is not a Dawahub-settled order' }, { status: 400 })
  }
  if (order.escrow_status === 'released') {
    return NextResponse.json({ error: 'Order has already been settled' }, { status: 400 })
  }
  if (!['confirmed', 'shipped', 'delivered'].includes(order.status)) {
    return NextResponse.json({ error: 'Order must be confirmed, shipped, or delivered before settling' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const finalStatus = order.status === 'shipped' ? 'delivered' : order.status

  const { error: updateError } = await adminSupabase.from('orders').update({
    status: finalStatus,
    escrow_status: 'released',
    updated_at: now,
  }).eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await adminSupabase.from('payments').insert({
    order_id: id,
    amount: order.total_amount,
    currency: 'KES',
    method: 'dawahub_credit',
    status: 'completed',
    escrow_released_at: now,
  })

  // Record the trade if not already recorded (e.g. order wasn't marked delivered via the normal flow)
  const { data: existingTrade } = await adminSupabase.from('trades').select('id').eq('order_id', id).maybeSingle()
  if (!existingTrade) {
    await adminSupabase.from('trades').insert({
      order_id: id,
      drug_id: order.drug_id,
      buyer_id: order.buyer_id,
      seller_id: order.seller_id,
      qty: order.qty,
      price_per_unit: order.price_per_unit,
      total_amount: order.total_amount,
    })
  }

  captureServerEvent(user.id, {
    event: 'order_settled_dawahub',
    props: { order_id: id, total: Number(order.total_amount) },
  })

  return NextResponse.redirect(new URL('/admin/orders', request.url))
}
