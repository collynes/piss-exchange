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

  const rows = [
    { label: 'Email',       value: user.email ?? '—' },
    { label: 'Organisation',value: profile?.org_name ?? '—' },
    { label: 'Role',        value: profile?.role ?? '—' },
    { label: 'Phone',       value: profile?.phone ?? '—' },
    { label: 'PPB License', value: profile?.license_no ?? '—' },
  ]

  return (
    <div className="row g-4">
      <div className="col-12">
        <h4 className="mb-1">My Profile</h4>
        <p className="text-muted mb-0">Account details and verification status</p>
      </div>

      <div className="col-xl-6 col-lg-8">
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Account</h5>
          {profile?.verified
            ? <span className="badge bg-label-success text-success">Verified</span>
            : <span className="badge bg-label-secondary text-muted">Pending Verification</span>
          }
        </div>

        <div className="table-responsive">
        <table className="table mb-0">
          <tbody>
            {rows.map(({ label, value }) => (
              <tr key={label}>
                <td className="text-uppercase small fw-semibold text-muted w-25">{label}</td>
                <td className="text-end fw-medium text-heading text-capitalize">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      </div>

      {!profile?.verified && (
        <div className="col-xl-6 col-lg-8">
          <div className="alert alert-primary mb-0">
            Your account is pending admin verification. You will receive an email when approved.
          </div>
        </div>
      )}
    </div>
  )
}
