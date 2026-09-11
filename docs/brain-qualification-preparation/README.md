# Brain qualification preparation (no database)

This package is preparation evidence only. It does not prove PostgreSQL persistence, an authenticated boundary, browser workflow, provider delivery, elapsed time, deployment, or production behavior. The preserved historical assessment is `docs/brain-integration-readiness.md`; its bytes must remain identical to the saved source and it says the migrations are unapplied.

## Reviewed inputs and target

`migration-manifest.json` is the sole five-file manifest and records hashes, ordering, dependencies, DDL/DML, transactions, bootstrap/upgrade status, idempotency, rollback, Drizzle parity, and residual risks. SQL hashes use exact repository bytes with LF endings; line-ending conversion is drift and fails admission. Locked installed tooling generated the reviewed offline full-current baseline `bootstrap/0000-current.sql` (SHA-256 `193867eb1a69acb86757ffd2f2340ec02785610be717163170edc855eb9fc7b2`) and schema snapshot (SHA-256 `783146063a548e19a39747672125943bd8a544a97320a4fbac100a7aa92a7d96`). Fresh targets use this baseline only and never duplicate incrementals. Upgrade remains blocked until future predecessor/catalog proof. The approved fixture is `synthetic-fixtures.json`, SHA-256 `0e0df18b78c6e14c126d7f392eb9e101e4f9228f3f89173e646b2f1d0270fac8`. It records birthday offsets separately from production rows. A future operator supplies an explicit synthetic `BRAIN_QUALIFICATION_SYNTHETIC_RUN_DATE=YYYY-MM-DD`; the loader resolves those birthdays relative to it and records the date in restart evidence while leaving observation timestamps null.

The future disposable target is PostgreSQL 16, host `127.0.0.1`, port `55432`, database `fi_forgot_brain_qualification`, least-privilege role `fi_forgot_brain_qualifier`, local cluster-admin role `fi_forgot_brain_cluster_admin`, and PGDATA `C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata`. API is `127.0.0.1:8080`; frontend is `127.0.0.1:25460`. Credentials do not exist and are not stored. A future owner-authorized operator supplies separate admin and app passwords as process-only inputs; the executor constructs strict option-free URLs for the relevant child only and never emits either credential.

Inspect the typed future plan with `pnpm --filter @workspace/scripts brain-qualification:plan`; run the admitted gate with `pnpm --filter @workspace/scripts brain-qualification:verify-no-db`. `--execute` is denied unless the exact token `OWNER-AUTHORIZES-BRAIN-QUALIFICATION-EXECUTION` and every target, PostgreSQL-major, disposable, catalog, hash, and credential gate match. Unknown/pre-existing targets, non-loopback hosts, wrong paths/ports, drift, missing predecessor evidence, and unsafe flags stop the run. The present mission must not use `--execute`.

## Future restart procedure (do not run now)

After separately authorized target creation and reviewed migration selection: record identity/catalog and hashes; load only the approved synthetic fixture; run the full assertion matrix; start the API on 127.0.0.1:8080 with qualification mode; capture sanitized SQL/API evidence; stop it; restart a fresh API process against the same disposable target; rerun persistence, immutable history, receipt replay, and active-state assertions; stop writers; preserve sanitized receipts; and clean up only the exact proven disposable database/cluster. An ambiguous write is unknown: inspect receipts before retry. There is no reviewed down chain. Recreate only the exact target, never an unknown path/database.

Assertions cover observation versions/heads and archive/restore; interpretation dependencies/revisions/actions; hypothesis evidence, null uniqueness, supersession/retirement/revival; temporal unknown/premature/approaching/valid/stale/expired/reactivated states; feedback replay/conflict/correction/withdrawal; separate action/outcome lineage and receipts; original-slot maximum three without backfill; and owner/recipient/cycle filtering. Opportunities are computed production projections, not claimed standalone persisted records. Null time/confidence/identity stays null; source, version, cycle, provenance, correction receipts, and immutable history remain distinct.

