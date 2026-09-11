import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/sms'

// Registration happens client-side (supabase.auth.signUp), so there's no
// server route in that path to hang the welcome SMS off. Called once, right
// after profile creation succeeds.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('org_name, phone').eq('id', user.id).single()

  if (profile?.phone) {
    sendSms(profile.phone,
      `Welcome to Dawahub PISS Exchange, ${profile.org_name}. Your account is under review and you'll be notified once verified.`)
  }

  return NextResponse.json({ ok: true })
}
