'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    // Always show the same success state — don't reveal whether the email exists.
    if (error && !/rate.limit|too.many/i.test(error.message)) {
      setSent(true)
      return
    }
    if (error) { setError('Too many attempts — please wait a few minutes and try again.'); return }
    setSent(true)
  }

  if (sent) return (
    <div className="card">
      <div className="card-body text-center">
        <h4 className="mb-2">Check your email</h4>
        <p className="text-muted mb-4">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login">Back to log in</Link>
      </div>
    </div>
  )

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="mb-1">Forgot password?</h4>
        <p className="mb-6 text-muted">Enter your email and we&apos;ll send you a reset link</p>
        {error && <div className="alert alert-danger mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="form-label">Email</label>
            <input type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" className="form-control" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary d-grid w-100">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center mb-0 mt-5">
          <Link href="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  )
}
