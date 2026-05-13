import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('profiles')
    .select('id, org_name, role, verified, license_no, phone, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-text mb-6">User Management</h1>
      <div className="overflow-x-auto">
      <div className="bg-surface border border-border rounded overflow-hidden min-w-[560px]">
        <table className="w-full">
          <thead className="border-b border-border bg-surface2/40">
            <tr>
              {['Organisation', 'Role', 'License', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className={`px-4 py-2.5 text-xs font-bold text-text uppercase tracking-wider ${h === 'Organisation' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u, i) => (
              <tr key={u.id} className={`hover:bg-surface2 transition-colors ${i % 2 === 1 ? 'bg-surface2/30' : ''}`}>
                <td className="px-4 py-2.5">
                  <div className="text-sm font-semibold text-text">{u.org_name}</div>
                  <div className="text-xs text-muted font-mono">{u.id.slice(0, 8)}…</div>
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-muted capitalize">{u.role}</td>
                <td className="px-4 py-2.5 text-right text-xs text-muted">{u.license_no ?? '—'}</td>
                <td className="px-4 py-2.5 text-right text-xs text-muted">{new Date(u.created_at!).toLocaleDateString('en-KE')}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${u.verified ? 'bg-green/10 text-green' : 'bg-muted/10 text-muted'}`}>
                    {u.verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex gap-1 justify-end">
                    {!u.verified && (
                      <form action={`/api/admin/users/${u.id}/verify`} method="POST">
                        <button type="submit" className="text-xs px-2 py-0.5 bg-green/10 text-green border border-green/30 rounded hover:bg-green/20 transition-colors">
                          Verify
                        </button>
                      </form>
                    )}
                    {u.verified && (
                      <form action={`/api/admin/users/${u.id}/suspend`} method="POST">
                        <button type="submit" className="text-xs px-2 py-0.5 bg-red/10 text-red border border-red/30 rounded hover:bg-red/20 transition-colors">
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
    </div>
  )
}
