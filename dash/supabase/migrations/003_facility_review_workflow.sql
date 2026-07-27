-- Review workflow support for facility/site/document curation.
-- This table is operational metadata and should not be publicly readable.

begin;

create table if not exists facility_reviews (
  facility_id uuid primary key references facilities(id) on delete cascade,
  facility_name text not null,
  site_id uuid references sites(id) on delete set null,
  site_reviewed boolean not null default false,
  docs_reviewed boolean not null default false,
  primary_document_id uuid references document_files(id) on delete set null,
  review_status text not null default 'todo'
    check (review_status in ('todo', 'in_progress', 'blocked', 'done')),
  reviewer text,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_facility_reviews_status
  on facility_reviews(review_status);

create index if not exists idx_facility_reviews_site_reviewed
  on facility_reviews(site_reviewed);

create index if not exists idx_facility_reviews_docs_reviewed
  on facility_reviews(docs_reviewed);

create index if not exists idx_facility_reviews_reviewer
  on facility_reviews(reviewer);

-- Keep the review table aligned with currently loaded facilities.
insert into facility_reviews (facility_id, facility_name, site_id)
select f.id, f.facility_name, f.site_id
from facilities f
on conflict (facility_id) do nothing;

update facility_reviews fr
set site_id = f.site_id
from facilities f
where fr.facility_id = f.id
  and fr.site_id is distinct from f.site_id;

-- Keep the stored facility name aligned with the source facility row.
create or replace function sync_facility_reviews_facility_name()
returns trigger
language plpgsql
as $$
begin
  select f.facility_name
  into new.facility_name
  from facilities f
  where f.id = new.facility_id;

  return new;
end;
$$;

create or replace function sync_facility_reviews_site_id()
returns trigger
language plpgsql
as $$
begin
  update facility_reviews
  set site_id = new.site_id
  where facility_id = new.id;

  return new;
end;
$$;

drop trigger if exists trg_sync_facility_reviews_facility_name on facility_reviews;
create trigger trg_sync_facility_reviews_facility_name
before insert or update of facility_id on facility_reviews
for each row execute function sync_facility_reviews_facility_name();

drop trigger if exists trg_sync_facility_reviews_site_id on facilities;
create trigger trg_sync_facility_reviews_site_id
after update of site_id on facilities
for each row execute function sync_facility_reviews_site_id();

-- Update timestamp helper for edits to review records.
create or replace function touch_facility_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_facility_reviews_updated_at on facility_reviews;
create trigger trg_touch_facility_reviews_updated_at
before update on facility_reviews
for each row execute function touch_facility_reviews_updated_at();

alter table facility_reviews enable row level security;

-- Reviewer queue with related names and document link counts.
create or replace view facility_review_queue as
select
  fr.facility_id,
  fr.facility_name,
  f.facility_type,
  f.facility_status,
  fr.site_id,
  s.site_name as site_name,
  fr.site_reviewed,
  fr.docs_reviewed,
  fr.primary_document_id,
  coalesce(df.filename, df.path) as primary_document_name,
  coalesce(doc_counts.document_count, 0) as document_count,
  fr.review_status,
  fr.reviewer,
  fr.reviewed_at,
  fr.notes,
  fr.updated_at
from facility_reviews fr
join facilities f on f.id = fr.facility_id
left join sites s on s.id = fr.site_id
left join document_files df on df.id = fr.primary_document_id
left join (
  select facility_id, count(*) as document_count
  from document_facilities
  group by facility_id
) doc_counts on doc_counts.facility_id = fr.facility_id;

commit;
