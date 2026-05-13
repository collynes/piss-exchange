import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 20px 48px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
} as const

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
    { label: 'Email', value: user.email ?? '—' },
    { label: 'Organisation', value: profile?.org_name ?? '—' },
    { label: 'Role', value: profile?.role ?? '—' },
    { label: 'Phone', value: profile?.phone ?? '—' },
    { label: 'PPB License', value: profile?.license_no ?? '—' },
  ]

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-bold text-text mb-6">My Profile</h1>

      <div className="rounded-2xl overflow-hidden mb-4" style={GLASS}>
        {/* Verification badge header */}
        <div className="px-5 py-4 bg-surface2/50 border-b border-white/5 flex items-center justify-between">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Account</div>
          {profile?.verified
            ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green/15 text-green">Verified</span>
            : <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted/15 text-muted">Pending Verification</span>
          }
        </div>

        <div className="px-5 py-4 space-y-0">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2.5">
              <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
              <span className="text-sm text-text capitalize">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {!profile?.verified && (
        <div className="rounded-2xl p-4 text-xs text-muted" style={{
          background: 'linear-gradient(160deg, rgba(41,98,255,0.08) 0%, rgba(41,98,255,0.03) 100%)',
          border: '1px solid rgba(41,98,255,0.2)',
        }}>
          Your account is pending admin verification. You will receive an email when approved.
        </div>
      )}
    </div>
  )
}
