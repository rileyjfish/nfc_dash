# Facility Review Workflow

This document defines the process for reviewing facility records, assigning sites, and linking documentation.


- One storage bucket for documents.
- Canonical document path convention: `source/year/filename`.

## Data Model Used

- `facilities`: source-of-truth facility records.
- `facility_reviews`: review tracking per facility.
- `document_files`: document metadata (`bucket`, `path`, `filename`).
- `document_facilities`: many-to-many document links to facilities.
- `facility_review_queue`: convenience view for review work.

## Core Rules

1. Do not run migrations for normal document ingestion.
2. Use migrations only for schema changes.
3. A facility can link to many documents; a document can link to many facilities
4. A site can link to multiple facilities; a facility can only link so a single site
5. Shared reference documents are stored once and linked many times.

## Completion Criteria

A facility is complete only when all are true:

1. `site_reviewed = true`
2. `docs_reviewed = true`
3. `primary_document_id` is not null
4. At least one `document_facilities` link exists
5. `review_status = 'done'`

## Daily Routine

1. Pull queue items with `review_status in ('todo', 'in_progress')`.
2. Select a fixed batch size (10-20 facilities).
3. Reserve the batch by setting:
   - `reviewer`
   - `review_status = 'in_progress'`
4. Process each facility using the per-facility routine.
5. Run end-of-day QA checks.
6. Log session outcomes:
   - completed count
   - blocked count
   - unresolved items

## Per-Facility Routine

1. Open one facility from `facility_review_queue`.
2. Confirm identity and location fields:
   - `facility_id`
   - `facility_name`
   - `site_id`
2. Fact-check facility_id referencing record.
    - facility_type, facility_status, proposal/start/end
    - if incorrect, edit referenced row in `facilities` 
3. Validate site assignment:
   - if correct, set `site_reviewed = true`
   - if incorrect, update `facilities.site_id` and verify sync in `facility_reviews.site_id`
4. Upload source document to storage bucket.
5. Use path pattern: `source/year/filename`.
6. Insert or upsert row in `document_files`.
7. Insert link row in `document_facilities`.
8. Set `primary_document_id` in `facility_reviews`.
9. Mark docs complete with `docs_reviewed = true` when minimum evidence is present.
10. Set status:
    - `done` if site and docs are both complete
    - `blocked` if unresolved
    - otherwise remain `in_progress`
11. Set `reviewed_at = now()` and add concise notes when needed.

## Weekly Routine

1. Run full QA checks over the entire dataset.
2. Triage `blocked` facilities oldest first.
3. Spot-check a sample of completed facilities (recommended 10-20).
4. Publish weekly metrics:
   - total facilities
   - done
   - in_progress
   - blocked
   - todo
5. Update naming consistency if drift appears.

## Document Pathing Standard

Use one bucket for all documents.

### Canonical path format

`source/year/filename`

Examples:

- `nrc/2023/nureg-1234.pdf`
- `iaea/2021/safety-report-78.pdf`

### Shared document behavior

If two or more facilities use the same reference:

1. Upload one file once.
2. Keep one row in `document_files`.
3. Create multiple rows in `document_facilities` (one per facility).
4. Optionally set that same document as `primary_document_id` for multiple facilities.

## SQL Templates

### 1) Link one document to one facility and update review status

```sql
begin;

with d as (
  insert into document_files (bucket, path, filename)
  values ('site-docs', 'nrc/2023/nureg-1234.pdf', 'nureg-1234.pdf')
  on conflict (bucket, path) do update
    set filename = excluded.filename
  returning id
)
insert into document_facilities (document_id, facility_id)
select d.id, 'PUT_FACILITY_UUID_HERE'::uuid
from d
on conflict do nothing;

update facility_reviews
set
  primary_document_id = (select id from d),
  docs_reviewed = true,
  review_status = case when site_reviewed then 'done' else 'in_progress' end,
  reviewed_at = now()
where facility_id = 'PUT_FACILITY_UUID_HERE'::uuid;

commit;
```

### 2) QA: done facilities with zero linked docs

```sql
select
  fr.facility_id,
  fr.facility_name,
  fr.review_status,
  count(df.document_id) as document_count
from facility_reviews fr
left join document_facilities df on df.facility_id = fr.facility_id
where fr.review_status = 'done'
group by fr.facility_id, fr.facility_name, fr.review_status
having count(df.document_id) = 0
order by fr.facility_name;
```

### 3) QA: docs reviewed true but no primary document

```sql
select
  facility_id,
  facility_name,
  docs_reviewed,
  primary_document_id,
  review_status
from facility_reviews
where docs_reviewed = true
  and primary_document_id is null
order by facility_name;
```

### 4) QA: orphan document metadata (not linked)

```sql
select
  d.id,
  d.bucket,
  d.path,
  d.filename,
  d.created_at
from document_files d
left join document_facilities df on df.document_id = d.id
where df.document_id is null
order by d.created_at desc;
```

## Notes

- Keep source naming canonical (lowercase slug), for example `nrc`, `iaea`, `doe`.
- Avoid duplicate uploads when the same reference is used across facilities.
- Prefer stable filenames including an identifier when available.
