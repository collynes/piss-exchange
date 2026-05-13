import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // Break out of the parent (app) layout padding
    <div className="-mx-4 md:-mx-6 -my-6 md:-my-8 flex" style={{ height: 'calc(100vh - 68px)' }}>
      <AdminSidebar />
      <div className="flex-1 overflow-auto bg-bg">
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}
