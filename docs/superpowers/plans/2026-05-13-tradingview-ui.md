# TradingView-Style UI Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle the entire PISS Exchange UI to match TradingView's clean, data-dense, professional trading aesthetic.

**Architecture:** CSS token swap (dark default), then component-by-component restyle — Nav → Ticker → MarketTable → OrderBook → TradeHistory → DrugStats → mobile tabs. No new dependencies. All changes are pure Tailwind/CSS.

**Tech Stack:** Next.js 16 App Router, Tailwind v4 (CSS-based @theme), existing components

---

### Task 1: Theme tokens — dark default, TradingView palette

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx` (flash-prevention script default)
- Modify: `components/ui/ThemePicker.tsx` (initial state default)

- [ ] **Step 1: Update globals.css**

Replace `:root` and `[data-theme="dark"]` blocks:

```css
/* Dark theme — DEFAULT (TradingView style) */
:root {
  --color-bg:       #0f1117;
  --color-surface:  #1a1d27;
  --color-surface2: #212433;
  --color-border:   #2a2d3e;
  --color-border2:  #363a4f;
  --color-text:     #d1d4dc;
  --color-muted:    #787b86;
}

/* Light theme */
[data-theme="light"] {
  --color-bg:       #ffffff;
  --color-surface:  #ffffff;
  --color-surface2: #f9fafb;
  --color-border:   #f0f0f0;
  --color-border2:  #e4e4e7;
  --color-text:     #09090b;
  --color-muted:    #52525b;
}
```

Also update `body` base styles:
```css
@layer base {
  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    -webkit-font-smoothing: antialiased;
    font-variant-numeric: tabular-nums;
    font-size: 13px;
    transition: background-color 0.15s ease, color 0.15s ease;
  }
}
```

- [ ] **Step 2: Update flash-prevention script in app/layout.tsx**

The script should default to dark (no stored value = dark):
```tsx
<script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}` }} />
```
This is already correct — dark is now `:root` so no attribute needed for dark.

- [ ] **Step 3: Update ThemePicker default state**

In `components/ui/ThemePicker.tsx`, change initial state:
```tsx
const [theme, setTheme] = useState<Theme>('dark')

useEffect(() => {
  const stored = (localStorage.getItem('theme') as Theme) ?? 'dark'
  setTheme(stored)
  // ensure html attribute is set correctly on mount
  if (!localStorage.getItem('theme')) {
    document.documentElement.removeAttribute('data-theme')
  }
}, [])

const toggle = () => {
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  setTheme(next)
  if (next === 'dark') {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')
  }
}
```

- [ ] **Step 4: Commit**
```bash
git add app/globals.css app/layout.tsx components/ui/ThemePicker.tsx
git commit -m "feat: dark theme default, TradingView palette"
```

---

### Task 2: Nav — thinner, cleaner, TradingView style

**Files:**
- Modify: `components/layout/Nav.tsx`

- [ ] **Step 1: Update Nav**

