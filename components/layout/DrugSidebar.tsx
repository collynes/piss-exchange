'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface SidebarDrug {
  slug: string
  generic_name: string
  dosage_form: string
  last_price: number | null
  change_pct: number | null
}

interface DrugSidebarProps {
  drugs: SidebarDrug[]
  categories: string[]   // passed from server — derived from DB, never hardcoded
}

export function DrugSidebar({ drugs, categories }: DrugSidebarProps) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('cat') ?? 'All'

  return (
    <div className="card h-100 drug-sidebar">
      {/* Search */}
      <div className="p-4 pb-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search drug…"
          className="form-control form-control-sm"
        />
      </div>

      {/* Categories */}
      <div className="px-4 pb-3 border-bottom flex-shrink-0">
        <div className="d-flex flex-wrap gap-2">
        {categories.map(cat => (
          <Link key={cat}
            href={cat === 'All' ? '/market' : `/market?cat=${cat}`}
            className={`btn btn-sm
              ${activeCategory === cat
                ? 'btn-primary'
                : 'btn-outline-secondary'
              }`}
          >
            {cat}
          </Link>
        ))}
        </div>
      </div>

      {/* Drug list */}
      <div className="p-4 pt-3 overflow-auto flex-grow-1">
        <div className="small fw-semibold text-muted text-uppercase mb-2">
          Top Movers
        </div>
        {drugs.map(drug => (
          <Link key={drug.slug} href={`/drug/${encodeURIComponent(drug.slug)}`}
            className="drug-sidebar-link d-flex justify-content-between align-items-center rounded px-2 py-2 text-decoration-none">
            <div className="min-w-0 flex-grow-1">
              <div className="small fw-semibold text-heading text-truncate">
                {drug.generic_name.split('/')[0].trim()}
              </div>
              <small className="text-muted">{drug.dosage_form}</small>
            </div>
            <div className="text-end ms-2 flex-shrink-0">
              <div className="small fw-semibold text-heading">
                {drug.last_price ? Number(drug.last_price).toFixed(2) : '—'}
              </div>
              <small className={Number(drug.change_pct) >= 0 ? 'text-success' : 'text-danger'}>
                {Number(drug.change_pct) > 0 ? '▲' : Number(drug.change_pct) < 0 ? '▼' : ''}
                {Math.abs(Number(drug.change_pct)).toFixed(1)}%
              </small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
