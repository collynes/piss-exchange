import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'

interface BulkDrugRow {
  generic_name: string
  dosage_form: string
  strength: string
  category: string
  atc_code?: string
}

function sanitizeSlug(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null) as { rows?: BulkDrugRow[] } | null
  const rows = body?.rows
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
  }
  if (rows.length > 5000) {
    return NextResponse.json({ error: 'Maximum 5,000 rows per import' }, { status: 400 })
  }

  const created: { generic_name: string; slug: string }[] = []
  const failed: { row: number; generic_name: string; error: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const generic_name = row.generic_name?.trim()
    const dosage_form = row.dosage_form?.trim()
    const strength = row.strength?.trim()
    const category = row.category?.trim()
    const atc_code = row.atc_code?.trim() || null

    if (!generic_name || !dosage_form || !strength || !category) {
      failed.push({ row: i + 2, generic_name: generic_name ?? '', error: 'Missing required field' })
      continue
    }

    const slug = sanitizeSlug(`${generic_name} ${strength} ${dosage_form}`)
    if (!slug) {
      failed.push({ row: i + 2, generic_name, error: 'Could not generate a valid slug' })
      continue
    }

    const { error } = await supabase.from('drugs').insert({
      generic_name, dosage_form, strength, category, atc_code, slug,
    })

    if (error) {
      failed.push({ row: i + 2, generic_name, error: error.message.includes('duplicate') ? 'Already exists' : error.message })
      continue
    }
    created.push({ generic_name, slug })
  }

  if (created.length > 0) {
    captureServerEvent(user.id, {
      event: 'drug_created',
      props: { drug_id: 'bulk', generic_name: `${created.length} drugs (bulk import)`, by: user.id },
    })
  }

  return NextResponse.json({ created: created.length, failed })
}
