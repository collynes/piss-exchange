import { Ticker } from '@/components/layout/Ticker'
import { Nav } from '@/components/layout/Nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </>
  )
}
