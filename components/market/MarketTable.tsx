'use client'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'

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

export function MarketTable({ rows }: { rows: MarketRow[] }) {
  return (
    <div className="table-responsive flex-1">
      {/* Mobile cards */}
      <div className="md:hidden">
        {rows.map(row => {
          const pct = Number(row.change_pct)
          const isUp = pct >= 0
          return (
            <Link key={row.drug_id} href={`/drug/${row.slug}`}
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
              <div className="min-w-0 flex-1">
                <div className="fw-semibold text-heading text-truncate">{row.generic_name}</div>
                <small className="text-muted">{row.strength} · {row.dosage_form}</small>
              </div>
              <div className="text-end ms-3 flex-shrink-0">
                <div className={`fw-bold ${isUp ? 'text-success' : 'text-danger'}`}>
                  {row.best_ask ? Number(row.best_ask).toFixed(2) : '—'}
                </div>
                <small className={`fw-semibold ${isUp ? 'text-success' : 'text-danger'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                </small>
              </div>
            </Link>
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
          {rows.map((row, i) => {
            const pct = Number(row.change_pct)
            const isUp = pct >= 0
            return (
              <tr key={row.drug_id}
                className="cursor-pointer"
                onClick={() => { window.location.href = `/drug/${row.slug}` }}>
                <td>
                  <span className="fw-semibold text-heading">{row.generic_name}</span>
                  <small className="text-muted ms-2">{row.strength} · {row.dosage_form}</small>
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
                <td className="text-end">
                  <Link href={`/drug/${row.slug}`} onClick={e => e.stopPropagation()}
                    className="btn btn-sm btn-icon btn-text-secondary rounded-pill">
                    <i className="bx bx-chevron-right" />
                  </Link>
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
  )
}
