import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const CARD = { boxShadow: '0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)' } as const

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
                isActive ? 'bg-blue/15 text-blue font-semibold' : 'text-muted hover:text-text bg-surface2/50'
              }`}>
              {f.label}
            </a>
          )
        })}
      </div>

      <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                className="hover:bg-surface2/30 transition-colors"
                style={{ borderBottom: i < (users?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                <td className="px-5 py-3.5">
                  <div className="text-[13px] font-semibold text-text">{u.org_name}</div>
                  <div className="text-xs text-muted font-mono">{u.id.slice(0, 8)}…</div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                    u.role === 'admin' ? 'bg-blue/12 text-blue' : u.role === 'seller' ? 'bg-green/12 text-green' : 'bg-muted/15 text-muted'
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
                    u.verified ? 'bg-green/12 text-green' : 'bg-muted/15 text-muted'
                  }`}>
                    {u.verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex gap-1.5 justify-end">
                    {!u.verified && (
                      <form action={`/api/admin/users/${u.id}/verify`} method="POST">
                        <button type="submit"
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green/12 text-green hover:bg-green/20 transition-colors">
                          Verify
                        </button>
                      </form>
                    )}
                    {u.verified && (
                      <form action={`/api/admin/users/${u.id}/suspend`} method="POST">
                        <button type="submit"
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red/12 text-red hover:bg-red/20 transition-colors">
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
