'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Setting {
  key: string
  value: string
  updated_at: string
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
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold text-white mb-6">Platform Settings</h1>
      <div className="bg-surface border border-border rounded overflow-hidden">
        {loading ? (
          <div className="px-5 py-6 text-center text-muted text-sm">Loading…</div>
        ) : settings.map((setting, i) => {
          const meta = SETTING_LABELS[setting.key]
          const isOn = setting.value === 'true'
          return (
            <div key={setting.key} className={`flex items-center justify-between px-5 py-4 ${i < settings.length - 1 ? 'border-b border-border' : ''}`}>
              <div>
                <div className="text-sm font-semibold text-white">{meta?.label ?? setting.key}</div>
                <div className="text-xs text-muted mt-0.5">{meta?.desc}</div>
                <div className="text-[10px] text-muted/50 mt-1">Last updated: {new Date(setting.updated_at).toLocaleString('en-KE')}</div>
              </div>
              <button
                onClick={() => toggle(setting.key, setting.value)}
                disabled={saving === setting.key}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50
                  ${isOn ? 'bg-green' : 'bg-surface2'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out
                  ${isOn ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
