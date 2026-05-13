'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const CATEGORIES = ['All', 'Antibiotics', 'Antimalarials', 'Diabetes', 'Cardiovascular', 'Respiratory', 'GI Tract', 'Pain Relief']

interface SidebarDrug {
  slug: string
  generic_name: string
  dosage_form: string
  last_price: number | null
  change_pct: number | null
}

export function DrugSidebar({ drugs }: { drugs: SidebarDrug[] }) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('cat') ?? 'All'

  return (
    <div className="bg-surface flex flex-col overflow-hidden h-full">
      {/* Search */}
      <div className="px-2 pt-2 pb-1.5">
        <input
          type="text"
          placeholder="Search drug…"
          className="w-full bg-surface2 rounded px-2.5 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/40 transition-all"
        />
      </div>

      {/* Categories */}
      <div className="px-1.5 pb-2 space-y-0.5">
        {CATEGORIES.map(cat => (
          <Link key={cat}
            href={cat === 'All' ? '/market' : `/market?cat=${cat}`}
            className={`block px-2 py-1 text-xs rounded cursor-pointer transition-colors
              ${activeCategory === cat
                ? 'bg-blue/15 text-blue font-semibold'
                : 'text-muted hover:text-text hover:bg-surface2'
              }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Drug list */}
      <div className="overflow-y-auto flex-1 scrollbar-hide">
        <div className="px-2 py-1.5 text-xs font-bold text-muted uppercase tracking-wider">
          Top Movers
        </div>
        {drugs.map(drug => (
          <Link key={drug.slug} href={`/drug/${drug.slug}`}
            className="flex justify-between items-center px-2.5 py-1.5 hover:bg-surface2 cursor-pointer transition-colors rounded mx-1">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-text leading-tight truncate">
                {drug.generic_name.split('/')[0].trim()}
              </div>
              <div className="text-xs text-muted">{drug.dosage_form}</div>
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <div className="text-xs font-semibold text-text">
                {drug.last_price ? Number(drug.last_price).toFixed(2) : '—'}
              </div>
              <div className={`text-xs ${Number(drug.change_pct) >= 0 ? 'text-green' : 'text-red'}`}>
                {Number(drug.change_pct) > 0 ? '▲' : Number(drug.change_pct) < 0 ? '▼' : ''}
                {Math.abs(Number(drug.change_pct)).toFixed(1)}%
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
