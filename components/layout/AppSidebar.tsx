'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, ShoppingBag, Package, Inbox,
  User, Shield, ChevronRight, List,
} from 'lucide-react'

interface AppSidebarProps {
  role: string | null
}

const ICON_CLASS = 'w-4 h-4 shrink-0'

function NavItem({ href, label, icon: Icon, exact = false }: {
  href: string; label: string; icon: React.ElementType; exact?: boolean
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)
  return (
    <Link href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all group ${
        active
          ? 'bg-blue/15 text-blue'
          : 'text-muted hover:text-text hover:bg-surface2'
      }`}>
      <Icon className={ICON_CLASS} />
      <span>{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue flex-shrink-0" />}
    </Link>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[10px] font-bold text-muted/60 uppercase tracking-widest">{label}</span>
    </div>
  )
}

export function AppSidebar({ role }: AppSidebarProps) {
  const isSeller = role === 'seller' || role === 'admin'
  const isAdmin = role === 'admin'

  return (
    <aside className="hidden md:flex w-56 flex-shrink-0 flex-col bg-surface overflow-y-auto scrollbar-hide"
      style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>

      {/* Branding */}
      <div className="flex items-center gap-2.5 px-4 py-4 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
          style={{ background: 'linear-gradient(135deg, #2962ff, #089981)' }}>
          DH
        </div>
        <span className="text-text font-bold text-sm tracking-tight">
          PISS<span className="text-blue">.</span>Exchange
        </span>
      </div>

      <div className="flex-1 px-2 pb-4 space-y-0.5">
        <SectionLabel label="Main" />
        <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} exact />
        <NavItem href="/market" label="Market Board" icon={TrendingUp} />

        <SectionLabel label="Trading" />
        <NavItem href="/orders" label="My Orders" icon={ShoppingBag} />
        {isSeller && <NavItem href="/seller/listings" label="My Listings" icon={Package} />}
        {isSeller && <NavItem href="/seller/orders" label="Incoming Orders" icon={Inbox} />}

        <SectionLabel label="Account" />
        <NavItem href="/profile" label="Profile" icon={User} exact />

        {isAdmin && (
          <>
            <SectionLabel label="Administration" />
            <NavItem href="/admin" label="Admin Panel" icon={Shield} />
            <NavItem href="/admin/users" label="Users" icon={List} />
          </>
        )}
      </div>

      {/* Bottom market link */}
      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <Link href="/market"
          className="flex items-center justify-between text-xs text-muted hover:text-text transition-colors">
          <span>Live Market</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  )
}
