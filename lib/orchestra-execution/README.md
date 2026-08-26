# @workspace/orchestra-execution

Thin Orchestra execution-provider package. Orchestra owns governance and assignment identity. This package supplies replaceable transport through the official Cursor SDK and official Codex App Server.

This is **not** constitutional Domain 3 runtime and **not** Product Brain.

## Purpose

Connect one bounded Orchestra assignment to an official execution provider, then judge the run from independent filesystem, Git, and hook evidence.

## Non-authoritative provider boundary

Cursor `agentId`, `runId`, request ids, Jsonl store contents, and assistant prose are correlation evidence only. They do not define:

- the current frozen requirement
- whether an assignment is lawful
- whether work passed
- whether commit or push is authorized
- which HEAD is authoritative

Those remain Orchestra facts. Provider `finished` is not Orchestra PASS.

The same boundary applies to Codex `thread.id`, `turn.id`, streamed telemetry, structured technical results, and `finalResponse`. Codex prose remains untrusted even when it is formatted as JSON.

## Codex provider (promoted default)

`ACTIVE_EXECUTION_PROVIDER_ID` is `codex` (ORCH IMP 042.2). `FALLBACK_EXECUTION_PROVIDER_ID` remains `cursor`. Resolve the default with `resolveActiveExecutionProvider()` or omit `provider`/`providerId` on governed routes. Pass `providerId: "cursor"` or an explicit `CursorExecutionProvider` for fallback. Do not rely on environment variables for routine provider selection.

`CodexExecutionProvider` uses the official Codex App Server JSON-RPC protocol through the exactly pinned `@openai/codex` runtime. Mode is assignment-derived when `mode` is omitted: non-empty `allowedPaths` → `governed-workspace-write`; otherwise read-only.

Governed Codex workspace-write runs in an isolated candidate workspace. Candidate application onto the governed tree is permitted only when the clean baseline gate holds: no dirty paths inside the assignment's `allowedPaths` (protected-path-only dirt is tolerated so intentional protected unrelated dirt does not permanently block Codex). Unqualified dirty same-tree state fails closed with `codex_workspace_write_baseline_unavailable` before App Server launch. There is no silent Cursor fallback.

Read-only Codex turns use:

- thread sandbox: `read-only`
- turn sandbox policy: `readOnly`
- approval policy: `never`

Workspace-write turns use `workspaceWrite` with Orchestra Git-evidence scope enforcement. Commit and push authorization remain false; `requireNoPush` remains true.

## Assignment objects

`createAssignment()` builds an immutable assignment and a SHA-256 hash of its canonical JSON. The provider receives that exact assignment. If the object is mutated, the hash no longer matches and submit is rejected.

This slice supports roles `executor` and `verifier`. Planner UI is not implemented.

## Protected-path projection

`projectCursorHookPolicy()` writes provider-specific Cursor project hooks into the **target execution repository**:

- `.cursor/hooks.json`
- `.cursor/hooks/orchestra-policy.json`
- `.cursor/hooks/orchestra-guard.mjs`
- `.cursor/hooks/invocations.ndjson`

Those files are a projection, not Orchestra authoritative state. This package refuses to install hooks into the real F.I. Forgot repository.

## Evidence

For every adapter run:

1. Collect Git evidence before the run.
2. Deliver the assignment through the provider.
3. Collect Git evidence after the run.
4. Read hook denial records.
5. Synthesize a technical execution result.

Do not trust the assistant's textual answer as the sole truth.

## Authoritative engineering store

IMP 034 adds a file-backed Orchestra **engineering** store inside this package. It is not constitutional Domain 3 authority and not Product Brain.

Preferred governed flow:

1. `createAssignment()` — freeze the assignment and hash it.
2. `createFileEngineeringStore(storeRoot)` — store root must be outside F.I. Forgot.
3. `store.persistFrozenAssignment(frozen)` — durable, append-only identity.
4. `dispatchFrozenAssignment({ store, provider, assignmentId })` — reload and validate from disk, then dispatch that exact frozen assignment.
5. Execution evidence is persisted separately. Verification posture remains `pending`.

Do not dispatch an assignment that was never persisted. Historical assignment and evidence files are exclusive-create; they cannot be silently overwritten. Status and audit are append-only NDJSON.

Provider session/run ids remain correlators. The store does not mark work verified, approved, or closed.

## Verifier assignment preparation

IMP 035 derives a bounded vendor-neutral **verifier** assignment from persisted executor `FrozenAssignment` and `ExecutionEvidence`. It does not dispatch a provider and does not decide PASS or FAIL.

