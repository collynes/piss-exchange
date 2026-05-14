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
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        <AppSidebar role={role} />
        <div className="layout-page">
          <Nav />
          <div className="content-wrapper">
            <main className="container-xxl flex-grow-1 container-p-y">
              {children}
            </main>
            <div className="content-backdrop fade" />
          </div>
        </div>
      </div>
      <div className="layout-overlay layout-menu-toggle" />
    </div>
  )
}
