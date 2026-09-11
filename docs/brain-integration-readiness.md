# F.I. Forgot Brain integration-readiness assessment

Inspected repository: C:/Users/James.Massaro/Projects/fi-forgot; branch frontend-rebuild; HEAD 7442d569ca538ae316cfa9c24ceedb95c0983e60. Fresh origin inspection at mission admission matched that HEAD (ahead 0, behind 0). This is point-in-time Git evidence, not database/deployment evidence.

## Scope, authority, and evidence classes

This is a **report-only** assessment. Inspection required no product-code change. No database, application, container, scheduler, browser workflow, external connection, migration, seed, deployment, credential creation, installation, checkpoint, or publication was run. Orchestra2 performed planning, static verification, correction, and independent review; its controller code was not changed. Secret values were neither read nor recorded.

**Unavailable evidence** includes a live database, an authenticated owner workflow, and a F.I. Forgot browser workflow; none is reported as failed or verified.

The evidence classes below are deliberately non-interchangeable:

- **Committed implementation/specification** means repository source or authority text.
- **Automated evidence** means checked-in tests or recorded test receipts; it is not a live owner workflow.
- **Integration evidence** means behavior against an actual database or connected transport. A controlled-clock actual-database test can prove deterministic persistence, but not real elapsed time.
- **Historical receipt** reports what an earlier bounded run recorded, not what the present runtime can do.
- **Runtime-scoped observation** applies only to the runtime named.
- **Unavailable evidence** was not produced; it is neither a failure nor a verification.

`docs/authority/Brain intelligence.docx` is authority but does not declare itself frozen. Read-only DOCX XML extraction gives actual numbered titles including **Chapter One — The Quiet Cost of Forgetting**, **Chapter Two — The Difference Between Remembering and Caring**, and **Chapter Eighty One — Understanding Creates Responsibility**. Chapter One says ordinary moments “become evidence,” explains that relationships experience behavior rather than intention, and concludes that technology must help genuine care survive modern complexity. Chapter Two distinguishes internal care from externally experienced expressions. Chapter Eighty One says understanding creates responsibility while stressing that not every observation demands action, that great relationship intelligence exercises restraint, and that the decision remains human. Those source passages support evidence preservation, restraint, and human agency; invented headings such as “Core Intelligence Model” are not used here (`docs/authority/Brain intelligence.docx`; read-only extraction receipt `.orchestra/brain-authority-read.txt`).

`docs/authority/FI-DAVE-001_Dave-Studio-Creative-System-and-Narrative-Standard_v1.0-FROZEN.docx` contains **Frozen Authority Notice**, **1. Purpose, Scope, and Authority**, and **1.10 Creative Authority and Change Control**. It is frozen only for its stated Dave Studio creative and narrative scope; that status is not transferred to Brain authority (`docs/authority/FI-DAVE-001_Dave-Studio-Creative-System-and-Narrative-Standard_v1.0-FROZEN.docx`; extraction receipt `.orchestra/dave-authority-read.txt`).

Architecture plans remain proposals/trackers rather than rollout proof (`playbook/122_BRAIN_INTEGRATION_PLAN.md`, `playbook/123_BRAIN_ATTENTION_PLANNER.md`, `playbook/124_BRAIN_FATIGUE_ENGINE.md`). Verification documents explicitly preserve rollout boundaries (`docs/versioned-understanding-verification.md`, `docs/relationship-memory-verification.md`, `docs/relationship-opportunity-concierge-verification.md`, `docs/opportunity-temporal-verification.md`, `docs/opportunity-feedback-verification.md`, `docs/opportunity-follow-through-verification.md`).

## 1. Persistence and migration readiness