Inputs:

- `executorAssignmentId`
- `executionEvidenceId` (required; no latest-by-timestamp guess)

Both records are reloaded from the engineering store. Provider prose is not authority.

Human authorization:

- `prepareVerifierAssignment` returns a candidate only.
- `authorizeAndFreezeVerifierAssignment({ humanAuthorized: true })` persists the verifier.
- Executor completion, evidence existence, provider `finished`, and verification-pending do not freeze a verifier.

The persisted verifier:

- role `verifier`
- `verifiesAssignmentId` = executor assignment id
- `verifiesExecutionEvidenceId` = execution evidence id
- read-only: empty write scope, original protected paths retained, `commitAuthorization: false`, `pushAuthorization: false`, `requireNoPush: true`
- inspection baseline from persisted post-run Git HEAD/branch

Technical execution verdict is copied into the verifier instruction as **input only**. It is not converted into a verification decision.

Refused as not reviewable: provider failure, baseline mismatch (provider never started), and incomplete evidence. Repository-state violation and policy denial remain reviewable and are included in the instruction.

`findVerifierAssignments(store, executorAssignmentId, executionEvidenceId?)` lists persisted verifier records.

`humanAuthority: "explicit_human"` on a `FrozenAssignmentRecord` is an IMP 034 schema constant. It does **not** prove the IMP 035 authorization gate. Governed authorization is an append-only `verifier_authorization_receipt` written only by `authorizeAndFreezeVerifierAssignment`, bound to the exact verifier assignment id and hash.

## Governed verifier dispatch

IMP 036 dispatches one already prepared and explicitly human-authorized verifier assignment through the closed execution adapter, then persists verifier `ExecutionEvidence`.

Preferred governed flow:

1. `prepareVerifierAssignment` — candidate only.
2. `authorizeAndFreezeVerifierAssignment({ humanAuthorized: true })` — persist verifier and authorization receipt.
3. `dispatchGovernedVerifierAssignment({ store, provider, verifierAssignmentId })` — eligibility, then closed adapter dispatch.

Dispatch eligibility requires all of:

- trusted load of a `role: verifier` assignment
- valid governed authorization receipt for that exact assignment id and hash
- `verifiesAssignmentId` / `verifiesExecutionEvidenceId` linkage to a trusted executor assignment and the selected executor evidence
- read-only policy: empty `allowedPaths`, `commitAuthorization: false`, `pushAuthorization: false`, `requireNoPush: true`
- protected paths coherent with the executor
- current repository branch and HEAD matching the frozen verifier baseline (post-executor Git evidence)

A homemade verifier persisted only through `persistFrozenAssignment` is not dispatch-eligible. `dispatchFrozenAssignment` refuses `role: verifier` unless the governed path has already validated eligibility.

Duplicate dispatch reuses existing verifier execution evidence and does not start another provider run.

## Programmatic verifier routing

IMP 036G closes the routing gap between governed verifier authorization and the active Cursor execution provider.

Preferred governed flow:

1. `prepareVerifierAssignment` — candidate only.
2. `authorizeAndFreezeVerifierAssignment({ humanAuthorized: true })` — persist verifier and authorization receipt.
3. `routeGovernedVerifierAssignment({ store, verifierAssignmentId })` — resolve the active provider, run closed eligibility, dispatch the exact frozen verifier through the provider API, persist verifier `ExecutionEvidence`.

`routeGovernedVerifierAssignment` wraps `dispatchGovernedVerifierAssignment` with explicit active provider resolution. The frozen verifier assignment is delivered programmatically through `ExecutionProvider.submitAssignment`. No Cursor chat paste or manual assignment transport is required.

`ACTIVE_EXECUTION_PROVIDER_ID` is `codex`. Cursor remains available as `FALLBACK_EXECUTION_PROVIDER_ID` / `providerId: "cursor"`. Pass an explicit `ExecutionProvider` instance to inject a test double or specialized transport.

F.I. Forgot modifying execution remains refused. Governed read-only verifier assignments may execute against F.I. Forgot only after `dispatchGovernedVerifierAssignment` establishes an internal, non-forgeable execution capability proving governed authorization and eligibility. Assignment shape alone is insufficient. Hook projection is skipped on F.I. Forgot because this slice refuses to install new Cursor hooks into the real repository; read-only enforcement relies on assignment policy, independent Git evidence, and any existing project hooks.

This slice does **not**:

