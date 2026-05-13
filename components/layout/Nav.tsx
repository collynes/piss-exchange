import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileMenu } from './MobileMenu'
import { ThemePicker } from '@/components/ui/ThemePicker'

export async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, org_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 h-10 bg-surface border-b border-border sticky top-0 z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded flex items-center justify-center text-white font-black text-[10px]"
          style={{ background: 'linear-gradient(135deg, #2962ff, #089981)' }}>
          DH
        </div>
        <span className="text-text font-bold text-[13px] tracking-tight">
          PISS<span className="text-blue">.</span>Exchange
        </span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-0">
        <Link href="/market" className="px-3 py-1.5 text-muted text-[13px] hover:text-text transition-colors">
          Market
        </Link>
        {user && (
          <>
            <Link href="/dashboard" className="px-3 py-1.5 text-muted text-[13px] hover:text-text transition-colors">
              Dashboard
            </Link>
            {(profile?.role === 'seller' || profile?.role === 'admin') && (
              <Link href="/seller/listings/new" className="px-3 py-1.5 text-muted text-[13px] hover:text-text transition-colors">
                + List Drug
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link href="/admin" className="px-3 py-1.5 text-muted text-[13px] hover:text-text transition-colors">
                Admin
              </Link>
            )}
          </>
        )}
      </div>

      {/* Desktop auth */}
      <div className="hidden md:flex items-center gap-2">
        <ThemePicker />
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-muted text-xs truncate max-w-36">{profile?.org_name}</span>
            <form action="/auth/signout" method="POST">
              <button className="px-2.5 py-1 text-xs border border-border rounded text-muted hover:text-text transition-colors">
                Log Out
              </button>
            </form>
          </div>
        ) : (
          <>
            <Link href="/login" className="px-3 py-1.5 text-[13px] text-muted hover:text-text transition-colors">
              Log In
            </Link>
            <Link href="/register" className="px-3 py-1.5 text-[13px] bg-blue text-white font-semibold rounded hover:bg-blue/90 transition-colors">
              Join Exchange
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <MobileMenu
        role={profile?.role ?? null}
        orgName={profile?.org_name ?? null}
        isLoggedIn={!!user}
      />
    </nav>
  )
}
