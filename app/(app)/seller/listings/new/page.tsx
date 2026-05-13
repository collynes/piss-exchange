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

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 20px 48px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
} as const

const INPUT_CLASS = 'w-full bg-bg/80 rounded-lg px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue/50 transition-all'
const INPUT_STYLE = { border: '1px solid rgba(255,255,255,0.08)' }

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
      <div className="rounded-2xl overflow-hidden mb-4" style={GLASS}>
        <div className="px-5 py-4 bg-surface2/50 border-b border-white/5">
          <div className="text-xs font-bold text-muted uppercase tracking-wider">Select Generic Drug</div>
        </div>
        <div className="px-5 py-4">
          {selectedDrug ? (
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: 'rgba(41,98,255,0.08)', border: '1px solid rgba(41,98,255,0.25)' }}>
              <div>
                <div className="text-sm text-text font-semibold">{selectedDrug.generic_name}</div>
                <div className="text-xs text-muted">{selectedDrug.strength} · {selectedDrug.dosage_form}</div>
              </div>
              <button onClick={() => setSelectedDrug(null)}
                className="text-xs text-muted hover:text-text transition-colors px-2 py-1">
                Change
              </button>
            </div>
          ) : (
            <div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search generic name (e.g. Amoxicillin)…"
                className={INPUT_CLASS + ' mb-2'}
                style={INPUT_STYLE}
              />
              {drugs.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  {drugs.map((drug, i) => (
                    <button key={drug.id} onClick={() => { setSelectedDrug(drug); setSearch('') }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface2 transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
                      <span className="text-text font-medium">{drug.generic_name}</span>
                      <span className="text-muted ml-2 text-xs">{drug.strength} · {drug.dosage_form}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedDrug && (
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl overflow-hidden mb-4" style={GLASS}>
            <div className="px-5 py-4 bg-surface2/50 border-b border-white/5">
              <div className="text-xs font-bold text-muted uppercase tracking-wider">Listing Details</div>
            </div>
            <div className="px-5 py-5 space-y-4">
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
                  <label className="block text-xs text-muted uppercase tracking-wider mb-2">
                    {label} {required && <span className="text-red">*</span>}
                  </label>
                  <input
                    type={type}
                    step={step}
                    required={required}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={INPUT_CLASS}
                    style={INPUT_STYLE}
                  />
                </div>
              ))}

              {form.qty_available && form.price_per_unit && (
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-bg/60" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-xs text-muted">Total listing value</span>
                  <span className="text-sm font-bold text-text tabular-nums">
                    KES {(Number(form.qty_available) * Number(form.price_per_unit)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {error && <div className="bg-red/8 rounded-lg px-4 py-3 text-xs text-red">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full font-bold py-3 rounded-xl text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 mt-2"
                style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)', boxShadow: '0 0 20px rgba(41,98,255,0.25)' }}>
                {loading ? 'Listing…' : 'List Drug on Exchange'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
