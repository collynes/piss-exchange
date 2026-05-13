'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Role = 'buyer' | 'seller'

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 32px 80px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.07)',
} as const

const INPUT_CLASS = 'w-full bg-bg/80 rounded-lg px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all'
const INPUT_STYLE = { border: '1px solid rgba(255,255,255,0.08)' }

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
    if (/rate.limit|too.many/i.test(msg)) return 'Too many sign-up attempts — please wait a few minutes and try again.'
    if (/already.registered|already.exists/i.test(msg)) return 'An account with this email already exists. Try logging in.'
    if (/invalid.email/i.test(msg)) return 'Please enter a valid email address.'
    if (/weak.password|password.should/i.test(msg)) return 'Password must be at least 6 characters.'
    return msg
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
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
    <div className="rounded-2xl overflow-hidden" style={GLASS}>
      <div className="px-8 py-6 bg-surface2/50 border-b border-white/5">
        <h1 className="text-text font-bold text-xl">Join the Exchange</h1>
        <p className="text-muted text-sm mt-1">Choose your role to get started</p>
      </div>
      <div className="px-8 py-6 space-y-3">
        {(['seller', 'buyer'] as Role[]).map(r => (
          <button key={r} onClick={() => handleRoleSelect(r)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all text-left group hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(41,98,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(41,98,255,0.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}>
            <div>
              <div className="text-text font-semibold text-sm">
                {r === 'seller' ? 'Join as a Seller' : 'Join as a Buyer'}
              </div>
              <div className="text-muted text-xs mt-1">
                {r === 'seller'
                  ? 'Manufacturer, importer or primary distributor'
                  : 'Pharmacy, hospital or secondary distributor'}
              </div>
            </div>
            <span className="text-muted group-hover:text-blue transition-colors text-lg">→</span>
          </button>
        ))}
        <p className="text-center text-muted text-sm pt-2">
          Already have an account?{' '}
          <Link href="/login" className="text-blue hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )

  return (
    <div className="rounded-2xl overflow-hidden" style={GLASS}>
      <div className="px-8 py-6 bg-surface2/50 border-b border-white/5">
        <button onClick={() => setStep(1)} className="text-muted text-xs mb-3 hover:text-text flex items-center gap-1 transition-colors">
          ← Back
        </button>
        <h1 className="text-text font-bold text-xl">
          {role === 'seller' ? 'Register as Seller' : 'Register as Buyer'}
        </h1>
        <p className="text-muted text-sm mt-1">
          {role === 'seller'
            ? 'For manufacturers, importers & distributors · PPB Kenya'
            : 'For pharmacies, hospitals & healthcare facilities'}
        </p>
      </div>
      <div className="px-8 py-6">
        {error && (
          <div className="bg-red/8 rounded-xl px-4 py-3 text-red text-sm mb-5" style={{ border: '1px solid rgba(242,54,69,0.2)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'org_name', label: 'Organisation Name', placeholder: role === 'seller' ? 'e.g. ABC Pharma Ltd' : 'e.g. Nairobi General Hospital', required: true },
            { key: 'email', label: 'Email', placeholder: 'you@company.com', type: 'email', required: true },
            { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password', required: true },
            { key: 'phone', label: 'Phone', placeholder: '+254700000000', required: false },
            ...(role === 'seller' ? [{ key: 'license_no', label: 'PPB License No.', placeholder: 'e.g. PPB/MNF/2024/001', required: false }] : []),
          ].map(({ key, label, placeholder, type = 'text', required }) => (
            <div key={key}>
              <label className="block text-xs text-muted uppercase tracking-wider mb-2">
                {label} {required && <span className="text-red">*</span>}
              </label>
              <input
                type={type}
                required={required}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className={INPUT_CLASS}
                style={INPUT_STYLE}
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full font-bold py-3 rounded-xl text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 mt-1"
            style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)', boxShadow: '0 0 20px rgba(41,98,255,0.3)' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="text-muted text-xs text-center mt-4">
          Your account will be reviewed before you can trade.
        </p>
      </div>
    </div>
  )
}
