export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-blue rounded flex items-center justify-center text-white font-black text-sm">
            DH
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            PISS<span className="text-blue">.</span>Exchange
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