The exported Drizzle model includes identity/recipient and source-memory prerequisites, the initial five versioned-understanding tables, the six evolving-understanding tables, Opportunity temporal/feedback/follow-through stores, exposure events, and outcome events (`lib/db/src/schema/index.ts`; `lib/db/src/schema/users.ts`; `lib/db/src/schema/personal-recipients.ts`; `lib/db/src/schema/recipients-normalized.ts`; `lib/db/src/schema/recipients-v2.ts`; `lib/db/src/schema/question-answers.ts`; `lib/db/src/schema/relationship-understanding.ts`; `lib/db/src/schema/opportunity-temporal.ts`; `lib/db/src/schema/opportunity-feedback.ts`; `lib/db/src/schema/opportunity-follow-through.ts`; `lib/db/src/schema/brain-opportunity-exposure-events.ts`; `lib/db/src/schema/brain-outcome-events.ts`). Importing the DB entry point requires `DATABASE_URL` and constructs a PostgreSQL pool (`lib/db/src/index.ts`).

There is no checked-in full prerequisite baseline, numbered migration journal, or verified executable upgrade chain. After that **missing prerequisite baseline**, the existing SQL/data artifacts are, in dependency order:

1. `lib/db/src/schema/evolving-understanding-migration.sql` — creates the next six understanding objects and assumes the initial five already exist.
2. `lib/db/src/schema/opportunity-temporal-migration.sql`.
3. `lib/db/src/schema/opportunity-feedback-migration.sql`.
4. `lib/db/src/schema/opportunity-follow-through-migration.sql`.
5. `lib/db/src/schema/versioned-understanding-snapshot.sql` — optional DML capture after all required DDL, not a baseline and only usable after its source and destination tables exist.

That list is a dependency inventory, not an instruction to concatenate files. A fresh database needs one reviewed **full-current baseline** containing every exported prerequisite and Brain object; duplicate `CREATE TABLE` artifacts must not then be applied over objects that baseline already created. An existing-schema upgrade instead needs a catalog-derived predecessor state and a reviewed incremental manifest. Without catalog and predecessor evidence, the existing-schema path is unverifiable.

Two exact SQL/Drizzle drifts prohibit blindly substituting `drizzle push` or an automatically generated baseline:

- `evolving-understanding-migration.sql` defines `relationship_hypothesis_evidence_uq ... NULLS NOT DISTINCT`; the corresponding unique index in `relationship-understanding.ts` does not request `NULLS NOT DISTINCT` (`lib/db/src/schema/evolving-understanding-migration.sql:10`; `lib/db/src/schema/relationship-understanding.ts`).
- `opportunity-follow-through-migration.sql` has SQL CHECK constraints for `source_type = 'brain_execution'`, dimension in `('action','outcome')`, action in `('set','withdraw')`, provenance `= 'explicit_owner_report'`, and verification `= 'user_reported'`; those CHECK constraints are absent from `opportunity-follow-through.ts` (`lib/db/src/schema/opportunity-follow-through-migration.sql:6`; `lib/db/src/schema/opportunity-follow-through.ts`).

The exact installed snapshot runner is:

```text
node scripts/node_modules/tsx/dist/cli.mjs lib/db/src/schema/run-understanding-snapshot.ts --apply
```

It is documented in `docs/versioned-understanding-verification.md`. **`--apply` was not invoked.** The same document says invocation without `--apply` accesses no database and that the applying runner wraps the snapshot SQL in a transaction. `lib/db/package.json` exposes state-sync push commands and `scripts/post-merge.sh` calls push, but neither was executed.

Actual database catalog/data state, migration application, and real PostgreSQL behavior are unavailable. Existing fixture tests exercise PostgreSQL **protocol mocks**, not PostgreSQL locking, constraints, catalog behavior, or durability (`docs/versioned-understanding-verification.md`, section “Automated evidence”).

## 2. Runtime, startup, and containment

