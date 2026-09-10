# Relationship Opportunity Concierge verification

## Implementation scope

This bounded transition adds a typed, server-owned `RelationshipOpportunity` to `GET /api/v2/concierge`. The server derives each Opportunity from the existing Brain execution selected by the unchanged attention planner and fatigue pipeline. Existing recommendation and insight arrays remain compatibility projections; they are not an independent intelligence source.

The Opportunity contract keeps presentation, evidence, confidence, provenance, identity, timing, recommendation, and restraint distinct. Brain confidence is copied only when it is a finite value. The current loader's `relationshipId` is a recipient alias, so it is not copied into the Opportunity; genuine relationship identity can enter only through the explicit provenance-bearing identity input and otherwise remains `null`. Missing evidence IDs and observation time remain `null`; response generation and context-load times are not reused as observation times. Contributor signals are classified conservatively, and unclassified or derived signals are observations rather than direct facts. Existing `show_dashboard_insight` action behavior is preserved. Brain `wait`/`do_nothing` results are represented as restrained Opportunities with a null recommendation without entering legacy recommendation or insight projections.

The frontend mirrors and maps the Opportunity without semantic renaming. Server-owned presentation policy marks only the first three ranked actionable Opportunities as recommendation-eligible while retaining six Opportunities and six legacy insight/recommendation compatibility projections. Workspace and conversation consumers require both presentation eligibility and a non-null recommendation, so cap-suppressed Opportunities remain actionable intelligence without becoming displayed actions; Brain restraint remains a separate state with a null recommendation. When the feature flag selects the legacy loader, both consumers retain the legacy recommendation fallback because that path intentionally has no Opportunity payload. The legacy recommendation adapter no longer maps priority into a field named confidence.

Attention selection, ordering, fatigue/exposure orchestration, route, copy, links, feature flags, and rollback configuration were not changed. The correction restores the established presentation split: up to six compatibility insight/recommendation projections remain available while only three Opportunity actions are eligible for workspace and conversation presentation.

## Automated evidence

- Static: frontend TypeScript (`node node_modules/typescript/lib/tsc.js -p artifacts/fi-forgot/tsconfig.json --noEmit`) passed.
- Static: API server TypeScript (`node node_modules/typescript/lib/tsc.js -p artifacts/api-server/tsconfig.json --noEmit --disableSourceOfProjectReferenceRedirect false`) passed.
- Focused coverage added: `relationship-opportunity-contract.test.ts`, `relationship-opportunity-concierge-serialization.test.ts`, `map-relationship-opportunity-view-model.test.ts`, and `concierge-opportunity-conversation.test.ts`. The serialization integration invokes the actual server workspace builder, performs a complete JSON round trip, and launches the actual frontend mapper/conversation consumer with the serialized payload.
- Existing Concierge mapping/workspace tests were updated for the additive `opportunities` field.
- The deterministic serialization integration now exercises seven actionable Brain executions plus one restrained execution through the real workspace builder, complete JSON serialization, actual frontend mapper, conversation consumer, and workspace presentation selector. It asserts six insight/recommendation compatibility projections, exactly three displayed actions, no restrained action, and preserved identity/confidence semantics.
- Full unit, integration, attention-regression, and build execution could not be completed in this worker environment. The installed `tsx` runner failed before loading test code because Node `uv_os_get_passwd` returned `ENOMEM`. Installed Vite/esbuild and the API build failed before compilation because the managed execution sandbox denied the native esbuild process access to repository paths. The outer verifier can execute these same repository-local commands and owns their admission.

These environment failures are not represented as passing evidence. Independent verification and checkpointing remain owned by the outer Orchestra controller.

## Repository and checkpoint state

Only authorized Concierge/Brain product code, authorized tests, the Concierge route, and this report were changed. No `.orchestra` state, authority/frozen document, manifest, lockfile, dependency, or unrelated file was modified or staged. This worker did not commit, checkpoint, push, or deploy.

## Deferred qualification

Live authenticated Concierge qualification remains outstanding and is explicitly outside this objective. Fixtures, JSON serialization tests, static checks, and builds do not establish live authenticated qualification.

## Owner decisions

No genuine owner decision arose.
