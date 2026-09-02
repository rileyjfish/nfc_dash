# Facility Data Quality Assurance

## Purpose

This document defines the quality-assurance model for the NFC Dashboard facility database. It is the authoritative source for the meaning of verification conclusions, material QA issues, and evidence-related decisions. The operational review sequence and routine SQL checks belong in `review_workflow.md`.

The database reconstructs the United States commercial nuclear fuel cycle for later demographic analysis. It should also remain useful as a general facility dataset. QA therefore focuses on whether each canonical facility record is adequately supported for comparisons across facility type, operational status, geography, and time.

QA cannot establish that every historical fact is complete or certain. Its purpose is to make consequential selections, uncertainties, and limitations visible and traceable without turning the database into an archival or claim-management system.

## Governing Principles

1. Every facility receives a consistent canonical review and general evidence linkage.
2. Only material uncertainty, conflict, inference, or analytical limitation receives a structured QA issue.
3. `facilities` retains one selected canonical value for each analytical field. Downstream users should not reconstruct a facility record from competing claims.
4. QA records explain or qualify canonical values; they do not replace them.
5. Structure information only when it must be filtered, validated, joined, analyzed, or reliably revisited. Use concise notes for unusual one-off detail.
6. Prefer explicit conclusions and issue states over numerical confidence scores or universal source-quality ratings.
7. Preserve material decisions and issue resolutions.
8. Keep the ordinary review path simple. Detailed QA is an exception workflow, not a requirement for every facility.
9. Keep demographic inclusion rules and alternative analytical definitions outside the facility database.

## Workflow Completion and Verification Are Different

`review_status` records the state of the review workflow: whether work is queued, underway, blocked, or complete. It does not express whether the resulting facility record is adequately supported.

`verification_status` records the reviewer's conclusion about the canonical facility record after considering its identity, classification, site assignment, status, dates, and supporting evidence. A review may have completed procedural steps without yet having a verification conclusion, particularly during migration of previously reviewed records.

The verification conclusions are:

- `unreviewed`: No verification conclusion has been assigned. This is the default for new and migrated records.
- `verified`: The canonical record is adequately supported for its intended database and demographic uses, with no material unresolved limitation.
- `verified_with_limitation`: The canonical record is adequately supported for use, but a material uncertainty, inference, conflict, or analytical limitation must accompany its interpretation.
- `unresolved`: Available evidence does not support a defensible conclusion on one or more material aspects of the record.
- `excluded`: The record was intentionally excluded because it falls outside the governing facility definition or database scope. The reason must be traceable.

Verification is a categorical conclusion, not a confidence score. It should reflect fitness for the database's intended uses rather than certainty in an abstract sense.

## Materiality

Create a QA issue when the matter could reasonably change or call into question one or more of the following:

- the identity or boundaries of the facility;
- its facility type or fuel-cycle classification;
- its assignment to a geographic site;
- its operational status or an important proposal, start, or end date;
- its verification conclusion or eligibility for normal use;
- a comparison by facility type, status, geography, or time;
- interpretation of the population associated with the facility.

Do not create a QA issue merely because a record could benefit from another source, a source uses a harmless naming variant, or a nonconsequential detail is incomplete. Correct minor errors directly and use existing notes only when brief context would help later reviewers.

When several symptoms arise from the same underlying problem, prefer one issue that describes the material problem clearly. Create separate issues only when they can be investigated, resolved, or interpreted independently.

## Evidence Treatment

General evidence for a facility is established through `document_facilities`. `primary_document_id` identifies the most useful principal document for routine review; it does not imply that the document supports every field or overrides all other sources.

Evidence should be judged for the specific claim at issue according to:

- **Relevance:** whether the source addresses the facility and fact being evaluated.
- **Directness:** whether the fact is reported directly or must be inferred.
- **Authority:** whether the source is well positioned to establish that particular fact.
- **Consistency:** whether the source agrees with other relevant evidence and the surrounding record.

Do not assign universal source-quality scores. A source may be authoritative for one subject and weak for another. Explicit comparative reasoning is mainly necessary when sources conflict, a value is derived, or the selected canonical value could materially affect the record or demographic analysis.

Field-level provenance is not required for every facility field. If a material decision would otherwise be difficult to reconstruct, identify the affected field and explain the relevant sources in the QA issue description or resolution. A separate field-evidence table should be added only if recurring cases show that issue records and general document links are inadequate.

## QA Issues

`qa_issues` records material exceptions and their disposition. It is not a checklist, a comprehensive audit log, or a record of every correction made during review.

Each issue belongs to one facility and contains:

- a controlled issue code;
- an optional affected field;
- severity;
- state;
- a concise description;
- resolution information when closed;
- manual or automated origin;
- reviewer and timestamp information.

Resolved and accepted issues remain in the database so that consequential decisions and limitations can be reconstructed.

### Issue codes

