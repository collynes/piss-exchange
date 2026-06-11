'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Suggestion {
  slug: string
  generic_name: string
  strength: string
  dosage_form: string
}

interface MarketSearchFormProps {
  q?: string
  cat?: string
  filter?: string
  categories: string[]
}

// Toolbar search with live autocomplete over the whole drugs catalogue.
// Picking a suggestion (or submitting) filters the board via ?q= — the row
// is then one click from the quick-view order book.
export function MarketSearchForm({ q, cat, filter, categories }: MarketSearchFormProps) {
  const router = useRouter()
  const [value, setValue] = useState(q ?? '')
  const [category, setCategory] = useState(cat ?? 'All')
  // Suggestions keyed by the term that produced them so stale ones never show
  const [sugg, setSugg] = useState<{ term: string; rows: Suggestion[] } | null>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const boxRef = useRef<HTMLDivElement>(null)

  const term = value.trim().toLowerCase()
  const rows = open && term && sugg?.term === term ? sugg.rows : []

  useEffect(() => {
    if (!term) return
    const supabase = createClient()
    let stale = false
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('drugs')
        .select('slug, generic_name, strength, dosage_form')
        .eq('active', true)
        .ilike('generic_name', `%${term}%`)
        .order('generic_name')
        .limit(8)
      if (!stale) setSugg({ term, rows: data ?? [] })
    }, 200)
    return () => { stale = true; clearTimeout(t) }
  }, [term])

  // Close the dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function go(searchTerm: string, nextCat = category) {
    setOpen(false)
    setActive(-1)
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.set('q', searchTerm.trim())
    if (nextCat && nextCat !== 'All') params.set('cat', nextCat)
    if (filter) params.set('filter', filter)
    const qs = params.toString()
    router.push(qs ? `/market?${qs}` : '/market')
  }

  function pick(s: Suggestion) {
    setValue(s.generic_name)
    go(s.generic_name)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' && rows.length) { e.preventDefault(); setActive(a => (a + 1) % rows.length) }
    else if (e.key === 'ArrowUp' && rows.length) { e.preventDefault(); setActive(a => (a <= 0 ? rows.length - 1 : a - 1)) }
    else if (e.key === 'Escape') { setOpen(false); setActive(-1) }
    else if (e.key === 'Enter' && active >= 0 && rows[active]) { e.preventDefault(); pick(rows[active]) }
  }

  return (
    <form
      onSubmit={e => { e.preventDefault(); go(value) }}
      className="d-flex align-items-center gap-1 flex-grow-1 flex-md-grow-0"
      style={{ maxWidth: 480 }}>

      <div ref={boxRef} className="position-relative flex-grow-1" style={{ minWidth: 160 }}>
        <input
          value={value}
          onChange={e => { setValue(e.target.value); setOpen(true); setActive(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search drug…"
          className="form-control form-control-sm"
          role="combobox"
          aria-expanded={rows.length > 0}
          aria-controls="market-search-listbox"
          aria-autocomplete="list"
        />
        {rows.length > 0 && (
          <div id="market-search-listbox" role="listbox"
            className="position-absolute start-0 end-0 mt-1 rounded-2 overflow-hidden bg-white"
            style={{ zIndex: 1060, border: '1px solid rgba(47,43,61,.14)', boxShadow: '0 10px 30px -8px rgba(47,43,61,.3)' }}>
            {rows.map((s, i) => (
              <button key={s.slug} type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => pick(s)}
                onMouseEnter={() => setActive(i)}
                className={`w-100 text-start border-0 px-3 py-2 d-block ${i === active ? 'bg-light' : 'bg-white'}`}>
                <span className="fw-semibold text-heading small">{s.generic_name}</span>
                <span className="text-muted small ms-2">{s.strength} · {s.dosage_form}</span>
              </button>
            ))}
          </div>
        )}
        {open && term && sugg?.term === term && sugg.rows.length === 0 && (
          <div className="position-absolute start-0 end-0 mt-1 rounded-2 bg-white px-3 py-2 small text-muted"
            style={{ zIndex: 1060, border: '1px solid rgba(47,43,61,.14)' }}>
            No drugs found for &quot;{value.trim()}&quot;
          </div>
        )}
      </div>

      <select
        value={category}
        onChange={e => { setCategory(e.target.value); go(value, e.target.value) }}
        className="form-select form-select-sm w-auto flex-shrink-0">
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <button type="submit" className="btn btn-sm btn-primary flex-shrink-0">
        <i className="bx bx-search" />
      </button>

      {(q || (cat && cat !== 'All')) && (
        <a href="/market" className="btn btn-sm btn-text-secondary flex-shrink-0">Clear</a>
      )}
    </form>
  )
}
