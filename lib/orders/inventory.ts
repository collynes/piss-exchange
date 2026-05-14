import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type AdminSupabase = SupabaseClient<Database>
type StockRpcClient = {
  rpc: (fn: 'reserve_order_stock' | 'release_order_stock', args: { p_order_id: string }) => Promise<{ data: string | null; error: { message: string } | null }>
}

function isMissingRpc(error: { message: string } | null) {
  return !!error?.message && /function .* does not exist|could not find/i.test(error.message)
}

async function reserveOrderStockFallback(adminSupabase: AdminSupabase, orderId: string) {
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select('id, listing_id, qty, status')
    .eq('id', orderId)
    .single()

  if (orderError || !order?.listing_id) {
    return { error: orderError?.message ?? 'Order listing not found' }
  }
  if (order.status !== 'pending') return { error: 'Order is not payable' }

  const { data: listing, error: listingError } = await adminSupabase
    .from('listings')
    .select('id, qty_remaining, status')
    .eq('id', order.listing_id)
    .single()

  if (listingError || !listing) return { error: listingError?.message ?? 'Listing not found' }
  if (listing.status !== 'active') return { error: 'Listing is not available' }
  if (listing.qty_remaining < order.qty) return { error: `Only ${listing.qty_remaining} units available` }

  const nextQty = listing.qty_remaining - order.qty
  const { data: updated, error: updateError } = await adminSupabase
    .from('listings')
    .update({
      qty_remaining: nextQty,
      status: nextQty === 0 ? 'filled' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', listing.id)
    .eq('qty_remaining', listing.qty_remaining) // optimistic lock
    .eq('status', 'active')
    .select('id')

  if (updateError) return { error: updateError.message }
  if (!updated?.length) return { error: 'Stock changed while processing. Please try again.' }
  return { error: null }
}

async function releaseOrderStockFallback(adminSupabase: AdminSupabase, orderId: string) {
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select('id, listing_id, qty')
    .eq('id', orderId)
    .single()

  if (orderError || !order?.listing_id) {
    return { error: orderError?.message ?? 'Order listing not found' }
  }

  const { data: listing, error: listingError } = await adminSupabase
    .from('listings')
    .select('id, qty_remaining')
    .eq('id', order.listing_id)
    .single()

  if (listingError || !listing) return { error: listingError?.message ?? 'Listing not found' }

  const newQty = listing.qty_remaining + order.qty
  const { error } = await adminSupabase
    .from('listings')
    .update({
      qty_remaining: newQty,
      status: newQty > 0 ? 'active' : 'filled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', listing.id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function reserveOrderStock(adminSupabase: AdminSupabase, orderId: string) {
  const { data, error } = await (adminSupabase as unknown as StockRpcClient).rpc('reserve_order_stock', { p_order_id: orderId })
  if (isMissingRpc(error)) return reserveOrderStockFallback(adminSupabase, orderId)
  if (error) return { error: error.message }
  return { error: data ?? null }
}

export async function releaseOrderStock(adminSupabase: AdminSupabase, orderId: string) {
  const { data, error } = await (adminSupabase as unknown as StockRpcClient).rpc('release_order_stock', { p_order_id: orderId })
  if (isMissingRpc(error)) return releaseOrderStockFallback(adminSupabase, orderId)
  if (error) return { error: error.message }
  return { error: data ?? null }
}
