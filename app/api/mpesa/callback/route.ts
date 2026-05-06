import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// M-Pesa callback — uses service role to bypass RLS
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.json()
  const callback = body?.Body?.stkCallback

  if (!callback) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback

  // Find payment by checkout ID
  const { data: payment } = await adminSupabase
    .from('payments')
    .select('id, order_id, amount')
    .eq('mpesa_checkout_id', CheckoutRequestID)
    .single()

  if (!payment) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }

  if (ResultCode === 0) {
    // Payment successful
    const items = CallbackMetadata?.Item ?? []
    const mpesaRef = items.find((i: { Name: string }) => i.Name === 'MpesaReceiptNumber')?.Value ?? null

    await adminSupabase.from('payments').update({
      status: 'completed',
      mpesa_ref: mpesaRef,
      updated_at: new Date().toISOString(),
    }).eq('id', payment.id)

    await adminSupabase.from('orders').update({
      status: 'paid',
      updated_at: new Date().toISOString(),
    }).eq('id', payment.order_id)
  } else {
    // Payment failed
    await adminSupabase.from('payments').update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    }).eq('id', payment.id)

    await adminSupabase.from('orders').update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    }).eq('id', payment.order_id)
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
}
