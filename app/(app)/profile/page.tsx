import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const rows = [
    { label: 'Email',       value: user.email ?? '—' },
    { label: 'Organisation',value: profile?.org_name ?? '—' },
    { label: 'Role',        value: profile?.role ?? '—' },
    { label: 'Phone',       value: profile?.phone ?? '—' },
    { label: 'PPB License', value: profile?.license_no ?? '—' },
  ]

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-text">My Profile</h1>
        <p className="text-xs text-muted mt-0.5">Account details and verification status</p>
      </div>

      <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
          <h2 className="text-sm font-bold text-text">Account</h2>
          {profile?.verified
            ? <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green/10 text-green">Verified</span>
            : <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted/15 text-muted">Pending Verification</span>
          }
        </div>

        <table className="w-full">
          <tbody>
            {rows.map(({ label, value }, i) => (
              <tr key={label}
                style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                <td className="px-5 py-3 text-xs text-muted uppercase tracking-wider w-1/3">{label}</td>
                <td className="px-5 py-3 text-[13px] text-text capitalize text-right">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!profile?.verified && (
        <div className="mt-4 px-4 py-3 rounded-xl text-xs text-muted"
          style={{ background: 'rgba(115,103,240,.06)', border: '1px solid rgba(115,103,240,.15)' }}>
          Your account is pending admin verification. You will receive an email when approved.
        </div>
      )}
    </div>
  )
}
