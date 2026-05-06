import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-bold text-text mb-6">My Profile</h1>
      <div className="bg-surface border border-border rounded p-6 space-y-4">
        {[
          { label: 'Email', value: user.email ?? '—' },
          { label: 'Organisation', value: profile?.org_name ?? '—' },
          { label: 'Role', value: profile?.role ?? '—' },
          { label: 'Phone', value: profile?.phone ?? '—' },
          { label: 'PPB License', value: profile?.license_no ?? '—' },
          {
            label: 'Verification Status',
            value: profile?.verified ? 'Verified' : 'Pending',
            className: profile?.verified ? 'text-green' : 'text-muted',
          },
        ].map(({ label, value, className }) => (
          <div key={label} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0">
            <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
            <span className={`text-sm capitalize ${className ?? 'text-white'}`}>{value}</span>
          </div>
        ))}
      </div>
      {!profile?.verified && (
        <div className="mt-4 bg-blue/5 border border-blue/20 rounded p-4 text-xs text-muted">
          Your account is pending admin verification. You will receive an email when approved.
        </div>
      )}
    </div>
  )
}
