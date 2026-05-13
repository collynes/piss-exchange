'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Pill, ShoppingBag, Settings, ArrowLeft,
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/drugs', label: 'Drug Catalogue', icon: Pill },
  { href: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[200px] flex-shrink-0 bg-surface flex flex-col overflow-hidden"
      style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>

      {/* Header */}
      <div className="px-4 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(242,54,69,0.15)' }}>
            <Settings className="w-3 h-3 text-red" />
          </div>
          <span className="text-xs font-bold text-text">Administration</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                active
                  ? 'bg-blue/15 text-blue'
                  : 'text-muted hover:text-text hover:bg-surface2'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <Link href="/dashboard" className="flex items-center gap-2 text-xs text-muted hover:text-text transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to App
        </Link>
      </div>
    </aside>
  )
}
