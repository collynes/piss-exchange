import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Session replay — records sessions when errors occur
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,

  integrations: [
    Sentry.replayIntegration({
      maskAllText:   true,
      blockAllMedia: false,
    }),
  ],

  // Don't send errors in dev unless DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})
