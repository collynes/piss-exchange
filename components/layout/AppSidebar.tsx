'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SneatLogo } from '@/components/layout/SneatLogo'

interface AppSidebarProps {
  role: string | null
}

function NavItem({ href, label, icon, exact = false }: {
  href: string
  label: string
  icon: string
  exact?: boolean
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)
  return (
    <li className={`menu-item${active ? ' active' : ''}`}>
      <Link href={href} className="menu-link">
        <i className={`menu-icon tf-icons bx ${icon}`} />
        <div className="text-truncate">{label}</div>
      </Link>
    </li>
  )
}

function MenuHeader({ label }: { label: string }) {
  return (
    <li className="menu-header small text-uppercase">
      <span className="menu-header-text">{label}</span>
    </li>
  )
}

export function AppSidebar({ role }: AppSidebarProps) {
  const isSeller = role === 'seller'
  const isAdmin = role === 'admin'

  return (
    <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
      <div className="app-brand demo">
        <SneatLogo />
        <button type="button" className="layout-menu-toggle menu-link text-large ms-auto border-0 bg-transparent">
          <i className="bx bx-chevron-left d-block d-xl-none align-middle" />
        </button>
      </div>

      <div className="menu-divider mt-0" />
      <div className="menu-inner-shadow" />

      <ul className="menu-inner py-1">
        <MenuHeader label="Main" />
        <NavItem href="/dashboard" label="Dashboard" icon="bx-home-smile" exact />
        <NavItem href="/market" label="Market Board" icon="bx-line-chart" />

        {!isAdmin && (
          <>
            <MenuHeader label="Trading" />
            <NavItem href="/orders" label="My Orders" icon="bx-cart" />
            {isSeller && <NavItem href="/seller/listings" label="My Listings" icon="bx-package" />}
            {isSeller && <NavItem href="/seller/orders" label="Incoming Orders" icon="bx-inbox" />}
          </>
        )}

        <MenuHeader label="Account" />
        <NavItem href="/profile" label="Profile" icon="bx-user" exact />

        {isAdmin && (
          <>
            <MenuHeader label="Administration" />
            <NavItem href="/admin" label="Overview" icon="bx-shield-quarter" exact />
            <NavItem href="/admin/users" label="Users" icon="bx-group" />
            <NavItem href="/admin/drugs" label="Drug Catalogue" icon="bx-capsule" />
            <NavItem href="/admin/orders" label="All Orders" icon="bx-receipt" />
            <NavItem href="/admin/settings" label="Settings" icon="bx-cog" />
          </>
        )}

        <MenuHeader label="Exchange" />
        <NavItem href="/" label="Public Home" icon="bx-globe" exact />
      </ul>
    </aside>
  )
}