The API import graph is not provider-safe by inspection. `artifacts/api-server/src/lib/openai.ts` eagerly executes `new OpenAI(...)` at module evaluation, selecting `AI_INTEGRATIONS_OPENAI_API_KEY` or `OPENAI_API_KEY` and optionally `AI_INTEGRATIONS_OPENAI_BASE_URL`. It is reachable through numerous eagerly composed routes/services—for example `routes/admin.ts`, `routes/generate-card.ts`, `routes/v2-generate-card.ts`, `services/sendgrid.ts`, and `services/card-classifier.ts`—which are reached by route composition from `artifacts/api-server/src/routes/index.ts` and `artifacts/api-server/src/app.ts`. This was traced statically without importing the module or fabricating a key. Provider-safe startup therefore remains unresolved.

The reviewed frontend gates include `VITE_BRAIN_CONCIERGE` and `VITE_BRAIN_CONCIERGE_CONVERSATION` (along with profile-question, notification, and dashboard gates) in `artifacts/fi-forgot/src/app/concierge-brain/conciergeBrainConfig.ts` and sibling Brain config files. Server fatigue gates are `BRAIN_FATIGUE_SHADOW_RECENTLY_SURFACED` and `BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED` (`artifacts/api-server/src/brain/fatigue/fatigueEnforcementConfig.ts`).

API startup composes Stripe, AI, email/card and Brain routes; after listen it registers hourly reminder and business scheduler intervals (`artifacts/api-server/src/app.ts`; `artifacts/api-server/src/index.ts`). `app.listen` supplies no explicit loopback host. Vite currently binds `0.0.0.0` and can proxy `/api` to `API_PROXY_TARGET` (`artifacts/fi-forgot/vite.config.ts`). Outbound network blocking, fail-closed fakes, disabled scheduler registration, and explicit loopback listeners are therefore preparation gaps, not established containment.

Valid **inactive examples only**, for a future contained Windows PowerShell harness, are:

```powershell
$env:DATABASE_URL = '<future-local-credential-method>'
$env:PORT = '8080'
pnpm --filter @workspace/api-server start

$env:PORT = '25460'
$env:BASE_PATH = '/'
$env:API_PROXY_TARGET = 'http://127.0.0.1:8080'
$env:VITE_BRAIN_CONCIERGE = 'true'
$env:VITE_BRAIN_CONCIERGE_CONVERSATION = 'true'
pnpm --filter @workspace/fi-forgot dev
```

These examples are not safe to run until local-only binding, provider import safety, scheduler suppression, outbound denial, fixtures, and a credential method exist. No environment was started. `scripts/src/seed-products.ts` mutates Stripe products/prices; it is not a Brain/database seed and must not be used for qualification.

## 3. Authentication boundary

Current endpoints trust user identifiers supplied through headers or bootstrap flows; ownership predicates are isolation logic, not authentication (`artifacts/api-server/src/routes/v2-concierge.ts`; `artifacts/api-server/src/routes/v2-recipients.ts`; `artifacts/api-server/src/routes/personal-recipients.ts`). Synthetic A/B tests can reveal filtering behavior and the forged-known-ID vulnerability, but cannot establish authenticated owner isolation. This report neither claims authenticated qualification nor authorizes authentication remediation. Real authentication design and verification remain separate future scope.

## 4. Source-grounded future scenario matrix

Every row below is an unexecuted qualification design. It requires synthetic owners/recipients, deterministic fixtures, SQL/HTTP/UI receipts, restart reconstruction, and an outbound zero-call ledger. Controlled-clock actual-database checks would be deterministic persistence evidence, not evidence that real wall-clock time elapsed.

