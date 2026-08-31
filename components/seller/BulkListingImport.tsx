'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { parseSpreadsheet } from '@/lib/bulk/parseSpreadsheet'

interface CatalogueDrug {
  id: string
  generic_name: string
  strength: string
  dosage_form: string
}

interface ParsedRow {
  generic_name: string
  strength: string
  dosage_form: string
  brand_name: string
  origin_country: string
  qty_available: string
  price_per_unit: string
  min_order_qty: string
  batch_no: string
  expiry_date: string
  listing_expiry: string
  drugId: string | null
  valid: boolean
  reason?: string
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function toRow(raw: Record<string, string>, catalogue: Map<string, string>): ParsedRow {
  const generic_name = raw.generic_name ?? ''
  const strength = raw.strength ?? ''
  const dosage_form = raw.dosage_form ?? ''
  const brand_name = raw.brand_name ?? ''
  const origin_country = raw.origin_country ?? ''
  const qty_available = raw.qty_available ?? ''
  const price_per_unit = raw.price_per_unit ?? ''
  const min_order_qty = raw.min_order_qty ?? '1'
  const batch_no = raw.batch_no ?? ''
  const expiry_date = raw.expiry_date ?? ''
  const listing_expiry = raw.listing_expiry ?? ''

  const key = normalize(`${generic_name}|${strength}|${dosage_form}`)
  const drugId = catalogue.get(key) ?? null

  const qty = Number(qty_available)
  const price = Number(price_per_unit)
  const minQty = Number(min_order_qty || '1')

  let reason: string | undefined
  if (!drugId) reason = 'Generic not found in catalogue'
  else if (!brand_name.trim() || !origin_country.trim()) reason = 'Missing brand or origin'
  else if (!Number.isInteger(qty) || qty <= 0) reason = 'Invalid quantity'
  else if (!Number.isFinite(price) || price <= 0) reason = 'Invalid price'
  else if (!Number.isInteger(minQty) || minQty <= 0 || minQty > qty) reason = 'Invalid min order qty'

  return {
    generic_name, strength, dosage_form, brand_name, origin_country,
    qty_available, price_per_unit, min_order_qty, batch_no, expiry_date, listing_expiry,
    drugId, valid: !reason, reason,
  }
}

export function BulkListingImport({ onImported }: { onImported?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [loadingCatalogue, setLoadingCatalogue] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ created: number; failed: { row: number; error: string }[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openModal = () => { setOpen(true); setRows([]); setResult(null); setError(null); setFileName('') }

  const handleFile = async (file: File) => {
    setError(null)
    setResult(null)
    setFileName(file.name)
    setLoadingCatalogue(true)
    try {
      const [raw, { data: drugs }] = await Promise.all([
        parseSpreadsheet(file),
        createClient().from('drugs').select('id, generic_name, strength, dosage_form').eq('active', true).returns<CatalogueDrug[]>(),
      ])
      const catalogue = new Map<string, string>()
      for (const d of drugs ?? []) {
        catalogue.set(normalize(`${d.generic_name}|${d.strength}|${d.dosage_form}`), d.id)
      }
      setRows(raw.map(r => toRow(r, catalogue)))
    } catch {
      setError('Could not read this file. Use the brand-listing template (.xlsx or .csv).')
    }
    setLoadingCatalogue(false)
  }

  const validRows = rows.filter(r => r.valid)

  const handleImport = async () => {
    setImporting(true)
    setError(null)
    const res = await fetch('/api/listings/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows: validRows.map(r => ({
          drugId: r.drugId,
          brandName: r.brand_name,
          originCountry: r.origin_country,
          qtyAvailable: Number(r.qty_available),
          pricePerUnit: Number(r.price_per_unit),
          minOrderQty: Number(r.min_order_qty || '1'),
          batchNo: r.batch_no,
          expiryDate: r.expiry_date || undefined,
          listingExpiry: r.listing_expiry || undefined,
        })),
      }),
    })
    const data = await res.json().catch(() => ({}))
    setImporting(false)
    if (!res.ok) { setError(data.error ?? 'Import failed'); return }
    setResult(data)
    if (data.created > 0) { onImported ? onImported() : router.refresh() }
  }

  return (
    <>
      <button onClick={openModal}
        className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all hover:opacity-90 flex-shrink-0"
        style={{ border: '1.5px solid #5a1149', color: '#5a1149', background: '#fff' }}>
        Import from Excel
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}>
          <div className="w-full max-w-4xl rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
            style={{ boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)', background: '#fff', color: '#2b3340' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
              <h2 className="text-sm font-bold text-text">Import Listings from Excel</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-text transition-colors text-lg leading-none">✕</button>
            </div>

            <div className="px-5 py-5 overflow-y-auto flex-1">
              <p className="text-xs text-muted mb-4">
                Columns expected: <span className="font-mono">generic_name, strength, dosage_form</span> (must match an
                existing catalogue entry exactly), plus <span className="font-mono">brand_name, origin_country,
                qty_available, price_per_unit, min_order_qty, batch_no, expiry_date, listing_expiry</span>.
                Rows whose generic isn&apos;t in the catalogue yet are skipped — add it via the drug catalogue import first.
              </p>

              <input type="file" accept=".xlsx,.xls,.csv"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="text-xs mb-4" />

              {loadingCatalogue && <div className="text-xs text-muted mb-3">Reading file and matching against catalogue…</div>}

              {error && (
                <div className="px-4 py-2.5 rounded-lg text-xs text-red mb-4"
                  style={{ background: 'rgba(234,84,85,.08)', border: '1px solid rgba(234,84,85,.2)' }}>
                  {error}
                </div>
              )}

              {rows.length > 0 && !result && (
                <div className="space-y-3">
                  <div className="text-xs text-text">
                    <span className="font-semibold">{fileName}</span> — {rows.length} rows found,{' '}
                    <span className="text-green font-semibold">{validRows.length} ready to import</span>
                    {rows.length - validRows.length > 0 && (
                      <span className="text-red"> · {rows.length - validRows.length} will be skipped</span>
                    )}
                  </div>
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(47,43,61,.12)', maxHeight: 280, overflowY: 'auto' }}>
                    <table className="table table-hover mb-0">
                      <thead className="table-light" style={{ position: 'sticky', top: 0 }}>
                        <tr>
                          {['Generic', 'Brand', 'Qty', 'Price', 'Status'].map(h => (
                            <th key={h} className="px-3 py-2 text-[11px] font-semibold text-muted uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 200).map((r, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-xs">{r.generic_name || '—'} <span className="text-muted">{r.strength}</span></td>
                            <td className="px-3 py-2 text-xs">{r.brand_name || '—'}</td>
                            <td className="px-3 py-2 text-xs">{r.qty_available || '—'}</td>
                            <td className="px-3 py-2 text-xs">{r.price_per_unit || '—'}</td>
                            <td className="px-3 py-2 text-xs">
                              {r.valid
                                ? <span className="text-green font-semibold">Ready</span>
                                : <span className="text-red">{r.reason}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length > 200 && (
                      <div className="px-3 py-2 text-[11px] text-muted">…and {rows.length - 200} more rows</div>
                    )}
                  </div>
                </div>
              )}

              {result && (
                <div className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: 'rgba(40,199,111,.08)', border: '1px solid rgba(40,199,111,.25)' }}>
                  <div className="font-semibold text-text mb-1">{result.created} listings created</div>
                  {result.failed.length > 0 && (
                    <div className="text-xs text-muted">
                      {result.failed.length} rows failed:{' '}
                      {result.failed.slice(0, 5).map(f => `row ${f.row} (${f.error})`).join('; ')}
                      {result.failed.length > 5 && ` …and ${result.failed.length - 5} more`}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-4 flex gap-2" style={{ borderTop: '1px solid rgba(47,43,61,.08)' }}>
              {!result ? (
                <button onClick={handleImport} disabled={validRows.length === 0 || importing}
                  className="px-4 py-2 text-xs font-bold text-white rounded-lg disabled:opacity-40 transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #5a1149, #8c3d77)' }}>
                  {importing ? 'Importing…' : `Import ${validRows.length} Listings`}
                </button>
              ) : (
                <button onClick={() => setOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-white rounded-lg transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #5a1149, #8c3d77)' }}>
                  Done
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-muted rounded-lg hover:text-text transition-colors"
                style={{ border: '1px solid rgba(47,43,61,.15)' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
