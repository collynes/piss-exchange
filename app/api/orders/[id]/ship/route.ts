import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureServerEvent } from '@/lib/posthog'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('orders')
    .update({ status: 'shipped', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('seller_id', user.id)

  captureServerEvent(user.id, { event: 'order_shipped', props: { order_id: id } })

  return NextResponse.redirect(new URL(`/seller/orders`, process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
