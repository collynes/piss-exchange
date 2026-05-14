import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { reserveOrderStock } from '@/lib/orders/inventory'
import { captureServerEvent } from '@/lib/posthog'

interface StkPushBody {
  orderId: string
  phone: string
  amount: number
}

const adminSupabase = createAdminClient()

async function cancelOrder(orderId: string) {
  await adminSupabase
    .from('orders')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
}

async function completeDevPayment(orderId: string, amount: number) {
  const stock = await reserveOrderStock(adminSupabase, orderId)
  if (stock.error) {
    await cancelOrder(orderId)
    return NextResponse.json({ error: stock.error }, { status: 409 })
  }

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
    .update({
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  return NextResponse.json({ checkoutId: `DEV-${orderId}`, simulated: true })
}

// Safaricom Daraja M-Pesa STK Push
export async function POST(request: Request) {
  const body: StkPushBody = await request.json()
  const { orderId, phone, amount } = body

  if (!orderId || !phone || !amount) {
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

  const expectedAmount = Number(order.total_amount)
  if (!Number.isFinite(amount) || Math.abs(Number(amount) - expectedAmount) > 0.01) {
    return NextResponse.json({ error: 'Payment amount does not match order total' }, { status: 400 })
  }

  // Get Daraja access token
  const consumerKey = process.env.MPESA_CONSUMER_KEY!
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  let tokenRes: Response
  try {
    tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${credentials}` },
    })
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      return completeDevPayment(orderId, expectedAmount)
    }
    await cancelOrder(orderId)
    return NextResponse.json({ error: 'Failed to reach M-Pesa' }, { status: 502 })
  }
  if (!tokenRes.ok) {
    if (process.env.NODE_ENV !== 'production') {
      return completeDevPayment(orderId, expectedAmount)
    }
    await cancelOrder(orderId)
    return NextResponse.json({ error: 'Failed to get M-Pesa token' }, { status: 502 })
  }
  const { access_token } = await tokenRes.json()

  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

  // Normalise phone: +254 → 254
  const normalizedPhone = phone.replace(/^\+/, '').replace(/^0/, '254')

  let stkRes: Response
  try {
    stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
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
        CallBackURL: new URL('/api/mpesa/callback', request.url).toString(),
        AccountReference: `PISS-${orderId.slice(0, 8).toUpperCase()}`,
        TransactionDesc: `PISS Exchange Order`,
      }),
    })
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      return completeDevPayment(orderId, expectedAmount)
    }
    await cancelOrder(orderId)
    return NextResponse.json({ error: 'Failed to reach M-Pesa' }, { status: 502 })
  }

  if (!stkRes.ok) {
    const err = await stkRes.json().catch(() => ({}))
    if (process.env.NODE_ENV !== 'production') {
      return completeDevPayment(orderId, expectedAmount)
    }
    await cancelOrder(orderId)
    return NextResponse.json({ error: err.errorMessage ?? 'STK push failed' }, { status: 502 })
  }

  const stkData = await stkRes.json()
  const checkoutId = stkData.CheckoutRequestID

  // Create payment record
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
