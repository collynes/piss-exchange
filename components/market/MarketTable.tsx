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
    <div className="overflow-auto flex-1">
      {/* Mobile cards */}
      <div className="md:hidden">
        {rows.map(row => {
          const pct = Number(row.change_pct)
          const isUp = pct >= 0
          return (
            <Link key={row.drug_id} href={`/drug/${row.slug}`}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-surface2 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-text truncate">{row.generic_name}</div>
                <div className="text-xs text-muted">{row.strength} · {row.dosage_form}</div>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <div className={`text-[13px] font-bold tabular-nums ${isUp ? 'text-green' : 'text-red'}`}>
                  {row.best_ask ? Number(row.best_ask).toFixed(2) : '—'}
                </div>
                <div className={`text-xs font-semibold ${isUp ? 'text-green' : 'text-red'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                </div>
              </div>
            </Link>
          )
        })}
        {rows.length === 0 && (
          <div className="px-4 py-8 text-center text-muted text-[13px]">No drugs listed yet.</div>
        )}
      </div>

      {/* Desktop table — TradingView screener style */}
      <table className="w-full border-collapse hidden md:table">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                className={`px-3 py-2.5 text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap text-${h.align}`}>
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
                className="hover:bg-surface2/40 cursor-pointer transition-colors"
                style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                onClick={() => { window.location.href = `/drug/${row.slug}` }}>
                <td className="px-3 py-2">
                  <span className="text-[13px] font-semibold text-text">{row.generic_name}</span>
                  <span className="text-xs text-muted ml-2">{row.strength} · {row.dosage_form}</span>
                </td>
                <td className={`px-3 py-2 text-right text-[13px] font-semibold tabular-nums ${isUp ? 'text-green' : 'text-red'}`}>
                  {row.last_price ? Number(row.last_price).toFixed(2) : '—'}
                </td>
                <td className={`px-3 py-2 text-right text-[13px] font-semibold tabular-nums ${isUp ? 'text-green' : 'text-red'}`}>
                  {isUp ? '+' : ''}{pct.toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-right text-[13px] text-red tabular-nums font-medium">
                  {row.best_ask ? Number(row.best_ask).toFixed(2) : '—'}
                </td>
                <td className="px-3 py-2 text-right text-[13px] text-green tabular-nums font-medium">
                  {row.best_bid ? Number(row.best_bid).toFixed(2) : '—'}
                </td>
                <td className="px-3 py-2 text-right text-[13px] text-text tabular-nums">{formatNumber(row.volume_today)}</td>
                <td className="px-3 py-2 text-right text-[13px] text-text tabular-nums">{row.deals_today}</td>
                <td className="px-3 py-2 text-right text-[13px] text-muted">{row.seller_count}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/drug/${row.slug}`} onClick={e => e.stopPropagation()}
                    className="px-2 py-0.5 text-xs text-muted hover:text-blue transition-colors">
                    →
                  </Link>
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr><td colSpan={9} className="px-4 py-8 text-center text-muted text-[13px]">No drugs listed yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
