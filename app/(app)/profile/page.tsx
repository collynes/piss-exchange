import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // capitalize is only correct for the role enum — applying it to email or a
  // license number mangles them (collynes@gmail.com → Collynes@gmail.com)
  const rows = [
    { label: 'Email',       value: user.email ?? '—' },
    { label: 'Organisation',value: profile?.org_name ?? '—' },
    { label: 'Role',        value: profile?.role ?? '—', capitalize: true },
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
            {rows.map(({ label, value, capitalize }) => (
              <tr key={label}>
                <td className="text-uppercase small fw-semibold text-muted w-25">{label}</td>
                <td className={`text-end fw-medium text-heading ${capitalize ? 'text-capitalize' : ''}`}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <div className="card-body border-top d-flex flex-wrap gap-2">
          <EditProfileForm
            orgName={profile?.org_name ?? ''}
            phone={profile?.phone ?? ''}
            licenseNo={profile?.license_no ?? ''}
            showLicense={profile?.role === 'seller' || profile?.role === 'admin'}
          />
          <ChangePasswordForm email={user.email ?? ''} />
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
