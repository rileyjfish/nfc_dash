-- Remove synthetic dataset created by supabase/synthetic_seed.sql.
-- Safe to run multiple times.

begin;

-- Remove ownership rows first (depends on facilities/owners).
delete from facility_ownerships
where id::text like '40000000-%';

-- Remove synthetic facilities.
delete from facilities
where id::text like '30000000-%';

-- Remove synthetic sites.
delete from sites
where id::text like '20000000-%';

-- Remove synthetic owners.
delete from owners
where id::text like '10000000-%';

commit;
