# Versioned understanding implementation verification

This implementation adds immutable observation versions and explicitly uncertain, user-authored interpretations pinned to exact observation-version IDs. Confirmation is a revocable endorsement, not objective verification or fact promotion. Withdrawal, rejection, archive, supersession, and invalid dependencies exclude understanding from active Brain and Concierge recipient context while retaining history. Reversal never silently restores endorsement.

## Schema rollout remains outstanding

No live schema application was run. With separately authorized target-database access, set `DATABASE_URL` and run `pnpm --filter @workspace/db push` from the repository root. Review the generated plan and verify the five new tables: observation versions, observation heads, interpretations, interpretation dependencies, and interpretation actions, including their unique constraints. Never use the force variant automatically.

An optional bulk capture uses only installed repository tooling:

`node scripts/node_modules/tsx/dist/cli.mjs lib/db/src/schema/run-understanding-snapshot.ts --apply`

The runner wraps `versioned-understanding-snapshot.sql` in a transaction. Invoking it without `--apply` accesses no database. Normal scoped timeline/Brain reads also capture previously unversioned current answers transactionally, so answers created by existing producers have an honest entry point. Capture time is recorded separately from unknown observation/occurrence time, and genuine source creation time remains in provenance. No earlier edits are reconstructed. Schema application, bulk capture, deployment, and live qualification remain outstanding.

## Implemented semantics

Observation content and state at each revision are immutable. A successor and the scoped current-version pointer establish effective supersession. The canonical history projection returns `stateAtRevision` separately from effective `lifecycleState`; an old revision can therefore be displayed as superseded without altering the evidence of its original state. Current Brain reads use a consistent transaction snapshot and the same current-version projection.

Interpretations are explicitly user-authored possibilities pinned to exact observation versions. The creation boundary rejects client confidence and relationship-identity claims; both remain unknown here. Confirmation is an endorsement, never fact promotion. Current interpretation state is a projection with an incrementing revision; create/confirm/withdraw/reject/archive/restore actions preserve actor, action time, operation identity, revision transition, and endorsement history. Reversal does not revive prior endorsement, and obsolete source versions cannot be silently retargeted or endorsed.

Production handlers share scoped serializable transactions, source/head compare-and-swap, and response publication after commit. Timeline mutations correlate the exact operation after reload. They never retry ambiguous writes automatically or accept an older same-text interpretation/prior endorsement as proof of a new action.

## Automated evidence

The three focused tests exercise canonical immutable-history projections; the real production handlers and Drizzle adapter over a controlled PostgreSQL-protocol fixture; and production frontend operation helpers, actual transport, reload outcomes, and rendered controls/history. The database fixture tests relational query operations rather than reimplementing the understanding domain. It verifies emitted scoped SQL, transaction ordering, and rollback across compatibility answers, observation versions, and heads. It does not establish real PostgreSQL locking or live deployment behavior.

Orchestra runs 18 admitted commands: these focused tests, existing source-backed memory/recipient-context/Opportunity/Concierge/attention/fatigue regressions, both package typechecks, both builds, and `git diff --check`. Final command and independent acceptance receipts remain in the local Orchestra state; runtime state is excluded from Git.

## Qualification boundary

Static checks, unit tests, controlled adapter-backed transaction integration, and builds qualify implementation behavior only. They are not live PostgreSQL evidence, deployment evidence, or proof of a real authenticated owner workflow. Live schema application, deployment, and authenticated create/edit/archive/restore/confirm/withdraw/reject/reversal qualification remain outstanding and require separately authorized access.
