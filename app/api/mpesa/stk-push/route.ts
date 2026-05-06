import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface StkPushBody {
  orderId: string
  phone: string
  amount: number
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

  // Get Daraja access token
  const consumerKey = process.env.MPESA_CONSUMER_KEY!
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

  const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${credentials}` },
  })
  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'Failed to get M-Pesa token' }, { status: 502 })
  }
  const { access_token } = await tokenRes.json()

  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

  // Normalise phone: +254 → 254
  const normalizedPhone = phone.replace(/^\+/, '').replace(/^0/, '254')

  const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
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
      Amount: Math.ceil(amount),
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mpesa/callback`,
      AccountReference: `PISS-${orderId.slice(0, 8).toUpperCase()}`,
      TransactionDesc: `PISS Exchange Order`,
    }),
  })

  if (!stkRes.ok) {
    const err = await stkRes.json().catch(() => ({}))
    return NextResponse.json({ error: err.errorMessage ?? 'STK push failed' }, { status: 502 })
  }

  const stkData = await stkRes.json()
  const checkoutId = stkData.CheckoutRequestID

  // Create payment record
  await supabase.from('payments').insert({
    order_id: orderId,
    amount,
    currency: 'KES',
    method: 'mpesa',
    mpesa_checkout_id: checkoutId,
    status: 'pending',
  })

  return NextResponse.json({ checkoutId })
}
