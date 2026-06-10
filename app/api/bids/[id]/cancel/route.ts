import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureServerEvent } from '@/lib/posthog'

// Lets the bid owner (or admin) withdraw an open bid — e.g. a fat-fingered
// price — instead of it sitting on the market until expiry.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const adminSupabase = createAdminClient()
  const { data: bid } = await adminSupabase
    .from('bids')
    .select('id, buyer_id, status')
    .eq('id', id)
    .single()

  if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
  if (!isAdmin && bid.buyer_id !== user.id) {
    return NextResponse.json({ error: 'You can only cancel your own bids' }, { status: 403 })
  }
  if (bid.status !== 'open') {
    return NextResponse.json({ error: 'Only open bids can be cancelled' }, { status: 400 })
  }

  // Conditional update guards against racing a seller's accept
  const { data: cancelled } = await adminSupabase
    .from('bids')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('status', 'open')
    .select('id')
    .single()

  if (!cancelled) {
    return NextResponse.json({ error: 'Bid was just accepted and can no longer be cancelled' }, { status: 409 })
  }

  captureServerEvent(user.id, { event: 'bid_cancelled', props: { bid_id: id } })
  return NextResponse.json({ ok: true })
}