- persist PASS, FAIL, verified, approved, closed, or correction-required
- generate a correction assignment
- select the next implementation requirement
- commit or push
- treat provider prose or the verifier technical verdict as a verification decision

Future step: a separately authorized sprint may consume persisted verifier evidence and decide what, if anything, becomes an authoritative verification outcome. IMP 036 ends after verifier execution evidence is persisted.

## Semantic verification decision

IMP 037 adjudicates persisted verifier `ExecutionEvidence` from the authoritative engineering store. It does not invoke providers, rerun verifiers, or trust provider prose.

Preferred governed flow:

1. `prepareVerifierAssignment` — candidate only.
2. `authorizeAndFreezeVerifierAssignment({ humanAuthorized: true })` — persist verifier and authorization receipt.
3. `routeGovernedVerifierAssignment({ store, verifierAssignmentId })` — programmatic verifier execution and evidence persistence.
4. `adjudicateVerifierExecution({ store, verifierAssignmentId })` — machine semantic decision from trusted records only.

Semantic vocabulary:

- `VERIFIED`
- `CORRECTION_REQUIRED`
- `INDETERMINATE`

Decisions persist as append-only hashed `verification_decision` records bound to exact verifier assignment id/hash and verifier execution evidence id. Duplicate adjudication of the same evidence reuses the existing record. Provider prose and technical execution verdicts are inputs only; they do not directly become semantic decisions.

Structured verifier events are captured as **provider proposals** only via `captureVerifierSemanticProposalsFromEvidence`. Orchestra promotes authoritative findings through `resolveVerifierSemanticFindings` using verification modes:

- `MACHINE_EVIDENCE` — resolved from trusted machine evidence
- `ACCEPTANCE_CHECK` — resolved from frozen Orchestra-evaluated acceptance checks
- `HUMAN_JUDGMENT_REQUIRED` — remains unresolved (`INDETERMINATE`) without a governed human decision

Provider consensus and existence-only evidence references never establish `requirement_satisfied`.

This slice does **not**:

- generate a correction assignment
- select the next implementation requirement
- commit or push
- continue workflow automatically

Human final authority remains outside automatic continuation. James adjudicates only where ambiguity or major governed action still requires him.

## Post-decision action preparation

IMP 038 consumes a persisted `VerificationDecisionRecord` and prepares the next governed **intent** only. It does not invoke providers, dispatch correction, create the next executor, commit, or push.

Preferred governed flow continuation:

5. `preparePostDecisionAction({ store, verificationDecisionId })` — or `{ store, verifierAssignmentId }` when a trusted decision already exists for the latest verifier evidence.

Prepared action vocabulary:

- `PREPARE_CONTINUATION` — from `VERIFIED` (continuation intent; human authorization still required before any later execution)
- `PREPARE_CORRECTION` — from `CORRECTION_REQUIRED` (machine-grounded failure context; no dispatch)
- `REQUIRE_HUMAN_DECISION` — from `INDETERMINATE` (machine continuation unsafe)

Actions persist as append-only hashed `post_decision_action` records bound to the exact verification decision id and relationship identities. Duplicate preparation reuses the existing record. Caller-supplied action values are not accepted; provider prose is ignored.

This slice does **not**:

- dispatch a correction assignment
- dispatch the next executor
- continue workflow automatically
- commit or push

Human final authority remains required before any execution of a prepared action.

## Authorized post-decision execution

IMP 039 executes an already prepared post-decision action only after a separate explicit human authorization record. A prepared action alone is not execution authority.

Preferred governed flow continuation:

6. `authorizePostDecisionExecution({ store, postDecisionActionId, humanAuthorized: true })` — persist action-specific authorization.
7. `executeAuthorizedPostDecisionAction({ store, postDecisionActionId, provider })` — load trusted records and execute.

Behavior:

- `PREPARE_CORRECTION` → generate a bounded correction executor assignment from authoritative failure context, then dispatch through the existing governed provider path (Mock or Cursor).
- `PREPARE_CONTINUATION` → resolve a registered governed continuation target (IMP 040), bind authorization to that exact target, then dispatch a bounded continuation assignment through the existing governed provider path. Missing/ambiguous/stale targets fail closed.
- `REQUIRE_HUMAN_DECISION` → always refuse with `human_decision_required`.

Authorization binds the exact `postDecisionActionId` / `actionHash`, decision id, prepared action, executor evidence linkage, and starting branch/HEAD. For continuation, authorization also binds `continuationTargetId` / `continuationTargetHash`. Baseline drift refuses before provider session. Duplicate execution reuses existing correction/continuation evidence. No standing auto-authorization, no continue-until-blocked, no automatic commit/push.

