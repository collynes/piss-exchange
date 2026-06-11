import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatKES } from '@/lib/utils'
import {
  ShoppingBag, DollarSign,
  Clock, CheckCircle, ArrowRight, Plus, TrendingUp,
} from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-label-warning text-warning',
  paid:      'bg-label-primary text-primary',
  confirmed: 'bg-label-info text-info',
  shipped:   'bg-label-warning text-warning',
  delivered: 'bg-label-success text-success',
  cancelled: 'bg-label-danger text-danger',
  disputed:  'bg-label-danger text-danger',
}

function StatCard({
  label, value, sub, Icon, color,
}: {
  label: string; value: string; sub?: string
  Icon: React.ElementType; color: { bg: string; text: string }
}) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <span className="text-uppercase small text-muted fw-semibold">{label}</span>
          <span className="avatar-initial rounded bg-label-primary">
            <Icon className="w-4 h-4" style={{ color: color.text }} />
          </span>
        </div>
        <h4 className="mb-1">{value}</h4>
        {sub && <small className="text-muted">{sub}</small>}
      </div>
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

  if (profile?.role === 'admin') redirect('/admin')

  const isSeller = profile?.role === 'seller'

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
    <div className="d-flex flex-column gap-4">

      {/* Page header — plain text, no card */}
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h4 className="mb-0">{profile?.org_name}</h4>
            {profile?.verified
              ? <span className="badge bg-label-success">Verified</span>
              : <span className="badge bg-label-secondary">Pending Review</span>
            }
          </div>
          <p className="text-muted text-capitalize mb-0">
            {profile?.role} account
            {!profile?.verified && ' · Under review — you can browse the market while you wait'}
          </p>
        </div>
        <Link href="/market"
          className="btn btn-primary d-none d-sm-inline-flex align-items-center gap-2">
          Browse Market <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {registered && (
        <div className="alert alert-success d-flex align-items-start gap-3 mb-0">
          <CheckCircle className="w-4 h-4 text-green mt-0.5 flex-shrink-0" />
          <div>
            <div className="fw-semibold">Account created successfully</div>
            <small>Pending admin verification — you&apos;ll receive an email once approved.</small>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="row g-4">
        <div className="col-6 col-md-3">
        <StatCard label="Total Orders" value={String(totalOrders ?? 0)} sub="all time" Icon={ShoppingBag} color={{ bg: 'rgba(90, 17, 73,.15)', text: '#5a1149' }} />
        </div>
        <div className="col-6 col-md-3">
        <StatCard label="Pending" value={String(pendingOrders ?? 0)} sub="awaiting action" Icon={Clock} color={{ bg: 'rgba(234,84,85,.12)', text: '#ea5455' }} />
        </div>
        <div className="col-6 col-md-3">
        <StatCard label="Delivered" value={String(deliveredOrders ?? 0)} sub="completed orders" Icon={CheckCircle} color={{ bg: 'rgba(40,199,111,.15)', text: '#28c76f' }} />
        </div>
        <div className="col-6 col-md-3">
        <StatCard label="Total Spent" value={formatKES(totalSpend)} sub="delivered orders" Icon={DollarSign} color={{ bg: 'rgba(124,58,237,0.15)', text: '#a78bfa' }} />
        </div>
      </div>

      {/* Main grid */}
      <div className="row g-4">

        {/* Recent orders */}
        <div className={isSeller ? 'col-lg-8' : 'col-12'}>
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Recent Orders</h5>
            <Link href="/orders" className="btn btn-sm btn-text-primary d-inline-flex align-items-center gap-1">
              All orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="table-responsive text-nowrap">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Drug</th>
                <th className="text-end">Total</th>
                <th className="text-end">Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(recentOrders ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-5 text-center text-muted">
                    No orders yet.{' '}
                    <Link href="/market" className="text-blue hover:underline">Browse the market →</Link>
                  </td>
                </tr>
              )}
              {(recentOrders ?? []).map(order => {
                const drug = order.drugs as { generic_name: string; slug: string } | null
                return (
                  <tr key={order.id}
                    className="cursor-pointer">
                    <td>
                      <div className="fw-semibold text-heading">{drug?.generic_name ?? '—'}</div>
                      <small className="text-muted">{new Date(order.created_at as string).toLocaleDateString('en-KE')}</small>
                    </td>
                    <td className="text-end fw-bold">
                      {formatKES(Number(order.total_amount))}
                    </td>
                    <td className="text-end">
                      <span className={`badge rounded-pill text-capitalize ${STATUS_COLOR[order.status] ?? 'bg-label-secondary'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link href={`/orders/${order.id}`} className="btn btn-sm btn-icon btn-text-secondary rounded-pill">
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
        </div>

        {/* Seller: Active listings sidebar */}
        {isSeller && (
          <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Active Listings</h5>
              <Link href="/seller/listings" className="btn btn-sm btn-text-primary d-inline-flex align-items-center gap-1">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="card-body py-3 border-bottom d-flex align-items-center justify-content-between">
              <span className="text-uppercase small fw-semibold text-muted">Stock</span>
              <span className="badge bg-label-primary">{activeListings ?? 0} active</span>
            </div>
            {(listings ?? []).length === 0 && (
              <div className="card-body text-center">
                <div className="text-muted small mb-3">No active listings</div>
                <Link href="/seller/listings/new"
                  className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1">
                  <Plus className="w-3 h-3" /> List a Drug
                </Link>
              </div>
            )}
            {(listings ?? []).map(l => {
              const drug = l.drugs as { generic_name: string } | null
              const pct = l.qty_available > 0 ? Math.round((l.qty_remaining / l.qty_available) * 100) : 0
              return (
                <div key={l.id} className="card-body py-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-semibold text-heading text-truncate pe-2">{drug?.generic_name ?? '—'}</div>
                    <div className="small fw-bold text-danger flex-shrink-0">
                      KES {Number(l.price_per_unit).toFixed(2)}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="progress flex-grow-1" style={{ height: 6 }}>
                      <div className="progress-bar bg-success" style={{ width: `${pct}%` }} />
                    </div>
                    <small className="text-muted flex-shrink-0">{l.qty_remaining.toLocaleString()} left</small>
                  </div>
                </div>
              )
            })}
            {(listings ?? []).length > 0 && (
              <div className="card-footer">
                <Link href="/seller/listings/new"
                  className="btn btn-sm btn-text-primary d-inline-flex align-items-center gap-2">
                  <Plus className="w-3 h-3" /> Add new listing
                </Link>
              </div>
            )}
          </div>
          </div>
        )}
      </div>

      {/* Quick links — plain text links, no card boxes */}
      <div className="d-flex align-items-center flex-wrap gap-3 pt-2">
        <span className="small text-muted">Quick links</span>
        <Link href="/market" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> Browse Market
        </Link>
        {isSeller && (
          <Link href="/seller/listings/new" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> List a Drug
          </Link>
        )}
        <Link href="/orders" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1">
          <ShoppingBag className="w-3.5 h-3.5" /> My Orders
        </Link>
        <Link href="/profile" className="btn btn-sm btn-outline-secondary">
          Profile & Settings
        </Link>
      </div>

    </div>
  )
}
