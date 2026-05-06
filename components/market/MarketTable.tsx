'use client'
import Link from 'next/link'
import { ChangeBadge } from '@/components/ui/Badge'
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
      <div className="md:hidden divide-y divide-border">
        {rows.map(row => (
          <Link key={row.drug_id} href={`/drug/${row.slug}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-surface2 transition-colors">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-text truncate">{row.generic_name}</div>
              <div className="text-xs text-muted">{row.strength} · {row.dosage_form}</div>
            </div>
            <div className="text-right ml-3 flex-shrink-0">
              <div className={`text-sm font-bold tabular-nums ${Number(row.change_pct) >= 0 ? 'text-green' : 'text-red'}`}>
                {row.best_ask ? Number(row.best_ask).toFixed(2) : '—'}
              </div>
              <ChangeBadge pct={Number(row.change_pct)} />
            </div>
          </Link>
        ))}
        {rows.length === 0 && (
          <div className="px-4 py-8 text-center text-muted text-sm">No drugs listed yet.</div>
        )}
      </div>

      {/* Desktop table */}
      <table className="w-full border-collapse hidden md:table">
        <thead className="sticky top-0 bg-surface z-10">
          <tr className="border-b border-border">
            {['Generic Drug', 'Last (KES)', 'Change', 'Best Ask', 'Best Bid', 'Volume', 'Deals', 'Sellers', ''].map(h => (
              <th key={h} className={`px-4 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap border-b border-border ${h !== 'Generic Drug' && h !== '' ? 'text-right' : 'text-left'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.drug_id}
              className="border-b border-border/50 hover:bg-surface2 cursor-pointer transition-colors"
              onClick={() => { window.location.href = `/drug/${row.slug}` }}>
              <td className="px-4 py-2.5">
                <div className="text-sm font-semibold text-text">{row.generic_name}</div>
                <div className="text-[10.5px] text-muted mt-0.5">{row.strength} · {row.dosage_form}{row.atc_code ? ` · ${row.atc_code}` : ''}</div>
              </td>
              <td className={`px-4 py-2.5 text-right text-sm font-semibold tabular-nums ${Number(row.change_pct) >= 0 ? 'text-green' : 'text-red'}`}>
                {row.last_price ? Number(row.last_price).toFixed(2) : '—'}
              </td>
              <td className="px-4 py-2.5 text-right">
                <ChangeBadge pct={Number(row.change_pct)} />
              </td>
              <td className="px-4 py-2.5 text-right text-sm text-red tabular-nums">
                {row.best_ask ? Number(row.best_ask).toFixed(2) : '—'}
              </td>
              <td className="px-4 py-2.5 text-right text-sm text-green tabular-nums">
                {row.best_bid ? Number(row.best_bid).toFixed(2) : '—'}
              </td>
              <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{formatNumber(row.volume_today)}</td>
              <td className="px-4 py-2.5 text-right text-sm text-text tabular-nums">{row.deals_today}</td>
              <td className="px-4 py-2.5 text-right text-xs text-muted">{row.seller_count}</td>
              <td className="px-4 py-2.5 text-right">
                <Link href={`/drug/${row.slug}`} onClick={e => e.stopPropagation()}
                  className="px-2.5 py-1 bg-surface2 text-muted text-xs rounded-lg hover:bg-blue hover:text-white transition-colors">
                  View
                </Link>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={9} className="px-4 py-8 text-center text-muted text-sm">No drugs listed yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