## Governed continuation targets

IMP 040 adds machine-addressable continuation targets so Orchestra can continue only already-authorized next work:

1. After a trusted `VERIFIED` decision, register a target with `registerGovernedContinuationTarget` (project-supplied governed state / config — never provider prose).
2. Prepare `PREPARE_CONTINUATION` as before.
3. `authorizePostDecisionExecution` resolves the unique eligible target (lowest `orderingKey`) and binds it into the authorization record.
4. `executeAuthorizedPostDecisionAction` rebuilds the bounded continuation assignment from that target and dispatches programmatically.

Eligibility fails closed for missing, ambiguous (tied ordering), consumed, superseded, blocked, repository/branch/HEAD/predecessor mismatch, policy-invalid targets, or predecessor path-authority violations. Consumed targets are not reusable. Provider prose cannot select or broaden a target.

## Project governed continuation sequences

IMP 041 adds durable project sequence configuration so Orchestra can materialize the next continuation target without manual per-step registration:

1. Persist a project sequence with `persistGovernedContinuationSequenceConfig` (exactly one bootstrap entry; later entries name `predecessorEntryKey`).
2. After a trusted `VERIFIED` decision, call `materializeNextGovernedContinuationTargetFromSequence`.
3. Orchestra records predecessor fulfillment, selects the unique next entry, and registers a sequence-bound continuation target through the existing IMP 040 registration/path-authority gates.
4. Explicit `authorizePostDecisionExecution` remains required before dispatch.

Sequence configuration is not execution authority. Standing automatic authorization is out of scope.

This slice does **not**:

- invent next requirements or R146
- authorize actions automatically
- convert human-decision intents into execution
- open Cursor chat or require manual assignment paste
- commit or push

## Current limitations

Observed Cursor provider facts, not solved by this slice:

1. Windows local SDK sandbox could not be enabled successfully.
2. Headless SDK auto-approves tools unless hooks deny.
3. Project hooks are currently the proven deterministic write enforcement mechanism.
4. Cursor hook stdin parsing requires robust JSON decoding.
5. Structured path fields are not always present; matching may need the full payload.
6. `beforeShellExecution` may be configured while shell denials arrive through `preToolUse`.
7. Provider session state is not authoritative Orchestra state.
8. User Cursor skills may still load even when project settings are selected.
9. External shell activity outside the SDK agent is outside Cursor hook enforcement.

This adapter does **not** protect against:

- an operator mutating files outside the Cursor agent
- arbitrary external processes
- all symlink or rename attacks (not proven)
- OS-level compromise
- provider bugs outside observed hook surfaces
- commit or push performed outside the agent

Symlink and rename containment are undocumented as proven. Fail-closed applies to targeted write ambiguity on observed Cursor write/shell surfaces only.

The adapter never commits and never pushes, even if `commitAuthorization` is recorded true. `commitAuthorization` is a policy field only in this slice.

## How to run deterministic tests

From the repository root, with pnpm:

```
pnpm --filter @workspace/orchestra-execution test
pnpm --filter @workspace/orchestra-execution typecheck
```

The deterministic suite covers both provider adapters. Codex tests use an injected App Server transport and do not require authentication.

Deterministic tests use mocks and a disposable temporary Git repository. They do not require live Cursor authentication.

## How to run the authorized live disposable integration test

Requires an already authenticated official Cursor SDK environment (`Cursor.auth.status()` logged in). Credentials stay in the SDK environment (`~/.cursor`); they are not stored in this repository.

```
pnpm --filter @workspace/orchestra-execution test:live
```

The live test creates a disposable temporary Git repository and a disposable engineering store, freezes the assignment on disk, dispatches through the closed Cursor adapter, then reconstructs assignment and evidence from a fresh store instance. It must not target F.I. Forgot.

If authentication is unavailable, the live test is skipped and reported blocked. Production code is not weakened to fake a pass.

## How to run the authorized live Codex read-only test

The Codex live test requires an existing official Codex login and an explicit opt-in. It creates disposable Git repositories, removes Cursor-specific fixture hooks before capturing its baseline, runs only with provider-enforced read-only/never policy, verifies independent Git state, and proves interruption.

```powershell
$env:RUN_LIVE_CODEX_INTEGRATION='1'
pnpm --filter @workspace/orchestra-execution test:live:codex
```

It never targets the governed F.I. Forgot repository and never enables workspace-write or full access.
