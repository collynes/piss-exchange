-- Bid acceptance by sellers + Dawahub-settled (off-platform credit) orders.
--
-- Lets a verified seller accept an open bid directly (creating an order without
-- the buyer needing to act first), and lets Dawahub settle that order's payment
-- out-of-band (e.g. bulk annual procurement deals) instead of routing through
-- the buyer's M-Pesa escrow.

-- ── ORDERS: settlement_method ──────────────────────────────────────────────
-- 'mpesa'          → buyer pays via M-Pesa STK push, held in escrow (existing flow)
-- 'dawahub_credit' → Dawahub pays the seller directly and settles with the buyer off-platform
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS settlement_method text NOT NULL DEFAULT 'mpesa'
    CHECK (settlement_method IN ('mpesa', 'dawahub_credit'));

CREATE INDEX IF NOT EXISTS orders_settlement_method_idx ON orders(settlement_method);

-- ── BIDS: track who accepted and when ──────────────────────────────────────
ALTER TABLE bids
  ADD COLUMN IF NOT EXISTS accepted_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

-- ── PAYMENTS: allow recording Dawahub-settled payments ─────────────────────
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'dawahub_credit';
