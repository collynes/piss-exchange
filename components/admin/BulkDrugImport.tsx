'use client'
import { useState, useRef } from 'react'
import { parseSpreadsheet } from '@/lib/bulk/parseSpreadsheet'

interface ParsedRow {
  generic_name: string
  dosage_form: string
  strength: string
  category: string
  atc_code: string
  valid: boolean
  reason?: string
}

const REQUIRED = ['generic_name', 'dosage_form', 'strength', 'category']

function toRow(raw: Record<string, string>): ParsedRow {
  const generic_name = raw.generic_name ?? ''
  const dosage_form = raw.dosage_form ?? ''
  const strength = raw.strength ?? ''
  const category = raw.category ?? ''
  const atc_code = raw.atc_code ?? ''
  const missing = REQUIRED.filter(k => !raw[k]?.trim())
  return {
    generic_name, dosage_form, strength, category, atc_code,
    valid: missing.length === 0,
    reason: missing.length ? `Missing ${missing.join(', ')}` : undefined,
  }
}

export function BulkDrugImport({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ created: number; failed: { row: number; generic_name: string; error: string }[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const openModal = () => { setOpen(true); setRows([]); setResult(null); setError(null); setFileName('') }

  const handleFile = async (file: File) => {
    setError(null)
    setResult(null)
    setFileName(file.name)
    try {
      const raw = await parseSpreadsheet(file)
      setRows(raw.map(toRow))
    } catch {
      setError('Could not read this file. Use the generic-drug template (.xlsx or .csv).')
    }
  }

  const validRows = rows.filter(r => r.valid)

  const handleImport = async () => {
    setImporting(true)
    setError(null)
    const res = await fetch('/api/admin/drugs/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: validRows.map(({ valid, reason, ...r }) => r) }),
    })
    const data = await res.json().catch(() => ({}))
    setImporting(false)
    if (!res.ok) { setError(data.error ?? 'Import failed'); return }
    setResult(data)
    if (data.created > 0) onImported()
  }

  return (
    <>
      <button onClick={openModal}
        className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all hover:opacity-90"
        style={{ border: '1.5px solid #5a1149', color: '#5a1149', background: '#fff' }}>
        Import from Excel
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
            style={{ boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)', background: '#fff', color: '#2b3340' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
              <h2 className="text-sm font-bold text-text">Import Generic Drugs from Excel</h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-text transition-colors text-lg leading-none">✕</button>
            </div>

            <div className="px-5 py-5 overflow-y-auto flex-1">
              <p className="text-xs text-muted mb-4">
                Columns expected: <span className="font-mono">generic_name, dosage_form, strength, category, atc_code</span> (atc_code optional).
                Rows missing a required field are skipped and shown below.
              </p>

              <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="text-xs mb-4" />

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
                          {['Generic Name', 'Form', 'Strength', 'Category', 'Status'].map(h => (
                            <th key={h} className="px-3 py-2 text-[11px] font-semibold text-muted uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 200).map((r, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-xs">{r.generic_name || '—'}</td>
                            <td className="px-3 py-2 text-xs">{r.dosage_form || '—'}</td>
                            <td className="px-3 py-2 text-xs">{r.strength || '—'}</td>
                            <td className="px-3 py-2 text-xs">{r.category || '—'}</td>
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
                  <div className="font-semibold text-text mb-1">{result.created} drugs imported</div>
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
                  {importing ? 'Importing…' : `Import ${validRows.length} Drugs`}
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