- `identity`: Uncertainty about whether the facility exists as represented or whether names, records, units, projects, or sources refer to the same facility. This includes possible duplicates, renamed facilities, ambiguous unit boundaries, and unclear continuity between proposed and constructed operations.
- `site_assignment`: Uncertainty about the geographic site to which the facility belongs. This includes conflicting coordinates or addresses, ambiguous colocated operations, and uncertainty about the appropriate site boundary.
- `classification`: Uncertainty about the facility's canonical type or role in the nuclear fuel cycle. Use this when activities cross existing type boundaries or relevant sources classify the facility differently.
- `status_or_dates`: A material problem involving operational status or an important proposal, start, or end date. This includes conflicting dates, unclear transitions between construction and operation, temporary shutdowns, cancelled proposals, or uncertainty about whether a facility remains active.
- `source_conflict`: Material disagreement among relevant sources that does not fit more clearly under another issue code, or for which the disagreement itself must be documented. Prefer a more specific code when the conflict is primarily about identity, site assignment, classification, or status and dates.
- `insufficient_evidence`: Available evidence is inadequate to support a consequential canonical value or verification conclusion because it is absent, inaccessible, too indirect, or otherwise insufficient.

The issue code identifies the primary nature of the problem. It does not encode seriousness, workflow state, or the overall verification conclusion. Add new codes only after recurring cases demonstrate a need that cannot be handled clearly by the existing vocabulary.

### Severity

- `warning`: The issue warrants documentation or follow-up but does not, by itself, prevent a defensible canonical record and verification conclusion.
- `blocking`: The issue prevents a defensible verification conclusion or completion of the facility review while it remains open.

Severity reflects the issue's present effect on the record. It should not be used as a subjective confidence rating.

### State

- `open`: The issue requires investigation, a decision, or additional evidence.
- `resolved`: The underlying issue was addressed and no longer limits the canonical record. The resolution must explain what changed or how the conflict was settled.
- `accepted`: The issue could not or need not be eliminated, but its effect has been evaluated and a documented canonical decision or limitation has been accepted. The resolution must explain why the record remains usable or how its interpretation is limited.

`resolved` and `accepted` are both closed states, but they communicate different outcomes. Do not mark an issue `resolved` merely because work stopped. An accepted material limitation will commonly accompany `verified_with_limitation`.

## Relationship Between Issues and Verification

Verification should consider all material issues, but issue rows do not mechanically determine the conclusion in every case.

- `verified` normally has no open material issue and no accepted limitation that materially qualifies use.
- `verified_with_limitation` normally has at least one accepted limitation or another clearly documented qualification.
- `unresolved` normally has an open blocking issue or equivalent unresolved material deficiency.
- `excluded` requires a traceable scope or definition decision, which may be recorded in an issue or review note depending on its complexity.
- `unreviewed` means no conclusion has been made, regardless of earlier workflow completion.

An open blocking issue prevents a facility review from being considered complete. Warnings should affect completion only when their substance makes the verification conclusion indefensible.

## Normal Review and Exception Handling

The normal facility review should remain concise:

1. Verify facility identity and type.
2. Verify site assignment.
3. Verify operational status and important dates.
4. Link supporting documents.
5. Select a primary document.
6. Assign a verification conclusion.
7. Add a concise note only if needed.
8. Mark the workflow complete when all completion requirements are met.

Create a QA issue only when the reviewer encounters a material exception. The issue description should state the problem and why it matters without reproducing entire source documents. When closing an issue, the resolution should identify the decision, the evidence or reasoning that controlled, and any remaining limitation.

Automated QA may create issues when a check identifies a material condition. Automated findings require the same human disposition as manual findings and must not silently change canonical facility values or verification conclusions.

## Legacy Review Backfill

Existing records that were completed before `verification_status` was introduced must not be automatically declared verified. They begin with `verification_status = 'unreviewed'` and receive a shortened backfill review.

The backfill reviewer should confirm that the existing canonical values and linked evidence still support a verification conclusion, record any material exception, and then assign the appropriate status. Existing workflow work, document links, primary-document selections, notes, and review history should be preserved.

Legacy migration must not infer field-level support or manufacture QA issues from the mere absence of newly introduced metadata.

## Relationship to Demographic Analysis

The facility database provides canonical facility characteristics, locations, temporal fields, verification conclusions, and documented limitations. Downstream demographic processing may use these fields for sensitivity analysis and may test alternative Standard or Residual inclusion rules.

Those analytical inclusion rules do not belong in this database. `verification_status` describes support for the canonical record; it is not a demographic inclusion flag. QA issues preserve limitations that analysts may need to consider, but they should not force downstream users to reconstruct competing facility definitions from raw claims.

## Non-Goals

This QA model does not attempt to provide:

- a comprehensive document archive or bibliographic system;
- field-level provenance for every value;
- universal source rankings or numerical confidence scores;
- a complete history of every edit;
- a general claim-management system;
- speculative facility-event or status-period structures;
- demographic inclusion flags or analysis-specific rules.

These structures should be reconsidered only if recurring review cases show that the current canonical fields, evidence links, QA issues, and notes cannot preserve decisions adequately.

## Maintaining the QA Model

Keep the controlled vocabularies short and stable. Add a new status, issue code, severity, or state only when repeated cases require a distinct workflow or analytical treatment. Prefer improving guidance and examples over adding categories for isolated cases.

Database constraints should prevent simple invalid states, especially invalid controlled values and closed issues without resolution information. Avoid complex triggers that obscure behavior or make records difficult to repair. Schema changes should remain backward-compatible and separately backfillable.
