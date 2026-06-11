import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Ticker } from '@/components/layout/Ticker'
import { PublicNav } from '@/components/layout/PublicNav'

export default async function LandingPage() {
  const supabase = await createClient()

  const [{ data: { user } }, { count: drugCount }, { data: topDrugs }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('drugs').select('id', { count: 'exact', head: true }),
    supabase
      .from('listings')
      .select('drug_id, price_per_unit, drugs(generic_name, slug, category, dosage_form, strength)')
      .eq('status', 'active')
      .order('price_per_unit', { ascending: true })
      .limit(6),
  ])
  const listingRows = (topDrugs ?? []).slice(0, 6).map(l => ({
    generic_name: (l.drugs as { generic_name: string } | null)?.generic_name ?? '',
    slug: (l.drugs as { slug: string } | null)?.slug ?? '',
    category: (l.drugs as { category: string } | null)?.category ?? '',
    strength: (l.drugs as { strength: string } | null)?.strength ?? '',
    dosage_form: (l.drugs as { dosage_form: string } | null)?.dosage_form ?? '',
    price: Number(l.price_per_unit),
  })).filter(r => r.generic_name)

  return (
    <div>
      <Ticker />
      <PublicNav />
      <main className="min-h-screen bg-bg overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#d1d4dc 1px, transparent 1px), linear-gradient(90deg, #d1d4dc 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Live badge */}
        <div className="relative inline-flex items-center gap-2 bg-blue/10 border border-blue/25 text-blue text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-green" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Kenya Pharma Exchange — Live
        </div>

        {/* Main headline */}
        <h1 className="relative text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 max-w-4xl">
          <span className="text-text">The smarter way</span>
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
        <p className="text-muted text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          Real-time order books, transparent KES pricing and M-Pesa escrow. Built for Kenya&apos;s licensed pharmaceutical community.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          {user ? (
            <Link href="/dashboard"
              className="px-8 py-4 rounded-full font-bold text-white text-sm tracking-wide transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)', boxShadow: '0 0 28px rgba(41,98,255,0.35)' }}>
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/register"
              className="px-8 py-4 rounded-full font-bold text-white text-sm tracking-wide transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)', boxShadow: '0 0 28px rgba(41,98,255,0.35)' }}>
              Join the Exchange
            </Link>
          )}
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
      <section className="bg-surface/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: `${drugCount || 143}+`, label: 'Active Molecules', color: '#2962ff' },
            { value: '79+', label: 'Active Listings', color: '#089981' },
            { value: 'KES', label: 'Local Currency', color: '#5a1149' },
            { value: '24/7', label: 'Live Order Books', color: '#2962ff' },
          ].map(({ value, label, color }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black mb-1" style={{ color }}>{value}</div>
              <div className="text-sm text-muted font-medium uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block text-xs font-bold text-blue uppercase tracking-widest bg-blue/10 px-3 py-1 rounded-full mb-4">How it works</div>
          <h2 className="text-3xl font-black text-text">From registration to delivery</h2>
          <p className="text-muted mt-2 text-base max-w-md mx-auto">Four steps, fully digital, M-Pesa secured.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-9 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px bg-gradient-to-r from-blue/20 via-green/20 to-blue/20" />

          {[
            { step: '01', title: 'Register', desc: 'Sign up and choose your role. Upload your PPB license to get verified.', color: '#2962ff' },
            { step: '02', title: 'List or Browse', desc: 'Sellers post stock under generic names. Buyers see all brands live.', color: '#089981' },
            { step: '03', title: 'Trade', desc: 'Buy at ask price instantly or place a bid. Every trade is recorded on-chain.', color: '#2962ff' },
            { step: '04', title: 'Pay via M-Pesa', desc: 'Funds held in escrow. Released to the seller on confirmed delivery.', color: '#089981' },
          ].map((s, i) => (
            <div key={s.step} className="relative flex flex-col items-center text-center p-6 bg-surface rounded-2xl shadow-sm transition-all"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black mb-5"
                style={{ background: `${s.color}18`, border: `1.5px solid ${s.color}35`, color: s.color }}>
                {s.step}
              </div>
              <div className="text-sm font-bold text-text mb-2">{s.title}</div>
              <div className="text-sm text-muted leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR WHO ───────────────────────────────────────────────── */}
      <section className="bg-surface/40">
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-6">
          {/* Sellers */}
          <div className="p-8 rounded-2xl bg-surface shadow-sm transition-all">
            <div className="w-2 h-2 rounded-full bg-blue mb-6" />
            <div className="text-xs font-bold text-blue uppercase tracking-widest mb-2">For Sellers</div>
            <h3 className="text-xl font-black text-text mb-3">Reach every pharmacy in Kenya</h3>
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
            <Link href={user ? '/seller/listings/new' : '/register'}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue hover:gap-3 transition-all">
              {user ? 'List a drug' : 'Start selling'}
            </Link>
          </div>

          {/* Buyers */}
          <div className="p-8 rounded-2xl bg-surface shadow-sm transition-all">
            <div className="w-2 h-2 rounded-full bg-green mb-6" />
            <div className="text-xs font-bold text-green uppercase tracking-widest mb-2">For Buyers</div>
            <h3 className="text-xl font-black text-text mb-3">Buy at the best price, always</h3>
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
            <Link href={user ? '/market' : '/register'}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-green hover:gap-3 transition-all">
              {user ? 'Browse market' : 'Start buying'}
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
            <h2 className="text-3xl font-black text-text">What&apos;s on the exchange</h2>
            <p className="text-muted mt-2 text-sm">Real prices from verified sellers, right now.</p>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Drug</th>
                    <th className="text-end">Category</th>
                    <th className="text-end">Form</th>
                    <th className="text-end">Ask (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {listingRows.map(row => (
                    <tr key={row.slug}>
                      <td>
                        <Link href={`/drug/${encodeURIComponent(row.slug)}`} className="fw-semibold text-heading">
                          {row.generic_name}
                        </Link>
                        <small className="d-block text-muted">{row.strength}</small>
                      </td>
                      <td className="text-end">
                        <span className="badge rounded-pill bg-label-secondary text-muted">{row.category}</span>
                      </td>
                      <td className="text-end text-muted">{row.dosage_form}</td>
                      <td className="text-end fw-bold text-danger tabular-nums">{row.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
      <section className="bg-surface/40">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-block text-xs font-bold text-muted uppercase tracking-widest bg-surface2 px-3 py-1 rounded-full mb-4">Why PISS Exchange</div>
            <h2 className="text-3xl font-black text-text">Built for trust</h2>
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
              <div key={f.title} className="p-6 rounded-2xl bg-surface shadow-sm transition-all">
                <div className="w-1.5 h-1.5 rounded-full mb-4" style={{ background: f.color }} />
                <div className="text-sm font-bold text-text mb-2">{f.title}</div>
                <div className="text-sm text-muted leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="relative rounded-3xl p-10 md:p-12 text-center bg-surface shadow-sm">

          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-widest bg-blue/8 border border-blue/20 px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Free to join
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-text tracking-tight mb-4">
              Kenya&apos;s pharma supply chain<br />
              <span style={{
                background: 'linear-gradient(135deg, #2962ff, #089981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>starts here.</span>
            </h2>
            <p className="text-muted text-base max-w-xl mx-auto mb-8">
              Join a growing network of verified pharmaceutical companies on Kenya&apos;s first digital drugs exchange.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Link href="/dashboard"
                  className="px-10 py-4 rounded-full font-bold text-white text-sm tracking-wide transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)', boxShadow: '0 8px 32px rgba(41,98,255,0.25)' }}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register"
                    className="px-10 py-4 rounded-full font-bold text-white text-sm tracking-wide transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #2962ff, #1a47c8)', boxShadow: '0 8px 32px rgba(41,98,255,0.25)' }}>
                    Create Free Account
                  </Link>
                  <Link href="/login"
                    className="px-10 py-4 rounded-full font-semibold text-muted text-sm border border-border2 hover:text-text transition-all">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <p className="text-xs text-muted mt-5">Licensed pharmaceutical entities only. PPB Kenya regulated.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer>
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="font-bold text-muted">PISS Exchange</span>
            <span>by DawaHub</span>
          </div>
          <div className="flex gap-5">
            <Link href="/market" className="hover:text-muted transition-colors">Market</Link>
            {user ? (
              <Link href="/dashboard" className="hover:text-muted transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link href="/register" className="hover:text-muted transition-colors">Register</Link>
                <Link href="/login" className="hover:text-muted transition-colors">Sign In</Link>
              </>
            )}
          </div>
          <span>2026 DawaHub</span>
        </div>
      </footer>

      </main>
    </div>
  )
}
