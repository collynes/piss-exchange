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

export default function AdminDrugsPage() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ generic_name: '', slug: '', atc_code: '', dosage_form: '', strength: '', category: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-white mb-6">Drug Catalogue</h1>

      {/* Add drug form */}
      <div className="bg-surface border border-border rounded p-5 mb-6">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Add Drug</div>
        <form onSubmit={handleAdd} className="grid grid-cols-3 gap-3">
          {[
            { key: 'generic_name', label: 'Generic Name', placeholder: 'Amoxicillin / Clavulanic Acid', required: true },
            { key: 'slug', label: 'Slug (auto if blank)', placeholder: 'amoxicillin-625mg-tablet', required: false },
            { key: 'atc_code', label: 'ATC Code', placeholder: 'J01CR02', required: false },
            { key: 'dosage_form', label: 'Dosage Form', placeholder: 'Tablet', required: true },
            { key: 'strength', label: 'Strength', placeholder: '625mg', required: true },
            { key: 'category', label: 'Category', placeholder: 'Antibiotics', required: true },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-[10px] text-muted uppercase tracking-wider mb-1">{label}</label>
              <input
                required={required}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-bg border border-border2 rounded px-2.5 py-1.5 text-xs text-white placeholder:text-muted focus:border-blue transition-colors"
              />
            </div>
          ))}
          {error && <div className="col-span-3 text-red text-xs">{error}</div>}
          <div className="col-span-3">
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue text-white text-xs font-semibold rounded hover:bg-blue/90 transition-colors disabled:opacity-50">
              {saving ? 'Adding…' : 'Add Drug'}
            </button>
          </div>
        </form>
      </div>

      {/* Drug list */}
      <div className="bg-surface border border-border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Generic Name', 'Form', 'Strength', 'Category', 'ATC', 'Active'].map(h => (
                <th key={h} className={`px-4 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider ${h === 'Generic Name' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted text-sm">Loading…</td></tr>
            ) : drugs.map(drug => (
              <tr key={drug.id} className="border-b border-border/30 hover:bg-bg transition-colors">
                <td className="px-4 py-2.5">
                  <div className="text-sm text-white">{drug.generic_name}</div>
                  <div className="text-[10px] text-muted font-mono">{drug.slug}</div>
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-text">{drug.dosage_form}</td>
                <td className="px-4 py-2.5 text-right text-xs text-text">{drug.strength}</td>
                <td className="px-4 py-2.5 text-right text-xs text-muted">{drug.category}</td>
                <td className="px-4 py-2.5 text-right text-xs text-muted">{drug.atc_code ?? '—'}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => toggleActive(drug.id, drug.active)}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${drug.active ? 'bg-green/10 text-green hover:bg-red/10 hover:text-red' : 'bg-red/10 text-red hover:bg-green/10 hover:text-green'} transition-colors`}>
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
