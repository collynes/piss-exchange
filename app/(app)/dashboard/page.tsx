import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import {
  ShoppingBag, Package, TrendingUp, DollarSign,
  Clock, CheckCircle, ArrowRight, Plus,
} from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-muted/15 text-muted',
  paid:      'bg-blue/12 text-blue',
  confirmed: 'bg-blue/12 text-blue',
  shipped:   'bg-green/12 text-green',
  delivered: 'bg-green/15 text-green',
  cancelled: 'bg-red/12 text-red',
  disputed:  'bg-red/12 text-red',
}

const CARD = { boxShadow: '0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)' } as const

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const { registered } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, org_name, verified')
    .eq('id', user.id)
    .single()

  const isSeller = profile?.role === 'seller' || profile?.role === 'admin'

  const [
    { data: recentOrders },
    { count: totalOrders },
    { count: pendingOrders },
    { count: deliveredOrders },
    { data: spendData },
    { data: listings },
    { count: activeListings },
  ] = await Promise.all([
    supabase.from('orders').select('id, qty, total_amount, status, created_at, drugs(generic_name, slug)')
      .eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(6),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).eq('status', 'delivered'),
    supabase.from('orders').select('total_amount').eq('buyer_id', user.id).eq('status', 'delivered'),
    isSeller
      ? supabase.from('listings').select('id, qty_remaining, qty_available, price_per_unit, drugs(generic_name), status')
          .eq('seller_id', user.id).eq('status', 'active').limit(4)
      : Promise.resolve({ data: null }),
    isSeller
      ? supabase.from('listings').select('*', { count: 'exact', head: true }).eq('seller_id', user.id).eq('status', 'active')
      : Promise.resolve({ count: 0 }),
  ])

  const totalSpend = spendData?.reduce((s, r) => s + Number(r.total_amount), 0) ?? 0

  return (
    <div className="max-w-5xl space-y-6">

      {/* Page header — plain text, no card */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-lg font-bold text-text">{profile?.org_name}</h1>
            {profile?.verified
              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green/15 text-green">Verified</span>
              : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted/15 text-muted">Pending Review</span>
            }
          </div>
          <p className="text-xs text-muted capitalize">
            {profile?.role} account
            {!profile?.verified && ' · Under review — you can browse the market while you wait'}
          </p>
        </div>
        <Link href="/market"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)' }}>
          Browse Market <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {registered && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(8,153,129,0.08)', border: '1px solid rgba(8,153,129,0.2)' }}>
          <CheckCircle className="w-4 h-4 text-green mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-green">Account created successfully</div>
            <div className="text-xs text-muted mt-0.5">Pending admin verification — you&apos;ll receive an email once approved.</div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={String(totalOrders ?? 0)} sub="all time" Icon={ShoppingBag} color={{ bg: 'rgba(41,98,255,0.15)', text: '#2962ff' }} />
        <StatCard label="Pending" value={String(pendingOrders ?? 0)} sub="awaiting action" Icon={Clock} color={{ bg: 'rgba(242,54,69,0.12)', text: '#f23645' }} />
        <StatCard label="Delivered" value={String(deliveredOrders ?? 0)} sub="completed orders" Icon={CheckCircle} color={{ bg: 'rgba(8,153,129,0.15)', text: '#089981' }} />
        <StatCard label="Total Spent" value={formatKES(totalSpend)} sub="delivered orders" Icon={DollarSign} color={{ bg: 'rgba(124,58,237,0.15)', text: '#a78bfa' }} />
      </div>

      {/* Main grid */}
      <div className={`grid gap-6 ${isSeller ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>

        {/* Recent orders */}
        <div className={`rounded-2xl bg-surface overflow-hidden ${isSeller ? 'lg:col-span-2' : ''}`} style={CARD}>
          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-sm font-bold text-text">Recent Orders</h2>
            <Link href="/orders" className="text-xs text-blue flex items-center gap-1 hover:underline">
              All orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <th className="px-5 py-2.5 text-left text-[11px] font-bold text-muted uppercase tracking-wider">Drug</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-bold text-muted uppercase tracking-wider">Total</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-bold text-muted uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted text-sm">
                    No orders yet.{' '}
                    <Link href="/market" className="text-blue hover:underline">Browse the market →</Link>
                  </td>
                </tr>
              )}
              {(recentOrders ?? []).map((order, i) => {
                const drug = order.drugs as { generic_name: string; slug: string } | null
                return (
                  <tr key={order.id}
                    className="hover:bg-surface2/40 transition-colors"
                    style={{ borderBottom: i < (recentOrders?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                    <td className="px-5 py-3">
                      <div className="text-[13px] font-semibold text-text">{drug?.generic_name ?? '—'}</div>
                      <div className="text-[11px] text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</div>
                    </td>
                    <td className="px-5 py-3 text-right text-[13px] font-bold text-text tabular-nums">
                      {formatKES(Number(order.total_amount))}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'text-muted'}`}>
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

        {/* Seller: Active listings sidebar */}
        {isSeller && (
          <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
            <div className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-sm font-bold text-text">Active Listings</h2>
              <Link href="/seller/listings" className="text-xs text-blue flex items-center gap-1 hover:underline">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-center justify-between px-5 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Stock</span>
              <span className="text-xs font-bold text-blue">{activeListings ?? 0} active</span>
            </div>
            {(listings ?? []).length === 0 && (
              <div className="px-5 py-6 text-center">
                <div className="text-muted text-xs mb-3">No active listings</div>
                <Link href="/seller/listings/new"
                  className="text-xs font-bold text-white px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                  style={{ background: 'linear-gradient(135deg, #089981, #05705f)' }}>
                  <Plus className="w-3 h-3" /> List a Drug
                </Link>
              </div>
            )}
            {(listings ?? []).map((l, i) => {
              const drug = l.drugs as { generic_name: string } | null
              const pct = l.qty_available > 0 ? Math.round((l.qty_remaining / l.qty_available) * 100) : 0
              return (
                <div key={l.id} className="px-5 py-3 hover:bg-surface2/30 transition-colors"
                  style={{ borderBottom: i < (listings?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
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
              <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Link href="/seller/listings/new"
                  className="flex items-center gap-2 text-xs font-semibold text-blue hover:underline">
                  <Plus className="w-3 h-3" /> Add new listing
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick links — plain text links, no card boxes */}
      <div className="flex items-center gap-6 pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="text-xs text-muted">Quick links</span>
        <Link href="/market" className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors">
          <TrendingUp className="w-3.5 h-3.5" /> Browse Market
        </Link>
        {isSeller && (
          <Link href="/seller/listings/new" className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors">
            <Plus className="w-3.5 h-3.5" /> List a Drug
          </Link>
        )}
        <Link href="/orders" className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors">
          <ShoppingBag className="w-3.5 h-3.5" /> My Orders
        </Link>
        <Link href="/profile" className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors">
          Profile & Settings
        </Link>
      </div>

    </div>
  )
}
