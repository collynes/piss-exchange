import { SneatLogo } from '@/components/layout/SneatLogo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="authentication-wrapper authentication-basic container-p-y">
      <div className="authentication-inner">
        <div className="app-brand justify-content-center mb-6">
          <SneatLogo href="/" />
        </div>
        {children}
      </div>
    </div>
  )
}
