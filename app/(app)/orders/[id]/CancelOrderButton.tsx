'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Two-click cancel for a pending order. Releases any reserved stock server-side.
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [arming, setArming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function cancel() {
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to cancel order')
      setBusy(false)
      setArming(false)
      return
    }
    router.refresh()
  }

  return (
    <div className="rounded-2xl px-5 py-4" style={{
      background: 'rgba(234,84,85,.06)',
      border: '1px solid rgba(234,84,85,.22)',
    }}>
      <div className="text-sm font-bold text-text mb-0.5">Awaiting payment</div>
      <div className="text-xs text-muted mb-4">
        This order hasn&apos;t been paid yet. If the M-Pesa prompt was missed, cancel here to release the
        reserved stock — then you can place the order again.
      </div>
      {error && <div className="text-xs text-red mb-3">{error}</div>}
      {arming ? (
        <div className="d-inline-flex align-items-center gap-2">
          <button onClick={cancel} disabled={busy} className="btn btn-danger">
            {busy ? 'Cancelling…' : 'Confirm cancel'}
          </button>
          <button onClick={() => setArming(false)} disabled={busy} className="btn btn-outline-secondary">
            Keep order
          </button>
        </div>
      ) : (
        <button onClick={() => setArming(true)} className="btn btn-outline-danger">
          Cancel Order
        </button>
      )}
    </div>
  )
}
