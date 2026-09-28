-- Investor: an admin-grantable flag on top of an existing account, not a
-- separate role. A seller or buyer can also be an investor (e.g. First
-- Dawahub Ltd), so this is a boolean, not a fourth user_role value.
--
-- Investors don't get any new market-visibility rules — every verified
-- account already sees the market board and can place bids today, and that
-- stays unchanged. This column exists so admins can identify and present
-- specific accounts as investors (for the bulk-funding pitch to
-- distributors), and as a hook for investor-specific features later.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_investor boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_investor_idx ON profiles(is_investor) WHERE is_investor = true;

-- Re-tighten the self-service policies to also block self-granting investor
-- status, the same way role and verified are already locked down.
DROP POLICY IF EXISTS "profiles_own_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON profiles;

CREATE POLICY "profiles_own_insert" ON profiles
  FOR INSERT
  WITH CHECK (
    id = auth.uid()
    AND role IN ('buyer', 'seller')
    AND verified = false
    AND is_investor = false
  );

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND verified = (SELECT verified FROM profiles WHERE id = auth.uid())
    AND is_investor = (SELECT is_investor FROM profiles WHERE id = auth.uid())
  );
