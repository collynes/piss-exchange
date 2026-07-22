import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatKES, memberCode } from '@/lib/utils'
import { PrintButton } from './PrintButton'

const SETTLED_STATES = ['confirmed', 'shipped', 'delivered']

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/orders/${id}/invoice`)

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const orderQuery = supabase
    .from('orders')
    .select(`
      id, qty, price_per_unit, total_amount, status, settlement_method, created_at,
      buyer_id, seller_id,
      drugs(generic_name, strength, dosage_form),
      listings(brand_name, origin_country)
    `)
    .eq('id', id)
  const { data: order } = await (isAdmin
    ? orderQuery
    : orderQuery.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
  ).single()

  if (!order) notFound()
  if (!SETTLED_STATES.includes(order.status)) {
    return (
      <div className="max-w-2xl mx-auto py-10 text-center text-muted text-sm">
        Invoice is available once the order is confirmed.
      </div>
    )
  }

  const drug = order.drugs as { generic_name: string; strength: string; dosage_form: string } | null
  const listing = order.listings as { brand_name: string; origin_country: string } | null

  const rows = [
    { label: 'Invoice No.', value: order.id.slice(0, 8).toUpperCase() },
    { label: 'Date', value: new Date(order.created_at as string).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { label: 'Buyer Code', value: memberCode(order.buyer_id) },
    { label: 'Seller Code', value: memberCode(order.seller_id) },
    { label: 'Drug', value: drug ? `${drug.generic_name} ${drug.strength} ${drug.dosage_form}` : '—' },
    { label: 'Brand / Origin', value: listing ? `${listing.brand_name} · ${listing.origin_country}` : '—' },
    { label: 'Quantity', value: `${order.qty.toLocaleString()} units` },
    { label: 'Price / unit', value: `KES ${Number(order.price_per_unit).toFixed(2)}` },
    { label: 'Settlement', value: order.settlement_method === 'dawahub_credit' ? 'Dawahub Credit' : 'M-Pesa Escrow' },
  ]

  return (
    <div className="max-w-2xl mx-auto py-8 print:py-0">
      <div className="flex justify-end mb-4 print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-2xl bg-surface overflow-hidden print:rounded-none print:shadow-none"
        style={{ boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' }}>

        {/* Letterhead — Dawahub identity only; buyer/seller stay anonymous below */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid rgba(47,43,61,.08)' }}>
          <Image src="/dawahub-logo.jpeg" alt="Dawahub" width={40} height={40} className="rounded-circle" />
          <div>
            <div className="text-base font-bold text-text">Dawahub PISS Exchange</div>
            <div className="text-xs text-muted">Settlement Invoice</div>
          </div>
        </div>

        <table className="table table-hover mb-0">
          <tbody>
            {rows.map(({ label, value }, i) => (
              <tr key={label}
                style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(47,43,61,.06)' : undefined }}>
                <td className="px-6 py-3 text-xs text-muted uppercase tracking-wider w-1/3">{label}</td>
                <td className="px-6 py-3 text-right text-[13px] text-text font-mono">{value}</td>
              </tr>
            ))}
            <tr>
              <td className="px-6 py-4 text-xs text-muted uppercase tracking-wider">Total</td>
              <td className="px-6 py-4 text-right text-lg font-black text-text">{formatKES(Number(order.total_amount))}</td>
            </tr>
          </tbody>
        </table>

        <div className="px-6 py-4 text-[11px] text-muted" style={{ borderTop: '1px solid rgba(47,43,61,.08)' }}>
          Buyer and seller identities are anonymised to member codes on this exchange.
          Dawahub PISS Exchange — a patented solution for the healthcare industry.
        </div>
      </div>
    </div>
  )
}
