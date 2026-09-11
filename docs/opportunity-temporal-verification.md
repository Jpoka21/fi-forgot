# Opportunity temporal lifecycle verification

## Implemented transition

This implementation adds a server-owned temporal judgment before Relationship Opportunity recommendation projection. The Brain retains Opportunities even when timing prevents presentation. Frontend code mirrors and copies the server contract; it does not parse dates, select cycles, calculate proximity, decay evidence, or reactivate Opportunities.

Supported production families are `birthday` and `anniversary`, because their exact `event_timing` signals justify annual recurrence. The pure evaluator also supports an explicitly declared `one_time` family. Every other rule is `unsupported`; its temporal state is `unknown`, and its established non-calendar behavior remains compatible.

## Exact semantics

- Dates are accepted only as exact `YYYY-MM-DD` for one-time evidence and exact `MM-DD` or `YYYY-MM-DD` for justified annual evidence. Impossible calendar dates, timestamps, partial dates in other formats, non-strings, and missing values are unknown.
- `evaluatedAt` is calendar evaluation time, never observation time. `timing.observedAt` remains null unless genuine observed evidence supplies it.
- The preparation window is a deterministic 30-day policy input and is serialized as `{ source: "policy", days: 30 }`; it is not evidence.
- `valid_now` means the supported occurrence is zero through 30 days ahead. `approaching_relevance` means 31 through 44 days ahead. `premature` means at least 45 days ahead. For one-time occurrences, one through 30 days past is `stale`, and more than 30 days past is `expired`. Missing, invalid, or unsupported inputs are `unknown`.
- Decay is qualitative only: `none` for valid now, `watch` before activation, `diminished` when stale, `exhausted` when expired, and `unknown` when timing is unknown. It never changes Brain confidence.
- Confidence remains a genuine finite Brain confidence or unknown. Importance/action priority, rank, proximity, timing, eligibility, restraint, and recommendation existence remain separate fields.
- One-time cycle identity is permanently `one-time:<exact-date>` and is never rolled forward. Justified recurrence uses `annual:<month-day>:<cycle-year>` and selects the next real calendar occurrence (including leap-day handling).
- A semantic timing/support/evidence change creates an immutable history entry. Re-evaluation time alone is inert. Known entries include cycle and effective date; every entry carries its exact evidence snapshot. Unknown transitions retain the last known cycle/date inside history while the current state exposes null timing. An A→B→A sequence therefore retains all three states rather than deduplicating the later A.
- A previously supported source becoming null is appended as `source_withdrawn`; archived relationship context is appended as `source_archived`; inactive relationship context is appended as `source_invalidated`; and malformed replacement dates are appended as invalid support. Each is retained, recommendation-null, and non-presentable.
- Known states other than `valid_now` are retained but restrained, recommendation-null, and ineligible for both recommendation and insight projection. Supported malformed/missing dates are likewise silent. Unsupported non-calendar Opportunity families retain established compatibility because no timing claim can legitimately be made about them.
- Annual reactivation requires the still-present supported recurring evidence; one-time evidence never reactivates merely because time advanced. New or changed evidence creates a new append-only history entry rather than rewriting an old occurrence.
- Ranking and upstream attention/fatigue behavior are unchanged. The existing first-three Opportunity presentation assignment occurs before temporal filtering, so an ineligible item consumes no action and no lower-ranked item backfills its slot. Workspace and conversation consumers both require eligible presentation plus a non-null recommendation and cap output at three.

## Provenance and unknowns

Production signal provenance serializes the true signal source and loaded recipient-row identity when present. The current signal contract supplies no evidence revision, so `sourceVersion` and `evidenceId` remain null rather than relabeling a context schema version as an evidence version; absent identity and timestamps also remain null. Interpretations and hypotheses are unsupported temporal families and cannot become dated-event facts here.

The Concierge production builder now uses an append-only repository seam: it enumerates owner-and-recipient-scoped retained Opportunities, loads owner/opportunity-scoped history before evaluation, and idempotently appends semantic transitions afterward. Retained identities absent from the current decisions are re-evaluated from their immutable prior evidence snapshot and kept silent. A continuing genuine annual source can preserve the displaced occurrence as a fixed one-time cycle; withdrawal/archive/invalidation instead append explicit unknown-support transitions. Failed listing or history loading is never converted into an empty baseline: affected dated Opportunities expose unavailable persistence and are silent, with no append. Failed append exposes failed persistence and removes compatibility projections. The storage identity is a hash of an unambiguous user/Opportunity/change tuple, while the semantic change key is stored separately. Integration tests exercise both the in-memory seam and the actual PostgreSQL adapter against a controlled relational fixture. This is durable-path implementation evidence, not proof that a live database has the unapplied table.

Rollout path: review the table and retention/access policy; apply the SQL through the normal migration process; qualify the existing owner-scoped, insert-only/idempotent repository against a non-production database; verify route handling for withdrawal/archive/invalidation inputs; then qualify live deployment separately. No schema was applied in this work.

## Automated evidence

Evidence is implementation-only:

- Static: scoped API and frontend TypeScript checks passed; the DB package TypeScript check passed.
- Unit: `opportunity-temporal.test.ts` passed and deterministically covers all six states, strict invalid dates, stable one-time identity, justified recurrence, policy labeling, qualitative decay, and appended withdrawal/archive/invalidation history.
- Integration: `opportunity-temporal-integration.test.ts` passed using separate production workspace-builder calls and the repository seam, plus JSON serialization, frontend mapping, workspace filtering, and the conversation consumer. It proves cross-request history, retained identities absent current decisions, active/withdrawn/archived/invalidated transitions, a production displaced occurrence preserved as a fixed expired one-time cycle, temporal fields, evidence snapshots, null semantics, silent retained Opportunities, no backfill, the maximum-three cap, and actual-adapter owner/recipient isolation and idempotency. Expected fatigue warnings confirm no live database was used.
- Regression: Relationship Opportunity server/frontend contracts; Brain attention and fatigue; relationship memory; versioned understanding; evolving hypotheses; and Concierge cap tests passed.
- Build: an earlier controller verification completed both scoped builds, but the latest worker rerun was blocked by the managed filesystem denying esbuild reads of the repository entry/config and dependency files. Because code changed after the earlier receipt, the outer controller must rerun `pnpm --filter @workspace/api-server build` and `pnpm --filter @workspace/fi-forgot build`; this report does not present the earlier result as current final evidence.

Deployment, live database migration, live database persistence qualification, and live authenticated owner workflow remain explicitly deferred. Orchestra2 owns checkpoint, gated automatic publication, and fresh remote synchronization checks after independent acceptance; its durable mission state records those outcomes separately from implementation test evidence.

## Qualification boundary

The annual preparation/approaching windows and one-time stale/expiry windows are explicitly serialized policy inputs, not observed evidence or inferred urgency. Their product-policy suitability remains reviewable independently of evidence truthfulness. The implementation does not fabricate a `one_time_date` production signal: production one-time preservation occurs only when an already persisted, genuinely sourced annual occurrence is displaced while the same exact source signal continues.

The worker runtime required a temporary local Node launch shim because `os.userInfo()` failed before `tsx` startup; the shim and temporary directory were removed after testing and are not product changes. The latest worker build attempts reached the real build scripts but esbuild was denied repository/dependency reads by the managed filesystem. Current final build evidence therefore remains an outer-controller verification step. Automated evidence does not qualify deployment, a live database, or an authenticated owner workflow.
