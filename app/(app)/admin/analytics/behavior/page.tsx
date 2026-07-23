import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Eye, ShieldAlert, FileWarning } from 'lucide-react'

type LogRow = {
  id: string
  event: string
  distinct_id: string | null
  properties: { path?: string; email_domain?: string; referrer?: string } | null
  created_at: string
}
type LogQueryResult = { data: LogRow[] | null; error: { message: string } | null }
type LogQueryClient = {
  from: (table: 'app_event_logs') => {
    select: (columns: string) => {
      order: (column: string, options: { ascending: boolean }) => {
        limit: (count: number) => Promise<LogQueryResult>
      }
    }
  }
}

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

function StatCard({ label, value, sub, Icon, tone }: { label: string; value: string; sub?: string; Icon: React.ElementType; tone: string }) {
  return (
    <div className="rounded-2xl p-5 bg-surface" style={CARD}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${tone}20` }}>
          <Icon className="w-4 h-4" style={{ color: tone }} />
        </div>
      </div>
      <div className="text-2xl font-black text-text tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  )
}

function BarList({ rows, max }: { rows: { label: string; count: number }[]; max: number }) {
  return (
    <div className="space-y-2.5">
      {rows.length === 0 && <div className="text-xs text-muted text-center py-6">No data yet</div>}
      {rows.map(r => (
        <div key={r.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text font-mono truncate pr-2">{r.label}</span>
            <span className="text-muted font-semibold tabular-nums flex-shrink-0">{r.count}</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface2">
            <div className="h-1.5 rounded-full bg-blue" style={{ width: `${max ? (r.count / max) * 100 : 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function AdminBehaviorAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const adminSupabase = createAdminClient()
  const { data: logs, error } = await (adminSupabase as unknown as LogQueryClient)
    .from('app_event_logs')
    .select('id, event, distinct_id, properties, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  const rows = error ? [] : (logs ?? [])
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000
  const within = (row: LogRow, ms: number) => now - new Date(row.created_at).getTime() <= ms

  const pageViews = rows.filter(r => r.event === 'page_viewed')
  const failedLogins = rows.filter(r => r.event === 'login_failed')
  const notFounds = rows.filter(r => r.event === 'page_not_found')

  const activeUsers24h = new Set(rows.filter(r => within(r, DAY) && r.distinct_id && r.distinct_id !== 'anonymous').map(r => r.distinct_id)).size
  const activeUsers7d = new Set(rows.filter(r => within(r, 7 * DAY) && r.distinct_id && r.distinct_id !== 'anonymous').map(r => r.distinct_id)).size

  const pathCounts = pageViews.reduce<Record<string, number>>((acc, r) => {
    const path = r.properties?.path ?? 'unknown'
    acc[path] = (acc[path] ?? 0) + 1
    return acc
  }, {})
  const pathEntries = Object.entries(pathCounts).map(([label, count]) => ({ label, count }))
  const mostVisited = [...pathEntries].sort((a, b) => b.count - a.count).slice(0, 10)
  const leastVisited = [...pathEntries].sort((a, b) => a.count - b.count).slice(0, 10)
  const maxVisit = Math.max(...pathEntries.map(p => p.count), 1)

  const notFoundCounts = notFounds.reduce<Record<string, number>>((acc, r) => {
    const path = r.properties?.path ?? 'unknown'
    acc[path] = (acc[path] ?? 0) + 1
    return acc
  }, {})
  const topNotFound = Object.entries(notFoundCounts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link href="/admin/analytics" className="text-xs text-muted hover:text-text transition-colors">← Analytics & Logs</Link>
        <h1 className="text-lg font-bold text-text mt-1">Behavior Analytics</h1>
        <p className="text-xs text-muted mt-0.5">Page traffic, failed logins and broken links — last 5,000 events</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Users (24h)" value={String(activeUsers24h)} Icon={Users} tone="#28c76f" />
        <StatCard label="Active Users (7d)" value={String(activeUsers7d)} Icon={Users} tone="#5a1149" />
        <StatCard label="Failed Logins (24h)" value={String(failedLogins.filter(r => within(r, DAY)).length)} sub={`${failedLogins.length} total`} Icon={ShieldAlert} tone="#ea5455" />
        <StatCard label="404s (24h)" value={String(notFounds.filter(r => within(r, DAY)).length)} sub={`${notFounds.length} total`} Icon={FileWarning} tone="#ff9f43" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-surface p-5" style={CARD}>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-blue" />
            <h2 className="text-sm font-bold text-text">Most Visited Pages</h2>
          </div>
          <BarList rows={mostVisited} max={maxVisit} />
        </div>
        <div className="rounded-2xl bg-surface p-5" style={CARD}>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-muted" />
            <h2 className="text-sm font-bold text-text">Least Visited Pages</h2>
          </div>
          <BarList rows={leastVisited} max={maxVisit} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent failed logins */}
        <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
            <h2 className="text-sm font-bold text-text">Recent Failed Logins</h2>
            <span className="text-xs text-muted">{failedLogins.length}</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {failedLogins.length === 0 && <div className="px-5 py-8 text-center text-muted text-xs">None recorded</div>}
            {failedLogins.slice(0, 30).map(r => (
              <div key={r.id} className="flex items-center justify-between px-5 py-2.5" style={{ borderBottom: '1px solid rgba(47,43,61,.06)' }}>
                <span className="text-xs text-text font-mono">@{r.properties?.email_domain ?? 'unknown'}</span>
                <span className="text-[11px] text-muted">{new Date(r.created_at).toLocaleString('en-KE')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent 404s */}
        <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
            <h2 className="text-sm font-bold text-text">Top 404 Paths</h2>
            <span className="text-xs text-muted">{notFounds.length}</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {topNotFound.length === 0 && <div className="px-5 py-8 text-center text-muted text-xs">None recorded</div>}
            {topNotFound.map(r => (
              <div key={r.label} className="flex items-center justify-between px-5 py-2.5" style={{ borderBottom: '1px solid rgba(47,43,61,.06)' }}>
                <span className="text-xs text-text font-mono truncate pr-2">{r.label}</span>
                <span className="text-[11px] text-muted flex-shrink-0">{r.count}×</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-muted text-center py-4">
          No behavior events yet — this data starts accumulating from when this page shipped.
        </p>
      )}
    </div>
  )
}
