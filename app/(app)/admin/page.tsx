import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES, formatNumber } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [
    { count: userCount },
    { count: pendingCount },
    { count: listingCount },
    { count: orderCount },
    { data: totals },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified', false),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('market_data').select('deals_today, turnover_today'),
  ])

  const totalDeals = totals?.reduce((s, r) => s + (r.deals_today ?? 0), 0) ?? 0
  const totalTurnover = totals?.reduce((s, r) => s + Number(r.turnover_today ?? 0), 0) ?? 0

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-text mb-6">Admin Overview</h1>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Users', value: formatNumber(userCount ?? 0) },
          { label: 'Pending Verification', value: formatNumber(pendingCount ?? 0), alert: (pendingCount ?? 0) > 0 },
          { label: 'Active Listings', value: formatNumber(listingCount ?? 0) },
          { label: 'Total Orders', value: formatNumber(orderCount ?? 0) },
          { label: "Today's Deals", value: formatNumber(totalDeals) },
          { label: "Today's Turnover", value: formatKES(totalTurnover) },
        ].map(card => (
          <div key={card.label} className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
              boxShadow: card.alert
                ? '0 16px 40px -8px rgba(242,54,69,0.2), 0 0 0 1px rgba(242,54,69,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 16px 40px -8px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
            <div className="text-xs text-muted uppercase tracking-wider mb-1">{card.label}</div>
            <div className={`text-xl font-bold tabular-nums ${card.alert ? 'text-red' : 'text-text'}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { href: '/admin/users', label: 'User Management', desc: 'Verify, reject, manage users' },
          { href: '/admin/drugs', label: 'Drug Catalogue', desc: 'Add and manage drug instruments' },
          { href: '/admin/listings/new', label: 'List on Behalf', desc: 'Add listing for any seller' },
          { href: '/admin/settings', label: 'Platform Settings', desc: 'Document requirements, toggles' },
        ].map(link => (
          <Link key={link.href} href={link.href}
            className="rounded-xl p-5 transition-all group hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
              boxShadow: '0 16px 40px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
            <div className="text-sm font-semibold text-text group-hover:text-blue transition-colors mb-1">{link.label}</div>
            <div className="text-xs text-muted">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
