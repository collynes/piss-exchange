import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface CreateListingBody {
  drugId: string
  brandName: string
  manufacturer?: string
  originCountry: string
  qtyAvailable: number
  pricePerUnit: number
  minOrderQty: number
  batchNo?: string
  expiryDate?: string
  listingExpiry?: string
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as CreateListingBody | null
  const qty = Number(body?.qtyAvailable)
  const price = Number(body?.pricePerUnit)
  const minQty = Number(body?.minOrderQty)

  if (!body?.drugId || !body.brandName?.trim() || !body.originCountry?.trim() ||
      !Number.isInteger(qty) || qty <= 0 ||
      !Number.isFinite(price) || price <= 0 ||
      !Number.isInteger(minQty) || minQty <= 0 || minQty > qty) {
    return NextResponse.json({ error: 'Invalid listing request' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verified')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'seller' || !profile.verified) {
    return NextResponse.json({ error: 'Only verified sellers can list stock' }, { status: 403 })
  }

  const adminSupabase = createAdminClient()
  const { data: drug } = await adminSupabase
    .from('drugs')
    .select('id, slug, active')
    .eq('id', body.drugId)
    .single()

  if (!drug?.active) {
    return NextResponse.json({ error: 'Drug is not available for listing' }, { status: 404 })
  }

  const { error } = await adminSupabase.from('listings').insert({
    drug_id: drug.id,
    seller_id: user.id,
    brand_name: body.brandName.trim(),
    manufacturer: emptyToNull(body.manufacturer),
    origin_country: body.originCountry.trim(),
    qty_available: qty,
    qty_remaining: qty,
    price_per_unit: Number(price.toFixed(4)),
    min_order_qty: minQty,
    batch_no: emptyToNull(body.batchNo),
    expiry_date: emptyToNull(body.expiryDate),
    listing_expiry: emptyToNull(body.listingExpiry),
    status: 'active',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ slug: drug.slug })
}
