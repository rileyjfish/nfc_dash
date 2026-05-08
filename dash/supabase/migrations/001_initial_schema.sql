-- Enable UUID generation
create extension if not exists "pgcrypto";

--------------------------------------------------
-- Facility Types (controlled vocabulary)
--------------------------------------------------
create table facility_types (
  id text primary key,
  label text not null,
  category text not null
);

--------------------------------------------------
-- Sites (geographic locations)
--------------------------------------------------
create table sites (
  id uuid primary key default gen_random_uuid(),
  site_name text,
  latitude double precision not null,
  longitude double precision not null,
  parent_site_id uuid references sites(id),
  notes text,
  created_at timestamptz default now()
);

--------------------------------------------------
-- Facilities (core entities)
--------------------------------------------------
create table facilities (
  id uuid primary key default gen_random_uuid(),

  site_id uuid references sites(id) on delete cascade,

  facility_name text not null,
  facility_type text not null references facility_types(id),
  facility_status text,

  proposal_date date,
  start_operation date,
  end_operation date,

  capacity numeric,
  capacity_unit text,

  source text,
  notes text,
  created_at timestamptz default now()
);

--------------------------------------------------
-- Owners
--------------------------------------------------
create table owners (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null unique,
  owner_type text,
  notes text,
  created_at timestamptz default now()
);

--------------------------------------------------
-- Facility Ownership History
--------------------------------------------------
create table facility_ownerships (
  id uuid primary key default gen_random_uuid(),

  facility_id uuid not null references facilities(id) on delete cascade,
  owner_id uuid not null references owners(id) on delete restrict,

  stake numeric,
  stake_unit text default 'percent',

  stake_start date,
  stake_end date,

  source text,
  notes text,

  constraint valid_stake check (
    stake is null or (stake >= 0 and stake <= 100)
  ),

  constraint valid_ownership_dates check (
    stake_end is null or stake_start is null or stake_end >= stake_start
  )
);

--------------------------------------------------
-- Document Storage Metadata
--------------------------------------------------
create table document_files (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  filename text,
  created_at timestamptz default now(),

  unique (bucket, path)
);

--------------------------------------------------
-- Document ↔ Facility mapping (many-to-many)
--------------------------------------------------
create table document_facilities (
  document_id uuid references document_files(id) on delete cascade,
  facility_id uuid references facilities(id) on delete cascade,

  primary key (document_id, facility_id)
);

--------------------------------------------------
-- Mine Locations (large spatial dataset)
--------------------------------------------------
create table mine_locations (
  id uuid primary key default gen_random_uuid(),

  mine_name text,
  latitude double precision not null,
  longitude double precision not null,

  mine_type text,
  facility_status text,

  proposal_date date,
  start_operation date,
  end_operation date,

  capacity numeric,
  capacity_unit text,

  source text,
  notes text,
  created_at timestamptz default now()
);