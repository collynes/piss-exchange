'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, ShoppingBag, Package, Inbox,
  User, Shield, List, Settings,
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all mx-2 ${
        active
          ? 'text-blue font-semibold'
          : 'text-muted hover:text-text'
      }`}
      style={active ? { background: 'rgba(115,103,240,.12)' } : {}}>
      <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue' : 'text-muted'}`} />
      <span>{label}</span>
      {active && (
        <span className="ml-auto w-2 h-2 rounded-full bg-blue flex-shrink-0" />
      )}
    </Link>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-5 pt-5 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(47,43,61,.4)' }}>
        {label}
      </span>
    </div>
  )
}

export function AppSidebar({ role }: AppSidebarProps) {
  const isSeller = role === 'seller'
  const isAdmin = role === 'admin'

  return (
    <aside className="hidden md:flex w-[260px] flex-shrink-0 flex-col bg-surface overflow-y-auto"
      style={{ borderRight: '1px solid rgba(47,43,61,.1)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[11px]"
          style={{ background: 'linear-gradient(135deg, #7367f0, #9e95f5)' }}>
          DH
        </div>
        <span className="font-bold text-[15px] text-text tracking-tight">
          PISS<span className="text-blue">.</span>Exchange
        </span>
      </div>

      <div className="flex-1 py-3 space-y-0.5">
        <SectionLabel label="Main" />
        <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} exact />
        <NavItem href="/market" label="Market Board" icon={TrendingUp} />

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
            <NavItem href="/admin/settings" label="Settings" icon={Settings} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(47,43,61,.08)' }}>
        <div className="text-[11px] text-muted">PISS Exchange v1.0</div>
      </div>
    </aside>
  )
}
