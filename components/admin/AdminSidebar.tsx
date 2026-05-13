'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/drugs', label: 'Drug Catalogue' },
  { href: '/admin/orders', label: 'All Orders' },
  { href: '/admin/settings', label: 'Settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-44 flex-shrink-0 bg-surface flex flex-col overflow-hidden border-r border-white/5">
      <div className="px-3 py-3 border-b border-white/5">
        <div className="text-xs font-bold text-muted uppercase tracking-widest px-2">Admin</div>
      </div>
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 text-xs rounded transition-colors ${
                active
                  ? 'bg-blue/15 text-blue font-semibold'
                  : 'text-muted hover:text-text hover:bg-surface2'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-3 border-t border-white/5">
        <Link href="/dashboard" className="text-xs text-muted hover:text-text transition-colors">
          ← Dashboard
        </Link>
      </div>
    </aside>
  )
}
