import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatKES, memberCode } from '@/lib/utils'

const CARD = { boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' } as const

type LogRow = { id: string; event: string; level: string; properties: Record<string, unknown> | null; created_at: string }
type LogQueryResult = { data: LogRow[] | null; error: { message: string } | null }
type LogQueryClient = {
  from: (table: 'app_event_logs') => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        order: (column: string, options: { ascending: boolean }) => {
          limit: (count: number) => Promise<LogQueryResult>
        }
      }
    }
  }
}

type TimelineEntry = {
  at: string
  kind: 'event' | 'listing' | 'bid' | 'order' | 'trade'
  label: string
  detail: string
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'muted'
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: viewerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (viewerProfile?.role !== 'admin') redirect('/dashboard')

  const adminSupabase = createAdminClient()

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id, org_name, role, verified, phone, license_no, doc_url, created_at, updated_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const [
    { data: logs },
    { data: listings },
    { data: bids },
    { data: ordersAsBuyer },
    { data: ordersAsSeller },
    { data: trades },
  ] = await Promise.all([
    (adminSupabase as unknown as LogQueryClient)
      .from('app_event_logs').select('id, event, level, properties, created_at')
      .eq('distinct_id', id).order('created_at', { ascending: false }).limit(200),
    adminSupabase.from('listings').select('id, brand_name, status, qty_available, price_per_unit, created_at, drugs(generic_name)')
      .eq('seller_id', id).order('created_at', { ascending: false }).limit(100),
    adminSupabase.from('bids').select('id, qty, price_per_unit, status, created_at, drugs(generic_name)')
      .eq('buyer_id', id).order('created_at', { ascending: false }).limit(100),
    adminSupabase.from('orders').select('id, total_amount, status, created_at, drugs(generic_name)')
      .eq('buyer_id', id).order('created_at', { ascending: false }).limit(100),
    adminSupabase.from('orders').select('id, total_amount, status, created_at, drugs(generic_name)')
      .eq('seller_id', id).order('created_at', { ascending: false }).limit(100),
    adminSupabase.from('trades').select('id, qty, total_amount, executed_at, buyer_id, seller_id, drugs(generic_name)')
      .or(`buyer_id.eq.${id},seller_id.eq.${id}`).order('executed_at', { ascending: false }).limit(100),
  ])

  const timeline: TimelineEntry[] = [
    ...(logs ?? []).map(l => ({
      at: l.created_at, kind: 'event' as const,
      label: l.event.replace(/_/g, ' '),
      detail: JSON.stringify(l.properties ?? {}),
      tone: l.level === 'error' ? 'danger' as const : l.level === 'warning' ? 'warning' as const : 'muted' as const,
    })),
    ...(listings ?? []).map(l => ({
      at: l.created_at as string, kind: 'listing' as const,
      label: `Listed ${(l.drugs as { generic_name: string } | null)?.generic_name ?? 'drug'}`,
      detail: `${l.brand_name} · ${l.qty_available} units @ KES ${Number(l.price_per_unit).toFixed(2)} · ${l.status}`,
      tone: l.status === 'active' ? 'success' as const : 'muted' as const,
    })),
    ...(bids ?? []).map(b => ({
      at: b.created_at as string, kind: 'bid' as const,
      label: `Bid on ${(b.drugs as { generic_name: string } | null)?.generic_name ?? 'drug'}`,
      detail: `${b.qty} units @ KES ${Number(b.price_per_unit).toFixed(2)} · ${b.status}`,
      tone: b.status === 'accepted' ? 'success' as const : b.status === 'open' ? 'primary' as const : 'muted' as const,
    })),
    ...(ordersAsBuyer ?? []).map(o => ({
      at: o.created_at as string, kind: 'order' as const,
      label: `Bought ${(o.drugs as { generic_name: string } | null)?.generic_name ?? 'drug'}`,
      detail: `${formatKES(Number(o.total_amount))} · ${o.status}`,
      tone: o.status === 'delivered' ? 'success' as const : o.status === 'cancelled' || o.status === 'disputed' ? 'danger' as const : 'primary' as const,
    })),
    ...(ordersAsSeller ?? []).map(o => ({
      at: o.created_at as string, kind: 'order' as const,
      label: `Sold ${(o.drugs as { generic_name: string } | null)?.generic_name ?? 'drug'}`,
      detail: `${formatKES(Number(o.total_amount))} · ${o.status}`,
      tone: o.status === 'delivered' ? 'success' as const : o.status === 'cancelled' || o.status === 'disputed' ? 'danger' as const : 'primary' as const,
    })),
    ...(trades ?? []).map(t => ({
      at: t.executed_at, kind: 'trade' as const,
      label: `Trade settled — ${(t.drugs as { generic_name: string } | null)?.generic_name ?? 'drug'}`,
      detail: `${t.qty} units · ${formatKES(Number(t.total_amount))} · ${t.buyer_id === id ? 'as buyer' : 'as seller'}`,
      tone: 'success' as const,
    })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const toneClass: Record<TimelineEntry['tone'], string> = {
    primary: 'bg-blue', success: 'bg-green', warning: 'bg-yellow', danger: 'bg-red', muted: 'bg-muted',
  }

  return (
    <div className="max-w-4xl space-y-4">
      <Link href="/admin/users" className="text-xs text-muted hover:text-text transition-colors">← All users</Link>

      {/* Profile card */}
      <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-text">{profile.org_name}</h1>
              <span className={`badge rounded-pill text-capitalize ${
                profile.role === 'admin' ? 'bg-label-primary text-primary' : profile.role === 'seller' ? 'bg-label-success text-success' : 'bg-label-secondary text-muted'
              }`}>{profile.role}</span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${profile.verified ? 'bg-label-success text-success' : 'bg-label-secondary text-muted'}`}>
                {profile.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="text-xs text-muted mt-1 font-mono">{memberCode(profile.id)}</div>
          </div>
          <div className="flex gap-1.5">
            {!profile.verified && (
              <form action={`/api/admin/users/${profile.id}/verify`} method="POST">
                <button type="submit" className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-label-success text-success hover:bg-green/20 transition-colors">Verify</button>
              </form>
            )}
            {profile.verified && (
              <form action={`/api/admin/users/${profile.id}/suspend`} method="POST">
                <button type="submit" className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-label-danger text-danger hover:bg-red/20 transition-colors">Suspend</button>
              </form>
            )}
          </div>
        </div>
        <table className="table table-hover mb-0">
          <tbody>
            {[
              { label: 'Phone', value: profile.phone ?? '—' },
              { label: 'License No.', value: profile.license_no ?? '—' },
              { label: 'Document', value: profile.doc_url ? 'Uploaded' : '—' },
              { label: 'Joined', value: new Date(profile.created_at as string).toLocaleString('en-KE') },
              { label: 'Last profile update', value: profile.updated_at ? new Date(profile.updated_at).toLocaleString('en-KE') : '—' },
            ].map(({ label, value }, i, arr) => (
              <tr key={label} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                <td className="px-5 py-2.5 text-xs text-muted uppercase tracking-wider w-1/3">{label}</td>
                <td className="px-5 py-2.5 text-right text-[13px] text-text">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unified audit trail */}
      <div className="rounded-2xl bg-surface overflow-hidden" style={CARD}>
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
          <h2 className="text-sm font-bold text-text">Audit Trail</h2>
          <span className="text-xs text-muted">{timeline.length} events</span>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {timeline.length === 0 && (
            <div className="px-5 py-10 text-center text-muted text-sm">
              No recorded activity yet. Event logging started {new Date('2026-07-23').toLocaleDateString('en-KE')} —
              earlier activity on this account may not appear here.
            </div>
          )}
          {timeline.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3"
              style={{ borderBottom: i < timeline.length - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
              <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${toneClass[entry.tone]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-text capitalize truncate">{entry.label}</span>
                  <span className="text-[11px] text-muted flex-shrink-0">{new Date(entry.at).toLocaleString('en-KE')}</span>
                </div>
                <div className="text-xs text-muted mt-0.5 truncate">{entry.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
