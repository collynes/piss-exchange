-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── COUNTRIES ──────────────────────────────────────────────────────────────
create table countries (
  id           uuid primary key default uuid_generate_v4(),
  code         text not null unique,
  name         text not null,
  currency     text not null,
  currency_sym text not null,
  regulator    text not null,
  created_at   timestamptz default now()
);

insert into countries (code, name, currency, currency_sym, regulator)
values ('KE', 'Kenya', 'KES', 'KES', 'PPB');

-- ── PROFILES ───────────────────────────────────────────────────────────────
create type user_role as enum ('buyer', 'seller', 'admin');

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         user_role not null default 'buyer',
  org_name     text not null,
  phone        text,
  license_no   text,
  doc_url      text,
  verified     boolean not null default false,
  country_id   uuid references countries(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── SETTINGS ───────────────────────────────────────────────────────────────
create table platform_settings (
  key          text primary key,
  value        text not null,
  updated_at   timestamptz default now()
);

insert into platform_settings (key, value) values
  ('require_doc_for_seller', 'false'),
  ('require_doc_for_buyer',  'false');

-- ── DRUGS ──────────────────────────────────────────────────────────────────
create table drugs (
  id           uuid primary key default uuid_generate_v4(),
  generic_name text not null,
  slug         text not null unique,
  atc_code     text,
  dosage_form  text not null,
  strength     text not null,
  category     text not null,
  country_id   uuid references countries(id),
  active       boolean not null default true,
  created_at   timestamptz default now()
);

insert into drugs (generic_name, slug, atc_code, dosage_form, strength, category) values
  ('Amoxicillin / Clavulanic Acid', 'amoxicillin-clavulanic-acid-625mg-tablet', 'J01CR02', 'Tablet', '625mg', 'Antibiotics'),
  ('Paracetamol', 'paracetamol-500mg-tablet', 'N02BE01', 'Tablet', '500mg', 'Pain Relief'),
  ('Metformin HCl', 'metformin-500mg-tablet', 'A10BA02', 'Tablet', '500mg', 'Diabetes'),
  ('Artemether / Lumefantrine', 'artemether-lumefantrine-80-480mg-tablet', 'P01BF01', 'Tablet', '80/480mg', 'Antimalarials'),
  ('Ciprofloxacin', 'ciprofloxacin-500mg-tablet', 'J01MA02', 'Tablet', '500mg', 'Antibiotics'),
  ('Omeprazole', 'omeprazole-20mg-capsule', 'A02BC01', 'Capsule', '20mg', 'GI Tract'),
  ('Atorvastatin', 'atorvastatin-20mg-tablet', 'C10AA05', 'Tablet', '20mg', 'Cardiovascular'),
  ('Salbutamol Sulphate', 'salbutamol-100mcg-inhaler', 'R03AC02', 'Inhaler', '100mcg/dose', 'Respiratory'),
  ('Doxycycline Hyclate', 'doxycycline-100mg-capsule', 'J01AA02', 'Capsule', '100mg', 'Antibiotics'),
  ('Amlodipine Besylate', 'amlodipine-5mg-tablet', 'C08CA01', 'Tablet', '5mg', 'Cardiovascular');

update drugs set country_id = (select id from countries where code = 'KE');

-- ── LISTINGS (ASKS) ────────────────────────────────────────────────────────
create type listing_status as enum ('active', 'filled', 'expired', 'cancelled');

create table listings (
  id              uuid primary key default uuid_generate_v4(),
  drug_id         uuid not null references drugs(id),
  seller_id       uuid not null references profiles(id),
  brand_name      text not null,
  manufacturer    text,
  origin_country  text not null,
  qty_available   integer not null check (qty_available > 0),
  qty_remaining   integer not null check (qty_remaining >= 0),
  price_per_unit  numeric(12,4) not null check (price_per_unit > 0),
  min_order_qty   integer not null default 1,
  batch_no        text,
  expiry_date     date,
  listing_expiry  date,
  status          listing_status not null default 'active',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index listings_drug_id_idx on listings(drug_id) where status = 'active';
create index listings_seller_id_idx on listings(seller_id);

-- ── BIDS ───────────────────────────────────────────────────────────────────
create type bid_status as enum ('open', 'accepted', 'expired', 'cancelled');

create table bids (
  id             uuid primary key default uuid_generate_v4(),
  drug_id        uuid not null references drugs(id),
  buyer_id       uuid not null references profiles(id),
  qty            integer not null check (qty > 0),
  price_per_unit numeric(12,4) not null check (price_per_unit > 0),
  expires_at     timestamptz not null,
  status         bid_status not null default 'open',
  created_at     timestamptz default now()
);

create index bids_drug_id_idx on bids(drug_id) where status = 'open';

-- ── ORDERS ─────────────────────────────────────────────────────────────────
create type order_status as enum ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'disputed');
create type escrow_status as enum ('holding', 'released', 'refunded');

create table orders (
  id              uuid primary key default uuid_generate_v4(),
  listing_id      uuid references listings(id),
  bid_id          uuid references bids(id),
  drug_id         uuid not null references drugs(id),
  buyer_id        uuid not null references profiles(id),
  seller_id       uuid not null references profiles(id),
  qty             integer not null check (qty > 0),
  price_per_unit  numeric(12,4) not null,
  total_amount    numeric(14,2) not null,
  status          order_status not null default 'pending',
  escrow_status   escrow_status not null default 'holding',
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index orders_buyer_id_idx on orders(buyer_id);
create index orders_seller_id_idx on orders(seller_id);

-- ── PAYMENTS ───────────────────────────────────────────────────────────────
create type payment_method as enum ('mpesa', 'bank_transfer');
create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');

create table payments (
  id                  uuid primary key default uuid_generate_v4(),
  order_id            uuid not null references orders(id),
  amount              numeric(14,2) not null,
  currency            text not null default 'KES',
  method              payment_method not null default 'mpesa',
  mpesa_checkout_id   text,
  mpesa_ref           text,
  status              payment_status not null default 'pending',
  escrow_released_at  timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── TRADES (immutable history) ─────────────────────────────────────────────
create table trades (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references orders(id),
  drug_id        uuid not null references drugs(id),
  buyer_id       uuid not null references profiles(id),
  seller_id      uuid not null references profiles(id),
  qty            integer not null,
  price_per_unit numeric(12,4) not null,
  total_amount   numeric(14,2) not null,
  executed_at    timestamptz not null default now()
);

create index trades_drug_id_idx on trades(drug_id);
create index trades_executed_at_idx on trades(executed_at);

-- ── MARKET DATA (cached, updated by trigger) ───────────────────────────────
create table market_data (
  drug_id        uuid primary key references drugs(id),
  last_price     numeric(12,4),
  prev_price     numeric(12,4),
  change_pct     numeric(8,4) default 0,
  volume_today   bigint default 0,
  vwap           numeric(12,4),
  deals_today    integer default 0,
  turnover_today numeric(16,2) default 0,
  updated_at     timestamptz default now()
);

insert into market_data (drug_id)
select id from drugs;

-- ── TRIGGER: update market_data on new trade ──────────────────────────────
create or replace function update_market_data()
returns trigger language plpgsql as $$
declare
  _prev_price numeric(12,4);
begin
  select last_price into _prev_price
  from market_data
  where drug_id = NEW.drug_id;

  update market_data
  set
    prev_price     = coalesce(_prev_price, NEW.price_per_unit),
    last_price     = NEW.price_per_unit,
    change_pct     = case
                       when _prev_price is null or _prev_price = 0 then 0
                       else round(((NEW.price_per_unit - _prev_price) / _prev_price) * 100, 4)
                     end,
    volume_today   = volume_today + NEW.qty,
    deals_today    = deals_today + 1,
    turnover_today = turnover_today + NEW.total_amount,
    vwap           = case
                       when (volume_today + NEW.qty) = 0 then NEW.price_per_unit
                       else round((turnover_today + NEW.total_amount) / (volume_today + NEW.qty), 4)
                     end,
    updated_at     = now()
  where drug_id = NEW.drug_id;

  return NEW;
end;
$$;

create trigger on_trade_inserted
after insert on trades
for each row execute function update_market_data();

-- ── RLS POLICIES ──────────────────────────────────────────────────────────

alter table countries         enable row level security;
alter table profiles          enable row level security;
alter table platform_settings enable row level security;
alter table drugs             enable row level security;
alter table listings          enable row level security;
alter table bids              enable row level security;
alter table orders            enable row level security;
alter table payments          enable row level security;
alter table trades            enable row level security;
alter table market_data       enable row level security;

-- Countries: public read
create policy "countries_public_read" on countries for select using (true);

-- Drugs: public read
create policy "drugs_public_read" on drugs for select using (true);
create policy "drugs_admin_all" on drugs for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Market data: public read
create policy "market_data_public_read" on market_data for select using (true);

-- Listings: public read active; sellers manage own
create policy "listings_public_read" on listings for select using (status = 'active');
create policy "listings_seller_insert" on listings for insert with check (
  seller_id = auth.uid() and
  exists (select 1 from profiles where id = auth.uid() and role in ('seller', 'admin') and verified = true)
);
create policy "listings_seller_update" on listings for update using (seller_id = auth.uid());
create policy "listings_admin_all" on listings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Bids: buyers see own; open bids public
create policy "bids_buyer_own" on bids for all using (buyer_id = auth.uid());
create policy "bids_public_read_open" on bids for select using (status = 'open');

-- Profiles: users see/edit own; admin sees all
create policy "profiles_own" on profiles for all using (id = auth.uid());
create policy "profiles_admin_all" on profiles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Orders: buyer and seller see their own
create policy "orders_buyer" on orders for select using (buyer_id = auth.uid());
create policy "orders_seller" on orders for select using (seller_id = auth.uid());
create policy "orders_buyer_insert" on orders for insert with check (buyer_id = auth.uid());
create policy "orders_buyer_update" on orders for update using (buyer_id = auth.uid());
create policy "orders_seller_update" on orders for update using (seller_id = auth.uid());
create policy "orders_admin_all" on orders for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Payments: buyer and seller see own
create policy "payments_buyer" on payments for select using (
  exists (select 1 from orders where id = order_id and buyer_id = auth.uid())
);
create policy "payments_seller" on payments for select using (
  exists (select 1 from orders where id = order_id and seller_id = auth.uid())
);
create policy "payments_admin_all" on payments for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Trades: public read
create policy "trades_public_read" on trades for select using (true);

-- Platform settings: admin only
create policy "settings_admin_all" on platform_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
