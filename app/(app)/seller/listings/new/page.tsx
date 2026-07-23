import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewListingForm } from './NewListingForm'

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/seller/listings/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verified')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = profile?.role === 'admin'
  const isSeller = profile?.role === 'seller'

  if (!isAdmin && !isSeller) {
    return (
      <div className="max-w-xl">
        <div className="rounded-2xl bg-surface p-6 text-center"
          style={{ boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' }}>
          <h5 className="mb-2">Sellers only</h5>
          <p className="text-muted mb-0">Listing stock is available to verified seller accounts.</p>
        </div>
      </div>
    )
  }

  if (!isAdmin && !profile?.verified) {
    return (
      <div className="max-w-xl">
        <div className="rounded-2xl bg-surface p-6 text-center"
          style={{ boxShadow: '0 4px 18px 0 rgba(47,43,61,.1), 0 0 0 1px rgba(47,43,61,.05)' }}>
          <h5 className="mb-2">Account pending verification</h5>
          <p className="text-muted mb-0">Listing stock unlocks once your seller account is verified.</p>
        </div>
      </div>
    )
  }

  return <NewListingForm />
}
