import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'

interface UpdateProfileBody {
  org_name?: string
  phone?: string
  license_no?: string
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as UpdateProfileBody | null
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const orgName = body.org_name?.trim()
  const phone = body.phone?.trim()
  const licenseNo = body.license_no?.trim()

  if (!orgName) return NextResponse.json({ error: 'Organisation name is required' }, { status: 400 })
  if (orgName.length > 200) return NextResponse.json({ error: 'Organisation name is too long' }, { status: 400 })
  if (phone && !/^(\+?254|0)\d{9}$/.test(phone)) {
    return NextResponse.json({ error: 'Phone must be a valid Kenyan number — e.g. 0712345678 or +254712345678' }, { status: 400 })
  }
  if (licenseNo && licenseNo.length > 60) {
    return NextResponse.json({ error: 'License number is too long' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      org_name: orgName,
      phone: phone || null,
      license_no: licenseNo || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  captureServerEvent(user.id, { event: 'profile_updated', props: {} })
  return NextResponse.json({ ok: true })
}
