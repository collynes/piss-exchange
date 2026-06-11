import Link from 'next/link'
import Image from 'next/image'

export function SneatLogo({ href = '/dashboard' }: { href?: string }) {
  return (
    <Link href={href} className="app-brand-link">
      <span className="app-brand-logo">
        {/* Source art is a white circle on a square — clip to a circle */}
        <Image src="/dawahub-logo.jpeg" alt="Dawahub" width={32} height={32}
          className="rounded-circle" priority />
      </span>
      <span className="app-brand-text menu-text fw-bold ms-2">PISS.Exchange</span>
    </Link>
  )
}
