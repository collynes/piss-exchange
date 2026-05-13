import { AdminSidebar } from '@/components/admin/AdminSidebar'

// Use fixed positioning to overlay the (app) layout's AppSidebar
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 flex z-20 bg-bg" style={{ top: '68px' }}>
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}
