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
    if (!ph) return
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    ph.capture('$pageview', { $current_url: url })
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

  if (!key) return <>{children}</>

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  )
}
