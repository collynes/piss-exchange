'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'
import { BidModal } from './BidModal'

interface MarketRow {
  drug_id: string
  slug: string
  generic_name: string
  dosage_form: string
  strength: string
  atc_code: string | null
  last_price: number | null
  change_pct: number
  best_ask: number | null
  best_bid: number | null
  volume_today: number
  deals_today: number
  seller_count: number
}

export function MarketTable({ rows, canBid }: { rows: MarketRow[]; canBid: boolean }) {
  const [bidDrug, setBidDrug] = useState<{ id: string; name: string } | null>(null)

  return (
    <>
      <div className="table-responsive flex-1">
        {/* Mobile cards */}
        <div className="md:hidden">
          {rows.map(row => {
            const pct = Number(row.change_pct)
            const isUp = pct >= 0
            return (
              <div key={row.drug_id} className="list-group-item d-flex align-items-center justify-content-between">
                <Link href={`/drug/${encodeURIComponent(row.slug)}`} className="min-w-0 flex-1 text-decoration-none">
                  <div className="fw-semibold text-heading text-truncate">{row.generic_name}</div>
                  <small className="text-muted">{row.strength} · {row.dosage_form}</small>
                </Link>
                <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0">
                  <div className="text-end">
                    <div className={`fw-bold ${isUp ? 'text-success' : 'text-danger'}`}>
                      {row.best_ask ? Number(row.best_ask).toFixed(2) : '—'}
                    </div>
                    <small className={`fw-semibold ${isUp ? 'text-success' : 'text-danger'}`}>
                      {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                    </small>
                  </div>
                  {canBid && (
                    <button
                      onClick={() => setBidDrug({ id: row.drug_id, name: row.generic_name })}
                      className="btn btn-sm btn-outline-success flex-shrink-0">
                      Bid
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {rows.length === 0 && (
            <div className="p-4 text-center text-muted">No drugs listed yet.</div>
          )}
        </div>

        {/* Desktop table */}
        <table className="table table-hover card-table mb-0 d-none d-md-table">
          <thead className="table-light sticky-top">
            <tr>
              {[
                { label: 'Drug', align: 'left' },
                { label: 'Last', align: 'right' },
                { label: 'Chg %', align: 'right' },
                { label: 'Ask', align: 'right' },
                { label: 'Bid', align: 'right' },
                { label: 'Volume', align: 'right' },
                { label: 'Deals', align: 'right' },
                { label: 'Sellers', align: 'right' },
                { label: '', align: 'right' },
              ].map(h => (
                <th key={h.label}
                  className={`text-uppercase text-nowrap ${h.align === 'right' ? 'text-end' : ''}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const pct = Number(row.change_pct)
              const isUp = pct >= 0
              return (
                <tr key={row.drug_id}
                  className="cursor-pointer"
                  onClick={() => { window.location.href = `/drug/${encodeURIComponent(row.slug)}` }}>
                  <td style={{ maxWidth: '260px' }}>
                    <div className="fw-semibold text-heading text-truncate">{row.generic_name}</div>
                    <small className="text-muted text-nowrap">{row.strength} · {row.dosage_form}</small>
                  </td>
                  <td className={`text-end fw-semibold ${isUp ? 'text-success' : 'text-danger'}`}>
                    {row.last_price ? Number(row.last_price).toFixed(2) : '—'}
                  </td>
                  <td className={`text-end fw-semibold ${isUp ? 'text-success' : 'text-danger'}`}>
                    {isUp ? '+' : ''}{pct.toFixed(2)}%
                  </td>
                  <td className="text-end text-danger fw-medium">
                    {row.best_ask ? Number(row.best_ask).toFixed(2) : '—'}
                  </td>
                  <td className="text-end text-success fw-medium">
                    {row.best_bid ? Number(row.best_bid).toFixed(2) : '—'}
                  </td>
                  <td className="text-end">{formatNumber(row.volume_today)}</td>
                  <td className="text-end">{row.deals_today}</td>
                  <td className="text-end text-muted">{row.seller_count}</td>
                  <td className="text-end" onClick={e => e.stopPropagation()}>
                    <div className="d-flex align-items-center justify-content-end gap-1">
                      {canBid && (
                        <button
                          onClick={() => setBidDrug({ id: row.drug_id, name: row.generic_name })}
                          className="btn btn-sm btn-outline-success text-nowrap">
                          + Bid
                        </button>
                      )}
                      <Link href={`/drug/${encodeURIComponent(row.slug)}`} onClick={e => e.stopPropagation()}
                        className="btn btn-sm btn-icon btn-text-secondary rounded-pill">
                        <i className="bx bx-chevron-right" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="p-4 text-center text-muted">No drugs listed yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {bidDrug && (
        <BidModal
          drugId={bidDrug.id}
          drugName={bidDrug.name}
          onClose={() => setBidDrug(null)}
        />
      )}
    </>
  )
}
