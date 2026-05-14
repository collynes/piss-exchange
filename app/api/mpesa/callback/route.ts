import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { releaseOrderStock } from '@/lib/orders/inventory'
import { captureServerEvent } from '@/lib/posthog'

export async function POST(request: Request) {
  // C1: Reject callbacks that don't carry the shared secret embedded in the CallBackURL
  const callbackSecret = process.env.MPESA_CALLBACK_SECRET
  if (callbackSecret) {
    const url = new URL(request.url)
    if (url.searchParams.get('token') !== callbackSecret) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }
  }

  const body = await request.json().catch(() => null)
  const callback = body?.Body?.stkCallback

  if (!callback) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback

  const adminSupabase = createAdminClient()

  const { data: payment } = await adminSupabase
    .from('payments')
    .select('id, order_id, amount, status')
    .eq('mpesa_checkout_id', CheckoutRequestID)
    .single()

  if (!payment) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }

  // C2: Idempotency — Safaricom retries on non-200 or timeout; skip if already processed
  if (payment.status !== 'pending') {
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }

  const now = new Date().toISOString()

  if (ResultCode === 0) {
    const items = CallbackMetadata?.Item ?? []
    const mpesaRef = items.find((i: { Name: string }) => i.Name === 'MpesaReceiptNumber')?.Value ?? null

    await adminSupabase.from('payments').update({
      status: 'completed',
      mpesa_ref: mpesaRef,
      updated_at: now,
    }).eq('id', payment.id)

    await adminSupabase.from('orders').update({
      status: 'paid',
      updated_at: now,
    }).eq('id', payment.order_id)

    const { data: order } = await adminSupabase
      .from('orders').select('buyer_id').eq('id', payment.order_id).single()
    if (order) {
      captureServerEvent(order.buyer_id, {
        event: 'payment_completed',
        props: { order_id: payment.order_id, amount: payment.amount },
      })
    }
  } else {
    // Payment failed — stock was reserved at stk-push time, release it now
    await releaseOrderStock(adminSupabase, payment.order_id)

    await adminSupabase.from('payments').update({
      status: 'failed',
      updated_at: now,
    }).eq('id', payment.id)

    await adminSupabase.from('orders').update({
      status: 'cancelled',
      updated_at: now,
    }).eq('id', payment.order_id)
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
}
