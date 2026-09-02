# Facility Review Workflow

This document defines the process for reviewing facility records, assigning sites, linking documentation, recording a verification conclusion, and handling material QA issues. See [`qa_instructions.md`](qa_instructions.md) for the authoritative definitions, materiality standard, and evidence guidance.


- One storage bucket for documents.
- Canonical document path convention: `source/year/filename` (govt agencies), or `source/source/filename` (private records or other databases)

- Open supabase, facility_data
- Open facility_reviews (freeze facility_name), facilities, document_files, document_files, document_facilities, facility_review_queue (freeze review status)
- Open separate tab for Storage

## Data Model Used

- `facilities`: source-of-truth facility records.
- `facility_reviews`: review tracking per facility.
- `facility_reviews.verification_status`: verification conclusion for the resulting canonical facility record.
- `document_files`: document metadata (`bucket`, `path`, `filename`).
- `document_facilities`: many-to-many document links to facilities.
- `qa_issues`: material facility-level QA findings and their resolution history.
- `facility_review_queue`: convenience view for review work.

## Core Rules

1. Do not run migrations for normal document ingestion.
2. Use migrations only for schema changes.
3. A facility can link to many documents; a document can link to many facilities
4. A site can link to multiple facilities; a facility can link to only one site.
5. Shared reference documents are stored once and linked many times.
6. `review_status` tracks workflow progress; `verification_status` records the conclusion about the canonical facility record.
7. Create `qa_issues` rows only for material exceptions. Routine corrections do not require issue rows.
8. Do not delete resolved or accepted issues.

## QA Fields and Codes

Detailed definitions and judgment guidance are maintained in [`qa_instructions.md`](qa_instructions.md).

### Review workflow status

`facility_reviews.review_status`:

- `todo`: review has not started.
- `in_progress`: review is actively underway.
- `blocked`: review cannot be completed because required work or a material issue remains unresolved.
- `done`: all completion criteria are satisfied.

### Verification conclusion

`facility_reviews.verification_status`:

- `unreviewed`: no verification conclusion has been assigned.
- `verified`: the canonical record is adequately supported.
- `verified_with_limitation`: the record is adequately supported for use with a documented material limitation.
- `unresolved`: available evidence does not support a defensible conclusion on a material aspect of the record.
- `excluded`: the record is outside the governing facility definition or database scope.

`facility_review_queue` also exposes `verification_status`, `open_issue_count`, `blocking_issue_count`, and `migration_review_required`. The migration flag identifies legacy rows that were already `done` but still need a verification conclusion.

### QA issue fields

Material findings are stored in `qa_issues`. The main reviewer-facing fields are:

- `facility_id`: affected facility.
- `issue_code`: primary kind of issue.
- `affected_field`: optional affected field in the canonical record.
- `severity`: effect on completion.
- `state`: current disposition.
- `description`: concise statement of the problem and why it matters.
- `resolution`: decision and outcome when the issue is closed.
- `origin`: whether the finding was manual or automated.
- `opened_by`, `opened_at`, `resolved_by`, `resolved_at`: reviewer and timestamp information.

`issue_code` values:

- `identity`
- `site_assignment`
- `classification`
- `status_or_dates`
- `source_conflict`
- `insufficient_evidence`

`severity` values:

- `warning`: the issue should be documented or followed up but does not by itself prevent verification.
- `blocking`: the issue prevents a defensible verification conclusion or completion while open.

`state` values:

- `open`: investigation or a decision is still required.
- `resolved`: the underlying problem was addressed.
- `accepted`: the issue remains in some form, but its effect and the canonical decision or limitation have been documented and accepted.

`origin` values:

- `manual`
- `automated`

## Completion Criteria

A facility is complete only when all are true:

1. `site_reviewed = true`
2. `docs_reviewed = true`
3. `primary_document_id` is not null
4. At least one `document_facilities` link exists
5. `verification_status` is not `unreviewed`
6. No `qa_issues` row has `severity = 'blocking'` and `state = 'open'`
7. `review_status = 'done'`

## Daily Routine

