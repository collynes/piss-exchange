'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Delist button for an active listing. Asks for confirmation in-place
// (two-click) rather than a browser confirm() dialog.
export function ListingActions({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [arming, setArming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function delist() {
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/listings/${listingId}/cancel`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed')
      setBusy(false)
      setArming(false)
      return
    }
    router.refresh()
  }

  if (error) return <span className="text-xs text-red">{error}</span>

  if (arming) {
    return (
      <span className="d-inline-flex align-items-center gap-1">
        <button onClick={delist} disabled={busy} className="btn btn-sm btn-danger text-nowrap">
          {busy ? 'Delisting…' : 'Confirm'}
        </button>
        <button onClick={() => setArming(false)} disabled={busy} className="btn btn-sm btn-outline-secondary">
          Keep
        </button>
      </span>
    )
  }

  return (
    <button onClick={() => setArming(true)} className="btn btn-sm btn-outline-danger text-nowrap">
      Delist
    </button>
  )
}
