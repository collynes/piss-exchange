import type { Metadata } from 'next'
import Script from 'next/script'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'PISS Exchange — Kenya Pharma Trading',
  description: 'Real-time pharmaceutical trading exchange for Kenya',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="layout-menu-fixed layout-compact"
      data-assets-path="/sneat/assets/"
      data-template="vertical-menu-template-free"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/sneat/assets/img/favicon/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/sneat/assets/vendor/fonts/iconify-icons.css" />
        <link rel="stylesheet" href="/sneat/assets/vendor/css/core.css" />
        <link rel="stylesheet" href="/sneat/assets/css/demo.css" />
        <link rel="stylesheet" href="/sneat/assets/vendor/css/pages/page-auth.css" />
        <link rel="stylesheet" href="/sneat/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />
        <Script src="/sneat/assets/vendor/js/helpers.js" strategy="beforeInteractive" />
        <Script src="/sneat/assets/vendor/js/menu.js" strategy="beforeInteractive" />
        <Script src="/sneat/assets/js/config.js" strategy="beforeInteractive" />
      </head>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Script src="/sneat/assets/vendor/libs/jquery/jquery.js" strategy="afterInteractive" />
        <Script src="/sneat/assets/vendor/libs/popper/popper.js" strategy="afterInteractive" />
        <Script src="/sneat/assets/vendor/js/bootstrap.js" strategy="afterInteractive" />
        <Script src="/sneat/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js" strategy="afterInteractive" />
        <Script src="/sneat/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
