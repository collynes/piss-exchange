import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { reserveOrderStock, releaseOrderStock } from '@/lib/orders/inventory'
import { captureServerEvent } from '@/lib/posthog'

interface StkPushBody {
  orderId: string
  phone: string
}

const MPESA_BASE_URL = process.env.MPESA_BASE_URL ?? 'https://sandbox.safaricom.co.ke'

async function completeDevPayment(
  adminSupabase: ReturnType<typeof createAdminClient>,
  orderId: string,
  amount: number,
) {
  // Stock is already reserved by the caller — just record the payment and mark paid
  await adminSupabase.from('payments').insert({
    order_id: orderId,
    amount,
    currency: 'KES',
    method: 'mpesa',
    mpesa_checkout_id: `DEV-${orderId}`,
    mpesa_ref: `DEV-${orderId.slice(0, 8).toUpperCase()}`,
    status: 'completed',
  })

  await adminSupabase
    .from('orders')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .eq('id', orderId)

  return NextResponse.json({ checkoutId: `DEV-${orderId}`, simulated: true })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as StkPushBody | null
  const { orderId, phone } = body ?? {}

  if (!orderId || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, total_amount')
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status !== 'pending') return NextResponse.json({ error: 'Order is not payable' }, { status: 400 })

  const adminSupabase = createAdminClient()
  const expectedAmount = Number(order.total_amount)

  // Reserve stock atomically before any payment is initiated — prevents TOCTOU oversell
  const stockResult = await reserveOrderStock(adminSupabase, orderId)
  if (stockResult.error) {
    return NextResponse.json({ error: stockResult.error }, { status: 409 })
  }

  const devMode = process.env.MPESA_DEV_MODE === 'true'
  const consumerKey = process.env.MPESA_CONSUMER_KEY!
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  let tokenRes: Response
  try {
    tokenRes = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${credentials}` },
    })
  } catch {
    if (devMode) return completeDevPayment(adminSupabase, orderId, expectedAmount)
    await releaseOrderStock(adminSupabase, orderId)
    return NextResponse.json({ error: 'Failed to reach M-Pesa' }, { status: 502 })
  }

  if (!tokenRes.ok) {
    if (devMode) return completeDevPayment(adminSupabase, orderId, expectedAmount)
    await releaseOrderStock(adminSupabase, orderId)
    return NextResponse.json({ error: 'Failed to get M-Pesa token' }, { status: 502 })
  }

  const { access_token } = await tokenRes.json()
  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
  const normalizedPhone = phone.replace(/^\+/, '').replace(/^0/, '254')

  const callbackSecret = process.env.MPESA_CALLBACK_SECRET
  const callbackUrl = new URL('/api/mpesa/callback', request.url)
  if (callbackSecret) callbackUrl.searchParams.set('token', callbackSecret)

  let stkRes: Response
  try {
    stkRes = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(expectedAmount),
        PartyA: normalizedPhone,
        PartyB: shortcode,
        PhoneNumber: normalizedPhone,
        CallBackURL: callbackUrl.toString(),
        AccountReference: `PISS-${orderId.slice(0, 8).toUpperCase()}`,
        TransactionDesc: 'PISS Exchange Order',
      }),
    })
  } catch {
    if (devMode) return completeDevPayment(adminSupabase, orderId, expectedAmount)
    await releaseOrderStock(adminSupabase, orderId)
    return NextResponse.json({ error: 'Failed to reach M-Pesa' }, { status: 502 })
  }

  if (!stkRes.ok) {
    const err = await stkRes.json().catch(() => ({}))
    if (devMode) return completeDevPayment(adminSupabase, orderId, expectedAmount)
    await releaseOrderStock(adminSupabase, orderId)
    return NextResponse.json({ error: err.errorMessage ?? 'STK push failed' }, { status: 502 })
  }

  const { CheckoutRequestID: checkoutId } = await stkRes.json()

  await adminSupabase.from('payments').insert({
    order_id: orderId,
    amount: expectedAmount,
    currency: 'KES',
    method: 'mpesa',
    mpesa_checkout_id: checkoutId,
    status: 'pending',
  })

  captureServerEvent(user.id, {
    event: 'payment_initiated',
    props: { order_id: orderId, amount: expectedAmount, method: 'mpesa' },
  })

  return NextResponse.json({ checkoutId })
}
