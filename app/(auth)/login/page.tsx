'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const INPUT_CLASS = 'form-control'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      fetch('/api/analytics/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'login_failed', email }),
      }).catch(() => {})
      return
    }
    fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'user_logged_in' }),
    }).catch(() => {})
    router.push(next)
    router.refresh()
  }

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="mb-1">Welcome back</h4>
        <p className="mb-6 text-muted">Log in to PISS Exchange</p>
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Email</label>
            <input type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" className={INPUT_CLASS} />
          </div>
          <div className="mb-6">
            <div className="d-flex align-items-center justify-content-between">
              <label className="form-label">Password</label>
              <Link href="/forgot-password" className="small">Forgot password?</Link>
            </div>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className={INPUT_CLASS} />
          </div>
          <button type="submit" disabled={loading}
            className="btn btn-primary d-grid w-100">
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
        <p className="text-center mt-6 mb-0">
          No account?{' '}
          <Link href="/register">Join Exchange</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
