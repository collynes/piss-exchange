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
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in'); setLoading(false); return }

    const qty = Number(form.qty_available)
    const { error: err } = await supabase.from('listings').insert({
      drug_id: selectedDrug.id,
      seller_id: user.id,
      brand_name: form.brand_name,
      manufacturer: form.manufacturer || null,
      origin_country: form.origin_country,
      qty_available: qty,
      qty_remaining: qty,
      price_per_unit: Number(form.price_per_unit),
      min_order_qty: Number(form.min_order_qty),
      batch_no: form.batch_no || null,
      expiry_date: form.expiry_date || null,
      listing_expiry: form.listing_expiry || null,
      status: 'active',
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/drug/${selectedDrug.slug}`)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-bold text-text mb-6">List a Drug</h1>

      {/* Drug search */}
      <div className="bg-surface border border-border rounded p-5 mb-4">
        <label className="block text-xs text-muted uppercase tracking-wider mb-2">Generic Drug <span className="text-red">*</span></label>
        {selectedDrug ? (
          <div className="flex items-center justify-between bg-blue/10 border border-blue/30 rounded px-3 py-2">
            <div>
              <div className="text-sm text-text font-semibold">{selectedDrug.generic_name}</div>
              <div className="text-xs text-muted">{selectedDrug.strength} · {selectedDrug.dosage_form}</div>
            </div>
            <button onClick={() => setSelectedDrug(null)} className="text-muted hover:text-text text-xs">Change</button>
          </div>
        ) : (
          <div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search generic name (e.g. Amoxicillin)…"
              className="w-full bg-bg border border-border2 rounded px-3 py-2 text-sm text-text placeholder:text-muted focus:border-blue transition-colors mb-2"
            />
            {drugs.length > 0 && (
              <div className="border border-border2 rounded overflow-hidden">
                {drugs.map(drug => (
                  <button key={drug.id} onClick={() => { setSelectedDrug(drug); setSearch('') }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 transition-colors border-b border-border/50 last:border-0">
                    <span className="text-text">{drug.generic_name}</span>
                    <span className="text-muted ml-2 text-xs">{drug.strength} · {drug.dosage_form}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedDrug && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded p-5 space-y-4">
          {[
            { key: 'brand_name', label: 'Brand Name', placeholder: 'Augmentin', required: true },
            { key: 'manufacturer', label: 'Manufacturer', placeholder: 'GlaxoSmithKline', required: false },
            { key: 'origin_country', label: 'Country of Origin', placeholder: 'UK', required: true },
            { key: 'qty_available', label: 'Quantity Available', placeholder: '5000', type: 'number', required: true },
            { key: 'price_per_unit', label: 'Price per Unit (KES)', placeholder: '45.00', type: 'number', step: '0.01', required: true },
            { key: 'min_order_qty', label: 'Minimum Order Qty', placeholder: '100', type: 'number', required: true },
            { key: 'batch_no', label: 'Batch Number', placeholder: 'Optional', required: false },
            { key: 'expiry_date', label: 'Drug Expiry Date', type: 'date', required: false },
            { key: 'listing_expiry', label: 'Listing Expires On', type: 'date', required: false },
          ].map(({ key, label, placeholder, type = 'text', step, required }) => (
            <div key={key}>
              <label className="block text-xs text-muted uppercase tracking-wider mb-1">
                {label} {required && <span className="text-red">*</span>}
              </label>
              <input
                type={type}
                step={step}
                required={required}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-bg border border-border2 rounded px-3 py-2 text-sm text-text placeholder:text-muted focus:border-blue transition-colors"
              />
            </div>
          ))}

          {form.qty_available && form.price_per_unit && (
            <div className="bg-bg rounded p-3 flex justify-between text-xs">
              <span className="text-muted">Total listing value</span>
              <span className="text-text font-semibold">
                KES {(Number(form.qty_available) * Number(form.price_per_unit)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {error && <div className="bg-red/10 border border-red/30 text-red text-xs p-3 rounded">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue text-white font-semibold py-2.5 rounded text-sm hover:bg-blue/90 transition-colors disabled:opacity-50">
            {loading ? 'Listing…' : 'List Drug on Exchange'}
          </button>
        </form>
      )}
    </div>
  )
}
