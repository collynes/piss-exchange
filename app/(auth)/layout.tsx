export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(41,98,255,0.08) 0%, transparent 60%)' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-9 h-9 bg-blue rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue/20">
            DH
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            PISS<span className="text-blue">.</span>Exchange
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
