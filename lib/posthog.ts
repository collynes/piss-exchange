import { PostHog } from 'posthog-node'
import { createAdminClient } from '@/lib/supabase/admin'

let _client: PostHog | null = null
let _adminClient: ReturnType<typeof createAdminClient> | null = null

/** Server-side PostHog client (Node SDK) — singleton */
export function getPostHogClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
  if (!key) return null
  if (!_client) {
    _client = new PostHog(key, { host, flushAt: 1, flushInterval: 0 })
  }
  return _client
}

function getAdminClient() {
  if (!_adminClient) _adminClient = createAdminClient()
  return _adminClient
}

/** Typed event catalogue — keeps all event names in one place */
export type AnalyticsEvent =
  | { event: 'drug_viewed';         props: { drug_slug: string; drug_name: string } }
  | { event: 'listing_created';     props: { drug_id: string; price: number; qty: number } }
  | { event: 'bid_placed';          props: { drug_id: string; price: number; qty: number } }
  | { event: 'order_created';       props: { order_id: string; drug_id: string; total: number; source: 'listing' | 'bid' } }
  | { event: 'payment_initiated';   props: { order_id: string; amount: number; method: string } }
  | { event: 'payment_completed';   props: { order_id: string; amount: number } }
  | { event: 'order_confirmed';     props: { order_id: string } }
  | { event: 'order_shipped';       props: { order_id: string } }
  | { event: 'order_delivered';     props: { order_id: string } }
  | { event: 'user_registered';     props: { role: string; org_name: string } }
  | { event: 'user_logged_in';      props: Record<string, never> }
  | { event: 'search_performed';    props: { query: string; results: number } }
  | { event: 'market_filtered';     props: { category: string } }

/** Fire a server-side event (use in Server Actions / Route Handlers) */
export function captureServerEvent(
  distinctId: string,
  entry: AnalyticsEvent,
) {
  const client = getPostHogClient()
  if (client) client.capture({ distinctId, event: entry.event, properties: entry.props })

  void (async () => {
    try {
      await getAdminClient()
        .from('app_event_logs' as never)
        .insert({
          distinct_id: distinctId,
          event: entry.event,
          properties: entry.props,
          level: 'info',
          source: 'server',
        } as never)
    } catch {}
  })()
}
