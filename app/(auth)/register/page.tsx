'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Role = 'buyer' | 'seller'

const INPUT_CLASS = 'form-control'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    email: '', password: '', org_name: '', phone: '', license_no: '',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleRoleSelect = (r: Role) => { setRole(r); setStep(2) }

  const friendlyError = (msg: string) => {
    if (/rate.limit|too.many/i.test(msg)) return 'Too many sign-up attempts — please wait a few minutes and try again.'
    if (/already.registered|already.exists/i.test(msg)) return 'An account with this email already exists. Try logging in.'
    if (/invalid.email/i.test(msg)) return 'Please enter a valid email address.'
    if (/weak.password|password.should/i.test(msg)) return 'Password must be at least 6 characters.'
    return msg
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions to continue.')
      return
    }

    if (form.phone && !/^(\+?254|0)\d{9}$/.test(form.phone.trim())) {
      setError('Phone must be a valid Kenyan number — e.g. 0712345678 or +254712345678')
      return
    }

    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (signUpError || !data.user) {
      setError(friendlyError(signUpError?.message ?? 'Sign up failed'))
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id, role, org_name: form.org_name,
      phone: form.phone || null, license_no: form.license_no || null,
    })
    if (profileError) { setError(profileError.message); setLoading(false); return }
    router.push('/dashboard?registered=1')
  }

  if (step === 1) return (
    <div className="card">
      <div className="card-body">
        <h4 className="mb-1">Welcome to Dawahub PISS Exchange</h4>
        <p className="text-muted mb-4">
          A patented solution for the healthcare industry — reducing the cost of pharmaceutical
          products to end users and ensuring the authenticity of every product traded.
        </p>
        <p className="text-muted mb-6">Choose your role to get started</p>
        {(['seller', 'buyer'] as Role[]).map(r => (
          <button key={r} onClick={() => handleRoleSelect(r)}
            className="list-group-item list-group-item-action d-flex align-items-center justify-content-between text-start mb-3 rounded border">
            <div>
              <div className="fw-semibold text-heading">
                {r === 'seller' ? 'Join as a Seller' : 'Join as a Buyer'}
              </div>
              <small className="text-muted">
                {r === 'seller'
                  ? 'Manufacturer, importer or primary distributor'
                  : 'Pharmacy, hospital or secondary distributor'}
              </small>
            </div>
            <i className="bx bx-chevron-right bx-sm text-muted" />
          </button>
        ))}
        <p className="text-center mb-0 mt-5">
          Already have an account?{' '}
          <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  )

  return (
    <div className="card">
      <div className="card-body">
        <button onClick={() => setStep(1)} className="btn btn-sm btn-text-secondary mb-3">
          <i className="bx bx-chevron-left me-1" />
          Back
        </button>
        <h4 className="mb-1">
          {role === 'seller' ? 'Register as Seller' : 'Register as Buyer'}
        </h4>
        <p className="text-muted mb-6">
          {role === 'seller'
            ? 'For manufacturers, importers & distributors · PPB Kenya'
            : 'For pharmacies, hospitals & healthcare facilities'}
        </p>
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {[
            { key: 'org_name', label: 'Organisation Name', placeholder: role === 'seller' ? 'e.g. ABC Pharma Ltd' : 'e.g. Nairobi General Hospital', required: true, maxLength: 200 },
            { key: 'email', label: 'Email', placeholder: 'you@company.com', type: 'email', required: true, maxLength: 254 },
            { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password', required: true, minLength: 6 },
            { key: 'phone', label: 'Phone', placeholder: '+254700000000', type: 'tel', required: false, maxLength: 15 },
            ...(role === 'seller' ? [{ key: 'license_no', label: 'PPB License No.', placeholder: 'e.g. PPB/MNF/2024/001', required: false, maxLength: 60 }] : []),
          ].map(({ key, label, placeholder, type = 'text', required, maxLength, minLength }: { key: string; label: string; placeholder: string; type?: string; required: boolean; maxLength?: number; minLength?: number }) => (
            <div key={key} className="mb-4">
              <label className="form-label">
                {label} {required && <span className="text-danger">*</span>}
              </label>
              <input
                type={type}
                required={required}
                placeholder={placeholder}
                maxLength={maxLength}
                minLength={minLength}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
          ))}
          <div className="form-check mb-4">
            <input
              type="checkbox"
              id="accept-terms"
              className="form-check-input"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="accept-terms" className="form-check-label small">
              I accept the{' '}
              <Link href="/terms" target="_blank" className="text-blue">Terms &amp; Conditions</Link>,
              including that Dawahub PISS Exchange is a patented solution and buyer/seller identities
              are anonymised on the platform.
            </label>
          </div>
          <button type="submit" disabled={loading || !acceptedTerms}
            className="btn btn-primary d-grid w-100">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="text-muted small text-center mt-4 mb-0">
          Your account will be reviewed before you can trade.
        </p>
      </div>
    </div>
  )
}
