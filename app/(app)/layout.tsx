import { Ticker } from '@/components/layout/Ticker'
import { Nav } from '@/components/layout/Nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <Nav />
      <main className="min-h-[calc(100vh-68px)] relative">
        {/* Ambient radial glow — matches landing page feel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(41,98,255,0.06) 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, rgba(8,153,129,0.04) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </>
  )
}
