# Relationship memory implementation verification

The relationship timeline and Brain recipient context now consume one server-owned evidence projection over the existing `question_answers`, `personal_cards`, and recipient profile date records. The legacy Brain inventory is only a compatibility view derived from that projection, not a second semantic assembler. The projection preserves source IDs and grouped membership, distinguishes generated, known user-edited, and unknown-provenance card text from later mailing activity, and keeps recorded/activity/occurrence/observation time separate. Edit/archive/restore restrict supported answer kinds and require a returned row; the UI confirms every mutation and reloads authoritative state. A confirmed write followed by reload failure is reported as an ambiguous current view, never as an unchanged database state or successful completed interaction. Mutation feedback is separate from initial-load failure, so rejected or unconfirmed changes retain the current rows, controls, and open editor.

## Automated evidence

- Static: API and frontend TypeScript checks.
- Unit: `relationship-memory-evidence.test.ts` and `relationship-memory-timeline.test.ts`.
- Integration: `relationship-memory-lifecycle.test.ts` executes the same injectable lifecycle operation used by the Drizzle-backed routes against an owned in-memory repository. It covers edit/reload, archive/active-evidence exclusion, restore/reappearance, duplicate transitions, unsupported and missing IDs, ownership denial, and unchanged rejected state.
- Frontend unit/integration seam: `relationship-memory-timeline.test.ts` executes the production mutation/reload operation for confirmed success, failed writes with authoritative recovery, lost responses, failed reloads, restore, and single-attempt mutation behavior. Those outcomes pass through the same production state applicator used by all three hook mutations before the production view is rendered, verifying confirmed-only closing/analytics and retained reports, controls, or editor on failure.
- Build: the frontend package build is recorded as executed. API-server build evidence remains pending outer verification and is not claimed here.

Final command results and checkpoint state are recorded by the outer Orchestra controller after independent verification. No schema, dependency, or replacement store was added.

## Limitation

Real authenticated owner-visible qualification remains outstanding and explicitly deferred. Fixture tests, reload simulations, static checks, and builds do not prove the real authenticated owner workflow. No authenticated-route harness is currently claimed.
