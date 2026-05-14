import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureServerEvent } from '@/lib/posthog'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify order is in 'confirmed' state and belongs to this seller
  const { data: order } = await supabase
    .from('orders').select('status').eq('id', id).eq('seller_id', user.id).single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status !== 'confirmed') return NextResponse.json({ error: 'Order must be confirmed before shipping' }, { status: 400 })

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('orders')
    .update({ status: 'shipped', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  captureServerEvent(user.id, { event: 'order_shipped', props: { order_id: id } })

  return NextResponse.redirect(new URL('/seller/orders', request.url))
}
