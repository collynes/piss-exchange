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

const CARD = { boxShadow: '0 2px 6px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)' } as const
const INPUT_CLASS = 'w-full bg-bg rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all'
const INPUT_STYLE = { border: '1px solid rgba(255,255,255,0.08)' }

export default function AdminDrugsPage() {
  const [drugs, setDrugs]     = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [form, setForm]       = useState({ generic_name: '', slug: '', atc_code: '', dosage_form: '', strength: '', category: '' })

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
    d.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text">Drug Catalogue</h1>
          <p className="text-xs text-muted mt-0.5">{drugs.length} drugs registered</p>
        </div>
        <button onClick={() => setShowForm(f => !f)}
          className="px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)' }}>
          {showForm ? '✕ Close' : '+ Add Drug'}
        </button>
      </div>

      {/* Add drug form */}
      {showForm && (
        <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-sm font-bold text-text">New Drug</h2>
          </div>
          <form onSubmit={handleAdd} className="px-5 py-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {([
                { key: 'generic_name', label: 'Generic Name',      placeholder: 'Amoxicillin / Clavulanic Acid', required: true },
                { key: 'dosage_form',  label: 'Dosage Form',       placeholder: 'Tablet',                        required: true },
                { key: 'strength',     label: 'Strength',          placeholder: '625mg',                         required: true },
                { key: 'category',     label: 'Category',          placeholder: 'Antibiotics',                   required: true },
                { key: 'atc_code',     label: 'ATC Code',          placeholder: 'J01CR02',                       required: false },
                { key: 'slug',         label: 'Slug (auto)',        placeholder: 'amoxicillin-625mg-tablet',      required: false },
              ] as { key: keyof typeof form; label: string; placeholder: string; required: boolean }[]).map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-muted mb-1.5">
                    {label}{required && <span className="text-red ml-0.5">*</span>}
                  </label>
                  <input
                    required={required}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={INPUT_CLASS}
                    style={INPUT_STYLE}
                  />
                </div>
              ))}
            </div>
            {error && (
              <div className="px-4 py-2.5 rounded-lg text-xs text-red mb-3"
                style={{ background: 'rgba(242,54,69,0.08)', border: '1px solid rgba(242,54,69,0.2)' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-40 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)' }}>
              {saving ? 'Adding…' : 'Add Drug'}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or category…"
        className="bg-surface rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/40 transition-all w-full max-w-xs"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      />

      {/* Table */}
      <div className="rounded-2xl bg-surface overflow-x-auto" style={CARD}>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Generic Name', 'Form', 'Strength', 'Category', 'ATC', 'Status'].map((h, i) => (
                <th key={h} className={`px-5 py-3.5 text-[11px] font-bold text-muted uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted text-sm">No results</td></tr>
            ) : filtered.map((drug, i) => (
              <tr key={drug.id}
                className="hover:bg-surface2/30 transition-colors"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                <td className="px-5 py-3.5">
                  <div className="text-[13px] font-semibold text-text">{drug.generic_name}</div>
                </td>
                <td className="px-5 py-3.5 text-right text-[13px] text-text">{drug.dosage_form}</td>
                <td className="px-5 py-3.5 text-right text-[13px] text-text">{drug.strength}</td>
                <td className="px-5 py-3.5 text-right text-[13px] text-muted">{drug.category}</td>
                <td className="px-5 py-3.5 text-right text-[13px] text-muted">{drug.atc_code ?? '—'}</td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => toggleActive(drug.id, drug.active)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                      drug.active
                        ? 'bg-green/12 text-green hover:bg-red/12 hover:text-red'
                        : 'bg-muted/15 text-muted hover:bg-green/12 hover:text-green'
                    }`}>
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
