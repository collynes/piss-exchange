import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'
import { sendSms } from '@/lib/sms'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('profiles')
    .update({ is_investor: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (!error) {
    captureServerEvent(id, { event: 'investor_granted', props: { by: user.id } })
    const { data: profile } = await supabase.from('profiles').select('phone').eq('id', id).single()
    sendSms(profile?.phone, `Dawahub PISS Exchange: your account has been granted investor status.`)
  }

  const dest = error
    ? `/admin/users?error=${encodeURIComponent(error.message)}`
    : '/admin/users?success=investor_granted'
  return NextResponse.redirect(new URL(dest, request.url))
}
