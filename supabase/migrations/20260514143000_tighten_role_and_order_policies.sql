-- Tighten policies around identity, role escalation, and order state changes.

DROP POLICY IF EXISTS "profiles_own" ON profiles;
DROP POLICY IF EXISTS "listings_seller_insert" ON listings;
DROP POLICY IF EXISTS "listings_seller_update" ON listings;
DROP POLICY IF EXISTS "orders_buyer_insert" ON orders;
DROP POLICY IF EXISTS "orders_buyer_update" ON orders;
DROP POLICY IF EXISTS "orders_seller_update" ON orders;
DROP POLICY IF EXISTS "bids_buyer_own" ON bids;

CREATE POLICY "profiles_own_select" ON profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_own_insert" ON profiles
  FOR INSERT
  WITH CHECK (
    id = auth.uid()
    AND role IN ('buyer', 'seller')
    AND verified = false
  );

CREATE POLICY "bids_buyer_select_own" ON bids
  FOR SELECT
  USING (buyer_id = auth.uid());

CREATE OR REPLACE FUNCTION reserve_order_stock(p_order_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_listing listings%ROWTYPE;
  v_next_qty integer;
BEGIN
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND OR v_order.listing_id IS NULL THEN
    RETURN 'Order listing not found';
  END IF;

  IF v_order.status <> 'pending' THEN
    RETURN 'Order is not payable';
  END IF;

  SELECT * INTO v_listing
  FROM listings
  WHERE id = v_order.listing_id
  FOR UPDATE;

  IF NOT FOUND OR v_listing.status <> 'active' THEN
    RETURN 'Listing is not available';
  END IF;

  IF v_listing.qty_remaining < v_order.qty THEN
    RETURN format('Only %s units available', v_listing.qty_remaining);
  END IF;

  v_next_qty := v_listing.qty_remaining - v_order.qty;

  UPDATE listings
  SET qty_remaining = v_next_qty,
      status = CASE WHEN v_next_qty = 0 THEN 'filled'::listing_status ELSE 'active'::listing_status END,
      updated_at = now()
  WHERE id = v_listing.id;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION release_order_stock(p_order_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND OR v_order.listing_id IS NULL THEN
    RETURN 'Order listing not found';
  END IF;

  UPDATE listings
  SET qty_remaining = qty_remaining + v_order.qty,
      status = 'active',
      updated_at = now()
  WHERE id = v_order.listing_id;

  RETURN NULL;
END;
$$;
