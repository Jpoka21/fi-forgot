# Opportunity feedback vertical slice

## Contract

Feedback is explicit interaction-preference evidence only. It never becomes relationship truth, Opportunity evidence, outcome proof, confidence, memory, a hypothesis, or an observation timestamp. Receipt time is server time.

The nine types are: `helpful` (positive qualitative signal), `not_helpful` (restrain this occurrence), `not_now` (defer, optionally to a user-entered date), `too_early` (qualitative premature signal, optionally with a user-entered date), `too_late` (restrain the occurrence), `already_handled` (owner report that suppresses but does not prove action), `do_not_remind` (explicit suppression), `more_often` (cadence preference that cannot create eligibility), and `less_often` (additional restraint).

The default scope is owner + recipient + Opportunity + occurrence cycle. The UI labels the optional recipient-and-Opportunity-family choice; the server keeps it owner-and-recipient scoped even when relationship identity is unknown, and resolves the truthful product family from the server rule identity (for example, birthday rather than the broad temporal class `annual_recurring`). Missing relationship identity remains null. No global scope exists.

An optional `YYYY-MM-DD` not-before value is accepted only for `not_now` or `too_early`, labeled `user_not_before`, and otherwise timing remains `qualitative`. The system invents no offset, score, urgency, date, or relationship inference.

## Persistence and concurrency

`opportunity_feedback_events` is append-only. Rows retain server-resolved identity, provenance, server receipt time, lineage/version, supersession, withdrawal target, scope, and event activity. `(lineage_id, version)` gives deterministic optimistic concurrency. Append-only `opportunity_feedback_receipts` records the owner/key request fingerprint and response: an exact replay returns the original response, changed payload reuse conflicts, and an equal semantic request under a new key records only a receipt rather than another preference version. A stale state-changing request or concurrent unique collision returns 409; a semantically equal request is inert and records only its replay receipt. Withdrawal appends a new inactive lineage head, so it neither deletes history nor revives superseded rows.

Every read/mutation requires `x-user-id`; the handler checks active recipient ownership. New feedback resolves Opportunity, cycle, family and identity from the server workspace; withdrawal resolves owned historical feedback without depending on current Opportunity existence. Feedback never supplies or rewrites Opportunity evidence. Unknown fields and hostile identity/evidence/snapshot payloads are rejected.

Active feedback is loaded before projection and fatigue exposure accounting. Load failure suppresses presentation with `feedback_history_unavailable`. Suppressed Opportunities stay in `opportunities`; a dedicated ownership-checked history read preserves the legacy workspace projection and makes historical lineages withdrawable even when an Opportunity disappears or changes cycle. The UI reduces each lineage to its latest version, retains one request key across uncertain retries, and reloads rather than claiming a failed response proves no write occurred. No passive click, dismissal, ignored card, exposure, inactivity, or outcome event enters this repository.

## Verification and rollout boundary

Focused files: `opportunity-feedback.test.ts` (semantics/isolation/withdrawal), `opportunity-feedback-integration.test.ts` (production PostgreSQL adapter with filtered relational constraints, the injected production route service, replay mismatch, equal-repeat, stale/concurrent conflicts, ownership, hostile input, disappeared-source withdrawal, read/write failure, builder reload, and truth invariants), and `opportunity-feedback-controls.test.ts` (invoked transport, active reducer, modest controls, stable retry, retained reversal, and truthful uncertainty). Typechecks and both application builds are implementation evidence only. Controlled fixtures are integration evidence, not real owner-workflow evidence.

The SQL migration is deliberately unapplied. Schema application, deployment, live database qualification, and a live authenticated owned-recipient browser workflow are deferred. Honest live qualification requires a deployed target, applied migration, durable database, authenticated owner and owned recipient, plus supported authorized browser controls.




The integration suite uses the real Drizzle adapter and generated SQL through the existing controlled PostgreSQL protocol fixture. Fixture transactions are serialized; this does not qualify live database concurrency. It additionally exercises production workspace reloads for all nine feedback types, immutable evidence/confidence, explicit dated deferral, historical replay after source loss, transaction rollback, wrapped PostgreSQL unique conflicts, and recipient/family isolation across future cycles. Client tests invoke the actual HTTP transport and render the actual Concierge panel, including reversal without a current Opportunity. Uncertain retries preserve the entire original request even when a reload advances the visible version.

Broader recipient-and-family scope is an explicit control offered only for do_not_remind, more_often, and less_often. Helpful/not-helpful, not-now, too-early/late, and already-handled responses stay occurrence-specific; the server rejects attempts to generalize them. A frequency preference remains explainable and qualitative and never creates eligibility or overrides temporal restraint.

