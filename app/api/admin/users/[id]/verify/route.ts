import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await supabase.from('profiles').update({ verified: true, updated_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.redirect(new URL('/admin/users', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
