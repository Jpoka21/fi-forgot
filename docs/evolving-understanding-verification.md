# Evolving understanding implementation verification

## Implemented boundary

The initial server-owned Brain family is `explicit-recipient-communication-preference` policy version 3. It accepts only complete clauses in a finite recipient-scoped preference grammar from current user reports or exact active interpretation revisions. It abstains on incidental channel words, hypotheticals, quotations, other people, generated content, and unclassified sources. It does not infer personality, emotion, intent, permanence, or a recommendation. Confidence remains null because the rule is not a calibrated probability; the UI reports independent evidence support, conflict, and uncertainty separately.

Observation versions are deduplicated before judgment. An interpretation may contribute language but cannot count its underlying observation again. Exact observation-version and interpretation identity/revision links are stored. Interpretation revision snapshots begin only when this schema is deployed. A pre-existing interpretation captures only its actual current revision, with honest capture time; no earlier revisions are fabricated. Lifecycle snapshots use the actual returned state, including explicit nulls that clear endorsement.

Hypothesis identities are scoped by user, recipient, family, and subject. Versions are immutable and current heads use compare-and-swap updates inside the existing scoped serializable transaction and advisory lock. Source mutations recompute before commit; unchanged evidence is inert. Conflict and negative-only unknown remain explicit evidence states; absence of matching valid evidence retires the head. Revival requires a source-and-content signature never previously consumed as support, so restoring an old version or repeating old text cannot revive it. Retired, invalid-source, disagreed, and withdrawn hypotheses do not enter active Brain context. User actions are idempotent only when operation ID, scope, hypothesis, action, and expected revision match. Each action records the exact hypothesis version and effective response state. Confirmation is revocable, version-bound endorsement and never promotes a hypothesis to fact or creates confidence. Disagreement and withdrawal suppress authority across successors. Deliberate reversal validates current evidence and clears suppression to an unendorsed state; it never silently confirms. Hypotheses do not feed recommendation selection.

## Schema rollout, not yet authorized or performed

1. Review `lib/db/src/schema/evolving-understanding-migration.sql` against the Drizzle definitions. It is the exact six-table DDL reference and intentionally performs no historical backfill.
2. With separately authorized target-database access, set `DATABASE_URL` and run `pnpm --filter @workspace/db push` from the repository root. Review the generated Drizzle plan before approving it. Never use `push-force` automatically.
3. Run the six `\\d` verification commands listed at the bottom of the SQL reference, then query `select count(*)` from each new table; all counts must initially be zero.
4. To test rollback before production approval, apply the migration to a disposable database and run `DROP TABLE relationship_hypothesis_actions,relationship_hypothesis_evidence,relationship_hypothesis_heads,relationship_hypothesis_versions,relationship_hypotheses,relationship_interpretation_revisions;` inside an explicit transaction, then roll it back and confirm all six tables remain.
5. Run the focused static, unit, controlled relational integration, frontend transport, regression, and build commands against the intended artifact.
6. Separately qualify concurrent CAS behavior on live PostgreSQL and the authenticated owner-visible workflow.

Live schema application, deployment, live PostgreSQL concurrency proof, and authenticated owner workflow qualification remain outstanding. Controlled fixtures, typechecks, tests, builds, transport checks, and reload checks must not be described as those live qualifications.

## Verification record

Implementation verification is recorded by the outer controller from the repository-local locked commands. The legacy root `typecheck:libs` currently reports pre-existing errors under the excluded embedded `lib/orchestra-execution`; API and frontend package typechecks are the scoped static checks. No dependency, lockfile, authority, `.orchestra`, deployment, commit, or push change belongs to this worker diff.

The bounded grammar accepts whole statements such as “They prefer a phone call,” “Email works well for them,” and “They do not like phone calls.” It can retain both polarities across complete supported clauses. An unsupported clause, quotation, conditional, attribution, or unrelated text causes abstention on that evidence item. This intentionally favors missed hypotheses over unsupported relationship claims; it is not a general natural-language preference extractor.
