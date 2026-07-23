import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('profiles').update({ verified: false, updated_at: new Date().toISOString() }).eq('id', id)
  if (!error) captureServerEvent(id, { event: 'user_suspended', props: { by: user.id } })
  const dest = error
    ? `/admin/users?error=${encodeURIComponent(error.message)}`
    : '/admin/users?success=suspended'
  return NextResponse.redirect(new URL(dest, request.url))
}
