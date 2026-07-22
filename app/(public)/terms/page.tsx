import Link from 'next/link'
import { PublicNav } from '@/components/layout/PublicNav'

export default function TermsPage() {
  return (
    <div>
      <PublicNav />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-black text-text mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted mb-8">Dawahub PISS Exchange · Last updated 2026</p>

        <div className="space-y-6 text-sm text-text leading-relaxed">
          <section>
            <h2 className="font-bold mb-2">1. Patented Solution</h2>
            <p>
              Dawahub PISS Exchange is a patented solution for the healthcare industry, designed to
              reduce the cost of pharmaceutical products to end users and ensure the authenticity of
              products traded on the platform. By registering, you acknowledge the platform&apos;s
              underlying architecture and business method are subject to patent protection.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2">2. Eligibility</h2>
            <p>
              Access is restricted to licensed pharmaceutical manufacturers, importers, distributors,
              pharmacies and healthcare facilities regulated by PPB Kenya. Accounts are reviewed and
              verified before trading access is granted.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2">3. Counterparty Anonymity</h2>
            <p>
              To protect the integrity of the marketplace, buyer and seller identities are not disclosed
              to one another during bidding. Settlement documentation identifies both parties by
              platform-assigned member codes rather than organisation names.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2">4. Trading &amp; Settlement</h2>
            <p>
              Trades are executed via the platform&apos;s order book. Payment is settled either through
              M-Pesa escrow or, where applicable, directly by Dawahub on the seller&apos;s behalf. Users
              agree not to circumvent the platform to transact directly with a counterparty discovered
              through the exchange.
            </p>
          </section>

          <section>
            <h2 className="font-bold mb-2">5. Confidentiality</h2>
            <p>
              Users agree to keep platform pricing, order book data and counterparty information
              confidential and not to share access credentials with unverified third parties.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/register" className="text-sm text-blue hover:underline">← Back to registration</Link>
        </div>
      </main>
    </div>
  )
}
