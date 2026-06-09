'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrderBook, type Ask, type Bid } from '@/components/market/OrderBook'
import { TradeHistory } from '@/components/market/TradeHistory'
import { BuyModal } from './BuyModal'
import { BidModal } from '@/components/market/BidModal'
import { AcceptBidModal } from '@/components/market/AcceptBidModal'

interface Trade { id: string; qty: number; price_per_unit: number; executed_at: string }
interface Props {
  drugId: string; drugName: string; initialAsks: Ask[]; initialBids: Bid[]
  initialTrades: Trade[]; prevPrice: number | null
}

export function OrderBookClient({ drugId, drugName, initialAsks, initialBids, initialTrades, prevPrice }: Props) {
  const [asks, setAsks] = useState<Ask[]>(initialAsks)
  const [bids, setBids] = useState<Bid[]>(initialBids)
  const [trades, setTrades] = useState<Trade[]>(initialTrades)
  const [buyAsk, setBuyAsk] = useState<Ask | null>(null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [acceptBid, setAcceptBid] = useState<Bid | null>(null)
  const [mobileTab, setMobileTab] = useState<'book' | 'trades'>('book')
  const [canBid, setCanBid] = useState(false)
  const [canAcceptBid, setCanAcceptBid] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Detect auth + role client-side — any verified account can bid; verified sellers (and admin) can accept bids
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) { setCanBid(false); setCanAcceptBid(false); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, verified')
        .eq('id', session.user.id)
        .maybeSingle()
      setCanBid(profile?.role === 'admin' || profile?.verified === true)
      setCanAcceptBid(profile?.role === 'admin' || (profile?.role === 'seller' && profile?.verified === true))
    })

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
            .eq('drug_id', drugId).eq('status', 'open')
            .gt('expires_at', new Date().toISOString())
            .order('price_per_unit', { ascending: false })
          if (data) setBids(data)
        }).subscribe()
    const tradesChannel = supabase.channel(`trades:${drugId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trades', filter: `drug_id=eq.${drugId}` },
        (payload) => { setTrades(prev => [payload.new as Trade, ...prev].slice(0, 50)) }).subscribe()

    return () => {
      subscription.unsubscribe()
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

      {/* Desktop: order book + trades stacked */}
      <div className="hidden md:flex flex-1 flex-col md:overflow-hidden">
        <div className="flex-1 md:overflow-auto">
          <OrderBook asks={asks} bids={bids} canBid={canBid} canAcceptBid={canAcceptBid}
            onBuyClick={setBuyAsk} onBidClick={() => setShowBidModal(true)} onAcceptBid={setAcceptBid} />
        </div>
        <TradeHistory trades={trades} prevPrice={prevPrice} />
      </div>

      {/* Mobile: tabbed */}
      <div className="md:hidden flex-1 overflow-auto">
        {mobileTab === 'book' ? (
          <OrderBook asks={asks} bids={bids} canBid={canBid} canAcceptBid={canAcceptBid}
            onBuyClick={setBuyAsk} onBidClick={() => setShowBidModal(true)} onAcceptBid={setAcceptBid} />
        ) : (
          <TradeHistory trades={trades} prevPrice={prevPrice} />
        )}
      </div>

      {buyAsk && <BuyModal ask={buyAsk} drugName={drugName} onClose={() => setBuyAsk(null)} />}
      {showBidModal && <BidModal drugId={drugId} drugName={drugName} onClose={() => setShowBidModal(false)} />}
      {acceptBid && (
        <AcceptBidModal bidId={acceptBid.id} drugName={drugName} qty={acceptBid.qty}
          pricePerUnit={Number(acceptBid.price_per_unit)} onClose={() => setAcceptBid(null)} />
      )}
    </>
  )
}
