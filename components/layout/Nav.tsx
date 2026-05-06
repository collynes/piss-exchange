import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
    <nav className="flex items-center justify-between px-6 h-14 bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-surface/95">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-blue rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm">DH</div>
        <span className="text-white font-bold text-sm tracking-tight">
          PISS<span className="text-blue">.</span>Exchange
        </span>
      </Link>

      <div className="flex items-center gap-0.5">
        <Link href="/market" className="px-3.5 py-2 text-muted text-sm rounded-lg hover:text-white hover:bg-surface2 transition-colors">
          Market
        </Link>
        {user && (
          <>
            <Link href="/dashboard" className="px-3.5 py-2 text-muted text-sm rounded-lg hover:text-white hover:bg-surface2 transition-colors">
              Dashboard
            </Link>
            {(profile?.role === 'seller' || profile?.role === 'admin') && (
              <Link href="/seller/listings/new" className="px-3.5 py-2 text-muted text-sm rounded-lg hover:text-white hover:bg-surface2 transition-colors">
                + List Drug
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link href="/admin" className="px-3.5 py-2 text-muted text-sm rounded-lg hover:text-white hover:bg-surface2 transition-colors">
                Admin
              </Link>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-muted text-xs truncate max-w-32 hidden sm:block">{profile?.org_name}</span>
            <form action="/auth/signout" method="POST">
              <button className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted hover:text-white hover:border-border2 transition-colors">
                Log Out
              </button>
            </form>
          </div>
        ) : (
          <>
            <Link href="/login" className="px-3.5 py-2 text-sm text-muted hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm bg-blue text-white font-semibold rounded-lg hover:bg-blue/90 transition-colors shadow-sm">
              Join Exchange
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
