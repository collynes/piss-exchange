'use client'
import { useState } from 'react'
import { formatKES } from '@/lib/utils'
import { AcceptBidModal } from '@/components/market/AcceptBidModal'

export interface OpenBid {
  id: string
  qty: number
  price_per_unit: number
  expires_at: string
  created_at: string | null
  drug_name: string
  buyer_org: string
  is_own: boolean
}

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

export function SellerBidsClient({ bids, canAccept }: { bids: OpenBid[]; canAccept: boolean }) {
  const [acceptBid, setAcceptBid] = useState<OpenBid | null>(null)

  return (
    <>
      <div className="rounded-2xl overflow-x-auto bg-surface" style={CARD}>
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
              {['Drug', 'Buyer', 'Qty', 'Price/unit', 'Total', 'Expires', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3.5 text-[11px] font-bold text-muted uppercase tracking-wider ${i > 1 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, i) => (
              <tr key={bid.id} className="hover:bg-surface2 transition-colors"
                style={{ borderBottom: i < bids.length - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                <td className="px-5 py-3.5 text-[13px] font-semibold text-text" style={{ maxWidth: '220px' }}>
                  <div className="truncate">{bid.drug_name}</div>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted" style={{ maxWidth: '160px' }}>
                  <div className="truncate">{bid.buyer_org}</div>
                </td>
                <td className="px-5 py-3.5 text-right text-[13px] text-text tabular-nums">{bid.qty.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-right text-[13px] text-green font-bold tabular-nums">{bid.price_per_unit.toFixed(2)}</td>
                <td className="px-5 py-3.5 text-right text-[13px] font-bold text-text tabular-nums">{formatKES(bid.qty * bid.price_per_unit)}</td>
                <td className="px-5 py-3.5 text-right text-xs text-muted">
                  {new Date(bid.expires_at).toLocaleDateString('en-KE')}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {bid.is_own ? (
                    <span className="text-xs text-muted">Your bid</span>
                  ) : canAccept ? (
                    <button onClick={() => setAcceptBid(bid)}
                      className="btn btn-sm btn-outline-success text-nowrap">
                      Accept
                    </button>
                  ) : (
                    <span className="text-xs text-muted">Verification required</span>
                  )}
                </td>
              </tr>
            ))}
            {bids.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">No open bids right now.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {acceptBid && (
        <AcceptBidModal
          bidId={acceptBid.id}
          drugName={acceptBid.drug_name}
          qty={acceptBid.qty}
          pricePerUnit={acceptBid.price_per_unit}
          onClose={() => setAcceptBid(null)}
        />
      )}
    </>
  )
}
