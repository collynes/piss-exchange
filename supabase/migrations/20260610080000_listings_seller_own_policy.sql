-- Sellers could only see their ACTIVE listings: the only select policies were
-- listings_public_read (status = 'active') and admin-all. Once a listing was
-- filled, expired or cancelled it vanished from My Listings entirely.
-- Let sellers always see their own listings regardless of status.
create policy listings_seller_own on listings
  for select using (seller_id = auth.uid());
