import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'

// Unauthenticated telemetry beacon — deliberately narrow. Only these three
// low-sensitivity events are accepted, each with a tiny fixed prop shape, so
// this endpoint can't be used to write arbitrary data into app_event_logs.
// Attributed to the session user when one exists, 'anonymous' otherwise.
const MAX_PATH_LEN = 300

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const distinctId = user?.id ?? 'anonymous'

  const body = await request.json().catch(() => null) as { event?: string; path?: string; referrer?: string; email?: string } | null
  if (!body?.event) return NextResponse.json({ error: 'Missing event' }, { status: 400 })

  switch (body.event) {
    case 'page_viewed':
      captureServerEvent(distinctId, { event: 'page_viewed', props: { path: (body.path ?? '/').slice(0, MAX_PATH_LEN) } })
      break
    case 'page_not_found':
      captureServerEvent(distinctId, {
        event: 'page_not_found',
        props: { path: (body.path ?? '/').slice(0, MAX_PATH_LEN), referrer: (body.referrer ?? '').slice(0, MAX_PATH_LEN) },
      })
      break
    case 'login_failed': {
      const domain = body.email?.split('@')[1]?.toLowerCase().slice(0, 80) ?? 'unknown'
      captureServerEvent(distinctId, { event: 'login_failed', props: { email_domain: domain } })
      break
    }
    default:
      return NextResponse.json({ error: 'Event not allowed' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