```tsx
<nav className="flex items-center justify-between px-4 md:px-6 h-10 bg-surface border-b border-border sticky top-0 z-40">
  {/* Logo */}
  <Link href="/" className="flex items-center gap-2 shrink-0">
    <div className="w-6 h-6 rounded flex items-center justify-center text-white font-black text-[10px]"
      style={{ background: 'linear-gradient(135deg, #2962ff, #089981)' }}>
      DH
    </div>
    <span className="text-text font-bold text-[13px] tracking-tight">
      PISS<span className="text-blue">.</span>Exchange
    </span>
  </Link>

  {/* Desktop links */}
  <div className="hidden md:flex items-center gap-0">
    <Link href="/market" className="px-3 py-1.5 text-muted text-[13px] hover:text-text transition-colors">
      Market
    </Link>
    {user && (
      <>
        <Link href="/dashboard" className="px-3 py-1.5 text-muted text-[13px] hover:text-text transition-colors">
          Dashboard
        </Link>
        {(profile?.role === 'seller' || profile?.role === 'admin') && (
          <Link href="/seller/listings/new" className="px-3 py-1.5 text-muted text-[13px] hover:text-text transition-colors">
            + List Drug
          </Link>
        )}
        {profile?.role === 'admin' && (
          <Link href="/admin" className="px-3 py-1.5 text-muted text-[13px] hover:text-text transition-colors">
            Admin
          </Link>
        )}
      </>
    )}
  </div>

  {/* Desktop auth */}
  <div className="hidden md:flex items-center gap-2">
    <ThemePicker />
    {user ? (
      <div className="flex items-center gap-3">
        <span className="text-muted text-xs truncate max-w-36">{profile?.org_name}</span>
        <form action="/auth/signout" method="POST">
          <button className="px-2.5 py-1 text-xs border border-border rounded text-muted hover:text-text transition-colors">
            Log Out
          </button>
        </form>
      </div>
    ) : (
      <>
        <Link href="/login" className="px-3 py-1.5 text-[13px] text-muted hover:text-text transition-colors">
          Log In
        </Link>
        <Link href="/register" className="px-3 py-1.5 text-[13px] bg-blue text-white font-semibold rounded hover:bg-blue/90 transition-colors">
          Join Exchange
        </Link>
      </>
    )}
  </div>

  <MobileMenu role={profile?.role ?? null} orgName={profile?.org_name ?? null} isLoggedIn={!!user} />
</nav>
```

- [ ] **Step 2: Commit**
```bash
git add components/layout/Nav.tsx
git commit -m "feat: TV-style nav — h-10, 13px links, no rounded on links"
```

---

### Task 3: Ticker — compact, dots separator

**Files:**
- Modify: `components/layout/Ticker.tsx`

- [ ] **Step 1: Update Ticker**

```tsx
return (
  <div className="bg-bg border-b border-border h-7 overflow-hidden flex items-center">
    <div className="flex animate-ticker whitespace-nowrap">
      {doubled.map((item, i) => {
        const drug = item.drugs
        if (!drug) return null
        const pct = Number(item.change_pct ?? 0)
        const isUp = pct >= 0
        return (
          <div key={i} className="inline-flex items-center gap-2 px-4 h-7 text-[11px] shrink-0">
            <span className="text-muted font-medium">{drug.generic_name} {drug.strength}</span>
            <span className="text-text font-semibold tabular-nums">
              {item.last_price ? Number(item.last_price).toFixed(2) : '—'}
            </span>
            <span className={`font-semibold tabular-nums ${isUp ? 'text-green' : 'text-red'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
            </span>
            <span className="text-border2 text-[8px]">●</span>
          </div>
        )
      })}
    </div>
  </div>
)
```

- [ ] **Step 2: Commit**
```bash
git add components/layout/Ticker.tsx
git commit -m "feat: TV-style ticker — h-7, dot separators, coloured pct"
```

---

### Task 4: MarketTable — TradingView screener style

**Files:**
- Modify: `components/market/MarketTable.tsx`

- [ ] **Step 1: Rewrite MarketTable**

```tsx
'use client'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'

interface MarketRow {
  drug_id: string
  slug: string
  generic_name: string
  dosage_form: string
  strength: string
  atc_code: string | null
  last_price: number | null
  change_pct: number
  best_ask: number | null
  best_bid: number | null
  volume_today: number
  deals_today: number
  seller_count: number
}

