'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orgName: string
  phone: string
  licenseNo: string
  showLicense: boolean
}

export function EditProfileForm({ orgName, phone, licenseNo, showLicense }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ org_name: orgName, phone, license_no: licenseNo })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Failed to update profile'); return }
    setSuccess(true)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-sm btn-outline-primary">
        Edit Profile
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card-body border-top">
      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
      {success && <div className="alert alert-success py-2 small mb-3">Profile updated.</div>}

      <div className="mb-3">
        <label className="form-label small">Organisation Name</label>
        <input required maxLength={200} className="form-control form-control-sm"
          value={form.org_name} onChange={e => setForm(f => ({ ...f, org_name: e.target.value }))} />
      </div>

      <div className="mb-3">
        <label className="form-label small">Phone</label>
        <input maxLength={15} placeholder="+254700000000" className="form-control form-control-sm"
          value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </div>

      {showLicense && (
        <div className="mb-3">
          <label className="form-label small">PPB License No.</label>
          <input maxLength={60} className="form-control form-control-sm"
            value={form.license_no} onChange={e => setForm(f => ({ ...f, license_no: e.target.value }))} />
        </div>
      )}

      <div className="d-flex gap-2">
        <button type="submit" disabled={saving} className="btn btn-sm btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-sm btn-outline-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
