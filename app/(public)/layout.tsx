import { Ticker } from '@/components/layout/Ticker'
import { Nav } from '@/components/layout/Nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <Nav />
      <main>{children}</main>
    </>
  )
}