## Future Concierge CUA procedure (do not run now)

Use the supported desktop CUA only after safe browser access is separately authorized. Open exactly `http://127.0.0.1:25460/concierge`, the value exported by the production `ROUTE_PATHS.concierge` constant. Use the normal sign-in/session bootstrap only with the future preseeded synthetic owner A and recipients `brain-qual-a-r1`/`brain-qual-a-r2`; this exercises the existing caller-supplied identity contract and does not qualify authentication. Never use real identity/media. Compare AX text and screenshots with sanitized API JSON/server projection. Verify restrained/ineligible original ranked slots do not backfill and zero through three actions are valid. Capture route, fixture/hash, AX tree, screenshot, API projection, server projection, and discrepancies. Fail on another owner/recipient, fabricated null semantics, more than three, backfill, unsupported controls, external navigation, or unsanitized evidence. Hand the evidence bundle to Orchestra2 for independent review. This remains unresolved pending separate DB execution and safe CUA access.

Known-ID impersonation remains possible because current identifiers are caller supplied; repository filtering is tested, authenticated isolation is not qualified. JavaScript guards do not create an OS firewall: DNS, browser extensions/service workers, native processes, and code outside the guarded process remain limitations. Use an OS-denied network sandbox in the future execution mission. Qualification mode disables production route composition, provider eager initialization, Stripe webhook, schedulers, and production API paths; production defaults remain unchanged.

## Verification and independent acceptance

`pnpm --filter @workspace/scripts brain-qualification:verify-no-db` is the single admitted preparation gate. It refuses execution and checks historical bytes, inventory/hashes/order, docs/plan agreement, fixture serialization, installed containment, typed execution admission, production-path regressions, and controlled integration behavior. Scoped typechecks/builds and `git diff --check` remain required. No check may connect, listen, browse, authenticate, start an application workflow, or call a provider/network.

Independent acceptance must inspect every claim against files and executable output, and must explicitly reject synthetic fixtures, mocks, builds, transport checks, or process simulations as proof of real persistence/authenticated workflow. Only after acceptance may the outer controller checkpoint/push under the exact repository/branch/remote/lineage policy; this worker does neither.

Owner outputs: preserved report; manifest; SQL/Drizzle reconciliation; baseline status; residual risks; containment; fixtures; ownership limitation; target specification; credential method; plan commands; restart procedure; Concierge evidence contract; drift-proof verifier; correction/retest evidence; independent acceptance requirement; and future-authorization boundary.

A new explicit owner authorization is required before PostgreSQL installation/start/create/apply/seed, credentials, authenticated browser qualification, provider calls, deployment, or any external mutation.


## Complete executable plan contract

This generated example is compared in full with actual plan-only CLI output, including command order, complete arguments and environment, execution requirements, and limitations. Updating it requires reviewing the changed contract; verification never rewrites it.

