# NFC Dash — TODO

## Phase 1: Schema + Seed Baseline
- [x] Install `maplibre-gl` package
- [x] Run Supabase migration for new normalized schema (`facility_types`, `sites`, `facilities`, `owners`, `facility_ownerships`, `document_files`, `document_facilities`, `mine_locations`)
- [x] Load synthetic seed data into Supabase
- [X] Enable RLS + public read policies for all read-only app tables
- [X] Verify row counts after seeding (sanity check for each table)
- [X] Add `NEXT_PUBLIC_MAPTILER_KEY` to `.env.local`

## Phase 2: App Data Contract (must do before UI work)
- [x] Replace legacy `src/lib/types.ts` model with schema-aligned types (remove old `documents`, `demographics`, `production_data` contract)
- [x] Add joined query types for facility cards (facility + site + type)
- [x] Fix `src/app/page.tsx` query (`locations` table no longer exists)
- [x] Add a shared data-access layer for joins (e.g., `src/lib/queries/facilities.ts`)

## Phase 3: Facilities UI
- [x] Rewrite `src/app/page.tsx` dashboard summary cards (count by `facility_type` / `facility_status`)
- [x] Build `src/app/facilities/page.tsx` server-side list from joined facility/site/type data
- [x] Create `src/components/facilities/FacilityTable.tsx` (sortable/filterable)
- [x] Create `src/components/facilities/TypeBadge.tsx` (color-coded by category)
- [x] Create `src/app/facilities/[id]/page.tsx` detail page (core fields + ownership history + related documents)
- [x] Temporary route placeholder exists for `src/app/facilities/page.tsx`

## Phase 4: Map UI
- [x] Create `src/components/map/FacilityMap.tsx` (`'use client'`, MapLibre GL JS)
- [x] Use `sites.latitude/longitude` for markers; cluster where appropriate
- [x] Create `src/app/map/page.tsx` with dynamic import (`ssr: false`)
- [x] Add MapLibre CSS import in `src/app/globals.css`
- [x] Temporary route placeholder exists for `src/app/map/page.tsx`

## Phase 5: Documents
- [ ] Create Supabase Storage bucket and RLS policies for document access
- [ ] Implement `DocumentList` against `document_files` + `document_facilities`
- [ ] Integrate document list into facility detail page
- [ ] Add per-document route/page (metadata + download)

## Phase 6: Ownership + Mine Data
- [x] Add ownership timeline/table UI from `facility_ownerships`
- [ ] Add owner profile pages or drawer view from `owners`
- [ ] Decide whether `mine_locations` appears as a separate map layer or merged with facilities

## Data Quality
- [ ] Status audit: many facilities currently labeled `proposed` may actually be `terminated` — needs manual review before real data load. Relevant status groupings: Operating=`active`, Shutdown=`shutdown|decommissioned|decommissioning`, Planned=`under_construction|licensing`, Cancelled=`cancelled|terminated`
- [ ] Mill sites and units; all the units are individual sites but many are part of larger operating sites (wheel+spoke operations for example).
- [ ] Site boundary shapefiles: convert per-site shapefiles to GeoJSON (via `ogr2ogr` or QGIS), upload to Supabase Storage under a `site-boundaries` bucket, add `boundary_path` text column to `sites` table referencing storage path, fetch lazily on marker click in `SiteMap.tsx`
- [ ] Operator classification: identify private industry vs. government (national labs, defense/testing) operation per facility/site. No systematic approach yet — flag as schema + data quality work when methodology is established
- [ ] Consider rewiring reactor data entirely. There are better + higher fidelity databases than what I have currently. Maybe tap into the TAMU nuclear power plant dashboard 

## Schema TODO
- [ ] Add `boundary_path text` column to `sites` table (references Supabase Storage path for GeoJSON site boundary)
- [ ] Add operator classification field(s) to `facilities` or `sites` (e.g. `operator_sector` enum: `private`, `government`, `defense`) — hold until data approach is settled


## Notes
- Old TODO items for `documents`, `demographics`, and `production_data` were based on an earlier schema and are now superseded.
- Source of truth for schema: `nfc_dash/supabase/migrations/001_initial_schema.sql`
- Source of truth for synthetic data: `nfc_dash/supabase/seeds/synthetic_seed.sql`
