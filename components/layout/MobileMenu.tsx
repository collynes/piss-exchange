'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ThemePicker } from '@/components/ui/ThemePicker'

interface Props {
  role: string | null
  orgName: string | null
  isLoggedIn: boolean
}

export function MobileMenu({ role, orgName, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-surface2 transition-colors"
        aria-label="Open menu">
        <span className="w-5 h-px bg-text block" />
        <span className="w-5 h-px bg-text block" />
        <span className="w-5 h-px bg-text block" />
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Drawer */}
          <div className="absolute top-0 right-0 h-full w-72 bg-surface shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[11px]"
                  style={{ background: 'linear-gradient(135deg, #7367f0, #9e95f5)' }}>
                  DH
                </div>
                <span className="font-bold text-sm text-text">PISS<span className="text-blue">.</span>Exchange</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-text text-xl leading-none p-1">×</button>
            </div>

            {/* Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {[
                { href: '/market', label: 'Market' },
                ...(isLoggedIn ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
                ...(isLoggedIn && (role === 'seller' || role === 'admin') ? [
                  { href: '/seller/listings', label: 'My Listings' },
                  { href: '/seller/orders', label: 'Incoming Orders' },
                  { href: '/seller/listings/new', label: '+ List Drug' },
                ] : []),
                ...(isLoggedIn && role === 'buyer' ? [
                  { href: '/orders', label: 'My Orders' },
                ] : []),
                ...(isLoggedIn && role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
              ].map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm text-text hover:bg-surface2 transition-colors font-medium">
                  {label}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-5 border-t border-border space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted">Appearance</span>
                <ThemePicker />
              </div>
              {isLoggedIn ? (
                <div className="space-y-3">
                  {orgName && <p className="text-xs text-muted px-1 truncate">{orgName}</p>}
                  <form action="/auth/signout" method="POST">
                    <button className="w-full py-2.5 rounded-xl text-sm font-semibold border border-border text-muted hover:text-text hover:bg-surface2 transition-colors">
                      Log Out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center border border-border text-text hover:bg-surface2 transition-colors">
                    Log In
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}
                    className="block w-full py-2.5 rounded-xl text-sm font-bold text-center bg-blue text-white hover:bg-blue/90 transition-colors">
                    Join Exchange
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
