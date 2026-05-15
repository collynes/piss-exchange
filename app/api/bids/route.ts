import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureServerEvent } from '@/lib/posthog'

interface CreateBidBody {
  drugId: string
  qty: number
  price: number
  days: number
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as CreateBidBody | null
  const drugId = body?.drugId
  const qty = Number(body?.qty)
  const price = Number(body?.price)
  const days = Number(body?.days)

  if (!drugId || !Number.isInteger(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0 || !Number.isInteger(days) || days < 1 || days > 30) {
    return NextResponse.json({ error: 'Invalid bid request' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verified')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'buyer' || !profile.verified) {
    return NextResponse.json({ error: 'Only verified buyers can place bids' }, { status: 403 })
  }

  const adminSupabase = createAdminClient()
  const { data: drug } = await adminSupabase
    .from('drugs')
    .select('id, active')
    .eq('id', drugId)
    .single()

  if (!drug?.active) {
    return NextResponse.json({ error: 'Drug is not available for bidding' }, { status: 404 })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)

  const { error } = await adminSupabase.from('bids').insert({
    drug_id: drug.id,
    buyer_id: user.id,
    qty,
    price_per_unit: Math.round(price * 10000) / 10000,
    expires_at: expiresAt.toISOString(),
    status: 'open',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  captureServerEvent(user.id, {
    event: 'bid_placed',
    props: { drug_id: drug.id, price: Number(price.toFixed(4)), qty },
  })
  return NextResponse.json({ ok: true })
}
