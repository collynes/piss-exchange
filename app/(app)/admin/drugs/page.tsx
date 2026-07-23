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

type FormState = { generic_name: string; slug: string; atc_code: string; dosage_form: string; strength: string; category: string }

function sanitizeSlug(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function buildSlug(form: FormState): string {
  if (form.slug.trim()) return sanitizeSlug(form.slug)
  return sanitizeSlug(`${form.generic_name} ${form.strength} ${form.dosage_form}`)
}

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const
const INPUT_CLASS = 'w-full bg-bg rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all'
const INPUT_STYLE = { border: '1px solid rgba(47,43,61,.15)' }

const FORM_FIELDS: { key: keyof FormState; label: string; placeholder: string; required: boolean; maxLength: number }[] = [
  { key: 'generic_name', label: 'Generic Name',   placeholder: 'Amoxicillin / Clavulanic Acid', required: true,  maxLength: 255 },
  { key: 'dosage_form',  label: 'Dosage Form',    placeholder: 'Tablet',                        required: true,  maxLength: 50  },
  { key: 'strength',     label: 'Strength',       placeholder: '625mg',                         required: true,  maxLength: 50  },
  { key: 'category',     label: 'Category',       placeholder: 'Antibiotics',                   required: true,  maxLength: 100 },
  { key: 'atc_code',     label: 'ATC Code',       placeholder: 'J01CR02',                       required: false, maxLength: 10  },
  { key: 'slug',         label: 'Slug (auto)',     placeholder: 'amoxicillin-625mg-tablet',      required: false, maxLength: 200 },
]

const EMPTY_FORM: FormState = { generic_name: '', slug: '', atc_code: '', dosage_form: '', strength: '', category: '' }

function drugToForm(d: Drug): FormState {
  return { generic_name: d.generic_name, slug: d.slug, atc_code: d.atc_code ?? '', dosage_form: d.dosage_form, strength: d.strength, category: d.category }
}

/* ── Modal wrapper ─────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ ...CARD, background: '#fff', color: '#2b3340' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
          <h2 className="text-sm font-bold text-text">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors text-lg leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function DrugForm({
  form,
  setForm,
  saving,
  error,
  onSubmit,
  submitLabel,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  saving: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  submitLabel: string
}) {
  const computedSlug = buildSlug(form)

  return (
    <form onSubmit={onSubmit} className="px-5 py-5">
      <div className="grid grid-cols-2 gap-4 mb-5">
        {FORM_FIELDS.map(({ key, label, placeholder, required, maxLength }) => (
          <div key={key} className={key === 'generic_name' ? 'col-span-2' : ''}>
            <label className="block text-xs font-medium text-muted mb-1.5">
              {label}{required && <span className="text-red ml-0.5">*</span>}
            </label>
            <input
              required={required}
              maxLength={maxLength}
              placeholder={key === 'slug' ? computedSlug || placeholder : placeholder}
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className={INPUT_CLASS}
              style={INPUT_STYLE}
            />
            {key === 'slug' && (
              <p className="text-[11px] text-muted mt-1">
                Leave blank to auto-generate:{' '}
                <span className="font-mono text-blue">{computedSlug || '—'}</span>
              </p>
            )}
          </div>
        ))}
      </div>
      {error && (
        <div className="px-4 py-2.5 rounded-lg text-xs text-red mb-4"
          style={{ background: 'rgba(234,84,85,.08)', border: '1px solid rgba(234,84,85,.2)' }}>
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="px-4 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-40 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #5a1149, #8c3d77)' }}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default function AdminDrugsPage() {
  const [drugs, setDrugs]       = useState<Drug[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  /* modal state */
  const [addOpen,       setAddOpen]       = useState(false)
  const [editDrug,      setEditDrug]      = useState<Drug | null>(null)
  const [viewDrug,      setViewDrug]      = useState<Drug | null>(null)
  const [deleteDrug,    setDeleteDrug]    = useState<Drug | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  /* form state */
  const [form,    setForm]    = useState<FormState>(EMPTY_FORM)
  const [saving,  setSaving]  = useState(false)
  const [deleting,setDeleting]= useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    createClient().from('drugs').select('*').order('generic_name').then(({ data }) => {
      setDrugs(data ?? [])
      setLoading(false)
    })
  }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setError(null); setAddOpen(true) }
  const openEdit = (d: Drug) => { setForm(drugToForm(d)); setError(null); setEditDrug(d) }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(null)
    const slug = buildSlug(form)
    if (!slug) { setError('Cannot generate a valid slug — check the drug name'); setSaving(false); return }
    const res = await fetch('/api/admin/drugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slug }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error ?? 'Failed to add drug'); setSaving(false); return }
    setDrugs(d => [...d, data].sort((a, b) => a.generic_name.localeCompare(b.generic_name)))
    setAddOpen(false); setSaving(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editDrug) return
    setSaving(true); setError(null)
    const slug = buildSlug(form)
    if (!slug) { setError('Cannot generate a valid slug — check the drug name'); setSaving(false); return }
    const res = await fetch(`/api/admin/drugs/${editDrug.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slug }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error ?? 'Failed to save drug'); setSaving(false); return }
    setDrugs(d => d.map(drug => drug.id === editDrug.id ? { ...drug, ...form, slug } : drug))
    setEditDrug(null); setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteDrug) return
    setDeleting(true)
    await fetch(`/api/admin/drugs/${deleteDrug.id}`, { method: 'DELETE' })
    setDrugs(d => d.filter(drug => drug.id !== deleteDrug.id))
    setDeleteDrug(null); setDeleting(false)
  }

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/drugs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
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
        <button onClick={openAdd}
          className="px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #5a1149, #8c3d77)' }}>
          + Add Drug
        </button>
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>

        {/* Card header with search */}
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
          <span className="text-sm font-bold text-text">All Drugs</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or category…"
            className="bg-bg rounded-lg px-3 py-1.5 text-xs text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/40 transition-all w-52"
            style={{ border: '1px solid rgba(47,43,61,.12)' }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
                {['Drug', 'Form', 'Strength', 'Category', 'ATC', 'Status', 'Actions'].map((h, i) => (
                  <th key={h}
                    className={`px-4 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap
                      ${i === 0 ? 'text-left' : i === 6 ? 'text-right' : 'text-center'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-muted text-sm">No results</td></tr>
              ) : filtered.map((drug, i) => (
                <tr key={drug.id}
                  className="hover:bg-surface2 transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>

                  {/* Drug name + slug */}
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-text leading-tight">{drug.generic_name}</div>
                    <div className="text-[11px] text-muted mt-0.5">{drug.slug}</div>
                  </td>

                  <td className="px-4 py-3 text-center text-[13px] text-muted">{drug.dosage_form}</td>
                  <td className="px-4 py-3 text-center text-[13px] text-text font-medium">{drug.strength}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface2 text-muted">{drug.category}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-[12px] text-muted font-mono">{drug.atc_code ?? '—'}</td>

                  {/* Status badge — click to toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(drug.id, drug.active)}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                        drug.active
                          ? 'bg-label-success text-success hover:bg-red/10 hover:text-red'
                          : 'bg-muted/10 text-muted hover:bg-green/10 hover:text-green'
                      }`}>
                      {drug.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewDrug(drug)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-blue transition-colors rounded">
                        View
                      </button>
                      <button onClick={() => openEdit(drug)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-text transition-colors rounded">
                        Edit
                      </button>
                      <button onClick={() => setDeleteDrug(drug)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-muted hover:text-red transition-colors rounded">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Modal ──────────────────────────────────────── */}
      {addOpen && (
        <Modal title="Add New Drug" onClose={() => setAddOpen(false)}>
          <DrugForm
            form={form}
            setForm={setForm}
            saving={saving}
            error={error}
            onSubmit={handleAdd}
            submitLabel="Add Drug"
          />
        </Modal>
      )}

      {/* ── Edit Modal ─────────────────────────────────────── */}
      {editDrug && (
        <Modal title={`Edit — ${editDrug.generic_name}`} onClose={() => setEditDrug(null)}>
          <DrugForm
            form={form}
            setForm={setForm}
            saving={saving}
            error={error}
            onSubmit={handleEdit}
            submitLabel="Save Changes"
          />
        </Modal>
      )}

      {/* ── View Modal ─────────────────────────────────────── */}
      {viewDrug && (
        <Modal title="Drug Details" onClose={() => setViewDrug(null)}>
          <div className="px-5 py-5">
            <table className="table table-hover mb-0">
              <tbody>
                {[
                  ['Generic Name', viewDrug.generic_name],
                  ['Dosage Form',  viewDrug.dosage_form],
                  ['Strength',     viewDrug.strength],
                  ['Category',     viewDrug.category],
                  ['ATC Code',     viewDrug.atc_code ?? '—'],
                  ['Slug',         viewDrug.slug],
                  ['Status',       viewDrug.active ? 'Active' : 'Inactive'],
                ].map(([label, value], i, arr) => (
                  <tr key={label as string}
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                    <td className="py-2.5 text-xs text-muted uppercase tracking-wider w-1/3">{label}</td>
                    <td className={`py-2.5 text-[13px] text-right font-medium ${label === 'Status' ? (viewDrug.active ? 'text-green' : 'text-muted') : 'text-text'}`}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setViewDrug(null); openEdit(viewDrug) }}
                className="px-4 py-2 text-xs font-bold text-white rounded-lg hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #5a1149, #8c3d77)' }}>
                Edit Drug
              </button>
              <button onClick={() => setViewDrug(null)}
                className="px-4 py-2 text-xs font-semibold text-muted rounded-lg hover:text-text transition-colors"
                style={{ border: '1px solid rgba(47,43,61,.15)' }}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────── */}
      {deleteDrug && (
        <Modal title="Delete Drug" onClose={() => { setDeleteDrug(null); setDeleteConfirm('') }}>
          <div className="px-5 py-5">
            <p className="text-sm text-text mb-1">
              Are you sure you want to delete <span className="font-bold">{deleteDrug.generic_name}</span>?
            </p>
            <p className="text-xs text-muted mb-3">This will remove it from the catalogue and cannot be undone.</p>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Type <span className="font-bold text-text">{deleteDrug.generic_name}</span> to confirm
            </label>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={deleteDrug.generic_name}
              className={INPUT_CLASS}
              style={{ ...INPUT_STYLE, marginBottom: '1.25rem' }}
            />
            <div className="flex gap-2">
              <button onClick={handleDelete}
                disabled={deleting || deleteConfirm !== deleteDrug.generic_name}
                className="px-4 py-2 text-xs font-bold text-white rounded-lg disabled:opacity-40 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #ea5455, #c42030)' }}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button onClick={() => { setDeleteDrug(null); setDeleteConfirm('') }}
                className="px-4 py-2 text-xs font-semibold text-muted rounded-lg hover:text-text transition-colors"
                style={{ border: '1px solid rgba(47,43,61,.15)' }}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
