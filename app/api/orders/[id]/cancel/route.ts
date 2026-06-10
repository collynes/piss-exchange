import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { releaseOrderStock } from '@/lib/orders/inventory'
import { captureServerEvent } from '@/lib/posthog'

// Lets the buyer (or admin) cancel a still-pending order — e.g. an M-Pesa
// prompt that was abandoned, leaving the order stuck and its stock reserved.
// Only pending orders can be cancelled; paid/confirmed/shipped orders must go
// through the dispute/refund path instead.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const adminSupabase = createAdminClient()
  const { data: order } = await adminSupabase
    .from('orders')
    .select('id, buyer_id, status, listing_id')
    .eq('id', id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (!isAdmin && order.buyer_id !== user.id) {
    return NextResponse.json({ error: 'You can only cancel your own orders' }, { status: 403 })
  }
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 })
  }

  // stk-push reserves stock and always writes a payment row, so a payment row
  // is our signal that stock was decremented and must be released. A pending
  // order with a payment row necessarily has that payment still 'pending'
  // (completed → order would be 'paid'; failed → order would be 'cancelled').
  const { data: payment } = await adminSupabase
    .from('payments')
    .select('id')
    .eq('order_id', id)
    .limit(1)
    .maybeSingle()

  // Flip to cancelled, guarding against racing a callback that marks it paid
  const { data: cancelled } = await adminSupabase
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id')
    .single()

  if (!cancelled) {
    return NextResponse.json({ error: 'Order was just paid and can no longer be cancelled' }, { status: 409 })
  }

  // Release reserved stock only if it was actually reserved (stk-push ran)
  if (payment) {
    await releaseOrderStock(adminSupabase, id)
    await adminSupabase.from('payments')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('order_id', id)
      .eq('status', 'pending')
  }

  captureServerEvent(user.id, { event: 'order_cancelled', props: { order_id: id } })
  return NextResponse.json({ ok: true })
}