export function MarketTable({ rows }: { rows: MarketRow[] }) {
  return (
    <div className="overflow-auto flex-1">
      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border">
        {rows.map(row => {
          const pct = Number(row.change_pct)
          const isUp = pct >= 0
          return (
            <Link key={row.drug_id} href={`/drug/${row.slug}`}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-surface2 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-text truncate">{row.generic_name}</div>
                <div className="text-[11px] text-muted">{row.strength} · {row.dosage_form}</div>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <div className={`text-[13px] font-bold tabular-nums ${isUp ? 'text-green' : 'text-red'}`}>
                  {row.best_ask ? Number(row.best_ask).toFixed(2) : '—'}
                </div>
                <div className={`text-[11px] font-semibold ${isUp ? 'text-green' : 'text-red'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                </div>
              </div>
            </Link>
          )
        })}
        {rows.length === 0 && (
          <div className="px-4 py-8 text-center text-muted text-[13px]">No drugs listed yet.</div>
        )}
      </div>

      {/* Desktop table — TradingView screener style */}
      <table className="w-full border-collapse hidden md:table">
        <thead className="sticky top-0 bg-surface z-10">
          <tr className="border-b border-border">
            {[
              { label: 'Drug', align: 'left' },
              { label: 'Last', align: 'right' },
              { label: 'Chg %', align: 'right' },
              { label: 'Ask', align: 'right' },
              { label: 'Bid', align: 'right' },
              { label: 'Volume', align: 'right' },
              { label: 'Deals', align: 'right' },
              { label: 'Sellers', align: 'right' },
              { label: '', align: 'right' },
            ].map(h => (
              <th key={h.label}
                className={`px-3 py-2 text-[11px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap text-${h.align}`}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const pct = Number(row.change_pct)
            const isUp = pct >= 0
            return (
              <tr key={row.drug_id}
                className={`hover:bg-surface2 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-surface2/30'}`}
                onClick={() => { window.location.href = `/drug/${row.slug}` }}>
                <td className="px-3 py-2">
                  <span className="text-[13px] font-semibold text-text">{row.generic_name}</span>
                  <span className="text-[11px] text-muted ml-2">{row.strength} · {row.dosage_form}</span>
                </td>
                <td className={`px-3 py-2 text-right text-[13px] font-semibold tabular-nums ${isUp ? 'text-green' : 'text-red'}`}>
                  {row.last_price ? Number(row.last_price).toFixed(2) : '—'}
                </td>
                <td className={`px-3 py-2 text-right text-[13px] font-semibold tabular-nums ${isUp ? 'text-green' : 'text-red'}`}>
                  {isUp ? '+' : ''}{pct.toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-right text-[13px] text-red tabular-nums font-medium">
                  {row.best_ask ? Number(row.best_ask).toFixed(2) : '—'}
                </td>
                <td className="px-3 py-2 text-right text-[13px] text-green tabular-nums font-medium">
                  {row.best_bid ? Number(row.best_bid).toFixed(2) : '—'}
                </td>
                <td className="px-3 py-2 text-right text-[13px] text-text tabular-nums">{formatNumber(row.volume_today)}</td>
                <td className="px-3 py-2 text-right text-[13px] text-text tabular-nums">{row.deals_today}</td>
                <td className="px-3 py-2 text-right text-[13px] text-muted">{row.seller_count}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/drug/${row.slug}`} onClick={e => e.stopPropagation()}
                    className="px-2 py-0.5 text-[11px] text-muted hover:text-blue transition-colors">
                    →
                  </Link>
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr><td colSpan={9} className="px-4 py-8 text-center text-muted text-[13px]">No drugs listed yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add components/market/MarketTable.tsx
git commit -m "feat: TV screener-style market table — compact rows, inline strength label, ▲▼ pct"
```

---

### Task 5: OrderBook — full-width depth bars, spread row

**Files:**
- Modify: `components/market/OrderBook.tsx`

- [ ] **Step 1: Rewrite OrderBook**

```tsx
'use client'

export interface Ask {
  id: string; seller_id: string; brand_name: string
  origin_country: string; qty_remaining: number
  price_per_unit: number; min_order_qty: number
}
export interface Bid {
  id: string; qty: number; price_per_unit: number; created_at: string | null
}

interface OrderBookProps {
  asks: Ask[]; bids: Bid[]; isAuthenticated: boolean
  onBuyClick: (ask: Ask) => void; onBidClick: () => void
}

export function OrderBook({ asks, bids, isAuthenticated, onBuyClick, onBidClick }: OrderBookProps) {
  const sortedAsks = [...asks].sort((a, b) => a.price_per_unit - b.price_per_unit)
  const sortedBids = [...bids].sort((a, b) => b.price_per_unit - a.price_per_unit)
  const maxAskQty = Math.max(...asks.map(a => a.qty_remaining), 1)
  const maxBidQty = Math.max(...bids.map(b => b.qty), 1)

  const bestAsk = sortedAsks[0]?.price_per_unit
  const bestBid = sortedBids[0]?.price_per_unit
  const spread = bestAsk && bestBid ? (bestAsk - bestBid).toFixed(2) : null
  const spreadPct = bestAsk && bestBid ? (((bestAsk - bestBid) / bestBid) * 100).toFixed(2) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
      {/* Asks */}
      <div className="border-b md:border-b-0 md:border-r border-border flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
          <span className="text-[11px] font-semibold text-red uppercase tracking-wider">Asks</span>
          <div className="grid grid-cols-3 gap-4 text-[10px] text-muted w-48 text-right">
            <span>Price (KES)</span><span>Qty</span><span>Brand</span>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {asks.length === 0 && (
            <div className="text-[12px] text-muted text-center py-6">No asks</div>
          )}
          {sortedAsks.map(ask => (
            <div key={ask.id} className="relative flex items-center px-3 py-1 hover:bg-surface2 group cursor-pointer"
              onClick={() => isAuthenticated && onBuyClick(ask)}>
              <div className="absolute inset-y-0 right-0 bg-red/8"
                style={{ width: `${(ask.qty_remaining / maxAskQty) * 100}%` }} />
              <span className="relative text-red font-semibold tabular-nums text-[13px] w-24">{Number(ask.price_per_unit).toFixed(2)}</span>
              <span className="relative text-text tabular-nums text-[13px] w-20 text-right">{ask.qty_remaining.toLocaleString()}</span>
              <span className="relative text-muted text-[11px] flex-1 text-right truncate">{ask.brand_name}</span>
              {isAuthenticated && (
                <button className="relative ml-2 px-2 py-0.5 bg-blue text-white text-[10px] font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Buy
                </button>
              )}
              {!isAuthenticated && (
                <a href="/login" className="relative ml-2 text-[10px] text-muted hover:text-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  Login
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bids */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-green uppercase tracking-wider">Bids</span>
            {spread && (
              <span className="text-[10px] text-muted">
                Spread: <span className="text-text">{spread}</span>
                <span className="ml-1 text-muted">({spreadPct}%)</span>
              </span>
            )}
          </div>
          {isAuthenticated && (
            <button onClick={onBidClick}
              className="px-2 py-0.5 text-[11px] font-semibold text-green border border-green/30 rounded hover:bg-green/10 transition-colors">
              + Bid
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {bids.length === 0 && (
            <div className="text-[12px] text-muted text-center py-6">No bids</div>
          )}
          {sortedBids.map(bid => (
            <div key={bid.id} className="relative flex items-center px-3 py-1 hover:bg-surface2">
              <div className="absolute inset-y-0 right-0 bg-green/8"
                style={{ width: `${(bid.qty / maxBidQty) * 100}%` }} />
              <span className="relative text-green font-semibold tabular-nums text-[13px] w-24">{Number(bid.price_per_unit).toFixed(2)}</span>
              <span className="relative text-text tabular-nums text-[13px] w-20 text-right">{bid.qty.toLocaleString()}</span>
              <span className="relative text-muted text-[11px] flex-1 text-right">
                {bid.created_at ? new Date(bid.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add components/market/OrderBook.tsx
git commit -m "feat: TV-style order book — right-anchored depth bars, spread row, buy on row click"
```

---

### Task 6: TradeHistory — compact, ▲▼ arrows, HH:MM:SS

**Files:**
- Modify: `components/market/TradeHistory.tsx`

- [ ] **Step 1: Rewrite TradeHistory**

```tsx
interface Trade { id: string; qty: number; price_per_unit: number; executed_at: string }
interface TradeHistoryProps { trades: Trade[]; prevPrice: number | null }

export function TradeHistory({ trades, prevPrice }: TradeHistoryProps) {
  return (
    <div className="border-t border-border flex-shrink-0 bg-surface">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Recent Trades</span>
        <div className="grid grid-cols-3 gap-4 text-[10px] text-muted w-52 text-right">
          <span>Price</span><span>Qty</span><span>Time</span>
        </div>
      </div>
      <div className="overflow-y-auto max-h-36">
        {trades.length === 0 && (
          <div className="text-[12px] text-muted text-center py-4">No trades yet</div>
        )}
        {trades.map((trade, i) => {
          const prev = trades[i + 1]
          const isUp = prev
            ? trade.price_per_unit >= prev.price_per_unit
            : trade.price_per_unit >= (prevPrice ?? 0)
          return (
            <div key={trade.id} className="flex items-center px-3 py-0.5 hover:bg-surface2">
              <span className={`font-semibold tabular-nums text-[13px] w-24 flex items-center gap-1 ${isUp ? 'text-green' : 'text-red'}`}>
                {isUp ? '▲' : '▼'} {Number(trade.price_per_unit).toFixed(2)}
              </span>
              <span className="text-text tabular-nums text-[13px] w-20 text-right">{trade.qty.toLocaleString()}</span>
              <span className="text-muted text-[11px] flex-1 text-right">
                {new Date(trade.executed_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add components/market/TradeHistory.tsx
git commit -m "feat: TV-style trade history — compact rows, ▲▼ arrows, HH:MM:SS"
```

---

### Task 7: DrugStats bar — inline compact TV style

**Files:**
- Modify: `components/market/DrugStats.tsx`

- [ ] **Step 1: Rewrite DrugStats**

```tsx
import { formatNumber, formatKES } from '@/lib/utils'

interface DrugStatsProps {
  last_price: number | null; prev_price: number | null; change_pct: number
  volume_today: number; vwap: number | null; deals_today: number; turnover_today: number
}

export function DrugStats(props: DrugStatsProps) {
  const isUp = props.change_pct >= 0
  const stats = [
    { label: 'Prev Close', value: props.prev_price ? Number(props.prev_price).toFixed(2) : '—' },
    {
      label: 'Change',
      value: `${isUp ? '+' : ''}${Number(props.change_pct).toFixed(2)}%`,
      className: isUp ? 'text-green' : 'text-red',
    },
    { label: 'Volume', value: formatNumber(props.volume_today) },
    { label: 'Deals', value: formatNumber(props.deals_today) },
    { label: 'VWAP', value: props.vwap ? Number(props.vwap).toFixed(2) : '—' },
    { label: 'Turnover', value: formatKES(props.turnover_today) },
  ]
  return (
    <div className="flex items-center gap-6 px-4 py-1.5 border-b border-border bg-surface overflow-x-auto flex-shrink-0 scrollbar-hide">
      {stats.map(s => (
        <div key={s.label} className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-muted">{s.label}</span>
          <span className={`text-[13px] font-semibold tabular-nums ${s.className ?? 'text-text'}`}>{s.value}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add components/market/DrugStats.tsx
git commit -m "feat: TV-style stats bar — inline label+value pairs, compact"
```

---

### Task 8: Mobile order book — tabbed view

**Files:**
- Modify: `app/(public)/drug/[slug]/OrderBookClient.tsx`

- [ ] **Step 1: Add mobile tab state and render tabs**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrderBook, type Ask, type Bid } from '@/components/market/OrderBook'
import { TradeHistory } from '@/components/market/TradeHistory'
import { BuyModal } from './BuyModal'
import { BidModal } from './BidModal'

interface Trade { id: string; qty: number; price_per_unit: number; executed_at: string }
interface Props {
  drugId: string; drugName: string; initialAsks: Ask[]; initialBids: Bid[]
  initialTrades: Trade[]; isAuthenticated: boolean; prevPrice: number | null
}

export function OrderBookClient({ drugId, drugName, initialAsks, initialBids, initialTrades, isAuthenticated, prevPrice }: Props) {
  const [asks, setAsks] = useState<Ask[]>(initialAsks)
  const [bids, setBids] = useState<Bid[]>(initialBids)
  const [trades, setTrades] = useState<Trade[]>(initialTrades)
  const [buyAsk, setBuyAsk] = useState<Ask | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [mobileTab, setMobileTab] = useState<'book' | 'trades'>('book')

  useEffect(() => {
    const supabase = createClient()
    const listingsChannel = supabase.channel(`listings:${drugId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings', filter: `drug_id=eq.${drugId}` },
        async () => {
          const { data } = await supabase.from('listings')
            .select('id, seller_id, brand_name, origin_country, qty_remaining, price_per_unit, min_order_qty')
            .eq('drug_id', drugId).eq('status', 'active').order('price_per_unit', { ascending: true })
          if (data) setAsks(data)
        }).subscribe()
    const bidsChannel = supabase.channel(`bids:${drugId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids', filter: `drug_id=eq.${drugId}` },
        async () => {
          const { data } = await supabase.from('bids')
            .select('id, qty, price_per_unit, created_at')
            .eq('drug_id', drugId).eq('status', 'open').order('price_per_unit', { ascending: false })
          if (data) setBids(data)
        }).subscribe()
    const tradesChannel = supabase.channel(`trades:${drugId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trades', filter: `drug_id=eq.${drugId}` },
        (payload) => { setTrades(prev => [payload.new as Trade, ...prev].slice(0, 50)) }).subscribe()
    return () => {
      supabase.removeChannel(listingsChannel)
      supabase.removeChannel(bidsChannel)
      supabase.removeChannel(tradesChannel)
    }
  }, [drugId])

  return (
    <>
      {/* Mobile tabs */}
      <div className="md:hidden flex border-b border-border">
        {(['book', 'trades'] as const).map(tab => (
          <button key={tab} onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2 text-[12px] font-semibold transition-colors ${mobileTab === tab ? 'text-blue border-b-2 border-blue' : 'text-muted'}`}>
            {tab === 'book' ? 'Order Book' : 'Trades'}
          </button>
        ))}
      </div>

      {/* Desktop: side-by-side order book + trades stacked */}
      <div className="hidden md:flex flex-1 flex-col md:overflow-hidden">
        <div className="flex-1 md:overflow-auto">
          <OrderBook asks={asks} bids={bids} isAuthenticated={isAuthenticated}
            onBuyClick={setBuyAsk} onBidClick={() => setShowBidModal(true)} />
        </div>
        <TradeHistory trades={trades} prevPrice={prevPrice} />
      </div>

      {/* Mobile: tabbed */}
      <div className="md:hidden flex-1 overflow-auto">
        {mobileTab === 'book' ? (
          <OrderBook asks={asks} bids={bids} isAuthenticated={isAuthenticated}
            onBuyClick={setBuyAsk} onBidClick={() => setShowBidModal(true)} />
        ) : (
          <TradeHistory trades={trades} prevPrice={prevPrice} />
        )}
      </div>

      {buyAsk && <BuyModal ask={buyAsk} drugId={drugId} drugName={drugName} onClose={() => setBuyAsk(null)} />}
      {showBidModal && <BidModal drugId={drugId} drugName={drugName} onClose={() => setShowBidModal(false)} />}
    </>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add app/\(public\)/drug/\[slug\]/OrderBookClient.tsx
git commit -m "feat: mobile tab switcher for order book vs trades"
```

---

### Task 9: Remove card borders globally, fix DrugStats text-white

**Files:**
- Modify: `components/market/DrugStats.tsx` (already done in Task 7)
- Modify: `app/(app)/admin/page.tsx`
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `app/(app)/seller/dashboard/page.tsx`

- [ ] **Step 1: Fix admin stat card text**

In `app/(app)/admin/page.tsx`, find stat card value text and replace `text-white` with `text-text`:
```tsx
<div className={`text-xl font-bold tabular-nums ${card.alert ? 'text-red' : 'text-text'}`}>{card.value}</div>
```

- [ ] **Step 2: Commit**
```bash
git add app/\(app\)/admin/page.tsx
git commit -m "fix: stat card text uses text-text not text-white"
```

---

### Task 10: Final — push all

- [ ] **Step 1: Push**
```bash
git push origin main
```
