'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // Supabase exchanges the recovery token in the URL for a session and
    // fires PASSWORD_RECOVERY once that's done — only then is it safe to
    // show the form (otherwise updateUser has no session to act on).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (done) return (
    <div className="card">
      <div className="card-body text-center">
        <h4 className="mb-2">Password updated</h4>
        <p className="text-muted mb-0">Taking you to your dashboard…</p>
      </div>
    </div>
  )

  if (!ready) return (
    <div className="card">
      <div className="card-body text-center">
        <p className="text-muted mb-0">Verifying your reset link…</p>
      </div>
    </div>
  )

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="mb-1">Set a new password</h4>
        <p className="mb-6 text-muted">Choose a new password for your account</p>
        {error && <div className="alert alert-danger mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">New Password</label>
            <input type="password" required minLength={6} autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="form-control" />
          </div>
          <div className="mb-6">
            <label className="form-label">Confirm New Password</label>
            <input type="password" required minLength={6} autoComplete="new-password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••" className="form-control" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary d-grid w-100">
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