| Scenario | Required future evidence |
|---|---|
| Memory and evolving understanding | Immutable versions, heads, supersession, exact provenance/dependencies, uncertain/null values preserved, retirement and revival without history rewrite (`lib/db/src/schema/relationship-understanding.ts`; `docs/relationship-memory-verification.md`). |
| Opportunity creation | Create a source-grounded Opportunity and prove owner/recipient/source/cycle identity, persistence, replay behavior, and restrained presentation; do not infer eligibility or completion from creation alone. |
| Temporal states | Exercise implemented unknown timing, future/premature eligibility, expiry/expired behavior, and reactivation with a controlled clock and actual database. Preserve append-only history; never invent occurrence time or claim real elapsed-time evidence (`lib/db/src/schema/opportunity-temporal.ts`; `docs/opportunity-temporal-verification.md`). |
| Feedback | Prove lineage, receipts, idempotency, withdrawal/correction, stale/concurrent handling, and cross-owner/recipient denial without fabricating eligibility (`lib/db/src/schema/opportunity-feedback.ts`; `docs/opportunity-feedback-verification.md`). |
| Follow-through/outcomes | Keep action and outcome lineages separate; prove set/withdraw/correction, receipts, source/cycle/family identity, and that only explicit compatible evidence restrains (`lib/db/src/schema/opportunity-follow-through.ts`; `docs/opportunity-follow-through-verification.md`). |
| Restart durability | Hash/count immutable history and receipts before restart, then reconstruct through a fresh API process. This would prove local persistence only, not deployment. |
| Concierge and maximum three | Presentation is **at most three** actions. Zero, one, or two are valid when restraint leaves fewer. Timing, feedback, or follow-through suppression of original ranked slots must never automatically backfill vacated slots. Compatibility projections may still retain six legacy recommendations and four insights (`docs/relationship-opportunity-concierge-verification.md`). |
| No fabricated truth and isolation | Render only evidence-linked semantics; null stays unknown. Test missing, random, forged-known, cross-owner, cross-recipient, cross-receipt and cross-cycle requests and disclose the present authentication limitation. |

Checked-in unit/integration-style automation, historical receipts, controlled-clock database results, and a real owner/browser workflow must be reported separately. Builds, mocks, reloads, serialization, and connected transport do not prove the owner workflow.

## 5. Browser/runtime observations and gap

Two inventories are both true only within their runtimes:

- **Root CUA runtime observation:** a fresh inventory saw `browsers=[{id:"1", name:"Codex In-app Browser", type:"iab", tabs:[]}]` and `apps=[]`.
- **Worker runtime observation:** its separate inventory saw zero browsers and zero tabs.

Neither supports a global claim that browser capability is present or absent. No F.I. Forgot browser workflow ran.

Root CUA exposes accessibility-tree/snapshot, screenshot, click, value-setting, and key controls. It is not Orchestra’s BrowserUse adapter interface, which defines authenticated browser discovery/tab interaction with Playwright locator requests and `dev.logs` (`C:/Users/James.Massaro/Projects/orchestra-2/src/browser-use-adapter.ts`; `C:/Users/James.Massaro/Projects/orchestra-2/docs/BROWSER_LIFECYCLE.md`). Historical controller receipts qualify only a disposable loopback fixture and simulated lifecycle behavior, not F.I. Forgot (`C:/Users/James.Massaro/Projects/orchestra-2/docs/BROWSER_LIFECYCLE_QUALIFICATION.md`).

The F.I. Forgot web app requires **no extension**. The smallest browser gap is a repository-local, project-specific scenario/evidence handoff compatible with the actually approved and available runtime: exact loopback URL and synthetic IDs in; bounded operations, observations, screenshots and machine-readable results out. This report does not promise that a shell entry point controls CUA, or that CUA supplies BrowserUse Playwright locators or target-tab `dev.logs`. Generic inventory, reload, protocol simulation, extension installation, CDP/private-profile access, or restricted browser-management surfaces cannot substitute.

## 6. Risks, stop conditions, and recovery

Stop future execution on an unknown database identity/catalog, non-loopback listener, missing provider-safe startup, scheduler/outbound activity, nonsynthetic identity/data, unreviewed SQL/hash drift, destructive or duplicate DDL, ambiguous writes, mutation of immutable history, missing predecessor/receipt links, unsupported browser control, or evidence-class collapse.

