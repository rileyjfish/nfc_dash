-- Public read policies for app-facing tables.
-- Apply after 001_initial_schema.sql.

alter table facility_types enable row level security;
alter table sites enable row level security;
alter table facilities enable row level security;
alter table owners enable row level security;
alter table facility_ownerships enable row level security;
alter table document_files enable row level security;
alter table document_facilities enable row level security;
alter table mine_locations enable row level security;

drop policy if exists "public read" on facility_types;
create policy "public read" on facility_types
for select
using (true);

drop policy if exists "public read" on sites;
create policy "public read" on sites
for select
using (true);

drop policy if exists "public read" on facilities;
create policy "public read" on facilities
for select
using (true);

drop policy if exists "public read" on owners;
create policy "public read" on owners
for select
using (true);

drop policy if exists "public read" on facility_ownerships;
create policy "public read" on facility_ownerships
for select
using (true);

drop policy if exists "public read" on document_files;
create policy "public read" on document_files
for select
using (true);

drop policy if exists "public read" on document_facilities;
create policy "public read" on document_facilities
for select
using (true);

drop policy if exists "public read" on mine_locations;
create policy "public read" on mine_locations
for select
using (true);
