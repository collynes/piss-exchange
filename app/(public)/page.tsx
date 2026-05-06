import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function LandingPage() {
  const supabase = await createClient()

  const [{ data: stats }, { data: topDrugs }] = await Promise.all([
    supabase.from('drugs').select('id', { count: 'exact', head: true }),
    supabase
      .from('listings')
      .select('drug_id, price_per_unit, drugs(generic_name, slug, category, dosage_form, strength)')
      .eq('status', 'active')
      .order('price_per_unit', { ascending: true })
      .limit(6),
  ])

  const drugCount = stats ?? 0
  const listingRows = (topDrugs ?? []).slice(0, 6).map(l => ({
    generic_name: (l.drugs as { generic_name: string } | null)?.generic_name ?? '',
    slug: (l.drugs as { slug: string } | null)?.slug ?? '',
    category: (l.drugs as { category: string } | null)?.category ?? '',
    strength: (l.drugs as { strength: string } | null)?.strength ?? '',
    dosage_form: (l.drugs as { dosage_form: string } | null)?.dosage_form ?? '',
    price: Number(l.price_per_unit),
  })).filter(r => r.generic_name)

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#d1d4dc 1px, transparent 1px), linear-gradient(90deg, #d1d4dc 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2962ff, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-6 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #089981, transparent)' }} />

        {/* Live badge */}
        <div className="relative inline-flex items-center gap-2 bg-blue/10 border border-blue/25 text-blue text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-green" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Kenya Pharma Exchange — Live
        </div>

        {/* Main headline */}
        <h1 className="relative text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 max-w-4xl">
          <span className="text-white">The smarter way</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #2962ff 0%, #089981 50%, #2962ff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 4s linear infinite',
          }}>
            to trade medicines.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-text text-lg md:text-xl max-w-2xl leading-relaxed mb-10 opacity-75">
          Real-time order books, transparent KES pricing and M-Pesa escrow. Built for Kenya&apos;s licensed pharmaceutical community.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link href="/register"
            className="px-8 py-4 rounded-full font-bold text-white text-sm tracking-wide transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)', boxShadow: '0 0 28px rgba(41,98,255,0.35)' }}>
            Join the Exchange
          </Link>
          <Link href="/market"
            className="px-8 py-4 rounded-full font-semibold text-text text-sm tracking-wide border border-border bg-surface hover:bg-surface2 hover:border-border2 transition-all">
            Browse Live Market
          </Link>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted">
          {['PPB Kenya Regulated', 'M-Pesa Escrow', 'Verified Sellers', 'Real-time Prices'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green inline-block" />
              {t}
            </span>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-25 pointer-events-none">
          <span className="text-xs text-muted">scroll</span>
          <div className="w-px h-8 bg-muted animate-pulse" />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '71+', label: 'Generic Drugs', color: '#2962ff' },
            { value: '79+', label: 'Active Listings', color: '#089981' },
            { value: 'KES', label: 'Local Currency', color: '#d8dce6' },
            { value: '24/7', label: 'Live Order Books', color: '#2962ff' },
          ].map(({ value, label, color }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black mb-1" style={{ color }}>{value}</div>
              <div className="text-xs text-muted font-medium uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block text-xs font-bold text-blue uppercase tracking-widest bg-blue/10 px-3 py-1 rounded-full mb-4">How it works</div>
          <h2 className="text-3xl font-black text-white">From registration to delivery</h2>
          <p className="text-muted mt-2 text-sm max-w-md mx-auto">Four steps, fully digital, M-Pesa secured.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-9 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px bg-gradient-to-r from-blue/20 via-green/20 to-blue/20" />

          {[
            { step: '01', title: 'Register', desc: 'Sign up and choose your role. Upload your PPB license to get verified.', color: '#2962ff' },
            { step: '02', title: 'List or Browse', desc: 'Sellers post stock under generic names. Buyers see all brands live.', color: '#089981' },
            { step: '03', title: 'Trade', desc: 'Buy at ask price instantly or place a bid. Every trade is recorded on-chain.', color: '#2962ff' },
            { step: '04', title: 'Pay via M-Pesa', desc: 'Funds held in escrow. Released to the seller on confirmed delivery.', color: '#089981' },
          ].map((s, i) => (
            <div key={s.step} className="relative flex flex-col items-center text-center p-6 bg-surface border border-border rounded-2xl hover:border-blue/25 transition-all"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black mb-5"
                style={{ background: `${s.color}18`, border: `1.5px solid ${s.color}35`, color: s.color }}>
                {s.step}
              </div>
              <div className="text-sm font-bold text-white mb-2">{s.title}</div>
              <div className="text-xs text-muted leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR WHO ───────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface/40">
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-6">
          {/* Sellers */}
          <div className="p-8 rounded-2xl border border-border bg-bg hover:border-blue/30 transition-all">
            <div className="w-2 h-2 rounded-full bg-blue mb-6" />
            <div className="text-xs font-bold text-blue uppercase tracking-widest mb-2">For Sellers</div>
            <h3 className="text-xl font-black text-white mb-3">Reach every pharmacy in Kenya</h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              List your pharmaceutical stock once. Buyers across Kenya see your pricing in real time. No middlemen, no margins lost.
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                'Post listings in under 2 minutes',
                'Set your price, minimum order and expiry',
                'Get paid via M-Pesa with escrow protection',
                'Track all orders from your dashboard',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-text">
                  <span className="text-green mt-0.5 flex-shrink-0 text-xs">+</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue hover:gap-3 transition-all">
              Start selling
            </Link>
          </div>

          {/* Buyers */}
          <div className="p-8 rounded-2xl border border-border bg-bg hover:border-green/30 transition-all">
            <div className="w-2 h-2 rounded-full bg-green mb-6" />
            <div className="text-xs font-bold text-green uppercase tracking-widest mb-2">For Buyers</div>
            <h3 className="text-xl font-black text-white mb-3">Buy at the best price, always</h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Compare every brand of a drug in one order book. Place bids, watch prices move and pay securely from your phone.
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                'Real-time best ask and bid prices per drug',
                'Compare multiple brands and origins',
                'Place bids below market price',
                'Confirm delivery before escrow releases',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-text">
                  <span className="text-green mt-0.5 flex-shrink-0 text-xs">+</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-green hover:gap-3 transition-all">
              Start buying
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIVE MARKET PREVIEW ───────────────────────────────────── */}
      {listingRows.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-widest bg-green/10 px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
              Live listings
            </div>
            <h2 className="text-3xl font-black text-white">What&apos;s on the exchange</h2>
            <p className="text-muted mt-2 text-sm">Real prices from verified sellers, right now.</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-5 px-5 py-2.5 border-b border-border bg-surface2/50 text-[10px] font-bold text-muted uppercase tracking-wider">
              <span className="col-span-2">Drug</span>
              <span className="text-right">Category</span>
              <span className="text-right">Form</span>
              <span className="text-right">Ask (KES)</span>
            </div>
            {listingRows.map((row, i) => (
              <Link href={`/drug/${row.slug}`} key={i}
                className="grid grid-cols-5 px-5 py-3.5 border-b border-border/30 hover:bg-blue/5 transition-colors group items-center last:border-0">
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-white group-hover:text-blue transition-colors">{row.generic_name}</div>
                  <div className="text-[10px] text-muted">{row.strength}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface2 text-muted">{row.category}</span>
                </div>
                <div className="text-right text-xs text-muted">{row.dosage_form}</div>
                <div className="text-right text-sm font-bold text-red tabular-nums">{row.price.toFixed(2)}</div>
              </Link>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link href="/market"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue hover:gap-3 transition-all">
              View full market board
            </Link>
          </div>
        </section>
      )}

      {/* ── TRUST FEATURES ────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface/40">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-block text-xs font-bold text-muted uppercase tracking-widest bg-surface2 px-3 py-1 rounded-full mb-4">Why PISS Exchange</div>
            <h2 className="text-3xl font-black text-white">Built for trust</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: 'M-Pesa Escrow', desc: 'Buyer pays into escrow. Funds release to seller only after delivery is confirmed.', color: '#089981' },
              { title: 'Real-time Order Books', desc: 'Every drug has a live order book with all active asks and open bids, like a stock exchange for medicines.', color: '#2962ff' },
              { title: 'PPB Verified Sellers', desc: 'All sellers are manually verified against their PPB Kenya license before they can list a single product.', color: '#089981' },
              { title: 'Fair Price Discovery', desc: 'Open bids and asks create competitive pricing. See the VWAP, last trade and daily change for every drug.', color: '#2962ff' },
              { title: 'M-Pesa Native', desc: 'Pay directly from your M-Pesa. No bank transfers, no cheques, no waiting. Works on any phone.', color: '#d8dce6' },
              { title: 'Immutable Trade History', desc: 'Every completed trade is permanently recorded with timestamps, quantities and prices. Full audit trail.', color: '#2962ff' },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-border bg-bg hover:border-blue/20 transition-all">
                <div className="w-1.5 h-1.5 rounded-full mb-4" style={{ background: f.color }} />
                <div className="text-sm font-bold text-white mb-2">{f.title}</div>
                <div className="text-xs text-muted leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="relative rounded-3xl overflow-hidden p-12 text-center"
          style={{ background: 'linear-gradient(135deg, #1a2a5e 0%, #161b27 40%, #0d2b1f 100%)', border: '1px solid rgba(41,98,255,0.25)' }}>

          <div className="absolute inset-0 opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, #2962ff 0%, transparent 70%)' }} />

          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-widest bg-green/10 border border-green/20 px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Free to join
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Kenya&apos;s pharma supply chain<br />
              <span style={{
                background: 'linear-gradient(135deg, #2962ff, #089981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>starts here.</span>
            </h2>
            <p className="text-text text-base max-w-xl mx-auto mb-8 opacity-70">
              Join Batalo Pharma and a growing network of verified pharmaceutical companies on Kenya&apos;s first digital drugs exchange.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register"
                className="px-10 py-4 rounded-full font-bold text-white text-sm tracking-wide transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)', boxShadow: '0 8px 32px rgba(41,98,255,0.35)' }}>
                Create Free Account
              </Link>
              <Link href="/login"
                className="px-10 py-4 rounded-full font-semibold text-muted text-sm border border-border hover:text-white hover:border-border2 transition-all">
                Sign In
              </Link>
            </div>
            <p className="text-xs text-muted/40 mt-5">Licensed pharmaceutical entities only. PPB Kenya regulated.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="font-bold text-muted">PISS Exchange</span>
            <span>by DawaHub</span>
          </div>
          <div className="flex gap-5">
            <Link href="/market" className="hover:text-muted transition-colors">Market</Link>
            <Link href="/register" className="hover:text-muted transition-colors">Register</Link>
            <Link href="/login" className="hover:text-muted transition-colors">Sign In</Link>
          </div>
          <span>2026 DawaHub</span>
        </div>
      </footer>

    </div>
  )
}
