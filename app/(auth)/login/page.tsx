'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 32px 80px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.07)',
} as const

const INPUT_CLASS = 'w-full bg-bg/80 rounded-lg px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all'
const INPUT_STYLE = { border: '1px solid rgba(255,255,255,0.08)' }

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
    <div className="rounded-2xl overflow-hidden" style={GLASS}>
      <div className="px-8 py-6 bg-surface2/50 border-b border-white/5">
        <h1 className="text-text font-bold text-xl">Welcome back</h1>
        <p className="text-muted text-sm mt-1">Log in to PISS Exchange</p>
      </div>
      <div className="px-8 py-6">
        {error && (
          <div className="bg-red/8 rounded-xl px-4 py-3 text-red text-sm mb-5" style={{ border: '1px solid rgba(242,54,69,0.2)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" className={INPUT_CLASS} style={INPUT_STYLE} />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className={INPUT_CLASS} style={INPUT_STYLE} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full font-bold py-3 rounded-xl text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 mt-1"
            style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)', boxShadow: '0 0 20px rgba(41,98,255,0.3)' }}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
        <p className="text-center text-muted text-sm mt-6">
          No account?{' '}
          <Link href="/register" className="text-blue hover:underline">Join Exchange</Link>
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
