# NFC Dash — TODO

## Phase 1: Foundation *(do first)*
- [ ] Install `maplibre-gl` package
- [ ] Run SQL migrations in Supabase (4 tables: `facilities`, `documents`, `demographics`, `production_data`)
- [ ] Create Supabase Storage bucket `documents` with public-read RLS
- [ ] Add `NEXT_PUBLIC_MAPTILER_KEY` to `.env.local`
- [ ] Create `src/lib/types.ts` — shared TS types (`Facility`, `Document`, `Demographics`, `ProductionData`)
- [ ] Update `src/lib/supabase.ts` — typed client
- [ ] Update `src/app/layout.tsx` — fix metadata, add `<Navbar />`
- [ ] Create `src/components/nav/Navbar.tsx` — links: Home · Map · Facilities · Stats

## Phase 2: Facilities *(parallel with Phase 3)*
- [ ] Rewrite `src/app/page.tsx` — dashboard summary cards (count by category, active vs. decommissioned)
- [ ] Create `src/app/facilities/page.tsx` — filterable/searchable server-side list
- [ ] Create `src/components/facilities/FacilityTable.tsx` — sortable table rows
- [ ] Create `src/components/facilities/CategoryBadge.tsx` — color-coded category pill
- [ ] Create `src/app/facilities/[slug]/page.tsx` — detail: full fields + document list + mini map

## Phase 3: Map *(parallel with Phase 2)*
- [ ] Create `src/components/map/FacilityMap.tsx` — `'use client'`, MapLibre GL JS, markers colored by category, click → popup with name/category/link to detail
- [ ] Create `src/app/map/page.tsx` — full-screen map via `dynamic(() => ..., { ssr: false })`
- [ ] Add MapLibre CSS import to `src/app/globals.css`

## Phase 4: Documents *(depends on Phase 2)*
- [ ] Create `src/components/docs/DocumentList.tsx` — list docs, Supabase Storage signed URL downloads
- [ ] Integrate `DocumentList` into `src/app/facilities/[slug]/page.tsx`
- [ ] Scaffold `src/app/facilities/[slug]/docs/[docId]/page.tsx` — metadata + download button

## Phase 5: Stats *(deferred UI)*
- [ ] Create `src/app/stats/page.tsx` — "Coming soon" placeholder
- [ ] DB tables `demographics` and `production_data` created in Phase 1 migration — UI to follow later

---

## Database Schema (run in Supabase SQL editor)

### `facilities`
```sql
create table facilities (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text unique not null,
  category            text not null check (category in (
                        'mining_milling','conversion','enrichment',
                        'fuel_fabrication','power_reactor','reprocessing','waste_storage'
                      )),
  operator            text,
  country             text,
  region              text,
  latitude            numeric(10,6),
  longitude           numeric(10,6),
  status              text default 'active' check (status in (
                        'active','decommissioned','planned','under_construction'
                      )),
  description         text,
  capacity            text,
  commissioned_year   int,
  decommissioned_year int,
  created_at          timestamptz default now()
);
alter table facilities enable row level security;
create policy "public read" on facilities for select using (true);
```

### `documents`
```sql
create table documents (
  id          uuid primary key default gen_random_uuid(),
  facility_id uuid references facilities(id) on delete cascade,
  title       text not null,
  description text,
  file_path   text not null,
  file_type   text,
  file_size   bigint,
  tags        text[],
  uploaded_at timestamptz default now()
);
alter table documents enable row level security;
create policy "public read" on documents for select using (true);
```

### `demographics` *(scaffolded — no UI yet)*
```sql
create table demographics (
  id          uuid primary key default gen_random_uuid(),
  facility_id uuid references facilities(id) on delete cascade,
  radius_km   numeric,
  population  bigint,
  source      text,
  year        int
);
alter table demographics enable row level security;
create policy "public read" on demographics for select using (true);
```

### `production_data` *(scaffolded — no UI yet)*
```sql
create table production_data (
  id          uuid primary key default gen_random_uuid(),
  facility_id uuid references facilities(id) on delete cascade,
  year        int,
  metric_name text,
  value       numeric,
  unit        text,
  source      text
);
alter table production_data enable row level security;
create policy "public read" on production_data for select using (true);
```
