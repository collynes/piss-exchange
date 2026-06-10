'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SELLER_SEEN_KEY = 'piss_bids_seen_at'
const BUYER_SEEN_KEY = 'piss_accepted_seen_at'

interface NotificationBellProps {
  /** Buyers are notified when their bids are accepted; sellers/admins when new bids arrive. */
  mode: 'buyer' | 'seller'
}

// Bell with an unread count, bumped live via postgres_changes.
// - seller mode: open bids placed by others since the user last opened /seller/bids
// - buyer mode: own bids accepted since the user last opened /bids
export function NotificationBell({ mode }: NotificationBellProps) {
  const [count, setCount] = useState(0)
  const userIdRef = useRef<string | null>(null)

  const seenKey = mode === 'buyer' ? BUYER_SEEN_KEY : SELLER_SEEN_KEY
  const href = mode === 'buyer' ? '/bids' : '/seller/bids'

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      userIdRef.current = user.id
      const seenAt = localStorage.getItem(seenKey) ?? new Date(0).toISOString()

      if (mode === 'buyer') {
        const { count } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)
          .eq('status', 'accepted')
          .gt('accepted_at', seenAt)
        setCount(count ?? 0)
      } else {
        const { count } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open')
          .gt('expires_at', new Date().toISOString())
          .gt('created_at', seenAt)
          .neq('buyer_id', user.id)
        setCount(count ?? 0)
      }
    }
    load()

    const channel = supabase.channel(`bid-notifications-${mode}`)
    if (mode === 'buyer') {
      channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bids' },
        payload => {
          const bid = payload.new as { buyer_id: string; status: string }
          const old = payload.old as { status?: string }
          if (bid.buyer_id === userIdRef.current && bid.status === 'accepted' && old.status !== 'accepted') {
            setCount(c => c + 1)
          }
        })
    } else {
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' },
        payload => {
          const bid = payload.new as { buyer_id: string }
          if (bid.buyer_id !== userIdRef.current) setCount(c => c + 1)
        })
    }
    channel.subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [mode, seenKey])

  const markSeen = () => {
    localStorage.setItem(seenKey, new Date().toISOString())
    setCount(0)
  }

  return (
    <Link href={href} onClick={markSeen}
      className="nav-link position-relative px-2 d-inline-flex align-items-center"
      aria-label={count > 0
        ? `${count} ${mode === 'buyer' ? 'accepted bids' : 'new bids'}`
        : (mode === 'buyer' ? 'My bids' : 'Open bids')}>
      <i className="bx bx-bell bx-md" />
      {count > 0 && (
        <span className="badge rounded-pill bg-danger position-absolute"
          style={{ top: 0, right: 0, fontSize: '0.62rem', transform: 'translate(25%, -25%)' }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
