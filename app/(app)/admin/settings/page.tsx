'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Setting {
  key: string
  value: string
  updated_at: string | null
}

const SETTING_LABELS: Record<string, { label: string; desc: string }> = {
  require_doc_for_seller: {
    label: 'Require Document for Sellers',
    desc: 'Sellers must upload a PPB license document before being approved',
  },
  require_doc_for_buyer: {
    label: 'Require Document for Buyers',
    desc: 'Buyers must upload a registration document before being approved',
  },
}

const GLASS = {
  background: 'linear-gradient(160deg, var(--color-surface2) 0%, var(--color-surface) 100%)',
  boxShadow: '0 16px 40px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
} as const

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    createClient().from('platform_settings').select('*').then(({ data }) => {
      setSettings(data ?? [])
      setLoading(false)
    })
  }, [])

  const toggle = async (key: string, currentValue: string) => {
    setSaving(key)
    const newValue = currentValue === 'true' ? 'false' : 'true'
    await createClient().from('platform_settings').update({ value: newValue, updated_at: new Date().toISOString() }).eq('key', key)
    setSettings(s => s.map(setting => setting.key === key ? { ...setting, value: newValue } : setting))
    setSaving(null)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-base font-bold text-text">Platform Settings</h1>

      <div className="rounded-xl overflow-hidden" style={GLASS}>
        {loading ? (
          <div className="px-5 py-8 text-center text-muted text-xs">Loading…</div>
        ) : settings.length === 0 ? (
          <div className="px-5 py-8 text-center text-muted text-xs">No settings configured</div>
        ) : settings.map((setting, i) => {
          const meta = SETTING_LABELS[setting.key]
          const isOn = setting.value === 'true'
          return (
            <div key={setting.key}
              className={`flex items-center justify-between px-5 py-4 hover:bg-surface2/30 transition-colors ${i > 0 ? 'border-t border-white/5' : ''}`}>
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-sm font-semibold text-text">{meta?.label ?? setting.key}</div>
                <div className="text-xs text-muted mt-0.5">{meta?.desc}</div>
                {setting.updated_at && (
                  <div className="text-xs text-muted/40 mt-1">Updated: {new Date(setting.updated_at).toLocaleString('en-KE')}</div>
                )}
              </div>
              <button
                onClick={() => toggle(setting.key, setting.value)}
                disabled={saving === setting.key}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50
                  ${isOn ? 'bg-green' : 'bg-surface2'}`}
                style={{ border: '2px solid transparent' }}>
                <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out
                  ${isOn ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
