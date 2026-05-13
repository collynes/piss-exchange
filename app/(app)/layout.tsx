import { Ticker } from '@/components/layout/Ticker'
import { Nav } from '@/components/layout/Nav'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role ?? null
  }

  return (
    <>
      <Ticker />
      <Nav />
      <div className="flex" style={{ height: 'calc(100vh - 68px)' }}>
        <AppSidebar role={role} />
        <main className="flex-1 overflow-auto bg-bg">
          <div className="px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
