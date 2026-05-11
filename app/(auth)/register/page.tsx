'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Role = 'buyer' | 'seller'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    email: '', password: '', org_name: '', phone: '', license_no: '',
  })

  const handleRoleSelect = (r: Role) => { setRole(r); setStep(2) }

  const friendlyError = (msg: string) => {
    if (/rate.limit|too.many/i.test(msg))
      return 'Too many sign-up attempts — please wait a few minutes and try again.'
    if (/already.registered|already.exists/i.test(msg))
      return 'An account with this email already exists. Try logging in.'
    if (/invalid.email/i.test(msg))
      return 'Please enter a valid email address.'
    if (/weak.password|password.should/i.test(msg))
      return 'Password must be at least 6 characters.'
    return msg
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (signUpError || !data.user) {
      setError(friendlyError(signUpError?.message ?? 'Sign up failed'))
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      org_name: form.org_name,
      phone: form.phone || null,
      license_no: form.license_no || null,
    })
    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard?registered=1')
  }

  if (step === 1) return (
    <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl shadow-black/20">
      <h1 className="text-text font-bold text-xl mb-1">Join the Exchange</h1>
      <p className="text-muted text-sm mb-6">Choose your role to get started</p>
      <div className="space-y-3">
        {(['seller', 'buyer'] as Role[]).map(r => (
          <button key={r} onClick={() => handleRoleSelect(r)}
            className="w-full flex items-center justify-between p-4 bg-bg border border-border2 rounded hover:border-blue hover:bg-blue/10 transition-all text-left group">
            <div>
              <div className="text-text font-semibold capitalize">
                {r === 'seller' ? 'Join as a Seller' : 'Join as a Buyer'}
              </div>
              <div className="text-muted text-xs mt-1">
                {r === 'seller'
                  ? 'Manufacturer, importer or primary distributor'
                  : 'Pharmacy, hospital or secondary distributor'}
              </div>
            </div>
            <span className="text-muted group-hover:text-blue transition-colors">→</span>
          </button>
        ))}
      </div>
      <p className="text-center text-muted text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue hover:underline">Log in</Link>
      </p>
    </div>
  )

  return (
    <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl shadow-black/20">
      <button onClick={() => setStep(1)} className="text-muted text-xs mb-4 hover:text-text flex items-center gap-1">
        ← Back
      </button>
      <h1 className="text-text font-bold text-xl mb-1">
        {role === 'seller' ? 'Register as Seller' : 'Register as Buyer'}
      </h1>
      <p className="text-muted text-sm mb-6">
        {role === 'seller'
          ? 'For manufacturers, importers & distributors · PPB Kenya'
          : 'For pharmacies, hospitals & healthcare facilities'}
      </p>

      {error && <div className="bg-red/10 border border-red/30 text-red text-sm p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'org_name', label: 'Organisation Name', placeholder: role === 'seller' ? 'e.g. ABC Pharma Ltd' : 'e.g. Nairobi General Hospital', required: true },
          { key: 'email', label: 'Email', placeholder: 'you@company.com', type: 'email', required: true },
          { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password', required: true },
          { key: 'phone', label: 'Phone', placeholder: '+254700000000', required: false },
          ...(role === 'seller' ? [{ key: 'license_no', label: 'PPB License No.', placeholder: 'e.g. PPB/MNF/2024/001', required: false }] : []),
        ].map(({ key, label, placeholder, type = 'text', required }) => (
          <div key={key}>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1">
              {label} {required && <span className="text-red">*</span>}
            </label>
            <input
              type={type}
              required={required}
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-blue focus:outline-none transition-colors"
            />
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="w-full bg-blue hover:bg-blue/90 text-text font-semibold py-2.5 rounded text-sm disabled:opacity-50 transition-colors">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="text-muted text-xs text-center mt-4">
        Your account will be reviewed before you can trade.
      </p>
    </div>
  )
}