Fresh-database recovery must eventually identify only the dedicated disposable target before disposal. Existing-schema recovery would require an independently proven backup/restore plan. Neither recovery was exercised. Live catalog state, migration application, real PostgreSQL behavior, provider-safe startup, authenticated owner isolation, real elapsed-time behavior, F.I. Forgot browser workflow, external-environment behavior, and deployment qualification remain **unavailable**, not failed and not verified.

## 7. Sole immediate recommendation — PREPARATION ONLY

**PREPARATION ONLY:** authorize one bounded repository-local change set that creates (a) a reviewed fresh full-current migration baseline plus a separate existing-schema upgrade manifest, and (b) local-only containment, synthetic fixture, restart/durability, and browser-scenario/evidence-handoff artifacts. The planned future target must be PostgreSQL 16 at `127.0.0.1:55432`, database `fi_forgot_brain_qualification`, role `fi_forgot_brain_qualifier`, with planned `PGDATA` `C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata`.

Preparation rollback will revert only reviewed authorized repository changes; no database is touched.

This immediate recommendation permits **preparation only**. It prohibits database creation or application, migration execution, snapshot `--apply`, application/browser/database startup, deployment, credentials or secret creation, package/software installation, controller changes, authentication remediation, external connections, and any Git/checkpoint/push/publication or repository-scope expansion. It does not authorize unknown SQL or claim authenticated qualification.

Preparation verification is static review: exact SQL and artifact hashes, dependency/order and fresh-versus-upgrade semantics, no duplicate creation, local-only binding design, provider/scheduler/outbound fail-closed design, fixture provenance, restart assertions, browser handoff compatibility, and a diff limited to separately authorized repository paths.

A separate execution gate becomes reviewable only after the exact SQL hashes, an approved **available** runtime, and a credential method exist. That later gate must independently define containment, application order, database identity checks, evidence capture, and exact recovery; it is not granted here.

## Conclusion

Committed Brain structures and substantial automated specifications exist, but inspection alone cannot establish integration readiness. No code change was necessary for inspection; this report is the only output. Database catalog state, migration application, live PostgreSQL semantics, provider-safe startup, authenticated owner workflow, real elapsed-time behavior, F.I. Forgot browser workflow, external environment, and deployment evidence were unavailable. The precise next step is the single **PREPARATION ONLY** recommendation above, not execution.


## Detailed environment, recovery, and E2E requirements

Root runtime inspection found no PATH commands for psql, postgres, initdb, pg_ctl, pg_dump, pg_restore, Docker, or Podman, and no C:/Program Files/PostgreSQL directory. wsl.exe exists, but no usable PostgreSQL distribution or database was established. Absence from PATH is not proof software exists nowhere. DATABASE_URL was absent from the inspected root process; no catalog or remote secret store was opened. No accessible dedicated test or staging database was established. `.replit` declares PostgreSQL 16 and autoscale deployment, but does not establish provisioned service, production identity, or permission. Production database configuration/status remains unknown. The API deployment artifact declares port 8080, /api, build and Node startup; the frontend artifact declares port 25460, SPA output and proxy (`artifacts/api-server/.replit-artifact/artifact.toml`, `artifacts/fi-forgot/.replit-artifact/artifact.toml`). `scripts/post-merge.sh` installs dependencies and invokes schema push; it was not run.

The recommended target is a proposed new disposable local PostgreSQL 16 instance, not an available approved environment. Dedicated test, staging and production are not authorized fallbacks. Repository rollout documents and SQL headers describe schema application as deferred/unapplied; actual migration status is unknown in every live database.

