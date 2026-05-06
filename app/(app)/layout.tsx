import { Ticker } from '@/components/layout/Ticker'
import { Nav } from '@/components/layout/Nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <Nav />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">{children}</main>
    </>
  )
}