<!-- executable-plan:start -->
```json
{
  "mode": "plan-only",
  "target": {
    "postgresMajor": 16,
    "host": "127.0.0.1",
    "port": 55432,
    "database": "fi_forgot_brain_qualification",
    "role": "fi_forgot_brain_qualifier",
    "adminRole": "fi_forgot_brain_cluster_admin",
    "pgdata": "C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata",
    "apiPort": 8080,
    "frontendPort": 25460
  },
  "sql": [
    {
      "file": "evolving-understanding-migration.sql",
      "sha256": "98ed583de6caaaa6b166c24aca291a2a47872bcfa9c49db21d253f2f3a3a7fc2"
    },
    {
      "file": "opportunity-temporal-migration.sql",
      "sha256": "de161698e9492263d66447756ba75c0140137270a09d0bf2beecb1a41795fe99"
    },
    {
      "file": "opportunity-feedback-migration.sql",
      "sha256": "27b2e68f79b22789a577cd7ccf1d8cf8b5696441db9a008ff67641102826aa4a"
    },
    {
      "file": "opportunity-follow-through-migration.sql",
      "sha256": "8bba8e138e6ec56da73d4d24b9ce19087aa70b7aebdd5184c328c649069b462a"
    },
    {
      "file": "versioned-understanding-snapshot.sql",
      "sha256": "73dd5725dfc23acc8ce870ca0dd3c3a81a852241365b105e2e4f685dcae82bfd"
    }
  ],
  "commands": [
    {
      "phase": "initialize-cluster",
      "program": "@qualification/initialize-cluster",
      "args": [
        "C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata",
        "fi_forgot_brain_cluster_admin"
      ],
      "mutates": true
    },
    {
      "phase": "mark-owned-cluster",
      "program": "@qualification/mark-owned-cluster",
      "args": [
        "C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata"
      ],
      "mutates": true
    },
    {
      "phase": "start-postgres",
      "program": "pg_ctl",
      "args": [
        "--pgdata",
        "C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata",
        "--options",
        "-h 127.0.0.1 -p 55432",
        "start"
      ],
      "mutates": true
    },
    {
      "phase": "create-role",
      "program": "@qualification/create-role",
      "args": [
        "fi_forgot_brain_qualifier"
      ],
      "mutates": true
    },
    {
      "phase": "create-database",
      "program": "createdb",
      "args": [
        "--host",
        "127.0.0.1",
        "--port",
        "55432",
        "--username",
        "fi_forgot_brain_cluster_admin",
        "--owner",
        "fi_forgot_brain_qualifier",
        "fi_forgot_brain_qualification"
      ],
      "mutates": true
    },
    {
      "phase": "identity",
      "program": "psql",
      "args": [
        "--host",
        "127.0.0.1",
        "--port",
        "55432",
        "--username",
        "fi_forgot_brain_qualifier",
        "--dbname",
        "fi_forgot_brain_qualification",
        "--no-psqlrc",
        "--tuples-only",
        "--command",
        "select current_database(),current_user,current_setting('server_version_num')"
      ],
      "mutates": false
    },
    {
      "phase": "fresh-baseline",
      "program": "psql",
      "args": [
        "--host",
        "127.0.0.1",
        "--port",
        "55432",
        "--username",
        "fi_forgot_brain_qualifier",
        "--dbname",
        "fi_forgot_brain_qualification",
        "--no-psqlrc",
        "--set",
        "ON_ERROR_STOP=1",
        "--file",
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\docs\\brain-qualification-preparation\\bootstrap\\0000-current.sql"
      ],
      "mutates": true
    },
    {
      "phase": "fixtures",
      "program": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\node_modules\\tsx\\dist\\cli.mjs",
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\src\\brain-qualification\\future-workflow.ts",
        "load",
        "--fixture",
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\docs\\brain-qualification-preparation\\synthetic-fixtures.json"
      ],
      "env": {
        "BRAIN_QUALIFICATION_EXECUTION_ADMITTED": "true",
        "BRAIN_QUALIFICATION_HOST": "127.0.0.1",
        "BRAIN_QUALIFICATION_PORT": "55432",
        "BRAIN_QUALIFICATION_DATABASE": "fi_forgot_brain_qualification",
        "BRAIN_QUALIFICATION_ROLE": "fi_forgot_brain_qualifier",
        "BRAIN_QUALIFICATION_HASHES_VERIFIED": "true",
        "BRAIN_QUALIFICATION_CATALOG_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DISPOSABLE_MARKER_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DURABLE_EVIDENCE_PATH": "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\.orchestra\\qualification\\brain-qualification-durable-evidence.json"
      },
      "mutates": true
    },
    {
      "phase": "start-api",
      "program": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "--enable-source-maps",
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\artifacts\\api-server\\dist\\index.mjs"
      ],
      "env": {
        "BRAIN_QUALIFICATION_EXECUTION_ADMITTED": "true",
        "BRAIN_QUALIFICATION_HOST": "127.0.0.1",
        "BRAIN_QUALIFICATION_PORT": "55432",
        "BRAIN_QUALIFICATION_DATABASE": "fi_forgot_brain_qualification",
        "BRAIN_QUALIFICATION_ROLE": "fi_forgot_brain_qualifier",
        "BRAIN_QUALIFICATION_HASHES_VERIFIED": "true",
        "BRAIN_QUALIFICATION_CATALOG_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DISPOSABLE_MARKER_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DURABLE_EVIDENCE_PATH": "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\.orchestra\\qualification\\brain-qualification-durable-evidence.json",
        "BRAIN_QUALIFICATION_MODE": "true",
        "HOST": "127.0.0.1",
        "PORT": "8080"
      },
      "mutates": true,
      "process": "capture"
    },
    {
      "phase": "wait-api",
      "program": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\node_modules\\tsx\\dist\\cli.mjs",
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\src\\brain-qualification\\wait-api.ts"
      ],
      "env": {
        "BRAIN_QUALIFICATION_EXECUTION_ADMITTED": "true",
        "BRAIN_QUALIFICATION_HOST": "127.0.0.1",
        "BRAIN_QUALIFICATION_PORT": "55432",
        "BRAIN_QUALIFICATION_DATABASE": "fi_forgot_brain_qualification",
        "BRAIN_QUALIFICATION_ROLE": "fi_forgot_brain_qualifier",
        "BRAIN_QUALIFICATION_HASHES_VERIFIED": "true",
        "BRAIN_QUALIFICATION_CATALOG_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DISPOSABLE_MARKER_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DURABLE_EVIDENCE_PATH": "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\.orchestra\\qualification\\brain-qualification-durable-evidence.json"
      },
      "mutates": false
    },
    {
      "phase": "assert",
      "program": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\node_modules\\tsx\\dist\\cli.mjs",
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\src\\brain-qualification\\future-workflow.ts",
        "assert"
      ],
      "env": {
        "BRAIN_QUALIFICATION_EXECUTION_ADMITTED": "true",
        "BRAIN_QUALIFICATION_HOST": "127.0.0.1",
        "BRAIN_QUALIFICATION_PORT": "55432",
        "BRAIN_QUALIFICATION_DATABASE": "fi_forgot_brain_qualification",
        "BRAIN_QUALIFICATION_ROLE": "fi_forgot_brain_qualifier",
        "BRAIN_QUALIFICATION_HASHES_VERIFIED": "true",
        "BRAIN_QUALIFICATION_CATALOG_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DISPOSABLE_MARKER_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DURABLE_EVIDENCE_PATH": "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\.orchestra\\qualification\\brain-qualification-durable-evidence.json"
      },
      "mutates": true
    },
    {
      "phase": "stop-api",
      "program": "@captured-api",
      "args": [],
      "mutates": true,
      "process": "stop-captured"
    },
    {
      "phase": "restart-api",
      "program": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "--enable-source-maps",
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\artifacts\\api-server\\dist\\index.mjs"
      ],
      "env": {
        "BRAIN_QUALIFICATION_EXECUTION_ADMITTED": "true",
        "BRAIN_QUALIFICATION_HOST": "127.0.0.1",
        "BRAIN_QUALIFICATION_PORT": "55432",
        "BRAIN_QUALIFICATION_DATABASE": "fi_forgot_brain_qualification",
        "BRAIN_QUALIFICATION_ROLE": "fi_forgot_brain_qualifier",
        "BRAIN_QUALIFICATION_HASHES_VERIFIED": "true",
        "BRAIN_QUALIFICATION_CATALOG_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DISPOSABLE_MARKER_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DURABLE_EVIDENCE_PATH": "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\.orchestra\\qualification\\brain-qualification-durable-evidence.json",
        "BRAIN_QUALIFICATION_MODE": "true",
        "HOST": "127.0.0.1",
        "PORT": "8080"
      },
      "mutates": true,
      "process": "capture"
    },
    {
      "phase": "wait-api-after-restart",
      "program": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\node_modules\\tsx\\dist\\cli.mjs",
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\src\\brain-qualification\\wait-api.ts"
      ],
      "env": {
        "BRAIN_QUALIFICATION_EXECUTION_ADMITTED": "true",
        "BRAIN_QUALIFICATION_HOST": "127.0.0.1",
        "BRAIN_QUALIFICATION_PORT": "55432",
        "BRAIN_QUALIFICATION_DATABASE": "fi_forgot_brain_qualification",
        "BRAIN_QUALIFICATION_ROLE": "fi_forgot_brain_qualifier",
        "BRAIN_QUALIFICATION_HASHES_VERIFIED": "true",
        "BRAIN_QUALIFICATION_CATALOG_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DISPOSABLE_MARKER_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DURABLE_EVIDENCE_PATH": "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\.orchestra\\qualification\\brain-qualification-durable-evidence.json"
      },
      "mutates": false
    },
    {
      "phase": "assert-after-restart",
      "program": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\node_modules\\tsx\\dist\\cli.mjs",
        "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\scripts\\src\\brain-qualification\\future-workflow.ts",
        "assert",
        "--after-restart"
      ],
      "env": {
        "BRAIN_QUALIFICATION_EXECUTION_ADMITTED": "true",
        "BRAIN_QUALIFICATION_HOST": "127.0.0.1",
        "BRAIN_QUALIFICATION_PORT": "55432",
        "BRAIN_QUALIFICATION_DATABASE": "fi_forgot_brain_qualification",
        "BRAIN_QUALIFICATION_ROLE": "fi_forgot_brain_qualifier",
        "BRAIN_QUALIFICATION_HASHES_VERIFIED": "true",
        "BRAIN_QUALIFICATION_CATALOG_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DISPOSABLE_MARKER_VERIFIED": "true",
        "BRAIN_QUALIFICATION_DURABLE_EVIDENCE_PATH": "C:\\Users\\James.Massaro\\Projects\\fi-forgot\\.orchestra\\qualification\\brain-qualification-durable-evidence.json"
      },
      "mutates": false
    },
    {
      "phase": "stop-api-final",
      "program": "@captured-api",
      "args": [],
      "mutates": true,
      "process": "stop-captured"
    },
    {
      "phase": "stop-postgres",
      "program": "pg_ctl",
      "args": [
        "--pgdata",
        "C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata",
        "stop"
      ],
      "mutates": true
    }
  ],
  "executionRequirements": {
    "authorization": "OWNER-AUTHORIZES-BRAIN-QUALIFICATION-EXECUTION",
    "host": "127.0.0.1",
    "port": 55432,
    "database": "fi_forgot_brain_qualification",
    "role": "fi_forgot_brain_qualifier",
    "pgdata": "C:/Users/James.Massaro/Projects/fi-forgot/.orchestra/qualification/fi-forgot-brain-qualification-pgdata",
    "postgresMajor": 16,
    "disposable": true,
    "catalogApproved": true,
    "hashesApproved": true,
    "credentialEnv": "PGPASSWORD",
    "osBoundary": "reviewed-loopback-only"
  },
  "syntheticDateRequirement": "An explicit valid YYYY-MM-DD synthetic run date is required and recorded in restart evidence.",
  "limitations": [
    "Preparation only: PostgreSQL creation, migration and fixture execution require separate owner authorization.",
    "Fresh baseline only; existing-schema upgrade requires actual predecessor and catalog evidence.",
    "OS containment and process-only credentials must be independently established before execution.",
    "Caller-supplied identifiers do not establish authenticated isolation.",
    "Offline substitutes do not prove PostgreSQL persistence, recovery, browser behavior or external delivery.",
    "Recovery may remove only the independently verified disposable target; no reviewed down migration exists."
  ]
}
```
<!-- executable-plan:end -->

The no-database test launcher uses the already installed TypeScript compiler and native Node module hooks. It does not override OS identity or privilege APIs and writes no transpilation cache. The original serialized-consumer child command has an exact-argument compatibility adapter to the same compiler; other legacy child invocations fail closed. Original assertions remain unchanged. Production startup and future database execution do not use this test loader.