1. Pull queue items with `review_status in ('todo', 'in_progress')`.
2. Select a fixed batch size (10-20 facilities).
3. Reserve the batch by setting:
   - `reviewer`
   - `review_status = 'in_progress'`
4. Process each facility using the per-facility routine.
5. Triage open QA issues encountered in the batch.
6. Run end-of-day QA checks.
7. Log session outcomes:
   - completed count
   - blocked count
   - unresolved items

## Per-Facility Routine

1. Open one facility from `facility_review_queue`.
2. Confirm identity and location fields:
   - `facility_id`
   - `facility_name`
   - `site_id`
3. Fact-check the referenced facility record.
    - facility_type, facility_status, proposal/start/end
    - if incorrect, edit referenced row in `facilities` 
4. Validate site assignment:
   - if correct, set `site_reviewed = true`
   - if incorrect, update `facilities.site_id` and verify sync in `facility_reviews.site_id`
5. Upload source document to storage bucket.
6. Use path pattern: `source/year/filename`.
7. Insert or upsert row in `document_files`.
8. Insert link row in `document_facilities`.
9. Set `primary_document_id` in `facility_reviews`.
10. Mark docs complete with `docs_reviewed = true` when minimum evidence is present.
11. If a material exception is found, open a `qa_issues` row using the process below.
12. Assign `verification_status` after reviewing the canonical values and evidence.
13. Set `review_status`:
    - `done` when all completion criteria are satisfied
    - `blocked` when an open blocking issue or other required work prevents completion
    - otherwise remain `in_progress`
14. Set `reviewed_at = now()` and add a concise review note only when needed.

## Opening and Closing QA Issues

### Open an issue

1. Confirm that the finding is material under [`qa_instructions.md`](qa_instructions.md).
2. Insert one `qa_issues` row for the underlying problem.
3. Select the most specific `issue_code` and add `affected_field` when one canonical field is implicated.
4. Set `severity`, normally leaving `state = 'open'` and `origin = 'manual'` at their defaults.
5. Describe the problem, the relevant disagreement or missing support, and why it matters.
6. If severity is `blocking`, set the facility's `review_status = 'blocked'` and use `verification_status = 'unresolved'` when that is the appropriate current conclusion.

### Resolve or accept an issue

1. Reassess the canonical facility row and linked evidence.
2. Update the canonical value in `facilities` if the decision requires a correction.
3. Set `state = 'resolved'` when the underlying issue was addressed, or `state = 'accepted'` when a documented limitation or decision remains.
4. Record a concise `resolution`, `resolved_by`, and `resolved_at`.
5. Reassess `verification_status` and `review_status`. Do not mark the review `done` if another open blocking issue remains.

After resolving an issue, set `review_status = 'done'` only after checking every completion criterion. Do not delete the issue row.

## Weekly Routine

1. Run full QA checks over the entire dataset.
2. Triage `blocked` facilities oldest first.
3. Review open blocking QA issues and stale open warnings.
4. Spot-check a sample of completed facilities (recommended 10-20).
5. Publish weekly metrics:
   - total facilities
   - done
   - in_progress
   - blocked
   - todo
6. Update naming consistency if drift appears.

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

### 1) Link one document to one facility and keep the review in progress

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
  primary_document_id = (
    select id
    from document_files
    where bucket = 'site-docs'
      and path = 'nrc/2023/nureg-1234.pdf'
  ),
  docs_reviewed = true,
  review_status = 'in_progress',
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

### 5) QA: open issues

```sql
select
  qi.id,
  qi.facility_id,
  fr.facility_name,
  qi.issue_code,
  qi.affected_field,
  qi.severity,
  qi.description,
  qi.opened_by,
  qi.opened_at
from qa_issues qi
join facility_reviews fr on fr.facility_id = qi.facility_id
where qi.state = 'open'
order by
  case qi.severity when 'blocking' then 0 else 1 end,
  qi.opened_at;
```

## Notes

- Keep source naming canonical (lowercase slug), for example `nrc`, `iaea`, `doe`.
- Avoid duplicate uploads when the same reference is used across facilities.
- Prefer stable filenames including an identifier when available.
