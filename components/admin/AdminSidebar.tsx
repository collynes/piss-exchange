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
    <aside className="w-[220px] flex-shrink-0 bg-surface flex flex-col overflow-hidden"
      style={{ borderRight: '1px solid rgba(47,43,61,.1)' }}>

      {/* Header */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #5a1149, #8c3d77)' }}>
            <Settings className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px] font-bold text-text">Administration</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                active ? 'font-semibold text-blue' : 'text-muted hover:text-text hover:bg-surface2'
              }`}
              style={active ? { background: 'rgba(90, 17, 73,.12)' } : {}}>
              <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue' : 'text-muted'}`} />
              <span>{item.label}</span>
              {active && <span className="ml-auto w-2 h-2 rounded-full bg-blue flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(47,43,61,.08)' }}>
        <Link href="/dashboard" className="flex items-center gap-2 text-xs text-muted hover:text-text transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to App
        </Link>
      </div>
    </aside>
  )
}
