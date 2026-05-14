import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import { Package, Inbox, DollarSign, Plus, ArrowRight } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-label-warning text-warning',
  paid:      'bg-label-primary text-primary',
  confirmed: 'bg-label-primary text-primary',
  shipped:   'bg-label-warning text-warning',
  delivered: 'bg-label-success text-success',
  cancelled: 'bg-label-danger text-danger',
  disputed:  'bg-label-danger text-danger',
}

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

function StatCard({
  label, value, sub, Icon, color,
}: {
  label: string; value: string; sub?: string
  Icon: React.ElementType; color: { bg: string; text: string }
}) {
  return (
    <div className="rounded-2xl p-5 bg-surface" style={CARD}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color.bg }}>
          <Icon className="w-4 h-4" style={{ color: color.text }} />
        </div>
      </div>
      <div className="text-2xl font-black text-text tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  )
}

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_name, verified, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'buyer') redirect('/dashboard')

  const [{ data: listings }, { data: orders }, { count: pendingCount }] = await Promise.all([
    supabase.from('listings').select('id, status, qty_remaining, qty_available, price_per_unit, drugs(generic_name)')
      .eq('seller_id', user.id).eq('status', 'active'),
    supabase.from('orders').select('id, qty, total_amount, status, created_at, drugs(generic_name, slug)')
      .eq('seller_id', user.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id).in('status', ['pending', 'paid', 'confirmed']),
  ])

  const activeListings = listings?.length ?? 0
  const revenue = orders?.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0) ?? 0

  return (
    <div className="max-w-5xl space-y-6">

      {/* Welcome banner */}
      <div className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(115,103,240,.08) 0%, rgba(40,199,111,.06) 100%)',
          border: '1px solid rgba(47,43,61,.1)',
        }}>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xl font-black text-text">{profile?.org_name}</div>
            {profile?.verified
              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green/15 text-green">Verified</span>
              : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-label-secondary text-muted">Pending Review</span>
            }
          </div>
          <div className="text-sm text-muted">Seller Dashboard</div>
          {!profile?.verified && (
            <div className="text-xs text-muted mt-1">Account pending verification — listing will be enabled once approved.</div>
          )}
        </div>
        <Link href="/seller/listings/new"
          className="relative hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7367f0, #9e95f5)', boxShadow: '0 4px 16px rgba(115,103,240,.4)' }}>
          <Plus className="w-4 h-4" /> List Drug
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Active Listings"
          value={String(activeListings)}
          sub="currently live"
          Icon={Package}
          color={{ bg: 'rgba(40,199,111,.15)', text: '#28c76f' }}
        />
        <StatCard
          label="Pending Orders"
          value={String(pendingCount ?? 0)}
          sub="need action"
          Icon={Inbox}
          color={{ bg: 'rgba(234,84,85,.12)', text: '#ea5455' }}
        />
        <StatCard
          label="Total Revenue"
          value={formatKES(revenue)}
          sub="delivered orders"
          Icon={DollarSign}
          color={{ bg: 'rgba(124,58,237,0.15)', text: '#a78bfa' }}
        />
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recent incoming orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text">Recent Incoming Orders</h2>
            <Link href="/seller/orders" className="text-xs text-blue flex items-center gap-1 hover:underline">
              All orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden bg-surface" style={CARD}>
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-muted uppercase tracking-wider">Drug</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {(orders ?? []).length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-muted text-sm">No incoming orders yet.</td></tr>
                )}
                {(orders ?? []).map((order, i) => {
                  const drug = order.drugs as { generic_name: string; slug: string } | null
                  return (
                    <tr key={order.id}
                      className="hover:bg-surface2 transition-colors"
                      style={{ borderBottom: i < (orders?.length ?? 0) - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                      <td className="px-5 py-3">
                        <div className="text-[13px] font-semibold text-text">{drug?.generic_name ?? '—'}</div>
                        <div className="text-[11px] text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</div>
                      </td>
                      <td className="px-5 py-3 text-right text-[13px] font-bold text-text tabular-nums">
                        {formatKES(Number(order.total_amount))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`badge rounded-pill text-capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/orders/${order.id}`} className="text-muted hover:text-text transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active listings sidebar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text">Active Listings</h2>
            <Link href="/seller/listings" className="text-xs text-blue flex items-center gap-1 hover:underline">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Stock</div>
              <span className="text-xs font-bold text-green">{activeListings} active</span>
            </div>
            {(listings ?? []).length === 0 && (
              <div className="px-5 py-6 text-center">
                <div className="text-muted text-xs mb-3">No active listings</div>
                <Link href="/seller/listings/new"
                  className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1">
                  <Plus className="w-3 h-3" /> List a Drug
                </Link>
              </div>
            )}
            {(listings ?? []).slice(0, 5).map((l, i) => {
              const drug = l.drugs as { generic_name: string } | null
              const pct = l.qty_available > 0 ? Math.round((l.qty_remaining / l.qty_available) * 100) : 0
              return (
                <div key={l.id} className="px-5 py-3 hover:bg-surface2 transition-colors"
                  style={{ borderBottom: i < Math.min((listings?.length ?? 0), 5) - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="text-[13px] font-semibold text-text truncate flex-1 pr-2">{drug?.generic_name ?? '—'}</div>
                    <div className="text-xs font-bold text-red tabular-nums flex-shrink-0">
                      KES {Number(l.price_per_unit).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-surface2">
                      <div className="h-1 rounded-full bg-green transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted tabular-nums flex-shrink-0">{l.qty_remaining.toLocaleString()} left</span>
                  </div>
                </div>
              )
            })}
            {(listings ?? []).length > 0 && (
              <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(47,43,61,.08)' }}>
                <Link href="/seller/listings/new"
                  className="flex items-center gap-2 text-xs font-semibold text-blue hover:underline">
                  <Plus className="w-3 h-3" /> Add new listing
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-text mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/seller/listings/new', label: 'List a Drug', desc: 'Add stock to the exchange', Icon: Plus, color: '#7367f0' },
            { href: '/seller/listings', label: 'My Listings', desc: 'Manage active listings', Icon: Package, color: '#7367f0' },
            { href: '/seller/orders', label: 'Incoming Orders', desc: 'Confirm and ship', Icon: Inbox, color: '#7c3aed' },
          ].map(({ href, label, desc, Icon, color }) => (
            <Link key={href} href={href}
              className="group rounded-2xl p-4 bg-surface flex items-start gap-3 transition-all hover:bg-surface2"
              style={CARD}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${color}20` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-text group-hover:text-blue transition-colors">{label}</div>
                <div className="text-[11px] text-muted mt-0.5">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
