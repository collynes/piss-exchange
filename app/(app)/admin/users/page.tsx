import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

interface PageProps {
  searchParams: Promise<{ role?: string; status?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { role: roleFilter, status: statusFilter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  let query = supabase
    .from('profiles')
    .select('id, org_name, role, verified, license_no, phone, created_at')
    .order('created_at', { ascending: false })

  if (roleFilter && ['admin', 'buyer', 'seller'].includes(roleFilter))
    query = (query as typeof query).eq('role', roleFilter as 'admin' | 'buyer' | 'seller')
  if (statusFilter === 'pending') query = (query as typeof query).eq('verified', false)
  if (statusFilter === 'verified') query = (query as typeof query).eq('verified', true)

  const { data: users } = await query

  const filters = [
    { label: 'All', href: '/admin/users' },
    { label: 'Pending', href: '/admin/users?status=pending' },
    { label: 'Verified', href: '/admin/users?status=verified' },
    { label: 'Buyers', href: '/admin/users?role=buyer' },
    { label: 'Sellers', href: '/admin/users?role=seller' },
  ]

  const activeFilter = roleFilter ? `?role=${roleFilter}` : statusFilter ? `?status=${statusFilter}` : ''

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-text">
          Users <span className="text-muted font-normal text-xs ml-2">{users?.length ?? 0} results</span>
        </h1>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {filters.map(f => {
          const isActive = f.href === '/admin/users' ? !activeFilter : f.href.includes(activeFilter)
          return (
            <a key={f.label} href={f.href}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                isActive ? 'bg-label-primary text-primary font-semibold' : 'text-muted hover:text-text bg-surface2'
              }`}>
              {f.label}
            </a>
          )
        })}
      </div>

      <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
              {['Organisation', 'Role', 'Phone', 'License', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3.5 text-[11px] font-bold text-muted uppercase tracking-wider ${h === 'Organisation' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">No users found</td></tr>
            )}
            {(users ?? []).map((u, i) => (
              <tr key={u.id}
                className="hover:bg-surface2 transition-colors"
                style={{ borderBottom: i < (users?.length ?? 0) - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                <td className="px-5 py-3.5" style={{ maxWidth: '220px' }}>
                  <div className="text-[13px] font-semibold text-text truncate">{u.org_name}</div>
                  <div className="text-xs text-muted font-mono">{u.id.slice(0, 8)}…</div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`badge rounded-pill text-capitalize ${
                    u.role === 'admin' ? 'bg-label-primary text-primary' : u.role === 'seller' ? 'bg-label-success text-success' : 'bg-label-secondary text-muted'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-xs text-muted">{u.phone ?? '—'}</td>
                <td className="px-5 py-3.5 text-right text-xs text-muted">{u.license_no ?? '—'}</td>
                <td className="px-5 py-3.5 text-right text-xs text-muted">
                  {new Date(u.created_at!).toLocaleDateString('en-KE')}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    u.verified ? 'bg-label-success text-success' : 'bg-label-secondary text-muted'
                  }`}>
                    {u.verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex gap-1.5 justify-end">
                    {!u.verified && (
                      <form action={`/api/admin/users/${u.id}/verify`} method="POST">
                        <button type="submit"
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-label-success text-success hover:bg-green/20 transition-colors">
                          Verify
                        </button>
                      </form>
                    )}
                    {u.verified && (
                      <form action={`/api/admin/users/${u.id}/suspend`} method="POST">
                        <button type="submit"
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-label-danger text-danger hover:bg-red/20 transition-colors">
                          Suspend
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
