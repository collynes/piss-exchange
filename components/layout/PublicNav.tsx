import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function PublicNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile: { role: string | null; org_name: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, org_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <nav
      className="flex items-center justify-between px-6 h-16 bg-surface sticky top-0 z-40"
      style={{ borderBottom: '1px solid rgba(47,43,61,.1)', boxShadow: '0 2px 6px rgba(47,43,61,.06)' }}
    >
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[11px]"
          style={{ background: 'linear-gradient(135deg, #7367f0, #9e95f5)' }}
        >
          DH
        </div>
        <span className="font-bold text-[14px] tracking-tight text-text">
          PISS<span className="text-blue">.</span>Exchange
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-semibold text-text leading-tight">{profile?.org_name}</div>
              <div className="text-[11px] text-muted capitalize">{profile?.role}</div>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7367f0, #9e95f5)' }}
            >
              {profile?.org_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <form action="/auth/signout" method="POST">
              <button
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-muted hover:text-text transition-colors"
                style={{ border: '1px solid rgba(47,43,61,.15)' }}
              >
                Log Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 text-[13px] text-muted hover:text-text transition-colors">
              Log In
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-[13px] font-semibold text-white rounded-lg transition-colors hover:opacity-90"
              style={{ background: '#7367f0' }}
            >
              Join Exchange
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
