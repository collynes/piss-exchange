'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function NotFound() {
  useEffect(() => {
    fetch('/api/analytics/beacon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'page_not_found', path: window.location.pathname, referrer: document.referrer }),
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-bg">
      <div className="text-6xl font-black text-muted mb-4">404</div>
      <h1 className="text-xl font-bold text-text mb-2">Page not found</h1>
      <p className="text-muted text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
        style={{ background: '#5a1149' }}>
        Back to home
      </Link>
    </div>
  )
}
