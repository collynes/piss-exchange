'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
    if (error) { setError(error.message); setLoading(false); return }
    router.push(next)
    router.refresh()
  }

  return (
    <div className="bg-surface border border-border2 rounded p-8">
      <h1 className="text-white font-bold text-xl mb-1">Welcome back</h1>
      <p className="text-muted text-sm mb-6">Log in to PISS Exchange</p>

      {error && <div className="bg-red/10 border border-red/30 text-red text-sm p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-muted uppercase tracking-wider mb-1">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full bg-bg border border-border2 rounded px-3 py-2 text-sm text-white placeholder:text-muted focus:border-blue transition-colors" />
        </div>
        <div>
          <label className="block text-xs text-muted uppercase tracking-wider mb-1">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-bg border border-border2 rounded px-3 py-2 text-sm text-white placeholder:text-muted focus:border-blue transition-colors" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-blue hover:bg-blue/90 text-white font-semibold py-2.5 rounded text-sm disabled:opacity-50 transition-colors">
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <p className="text-center text-muted text-sm mt-6">
        No account?{' '}
        <Link href="/register" className="text-blue hover:underline">Join Exchange</Link>
      </p>
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
