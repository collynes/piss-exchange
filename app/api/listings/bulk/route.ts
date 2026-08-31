import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureServerEvent } from '@/lib/posthog'

interface BulkListingRow {
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

  const { data: profile } = await supabase
    .from('profiles').select('role, verified').eq('id', user.id).single()

  const isAdmin = profile?.role === 'admin'
  if (!isAdmin && (profile?.role !== 'seller' || !profile.verified)) {
    return NextResponse.json({ error: 'Only verified sellers can list stock' }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as { rows?: BulkListingRow[] } | null
  const rows = body?.rows
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
  }
  if (rows.length > 5000) {
    return NextResponse.json({ error: 'Maximum 5,000 rows per import' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()
  const drugIds = [...new Set(rows.map(r => r.drugId).filter(Boolean))]
  const { data: activeDrugs } = await adminSupabase
    .from('drugs').select('id').in('id', drugIds).eq('active', true)
  const validDrugIds = new Set((activeDrugs ?? []).map(d => d.id))

  let created = 0
  const failed: { row: number; error: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const qty = Number(row.qtyAvailable)
    const price = Number(row.pricePerUnit)
    const minQty = Number(row.minOrderQty)

    if (!row.drugId || !validDrugIds.has(row.drugId)) {
      failed.push({ row: i + 2, error: 'Drug not found in catalogue' }); continue
    }
    if (!row.brandName?.trim() || !row.originCountry?.trim()) {
      failed.push({ row: i + 2, error: 'Missing brand name or origin country' }); continue
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      failed.push({ row: i + 2, error: 'Invalid quantity' }); continue
    }
    if (!Number.isFinite(price) || price <= 0) {
      failed.push({ row: i + 2, error: 'Invalid price' }); continue
    }
    if (!Number.isInteger(minQty) || minQty <= 0 || minQty > qty) {
      failed.push({ row: i + 2, error: 'Invalid minimum order quantity' }); continue
    }

    const { error } = await adminSupabase.from('listings').insert({
      drug_id: row.drugId,
      seller_id: user.id,
      brand_name: row.brandName.trim(),
      manufacturer: emptyToNull(row.manufacturer),
      origin_country: row.originCountry.trim(),
      qty_available: qty,
      qty_remaining: qty,
      price_per_unit: Number(price.toFixed(4)),
      min_order_qty: minQty,
      batch_no: emptyToNull(row.batchNo),
      expiry_date: emptyToNull(row.expiryDate),
      listing_expiry: emptyToNull(row.listingExpiry),
      status: 'active',
    })

    if (error) { failed.push({ row: i + 2, error: error.message }); continue }
    created++
  }

  if (created > 0) {
    captureServerEvent(user.id, {
      event: 'listing_created',
      props: { drug_id: 'bulk', price: 0, qty: created },
    })
  }

  return NextResponse.json({ created, failed })
}
