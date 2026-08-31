import * as XLSX from 'xlsx'

// Reads the first sheet of an .xlsx/.xls/.csv file into an array of
// plain objects, keyed by lower-cased, underscored header names, so
// "Generic Name" and "generic_name" both resolve to the same key.
export async function parseSpreadsheet(file: File): Promise<Record<string, string>[]> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false })

  return rows.map(row => {
    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(row)) {
      const normalized = key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
      out[normalized] = String(value ?? '').trim()
    }
    return out
  }).filter(row => Object.values(row).some(v => v !== ''))
}
