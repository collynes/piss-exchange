import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureServerEvent } from '@/lib/posthog'

// Lets the seller (or admin) delist active stock — wrong price, stock gone
// elsewhere, etc. Existing orders are unaffected; the listing just stops
// being offered on the market.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const adminSupabase = createAdminClient()
  const { data: listing } = await adminSupabase
    .from('listings')
    .select('id, seller_id, status')
    .eq('id', id)
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (!isAdmin && listing.seller_id !== user.id) {
    return NextResponse.json({ error: 'You can only delist your own listings' }, { status: 403 })
  }
  if (listing.status !== 'active') {
    return NextResponse.json({ error: 'Only active listings can be delisted' }, { status: 400 })
  }

  const { error } = await adminSupabase
    .from('listings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('status', 'active')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  captureServerEvent(user.id, { event: 'listing_cancelled', props: { listing_id: id } })
  return NextResponse.json({ ok: true })
}
