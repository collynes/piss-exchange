'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('cat') ?? 'All'
  const [mode, setMode] = useState<'drug' | 'category'>('drug')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filteredDrugs = q ? drugs.filter(d => d.generic_name.toLowerCase().includes(q)) : drugs
  const filteredCategories = q
    ? categories.filter(c => c.toLowerCase().includes(q))
    : categories

  function handleDrugSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      router.push('/market')
      return
    }
    const cat = searchParams.get('cat')
    const filter = searchParams.get('filter')
    const params = new URLSearchParams()
    params.set('q', trimmed)
    if (cat) params.set('cat', cat)
    if (filter) params.set('filter', filter)
    router.push(`/market?${params.toString()}`)
  }

  function switchMode(next: 'drug' | 'category') {
    setMode(next)
    setQuery('')
  }

  return (
    <div className="card h-100 drug-sidebar d-flex flex-column">
      {/* Search mode toggle */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="btn-group w-100 mb-2" role="group" aria-label="Search mode">
          <button
            type="button"
            className={`btn btn-sm ${mode === 'drug' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => switchMode('drug')}
          >
            Drug
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'category' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => switchMode('category')}
          >
            Category
          </button>
        </div>

        {mode === 'drug' ? (
          <form onSubmit={handleDrugSearch} className="d-flex gap-1">
            <input
              type="text"
              placeholder="Search drug…"
              className="form-control form-control-sm"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-sm btn-primary flex-shrink-0">
              <i className="bx bx-search" />
            </button>
          </form>
        ) : (
          <input
            type="text"
            placeholder="Filter category…"
            className="form-control form-control-sm"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        )}
      </div>

      {mode === 'category' ? (
        /* Category chips */
        <div className="px-3 pb-3 overflow-auto flex-grow-1">
          <div className="d-flex flex-wrap gap-2 pt-1">
            {filteredCategories.map(cat => (
              <Link key={cat}
                href={cat === 'All' ? '/market' : `/market?cat=${cat}`}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                {cat}
              </Link>
            ))}
            {filteredCategories.length === 0 && (
              <small className="text-muted">No categories found.</small>
            )}
          </div>
        </div>
      ) : (
        /* Drug list */
        <div className="p-3 pt-2 overflow-auto flex-grow-1">
          <div className="small fw-semibold text-muted text-uppercase mb-2">
            {q ? `Results (${filteredDrugs.length})` : 'Top Movers'}
          </div>
          {filteredDrugs.map(drug => (
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
          {filteredDrugs.length === 0 && (
            <small className="text-muted">
              No match in top movers — press <i className="bx bx-search align-middle" /> to search the full market.
            </small>
          )}
        </div>
      )}
    </div>
  )
}
