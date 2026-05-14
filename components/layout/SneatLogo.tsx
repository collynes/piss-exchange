import Link from 'next/link'

export function SneatLogo({ href = '/dashboard' }: { href?: string }) {
  return (
    <Link href={href} className="app-brand-link">
      <span className="app-brand-logo demo">
        <span className="text-primary">
          <svg width="25" viewBox="0 0 25 42" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="sneat-logo-a" d="M13.79.36 3.4 7.44C.57 9.69-.38 12.48.56 15.8c.13.43.54 1.99 2.56 3.43.7.49 2.2 1.15 4.53 1.99l-.05.03-4.96 3.3C.45 26.3.09 28.51 1.56 31.17c1.28 1.65 3.65 2.09 5.53 1.37 1.26-.48 4.37-2.54 9.33-6.16 1.61-1.88 2.28-3.93 1.99-6.14-.45-2.7-2.23-4.66-5.36-5.86l-2.13-.9 7.7-5.49L13.79.36Z" />
              <path id="sneat-logo-b" d="M5.47 6c-1.42 2.22-1.11 4.07.93 5.57 2.22 1 3.7 1.64 4.46 1.94l4.65.92 3.11-6.45C15.54 3.12 13.93.57 13.79.36 13.58.51 10.81 2.39 5.47 6Z" />
              <path id="sneat-logo-c" d="m7.5 21.23 4.82 2.09c1.85 1.44 2.08 3.17.69 5.19-1.39 2.01-2.7 3.28-3.93 3.79C5.78 33.43 4.13 34 4.13 34S2.75 33.05 0 31.16c-.56-3.34-.56-5.1 0-5.28.84-.27 2.78-3.05 3.3-3.35.36-.2 1.75-.63 4.2-1.3Z" />
              <path id="sneat-logo-d" d="m20.6 7.13 5 6.67a2 2 0 0 1-1.6 3.2H14a2 2 0 0 1-1.6-3.2l5-6.67a2 2 0 0 1 3.2 0Z" />
            </defs>
            <g fill="none" fillRule="evenodd">
              <g transform="translate(0 8)">
                <mask id="sneat-logo-mask" fill="#fff">
                  <use href="#sneat-logo-a" />
                </mask>
                <use fill="currentColor" href="#sneat-logo-a" />
                <g mask="url(#sneat-logo-mask)">
                  <use fill="currentColor" href="#sneat-logo-b" />
                  <use fill="#fff" fillOpacity=".2" href="#sneat-logo-b" />
                </g>
                <g mask="url(#sneat-logo-mask)">
                  <use fill="currentColor" href="#sneat-logo-c" />
                  <use fill="#fff" fillOpacity=".2" href="#sneat-logo-c" />
                </g>
              </g>
              <g transform="rotate(60 2.29 35.72)">
                <use fill="currentColor" href="#sneat-logo-d" />
                <use fill="#fff" fillOpacity=".2" href="#sneat-logo-d" />
              </g>
            </g>
          </svg>
        </span>
      </span>
      <span className="app-brand-text demo menu-text fw-bold ms-2">PISS.Exchange</span>
    </Link>
  )
}
