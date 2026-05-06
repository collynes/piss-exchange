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
    <div className="border-r border-border flex flex-col overflow-hidden h-full">
      {/* Search */}
      <div className="p-2 border-b border-border">
        <input
          type="text"
          placeholder="Search drug…"
          className="w-full bg-surface2 border border-border2 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-muted focus:border-blue transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="p-1.5 border-b border-border space-y-0.5">
        {CATEGORIES.map(cat => (
          <Link key={cat}
            href={cat === 'All' ? '/market' : `/market?cat=${cat}`}
            className={`block px-2 py-1 text-xs rounded cursor-pointer transition-colors
              ${activeCategory === cat
                ? 'bg-blue/10 text-blue font-semibold'
                : 'text-muted hover:text-white hover:bg-surface2'
              }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Drug list */}
      <div className="overflow-y-auto flex-1 scrollbar-hide">
        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">
          Top Movers
        </div>
        {drugs.map(drug => (
          <Link key={drug.slug} href={`/drug/${drug.slug}`}
            className="flex justify-between items-center px-2.5 py-1.5 border-b border-border/50 hover:bg-surface2 cursor-pointer transition-colors">
            <div>
              <div className="text-xs font-semibold text-text leading-tight">
                {drug.generic_name.split('/')[0].trim()}
              </div>
              <div className="text-[10px] text-muted">{drug.dosage_form}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-white">
                {drug.last_price ? Number(drug.last_price).toFixed(2) : '—'}
              </div>
              <div className={`text-[10px] ${Number(drug.change_pct) >= 0 ? 'text-green' : 'text-red'}`}>
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
