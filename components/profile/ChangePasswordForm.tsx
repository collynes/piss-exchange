'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ChangePasswordForm({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return }
    if (newPassword === currentPassword) { setError('New password must be different from the current one'); return }

    setSaving(true)
    const supabase = createClient()

    // Re-authenticate with the current password before allowing the change —
    // an open session alone shouldn't be enough to take over the account.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (signInError) {
      setError('Current password is incorrect')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (updateError) { setError(updateError.message); return }

    fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'password_changed' }),
    }).catch(() => {})

    setSuccess(true)
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-sm btn-outline-secondary">
        Change Password
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card-body border-top">
      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
      {success && <div className="alert alert-success py-2 small mb-3">Password changed.</div>}

      <div className="mb-3">
        <label className="form-label small">Current Password</label>
        <input type="password" required autoComplete="current-password" className="form-control form-control-sm"
          value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label small">New Password</label>
        <input type="password" required minLength={6} autoComplete="new-password" className="form-control form-control-sm"
          value={newPassword} onChange={e => setNewPassword(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label small">Confirm New Password</label>
        <input type="password" required minLength={6} autoComplete="new-password" className="form-control form-control-sm"
          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      </div>

      <div className="d-flex gap-2">
        <button type="submit" disabled={saving} className="btn btn-sm btn-primary">
          {saving ? 'Changing…' : 'Change Password'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-sm btn-outline-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
