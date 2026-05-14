import { Ticker } from '@/components/layout/Ticker'
import { PublicNav } from '@/components/layout/PublicNav'

export default function DrugLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <PublicNav />
      <main>{children}</main>
    </>
  )
}
