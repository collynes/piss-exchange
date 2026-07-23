import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'

interface CreateDrugBody {
  generic_name: string
  slug: string
  atc_code: string
  dosage_form: string
  strength: string
  category: string
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) } as const
  return { supabase, user } as const
}

export async function POST(request: Request) {
  const gate = await requireAdmin()
  if ('error' in gate) return gate.error
  const { supabase, user } = gate

  const body = await request.json().catch(() => null) as CreateDrugBody | null
  if (!body?.generic_name?.trim() || !body.slug?.trim() || !body.dosage_form?.trim() || !body.strength?.trim() || !body.category?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase.from('drugs').insert({
    generic_name: body.generic_name.trim(),
    slug: body.slug.trim(),
    atc_code: body.atc_code?.trim() || null,
    dosage_form: body.dosage_form.trim(),
    strength: body.strength.trim(),
    category: body.category.trim(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  captureServerEvent(user.id, { event: 'drug_created', props: { drug_id: data.id, generic_name: data.generic_name, by: user.id } })
  return NextResponse.json(data)
}
