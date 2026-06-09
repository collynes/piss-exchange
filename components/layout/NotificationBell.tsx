'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SEEN_KEY = 'piss_bids_seen_at'

// Bell for sellers/admins: counts open bids placed since the user last
// opened /seller/bids (tracked in localStorage), bumped live on new bids.
export function NotificationBell() {
  const [count, setCount] = useState(0)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      userIdRef.current = user.id
      const seenAt = localStorage.getItem(SEEN_KEY) ?? new Date(0).toISOString()
      const { count } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .gt('expires_at', new Date().toISOString())
        .gt('created_at', seenAt)
        .neq('buyer_id', user.id)
      setCount(count ?? 0)
    }
    load()

    const channel = supabase.channel('bid-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' },
        payload => {
          const bid = payload.new as { buyer_id: string }
          if (bid.buyer_id !== userIdRef.current) setCount(c => c + 1)
        })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const markSeen = () => {
    localStorage.setItem(SEEN_KEY, new Date().toISOString())
    setCount(0)
  }

  return (
    <Link href="/seller/bids" onClick={markSeen}
      className="nav-link position-relative px-2 d-inline-flex align-items-center"
      aria-label={count > 0 ? `${count} new bids` : 'Open bids'}>
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
