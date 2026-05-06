import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en" className={inter.className}>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
