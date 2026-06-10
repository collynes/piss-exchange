'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatKES } from '@/lib/utils'

export interface MyBid {
  id: string
  qty: number
  price_per_unit: number
  status: string
  expires_at: string
  created_at: string | null
  drug_name: string
  drug_slug: string
  order_id: string | null
}

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

const STATUS_BADGE: Record<string, string> = {
  open:      'bg-label-success text-success',
  accepted:  'bg-label-primary text-primary',
  expired:   'bg-label-secondary text-muted',
  cancelled: 'bg-label-danger text-danger',
}

export function MyBidsClient({ bids }: { bids: MyBid[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function cancelBid(id: string) {
    setError(null)
    setBusyId(id)
    const res = await fetch(`/api/bids/${id}/cancel`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to cancel bid')
      setBusyId(null)
      return
    }
    setBusyId(null)
    router.refresh()
  }

  return (
    <>
      {error && (
        <div className="mb-3 px-4 py-3 rounded-lg text-xs text-red"
          style={{ background: 'rgba(234,84,85,.08)', border: '1px solid rgba(234,84,85,.2)' }}>
          {error}
        </div>
      )}

      <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
              {['Drug', 'Qty', 'Price/unit', 'Total', 'Status', 'Expires', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3.5 text-[11px] font-bold text-muted uppercase tracking-wider ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, i) => (
              <tr key={bid.id} className="hover:bg-surface2 transition-colors"
                style={{ borderBottom: i < bids.length - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                <td className="px-5 py-3.5" style={{ maxWidth: '240px' }}>
                  <Link href={`/drug/${encodeURIComponent(bid.drug_slug)}`}
                    className="text-[13px] font-semibold text-text hover:text-blue transition-colors truncate block">
                    {bid.drug_name}
                  </Link>
                  <div className="text-xs text-muted">
                    Placed {bid.created_at ? new Date(bid.created_at).toLocaleDateString('en-KE') : '—'}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right text-[13px] text-text tabular-nums">{bid.qty.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right text-[13px] font-bold text-text tabular-nums">{bid.price_per_unit.toFixed(2)}</td>
                <td className="px-5 py-3.5 text-right text-[13px] font-bold text-text tabular-nums">{formatKES(bid.qty * bid.price_per_unit)}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`badge rounded-pill text-capitalize ${STATUS_BADGE[bid.status] ?? 'bg-label-secondary text-muted'}`}>
                    {bid.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-xs text-muted text-nowrap">
                  {new Date(bid.expires_at).toLocaleDateString('en-KE')}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {bid.status === 'open' && (
                    <button onClick={() => cancelBid(bid.id)} disabled={busyId === bid.id}
                      className="btn btn-sm btn-outline-danger text-nowrap">
                      {busyId === bid.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                  {bid.status === 'accepted' && bid.order_id && (
                    <Link href={`/orders/${bid.order_id}`} className="btn btn-sm btn-outline-primary text-nowrap">
                      View Order
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {bids.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">
                No bids yet. <Link href="/market" className="text-blue hover:underline">Browse the market →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
