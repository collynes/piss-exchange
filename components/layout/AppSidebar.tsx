'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, ShoppingBag, Package, Inbox,
  User, Shield, List, ChevronRight,
} from 'lucide-react'

interface AppSidebarProps {
  role: string | null
}

function NavItem({ href, label, icon: Icon, exact = false }: {
  href: string; label: string; icon: React.ElementType; exact?: boolean
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)
  return (
    <Link href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
        active ? 'bg-blue/15 text-blue' : 'text-muted hover:text-text hover:bg-surface2'
      }`}>
      <Icon className="w-4 h-4 shrink-0" />
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
  const isSeller = role === 'seller'          // admin does NOT trade
  const isAdmin = role === 'admin'

  return (
    <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col bg-surface overflow-y-auto"
      style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>

      <div className="flex-1 px-2 py-3 space-y-0.5">
        <SectionLabel label="Main" />
        <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} exact />
        <NavItem href="/market" label="Market Board" icon={TrendingUp} />

        {/* Trading — buyers and sellers only, not admin */}
        {!isAdmin && (
          <>
            <SectionLabel label="Trading" />
            <NavItem href="/orders" label="My Orders" icon={ShoppingBag} />
            {isSeller && <NavItem href="/seller/listings" label="My Listings" icon={Package} />}
            {isSeller && <NavItem href="/seller/orders" label="Incoming Orders" icon={Inbox} />}
          </>
        )}

        <SectionLabel label="Account" />
        <NavItem href="/profile" label="Profile" icon={User} exact />

        {isAdmin && (
          <>
            <SectionLabel label="Administration" />
            <NavItem href="/admin" label="Overview" icon={Shield} exact />
            <NavItem href="/admin/users" label="Users" icon={List} />
            <NavItem href="/admin/drugs" label="Drug Catalogue" icon={Package} />
            <NavItem href="/admin/orders" label="All Orders" icon={ShoppingBag} />
          </>
        )}
      </div>

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
