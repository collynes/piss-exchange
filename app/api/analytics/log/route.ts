import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'

// Whitelisted client-triggerable events only — everything else must be
// logged server-side directly where the mutation happens. distinct_id is
// always the authenticated session user, never client-supplied.
const ALLOWED_EVENTS = ['user_registered', 'user_logged_in'] as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { event?: string; props?: Record<string, unknown> } | null
  if (!body?.event || !ALLOWED_EVENTS.includes(body.event as typeof ALLOWED_EVENTS[number])) {
    return NextResponse.json({ error: 'Event not allowed' }, { status: 400 })
  }

  captureServerEvent(user.id, { event: body.event, props: body.props ?? {} } as never)
  return NextResponse.json({ ok: true })
}
