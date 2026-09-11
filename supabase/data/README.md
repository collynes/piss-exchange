# Data imports

One-off bulk data files, separate from schema migrations in `supabase/migrations/`.
These are not run automatically by `supabase db push` — apply them manually,
once, when needed.

## 2026-09-11_keml_2023_generics.sql

Bulk import of **533 generic drugs** into the `drugs` catalogue table, sourced
from the **Kenya Essential Medicines List (KEML) 2023**. Provided by Abdinasir
via `Final Dawahub_Generic_Drug_Catalogue_Template_KEML.xlsx` (WhatsApp,
2026-09-01), built against the blank template in this same directory,
[Dawahub_Generic_Drug_Catalogue_Template.xlsx](./Dawahub_Generic_Drug_Catalogue_Template.xlsx)
(the matching listing-import template,
[Dawahub_Listing_Import_Template.xlsx](./Dawahub_Listing_Import_Template.xlsx),
is also here — that one is for sellers uploading their own brand/price/stock
rows via `/seller/listings` → Import from Excel, not for this SQL file).

**What it does:** inserts `generic_name`, `slug`, `dosage_form`, `strength`,
`category`, and `atc_code` (where known) for each drug. It does **not** create
any listings, prices, or stock — sellers list their own brands against these
generics afterwards via the normal "List a Drug" flow or the bulk listing
importer (`/seller/listings` → Import from Excel).

**Strength placeholder:** KEML lists many items by dosage form only (e.g.
"Fentanyl — Injection", no fixed strength). Those rows use `'N/A'` as the
strength value rather than being dropped, so nothing from the source list is
silently lost.

**Idempotent:** every `INSERT` ends in `ON CONFLICT (slug) DO NOTHING`. Safe
to run more than once — already-present generics are skipped, not duplicated
or overwritten.

**Row count note:** the source spreadsheet has 549 rows; 16 were exact
duplicates within the file itself (same generic name, strength, and dosage
form producing an identical slug) and are intentionally omitted here rather
than inserted under a mangled slug — see the skip list in the generation
script's output if you need the specifics.

### How to apply

**Local dev** (Supabase running via `npx supabase start`):

```bash
docker exec -i supabase_db_piss-exchange psql -U postgres -d postgres \
  -f - < supabase/data/2026-09-11_keml_2023_generics.sql
```

**Production** (Supabase Studio → SQL Editor): paste the file's contents and
run. There are no destructive statements in it — it's a plain multi-row
`INSERT ... ON CONFLICT DO NOTHING`, safe to review and run directly.

**Status:** this exact dataset was already applied to production directly on
2026-09-11 (543 of 549 rows, including a few within-file duplicates inserted
under de-duplicated slugs during that run). This SQL file is the clean,
reusable version of the same import — for other environments (a fresh local
DB, staging, a future re-deploy) that don't have it yet. Running it against
the production database again is safe and will insert 0 new rows, since
everything in it already exists there.
