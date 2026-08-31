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
  | { event: 'bid_accepted';        props: { bid_id: string; order_id: string; drug_id: string; qty: number; price: number } }
  | { event: 'order_settled_dawahub'; props: { order_id: string; total: number } }
  | { event: 'bid_cancelled';       props: { bid_id: string } }
  | { event: 'listing_cancelled';   props: { listing_id: string } }
  | { event: 'order_cancelled';     props: { order_id: string } }
  | { event: 'user_verified';       props: { by: string } }
  | { event: 'user_suspended';      props: { by: string } }
  | { event: 'drug_created';        props: { drug_id: string; generic_name: string; by: string } }
  | { event: 'drug_updated';        props: { drug_id: string; generic_name: string; by: string } }
  | { event: 'drug_deleted';        props: { drug_id: string; generic_name: string; by: string } }
  | { event: 'drug_status_toggled'; props: { drug_id: string; active: boolean; by: string } }
  | { event: 'setting_updated';     props: { key: string; value: string; by: string } }
  | { event: 'page_viewed';         props: { path: string } }
  | { event: 'login_failed';        props: { email_domain: string } }
  | { event: 'page_not_found';      props: { path: string; referrer: string } }
  | { event: 'profile_updated';     props: Record<string, never> }
  | { event: 'password_changed';    props: Record<string, never> }

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
