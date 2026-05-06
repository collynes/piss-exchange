import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MoverCards } from '@/components/market/MoverCards'
import { formatKES } from '@/lib/utils'

export const revalidate = 30

export default async function LandingPage() {
  const supabase = await createClient()

  const { data: moversData } = await supabase
    .from('market_data')
    .select('drug_id, last_price, change_pct, deals_today, drugs(generic_name, slug, dosage_form, strength)')
    .not('last_price', 'is', null)
    .order('deals_today', { ascending: false })
    .limit(4)

  const movers = (moversData ?? []).map(r => {
    const drug = r.drugs as { generic_name: string; slug: string; dosage_form: string; strength: string } | null
    return {
      slug: drug?.slug ?? '',
      generic_name: drug?.generic_name ?? '',
      dosage_form: drug?.dosage_form ?? '',
      strength: drug?.strength ?? '',
      last_price: Number(r.last_price ?? 0),
      change_pct: Number(r.change_pct ?? 0),
      deals_today: r.deals_today ?? 0,
    }
  }).filter(m => m.slug)

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <div className="inline-flex items-center gap-2 bg-blue/10 border border-blue/20 text-blue text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          Live · Kenya&apos;s Pharma Exchange
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Trade Medicines.<br />
          <span className="text-blue">Transparent Prices.</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed mb-8">
          Real-time order books, fair price discovery, and secure M-Pesa payments — connecting every link in Kenya&apos;s pharma supply chain.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/register"
            className="px-6 py-3 bg-blue text-white font-semibold rounded text-sm hover:bg-blue/90 transition-colors">
            Join Exchange
          </Link>
          <Link href="/market"
            className="px-6 py-3 border border-border2 text-muted font-medium rounded text-sm hover:text-white hover:border-border2/80 transition-colors">
            Browse Market
          </Link>
        </div>
        <p className="text-xs text-muted/50 mt-4">For licensed pharmaceutical entities · PPB Kenya</p>
      </section>

      {/* How It Works */}
      <section className="border-t border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-xs font-bold text-muted uppercase tracking-widest mb-8">How It Works</div>
          <div className="grid grid-cols-4 gap-px bg-border border border-border rounded overflow-hidden">
            {[
              { n: '01', title: 'Register & Verify', desc: 'Sign up, choose your role, upload your PPB license. Admin approves before you can list or trade.' },
              { n: '02', title: 'List or Browse', desc: 'Sellers list stock under a generic drug. Buyers see all brands, origins and prices in a live order book.' },
              { n: '03', title: 'Buy or Bid', desc: 'Buy at the ask price instantly or place your own bid. Trade is permanently recorded on the exchange.' },
              { n: '04', title: 'Pay via M-Pesa', desc: 'Funds held in escrow. Released to the seller when you confirm delivery. Fully traceable.' },
            ].map(step => (
              <div key={step.n} className="bg-surface p-6">
                <div className="text-xs text-blue font-bold tracking-wider mb-3">{step.n}</div>
                <div className="text-sm font-semibold text-white mb-1.5">{step.title}</div>
                <div className="text-xs text-muted leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Movers */}
      {movers.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-baseline justify-between mb-5">
            <span className="text-sm font-semibold text-white">Today&apos;s Top Movers</span>
            <Link href="/market" className="text-xs text-blue hover:underline">Full market board →</Link>
          </div>
          <MoverCards drugs={movers} />
        </section>
      )}

      {/* Join CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-surface border border-border rounded p-10 grid grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Ready to join<br />the exchange?</h2>
            <p className="text-sm text-muted leading-relaxed">One account. Choose your role at registration. Buy, sell, or both.</p>
          </div>
          <div className="space-y-3">
            {[
              { href: '/register', title: 'Join as a Seller', desc: 'Manufacturer, importer or primary distributor' },
              { href: '/register', title: 'Join as a Buyer', desc: 'Pharmacy, hospital or secondary distributor' },
            ].map(opt => (
              <Link key={opt.title} href={opt.href}
                className="flex items-center justify-between p-4 bg-bg border border-border2 rounded hover:border-blue hover:bg-blue/5 transition-all group">
                <div>
                  <div className="text-sm font-semibold text-white">{opt.title}</div>
                  <div className="text-xs text-muted mt-0.5">{opt.desc}</div>
                </div>
                <span className="text-muted group-hover:text-blue transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-4 flex justify-between text-xs text-muted/50">
        <span>PISS Exchange · by DawaHub · piss.dawahub.co.ke</span>
        <span>© 2026 DawaHub · PPB Kenya</span>
      </footer>
    </div>
  )
}