The prerequisite manifest must enumerate fi_users, personal_recipients.archived_at, recipients.active/archived_at, recipient_profile, recipients_v2, recipient_memory, question_answers.was_skipped/archived_at and edit timestamps, personal_cards, and follow_up_questions. It must include the five initial tables relationship_observation_versions, relationship_observation_heads, relationship_interpretations, relationship_interpretation_dependencies, relationship_interpretation_actions; the six evolving-understanding objects; brain_opportunity_exposure_events; brain_outcome_events; and all temporal/feedback/follow-through tables and receipts. Compare exact types, nullability, defaults, current-head/revision scoping, unique indexes and CHECK constraints, not just table names (`lib/db/src/schema/index.ts`; `lib/db/src/schema/users.ts`; `lib/db/src/schema/personal-recipients.ts`; `lib/db/src/schema/recipients-normalized.ts`; `lib/db/src/schema/recipients-v2.ts`; `lib/db/src/schema/question-answers.ts`; `lib/db/src/schema/personal-cards.ts`; `lib/db/src/schema/follow-up-questions.ts`; `lib/db/src/schema/relationship-understanding.ts`; `lib/db/src/schema/brain-opportunity-exposure-events.ts`; `lib/db/src/schema/brain-outcome-events.ts`; `lib/db/src/schema/opportunity-temporal.ts`; `lib/db/src/schema/opportunity-feedback.ts`; `lib/db/src/schema/opportunity-follow-through.ts`).

The loose SQL cannot initialize a fresh database by itself. Only evolving-understanding DDL wraps itself in BEGIN/COMMIT; the snapshot runner supplies a DML transaction. Other files require reviewed transaction boundaries. IF NOT EXISTS does not prove catalog parity. No complete baseline/journal/down chain was discovered. Fresh bootstrap must use one reviewed full-current baseline without duplicate CREATE TABLE files. Existing upgrade needs an authorized catalog/predecessor first, then reviewed missing prerequisites and named incremental artifacts from section 1. Upgrade safety cannot currently be determined. Optional snapshot DML follows prerequisites with reviewed counts/provenance; an empty fresh database needs no invented legacy history.

### Recovery

For a newly created disposable target, record resolved absolute PGDATA, cluster/database/role identity and port before writes. On failure stop writers, preserve sanitized logs, SQL/schema hashes, fixture IDs and transaction/receipt state; dispose/recreate only the exact target proven created for the run. Never delete or repurpose an unknown database/path.

Any existing-schema upgrade requires separate authority, consistent logical backup plus schema dump, immutable hashes and successful restore into a separately identified rehearsal database before target mutation. Rehearse exact SQL and compare catalog/counts/application reads. Stop on unknown drift, failed restore, destructive SQL, lock-budget breach, ambiguous commit or history loss. Preserve failed-state evidence; recover with reviewed forward correction or restoration into a new verified target. Switching targets requires authority. No down-migration chain was discovered. None of these operations was executed.

A lost response is unknown, not failed/successful. Inspect persisted receipts/transaction state before retrying; exact retries must replay and changed reuse must conflict. Preserve immutable versions, links, actions and receipts through recovery.

### Full qualification matrix

Future fixtures use two synthetic owners A/B and two recipients each, exact source/operation IDs, active/archived/skipped answers, explicit supported dates and deliberately missing identities/times/confidence. Run production repositories against actual PostgreSQL. After each write compare SQL rows/history, HTTP result and authoritative reload; UI limitations remain explicit. Provider mocks never count as delivery, genuine AI quality, authentication, or relationship outcomes.

