'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    if (ph) ph.capture('$pageview', { $current_url: url })

    // Mirror into app_event_logs so the in-app admin dashboard can show
    // popular/least-visited pages without needing the PostHog console.
    const body = JSON.stringify({ event: 'page_viewed', path: pathname })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/beacon', new Blob([body], { type: 'application/json' }))
    } else {
      fetch('/api/analytics/beacon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
    }
  }, [pathname, searchParams, ph])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

  useEffect(() => {
    if (!key) return
    posthog.init(key, {
      api_host:               host,
      ui_host:                'https://us.posthog.com',
      capture_pageview:       false,   // we do it manually above
      capture_pageleave:      true,
      session_recording: {
        maskAllInputs:        true,    // privacy: mask all text inputs by default
        maskInputOptions:     { password: true },
      },
      autocapture:            true,
      persistence:            'localStorage',
    })
  }, [key, host])

  if (!key) return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  )

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  )
}
