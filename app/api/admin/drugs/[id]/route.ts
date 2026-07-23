import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'

interface UpdateDrugBody {
  generic_name: string
  slug: string
  atc_code: string
  dosage_form: string
  strength: string
  category: string
  active?: boolean
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) } as const
  return { supabase, user } as const
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireAdmin()
  if ('error' in gate) return gate.error
  const { supabase, user } = gate

  const body = await request.json().catch(() => null) as Partial<UpdateDrugBody> | null
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  // Status-only toggle
  if (Object.keys(body).length === 1 && typeof body.active === 'boolean') {
    const { data, error } = await supabase.from('drugs').update({ active: body.active }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    captureServerEvent(user.id, { event: 'drug_status_toggled', props: { drug_id: id, active: body.active, by: user.id } })
    return NextResponse.json(data)
  }

  if (!body.generic_name?.trim() || !body.slug?.trim() || !body.dosage_form?.trim() || !body.strength?.trim() || !body.category?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase.from('drugs').update({
    generic_name: body.generic_name.trim(),
    slug: body.slug.trim(),
    atc_code: body.atc_code?.trim() || null,
    dosage_form: body.dosage_form.trim(),
    strength: body.strength.trim(),
    category: body.category.trim(),
  }).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  captureServerEvent(user.id, { event: 'drug_updated', props: { drug_id: id, generic_name: data.generic_name, by: user.id } })
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireAdmin()
  if ('error' in gate) return gate.error
  const { supabase, user } = gate

  const { data: drug } = await supabase.from('drugs').select('generic_name').eq('id', id).single()
  const { error } = await supabase.from('drugs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  captureServerEvent(user.id, { event: 'drug_deleted', props: { drug_id: id, generic_name: drug?.generic_name ?? 'unknown', by: user.id } })
  return NextResponse.json({ ok: true })
}
