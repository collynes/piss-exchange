'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Drug {
  id: string
  generic_name: string
  slug: string
  strength: string
  dosage_form: string
  category: string
  atc_code: string | null
  active: boolean
}

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 16px 40px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
} as const

const INPUT_CLASS = 'w-full bg-bg/80 rounded-lg px-3 py-2 text-xs text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all'
const INPUT_STYLE = { border: '1px solid rgba(255,255,255,0.08)' }

export default function AdminDrugsPage() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ generic_name: '', slug: '', atc_code: '', dosage_form: '', strength: '', category: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    createClient().from('drugs').select('*').order('generic_name').then(({ data }) => {
      setDrugs(data ?? [])
      setLoading(false)
    })
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const slug = form.slug || form.generic_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const { error: err } = await createClient().from('drugs').insert({ ...form, slug })
    if (err) { setError(err.message); setSaving(false); return }
    window.location.reload()
  }

  const toggleActive = async (id: string, active: boolean) => {
    await createClient().from('drugs').update({ active: !active }).eq('id', id)
    setDrugs(d => d.map(drug => drug.id === id ? { ...drug, active: !active } : drug))
  }

  const filtered = drugs.filter(d =>
    d.generic_name.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-text">
          Drug Catalogue <span className="text-muted font-normal text-xs ml-2">{drugs.length} drugs</span>
        </h1>
        <button onClick={() => setShowForm(f => !f)}
          className="text-xs px-3 py-1.5 font-semibold text-white rounded-lg transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)' }}>
          {showForm ? '− Close' : '+ Add Drug'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl overflow-hidden" style={GLASS}>
          <div className="px-4 py-3 bg-surface2/50 border-b border-white/5">
            <div className="text-xs font-bold text-muted uppercase tracking-wider">New Drug</div>
          </div>
          <form onSubmit={handleAdd} className="px-4 py-4">
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { key: 'generic_name', label: 'Generic Name', placeholder: 'Amoxicillin / Clavulanic Acid', required: true },
                { key: 'slug', label: 'Slug (auto if blank)', placeholder: 'amoxicillin-625mg-tablet', required: false },
                { key: 'atc_code', label: 'ATC Code', placeholder: 'J01CR02', required: false },
                { key: 'dosage_form', label: 'Dosage Form', placeholder: 'Tablet', required: true },
                { key: 'strength', label: 'Strength', placeholder: '625mg', required: true },
                { key: 'category', label: 'Category', placeholder: 'Antibiotics', required: true },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs text-muted uppercase tracking-wider mb-1">{label}</label>
                  <input
                    required={required}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={INPUT_CLASS}
                    style={INPUT_STYLE}
                  />
                </div>
              ))}
            </div>
            {error && <div className="text-xs text-red bg-red/8 rounded-lg px-3 py-2 mb-3">{error}</div>}
            <button type="submit" disabled={saving}
              className="text-xs px-4 py-2 font-bold text-white rounded-lg disabled:opacity-40 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)' }}>
              {saving ? 'Adding…' : 'Add Drug'}
            </button>
          </form>
        </div>
      )}

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or category…"
        className="w-full max-w-xs bg-surface rounded-lg px-3 py-2 text-xs text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/40 transition-all"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      />

      <div className="rounded-xl overflow-hidden" style={GLASS}>
        <table className="w-full min-w-[600px]">
          <thead className="bg-surface2/40">
            <tr>
              {['Generic Name', 'Form', 'Strength', 'Category', 'ATC', 'Status'].map(h => (
                <th key={h} className={`px-4 py-2.5 text-xs font-bold text-text uppercase tracking-wider ${h === 'Generic Name' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted text-xs">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted text-xs">No results</td></tr>
            ) : filtered.map((drug, i) => (
              <tr key={drug.id} className={`hover:bg-surface2 transition-colors ${i % 2 === 1 ? 'bg-surface2/30' : ''}`}>
                <td className="px-4 py-2.5">
                  <div className="text-sm font-semibold text-text">{drug.generic_name}</div>
                  <div className="text-xs text-muted font-mono">{drug.slug}</div>
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-text">{drug.dosage_form}</td>
                <td className="px-4 py-2.5 text-right text-xs text-text">{drug.strength}</td>
                <td className="px-4 py-2.5 text-right text-xs text-muted">{drug.category}</td>
                <td className="px-4 py-2.5 text-right text-xs text-muted">{drug.atc_code ?? '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => toggleActive(drug.id, drug.active)}
                    className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors
                      ${drug.active ? 'bg-green/10 text-green hover:bg-red/10 hover:text-red' : 'bg-red/10 text-red hover:bg-green/10 hover:text-green'}`}>
                    {drug.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
