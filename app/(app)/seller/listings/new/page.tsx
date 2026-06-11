'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Drug {
  id: string
  generic_name: string
  strength: string
  dosage_form: string
  slug: string
}

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

const INPUT_CLASS = 'w-full bg-bg rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all'
const INPUT_STYLE = { border: '1px solid rgba(47,43,61,.15)' }

export default function NewListingPage() {
  const router = useRouter()
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [search, setSearch] = useState('')
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    brand_name: '',
    manufacturer: '',
    origin_country: '',
    qty_available: '',
    price_per_unit: '',
    min_order_qty: '1',
    batch_no: '',
    expiry_date: '',
    listing_expiry: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('drugs').select('id, generic_name, strength, dosage_form, slug')
      .ilike('generic_name', `%${search}%`)
      .limit(10)
      .then(({ data }) => setDrugs(data ?? []))
  }, [search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDrug) { setError('Select a drug first'); return }

    const qty = Number(form.qty_available)
    const price = Number(form.price_per_unit)
    const minQty = Number(form.min_order_qty)

    if (!Number.isInteger(qty) || qty < 1) { setError('Quantity must be a positive whole number'); return }
    if (!Number.isFinite(price) || price < 0.01) { setError('Price must be at least KES 0.01'); return }
    if (!Number.isInteger(minQty) || minQty < 1) { setError('Minimum order quantity must be a positive whole number'); return }
    if (minQty > qty) { setError('Minimum order quantity cannot exceed total quantity'); return }

    setError(null)
    setLoading(true)

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drugId: selectedDrug.id,
        brandName: form.brand_name,
        manufacturer: form.manufacturer || null,
        originCountry: form.origin_country,
        qtyAvailable: qty,
        pricePerUnit: price,
        minOrderQty: minQty,
        batchNo: form.batch_no || null,
        expiryDate: form.expiry_date || null,
        listingExpiry: form.listing_expiry || null,
      }),
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok) { setError(body.error ?? 'Listing failed'); setLoading(false); return }
    router.push(`/drug/${encodeURIComponent(body.slug ?? selectedDrug.slug)}`)
  }

  const today = new Date().toISOString().split('T')[0]

  const fields: { key: keyof typeof form; label: string; placeholder?: string; type?: string; step?: string; min?: string; maxLength?: number; required: boolean }[] = [
    { key: 'brand_name',     label: 'Brand Name',         placeholder: 'Augmentin',       maxLength: 120, required: true },
    { key: 'manufacturer',   label: 'Manufacturer',       placeholder: 'GlaxoSmithKline', maxLength: 120, required: false },
    { key: 'origin_country', label: 'Country of Origin',  placeholder: 'UK',              maxLength: 60,  required: true },
    { key: 'qty_available',  label: 'Quantity Available', placeholder: '5000',  type: 'number', min: '1',    step: '1',    required: true },
    { key: 'price_per_unit', label: 'Price / Unit (KES)', placeholder: '45.00', type: 'number', min: '0.01', step: '0.01', required: true },
    { key: 'min_order_qty',  label: 'Minimum Order Qty',  placeholder: '100',   type: 'number', min: '1',    step: '1',    required: true },
    { key: 'batch_no',       label: 'Batch Number',       placeholder: 'Optional',        maxLength: 60,  required: false },
    { key: 'expiry_date',    label: 'Drug Expiry Date',   type: 'date', min: today,                        required: false },
    { key: 'listing_expiry', label: 'Listing Expires On', type: 'date', min: today,                        required: false },
  ]

  return (
    <div className="max-w-xl">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-text">List a Drug</h1>
        <p className="text-xs text-muted mt-0.5">Add your stock to the exchange order book</p>
      </div>

      {/* Step 1 — Drug selection */}
      <div className="rounded-2xl bg-surface overflow-hidden mb-4" style={CARD}>
        <div className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
          <h2 className="text-sm font-bold text-text">
            {selectedDrug ? '1. Generic Drug' : '1. Select Generic Drug'}
          </h2>
          {selectedDrug && (
            <button onClick={() => setSelectedDrug(null)}
              className="text-xs text-blue hover:underline">
              Change
            </button>
          )}
        </div>

        <div className="px-5 py-4">
          {selectedDrug ? (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green flex-shrink-0" />
              <div>
                <div className="text-[13px] font-semibold text-text">{selectedDrug.generic_name}</div>
                <div className="text-xs text-muted">{selectedDrug.strength} · {selectedDrug.dosage_form}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search generic name (e.g. Amoxicillin)…"
                className={INPUT_CLASS}
                style={INPUT_STYLE}
                autoFocus
              />
              {drugs.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(47,43,61,.12)' }}>
                  {drugs.map((drug, i) => (
                    <button key={drug.id}
                      onClick={() => { setSelectedDrug(drug); setSearch('') }}
                      className="w-full text-left px-4 py-2.5 hover:bg-surface2 transition-colors"
                      style={{ borderTop: i > 0 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                      <span className="text-[13px] font-medium text-text">{drug.generic_name}</span>
                      <span className="text-xs text-muted ml-2">{drug.strength} · {drug.dosage_form}</span>
                    </button>
                  ))}
                </div>
              )}
              {search.length > 1 && drugs.length === 0 && (
                <p className="text-xs text-muted px-1">
                  No drugs found for &quot;{search}&quot; — this generic may not be in the catalogue yet.
                  Contact Dawahub support to have it added before listing.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 2 — Listing details */}
      {selectedDrug && (
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-surface overflow-hidden mb-4" style={CARD}>
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
              <h2 className="text-sm font-bold text-text">2. Listing Details</h2>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fields.map(({ key, label, placeholder, type = 'text', step, min, maxLength, required }) => (
                  <div key={key} className={key === 'brand_name' || key === 'manufacturer' || key === 'origin_country' ? 'col-span-2 sm:col-span-1' : ''}>
                    <label className="block text-xs font-medium text-muted mb-1.5">
                      {label}{required && <span className="text-red ml-0.5">*</span>}
                    </label>
                    <input
                      type={type}
                      step={step}
                      min={min}
                      maxLength={maxLength}
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

              {form.qty_available && form.price_per_unit && (
                <div className="flex justify-between items-center py-3 px-4 rounded-lg"
                  style={{ background: 'rgba(90, 17, 73,.04)', border: '1px solid rgba(90, 17, 73,.12)' }}>
                  <span className="text-xs text-muted">Total listing value</span>
                  <span className="text-sm font-bold text-text tabular-nums">
                    KES {(Number(form.qty_available) * Number(form.price_per_unit)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {error && (
                <div className="px-4 py-3 rounded-lg text-xs text-red"
                  style={{ background: 'rgba(234,84,85,.08)', border: '1px solid rgba(234,84,85,.2)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #5a1149, #8c3d77)' }}>
                {loading ? 'Listing…' : 'List Drug on Exchange'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