| Capability | Actual persistence and workflow assertions |
|---|---|
| Memory | Create/read, edit, archive, restore through supported API/UI; compare exact provenance and version/head changes. Exclude archives from active Brain use; preserve history and unknown observation time on restore. |
| Observations | Append v2 linked to v1, atomic head advance, duplicate reads inert, archived/skipped source inactive. Separate recorded/observed/occurred time and preserve missing relationship identity. |
| Interpretations | Pin exact source versions, preserve uncertainty, confirm/withdraw/reject/archive/reverse where supported, retain revisions/actions, revoke endorsement on withdrawal, forbid obsolete retargeting and fact promotion. |
| Hypotheses | Supersede without rewriting old rows, preserve exact observation/interpretation revision links and conflicts. Weak support remains unknown; remove support to retire; genuine renewed support yields a new revival version. Confirmation/disagreement/withdrawal never creates fact. |
| Opportunity creation | Invoke production Brain/Concierge from persisted sources; compare source, owner, recipient, cycle, confidence and provenance plus stored history. Do not assume a standalone Opportunity table or that every computed projection is persisted. |
| Timing/decay | Exercise valid_now, premature, approaching_relevance, stale, expired and unknown; deterministic supported windows, activation, expiry, invalid/missing dates, source withdrawal and genuine renewed support/recurrence. Test applicable none/watch/diminished/exhausted/unknown decay states (`artifacts/api-server/src/brain/temporal/opportunityTemporalTypes.ts`). Clock injection proves deterministic DB behavior, not actual elapsed time. |
| Restraint/cap | Supported but poorly timed Opportunities survive while recommendation is absent/ineligible. Workspace/conversation display at most three original eligible slots; zero/one/two are valid. No automatic backfill, artificial urgency or priority-derived confidence. Preserve legacy six/four limits. |
| Feedback/preferences | Supported scopes/not-before, exact replay, changed-key reuse, stale/concurrent versions, correction/withdrawal and cross-scope denial. Event/receipt atomicity. User preference is distinct from source timing evidence. |
| Follow-through/outcomes | Separate action/outcome versions, correction/withdrawal, outcome-only history and vanished-source correction. Exact owner/recipient/source/family/cycle isolation. Owner report is never external verification; outcome may exist independently of action. |
| Restart/history | Hash/count immutable rows, evidence links, actions and receipts; restart API against same DB and reload browser state. Fresh process reconstructs current/history/replay results from PostgreSQL. |
| Concierge transport | Compare real API JSON, server projection and rendered workspace/conversation. Preserve nulls, ranking, timing, restraint and cap. Account for legitimate reconciliation/exposure writes; do not assume reads never write. |
| Isolation/authentication | Missing/random identity, A against B recipient/history/event/receipt, cross-recipient/cycle and unchanged foreign SQL rows. Known-B-ID spoofing remains a separate failing authentication boundary in current contract; separate browser storage cannot repair it. |

Capture commit/schema/SQL hashes, synthetic source manifest, SQL before/after, sanitized HTTP, supported browser AX/screenshots and all failures/ambiguous receipts. Independent acceptance must evaluate evidence for each claim. Real PostgreSQL, authenticated workflow, migration recovery, external delivery and production behavior remain unqualified; no live qualification was executed.


### File-backed SQL inventory receipt for acceptance

The read-only executable inventory check compared all SQL filenames in the schema folder with the exact five-file expected list and passed. Its SHA-256 output is recorded below. For criterion 4, this report and the five actual SQL files are file-backed evidence. Use `lib/db/src/schema/index.ts` for exported model coverage and this receipt for the complete SQL inventory; no directory path is offered as acceptance evidence. This clarifies traceability only and waives no acceptance assertion.

| Exact repository-relative file | SHA-256 |
|---|---|
| lib/db/src/schema/evolving-understanding-migration.sql | c1afca2067dfbef7e6cc28efdb6a87e9b9f10f5fd68fef875795c170ed7a0339 |
| lib/db/src/schema/opportunity-feedback-migration.sql | 27b2e68f79b22789a577cd7ccf1d8cf8b5696441db9a008ff67641102826aa4a |
| lib/db/src/schema/opportunity-follow-through-migration.sql | 677161b3f3fe4412863db9c0c781a929453a083bdfce8d9216172191302f9a2a |
| lib/db/src/schema/opportunity-temporal-migration.sql | de161698e9492263d66447756ba75c0140137270a09d0bf2beecb1a41795fe99 |
| lib/db/src/schema/versioned-understanding-snapshot.sql | 73dd5725dfc23acc8ce870ca0dd3c3a81a852241365b105e2e4f685dcae82bfd |
