-- Verification conclusions and material QA issue tracking.
-- Existing review progress is preserved; no legacy review is automatically verified.

begin;

--------------------------------------------------
-- Facility verification conclusion
--------------------------------------------------

alter table facility_reviews
  add column verification_status text not null default 'unreviewed'
    constraint facility_reviews_verification_status_check
    check (
      verification_status in (
        'unreviewed',
        'verified',
        'verified_with_limitation',
        'unresolved',
        'excluded'
      )
    );

comment on column facility_reviews.verification_status is
  'Conclusion about whether the canonical facility record is adequately supported; separate from review workflow status.';

create index idx_facility_reviews_verification_status
  on facility_reviews(verification_status);

--------------------------------------------------
-- Material facility QA issues
--------------------------------------------------

create table qa_issues (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references facilities(id) on delete cascade,

  issue_code text not null
    constraint qa_issues_issue_code_check
    check (
      issue_code in (
        'identity',
        'site_assignment',
        'classification',
        'status_or_dates',
        'source_conflict',
        'insufficient_evidence'
      )
    ),
  affected_field text,
  severity text not null default 'warning'
    constraint qa_issues_severity_check
    check (severity in ('warning', 'blocking')),
  state text not null default 'open'
    constraint qa_issues_state_check
    check (state in ('open', 'resolved', 'accepted')),

  description text not null,
  resolution text,
  origin text not null default 'manual'
    constraint qa_issues_origin_check
    check (origin in ('manual', 'automated')),

  opened_by text,
  resolved_by text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,

  constraint qa_issues_affected_field_not_blank check (
    affected_field is null or btrim(affected_field) <> ''
  ),
  constraint qa_issues_description_not_blank check (
    btrim(description) <> ''
  ),
  constraint qa_issues_opened_by_not_blank check (
    opened_by is null or btrim(opened_by) <> ''
  ),
  constraint qa_issues_resolution_state_check check (
    (
      state = 'open'
      and resolution is null
      and resolved_by is null
      and resolved_at is null
    )
    or
    (
      state in ('resolved', 'accepted')
      and resolution is not null
      and btrim(resolution) <> ''
      and resolved_by is not null
      and btrim(resolved_by) <> ''
      and resolved_at is not null
    )
  )
);

comment on table qa_issues is
  'Material facility QA findings and their retained resolution history; routine review corrections do not require issue rows.';

create index idx_qa_issues_facility_id
  on qa_issues(facility_id);

create index idx_qa_issues_open
  on qa_issues(facility_id, severity, opened_at)
  where state = 'open';

alter table qa_issues enable row level security;

--------------------------------------------------
-- Reviewer queue QA summary
--------------------------------------------------

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
  fr.updated_at,
  fr.verification_status,
  coalesce(issue_counts.open_issue_count, 0::bigint) as open_issue_count,
  coalesce(issue_counts.blocking_issue_count, 0::bigint) as blocking_issue_count,
  (
    fr.review_status = 'done'
    and fr.verification_status = 'unreviewed'
  ) as migration_review_required
from facility_reviews fr
join facilities f on f.id = fr.facility_id
left join sites s on s.id = fr.site_id
left join document_files df on df.id = fr.primary_document_id
left join (
  select facility_id, count(*) as document_count
  from document_facilities
  group by facility_id
) doc_counts on doc_counts.facility_id = fr.facility_id
left join (
  select
    facility_id,
    count(*) filter (where state = 'open') as open_issue_count,
    count(*) filter (
      where state = 'open' and severity = 'blocking'
    ) as blocking_issue_count
  from qa_issues
  group by facility_id
) issue_counts on issue_counts.facility_id = fr.facility_id;

commit;
