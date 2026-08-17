# ORCH-ARCH-001 — Orchestra Execution Provider Architecture

## Document Control

| Field | Value |
|-------|-------|
| **Identifier** | `ORCH-ARCH-001` |
| **Title** | Orchestra Execution Provider Architecture |
| **Document** | `playbook/orchestra/01-execution-provider-architecture.md` |
| **Sprint** | ORCH ARCH 001 |
| **Status** | Architecture recorded |
| **Version** | 1.0 |
| **Date** | August 17, 2026 |
| **Branch** | `frontend-rebuild` |
| **Owner** | F.I. Forgot |
| **Human authority** | James |
| **Basis HEAD** | `85d9edd9e71414730769441f4da4076e4f5bfdea` |
| **Basis subject** | `feat(orchestra): implement std015 exit completeness` |
| **Document class** | Orchestra implementation architecture |
| **Not a Design Standard** | Does not mint `FI-DSN-*` identifiers and does not amend frozen Design Library text |

**Purpose:** Record a vendor-neutral architecture in which Orchestra retains authoritative governance and project state, while official execution providers supply replaceable transport and agent execution.

**This document does not:** implement Cursor SDK, ACP, Cursor hooks, or Codex SDK; install packages; change runtime behavior; modify frozen `FI-DSN-STD-014` or `FI-DSN-STD-015`; invent `R146`; reopen closed Domain 3 runtime; or authorize Product Sprint 004.

---

## 1. Frozen authority consumed, not amended

The following remain authoritative and unchanged:

| Source | Binding meaning for this architecture |
|--------|----------------------------------------|
| `FI-DSN-GOV-001` | Design Standards Governance |
| `FI-DSN-GOV-003` | Evidence versus company judgment |
| `FI-DSN-GOV-004` | Brain is advisory; Brain does not legislate or execute constitutional authority |
| Volume 06 architecture | Three-domain Creative Production constitution |
| `FI-DSN-STD-012` | Domain 1 Production Intent and Program Governance |
| `FI-DSN-STD-013` | Domain 2 Artifact Realization Governance |
| `FI-DSN-STD-014` | Domain 3 Review and Approval; independently verified CLOSED through `R95` |
| `FI-DSN-STD-015` | Domain 3 Governed Handoff; independently verified COMPLETE through `R145` |
| IMP-D78.1 | Orchestra implementation authorized for Design Library runtime, not ChatGPT-to-Cursor messaging |

Frozen Domain 3 facts this architecture **must not reopen**:

- HGA matrix remains exactly eight types: `authorization`, `posture_declaration`, `completion`, `suspension`, `withdrawal`, `recall`, `reentry`, `resumption`
- HSLM remains exactly eight states
- No HGA Rejection act
- No HGA Exit act
- Brain remains advisory only
- All closed authority, lineage, preservation, independent verification, Suspension, Withdrawal, Recall, HERCM, Handoff, and Exit Completeness semantics remain authoritative
- `R146` is undrafted and has no authorized purpose

External execution capabilities overlapping previously anticipated infrastructure **do not** reopen STD-014 or STD-015.

---

## 2. Primary architectural principle

**Orchestra owns governance. Execution providers own transport.**

Provider state must not silently become Orchestra authoritative state.

### Orchestra owns

- Authoritative project state
- Constitutional governance
- Frozen requirement state
- Bounded assignment definition
- Planner versus executor versus verifier separation
- Independent verification requirements
- Evidence requirements
- Approval policy
- Protected path policy
- Scope policy
- Commit authorization
- Push authorization
- Suspension, Withdrawal, Recall, Reentry, Resumption, and recovery governance
- Decision history
- Idea capture
- Multi-project governance
- Human final decision authority

### Execution providers may own

- Agent process execution
- Agent session transport
- Prompt delivery
- Streaming events
- Tool invocation mechanisms
- Repository editing mechanisms
- Run cancellation mechanism
- Provider-specific permissions
- Provider-specific hooks
- Provider-specific session persistence
- Provider-specific execution telemetry

A provider run id, chat transcript, or “tests passed” sentence is transport evidence, not Orchestra truth, until Orchestra independently inspects repository facts.

---

## 3. Existing architecture inventory

Concepts that interact with a future execution provider:

| Concept | Current owner | Interaction with an execution provider |
|---------|---------------|----------------------------------------|
| Orchestrator ownership | Orchestra constitutional runtime (`artifacts/api-server/src/orchestra/`) | Provider must not become the orchestrator. Orchestra decides whether a run may start and whether a result counts. |
| Brain role | Advisory only (`FI-DSN-GOV-004`; `brain-consumer-boundary.ts`) | Product Brain (`artifacts/api-server/src/brain/orchestrator.ts`) is a separate product pipeline. It is not execution transport and must not be merged with provider sessions. |
| Handoff governance | STD-015 runtime through `R145` | Unrelated to Cursor/Codex transport. Do not map provider “handoff” vocabulary onto HGA. |
| Authority classes | MAGAC (`approval-authority.ts`; STD-014 `R36`–`R38`) | Provider identity is not an Approval authority class. |
| State persistence | Domain 1–3 in-memory repositories and storage ports | Constitutional runtime persistence stays separate from execution-governance project state. |
| Audit and evidence | Constitutional artifacts plus GOV-003 epistemic rules | Provider prose is not sufficient. Machine repository evidence is required where available. |
| Approval | STD-014 runtime | Distinct from human approval of repository mutations in this engineering process. |
| Execution (product) | Product Implementation enforces frozen design law | Distinct from provider agent execution of repository work. |
| Verification | Independent verification sprints (process) | Must remain a constitutionally distinct role even if the same vendor technology is used. |
| Suspension / recovery | STD-015 HSLM, HERCM | Product-runtime recovery. Engineering-process pause/resume is a separate Orchestra lifecycle posture and must not reuse HGA act types as transport verbs. |
| Repository mutation | Git working tree; current practice is prompt-governed | Future provider edits are transport. Lawfulness is Orchestra policy plus enforcement. |
| Commit and push | Human-governed cadence | Provider `autoCreatePR` or implicit push is prohibited without new authority. |
| External tool boundary | No Orchestra provider adapter exists | This document creates the boundary. Official SDKs/hooks/ACP are candidates, not authority. |
| Multi-project | Not implemented | Future isolation requirement only (Section 16). |

Current engineering loop is still manual: a human pastes a bounded sprint into Cursor or ChatGPT. That loop is **process**, not implemented transport.

---

## 4. Overlap audit

Classification:

- **A KEEP** — retain as-is
- **B INTEGRATE** — consume through the provider contract or evidence model
- **C ADAPT** — keep the purpose; change the mechanism
- **D POTENTIALLY REDUNDANT** — custom engineering likely unnecessary if an official mechanism proves
- **E REQUIRES VERIFICATION** — do not delete or commit; prove before architectural lock-in

Nothing in this sprint is deleted.

| Item | Location | Classification | Note |
|------|----------|----------------|------|
| Orchestra STD-012–015 constitutional runtime | `artifacts/api-server/src/orchestra/` | **A KEEP** | Governance core. Not transport. |
| Domain 3 persistence, HGA, HSLM, HERCM, HOEM, Exit Completeness | orchestra Domain 3 modules | **A KEEP** | Frozen product-runtime semantics. |
| Brain consumer boundary | `brain-consumer-boundary.ts`; GOV-004 | **A KEEP** | Brain remains advisory. |
| MAGAC approval classes | `approval-authority.ts` | **A KEEP** | Not provider identity. |
| IMP-D78.1 implementation authorization | Design Planning Register | **A KEEP** | Authorizes Design Library runtime, not a ChatGPT bridge. |
| Product Brain orchestrator | `artifacts/api-server/src/brain/orchestrator.ts` | **A KEEP** | Distinct product pipeline. Do not reuse as execution transport. |
| Product constitution and playbook | `playbook/01_CONSTITUTION.md` and related playbooks | **A KEEP** | Product law. Not agent transport. |
| Cursor Development Guide | `playbook/79_CURSOR_DEVELOPMENT_GUIDE.md` | **C ADAPT** | Prompt-level assistant rules. Useful as assignment guidance; not Orchestra authority and not a session protocol. |
| Independent verification sprint pattern (`ORCH IMP n` then `n.1`) | process | **C ADAPT** | Becomes Planner / Executor / Independent Verifier roles. Same vendor technology may be used; roles stay distinct. |
| Copy-and-paste sprint prompts | ChatGPT / Cursor chat | **C ADAPT** | Replace with bounded assignments generated from Orchestra authoritative state. |
| Git as independent evidence | repository | **A KEEP** / **B INTEGRATE** | Orchestra inspects HEAD, diff, status, and tests itself. |
| Protected writing-quality working-tree exceptions | process | **A KEEP** | Remain protected. Do not use them as destructive hook-test targets. |
| Custom ChatGPT-to-Cursor messaging | not implemented | **D POTENTIALLY REDUNDANT** | Official session transport should be proven first. |
| Custom agent session transport | not implemented | **D POTENTIALLY REDUNDANT** | Cursor SDK `Agent.create` / `Agent.resume` is the primary candidate. |
| Custom prompt delivery | not implemented | **D POTENTIALLY REDUNDANT** | `agent.send` / `Agent.prompt` is the primary candidate. |
| Custom streaming and result collection | not implemented | **D POTENTIALLY REDUNDANT** | `run.stream()` / `run.wait()` is the primary candidate. |
| Custom cancellation | not implemented | **D POTENTIALLY REDUNDANT** | `run.cancel()` when `supports("cancel")` is the primary candidate. |
| Custom agent process launching | not implemented | **D POTENTIALLY REDUNDANT** | Official local runtime is the primary candidate. |
| Custom repository command execution layer | not implemented | **D POTENTIALLY REDUNDANT** | Provider tools plus Orchestra policy plus hooks. |
| Custom permission interception bus | not implemented | **B INTEGRATE** | Prefer official hooks / provider permission events over a homegrown IPC bus. |
| Custom hook runtime | not present; no `.cursor/hooks.json` | **B INTEGRATE** | Official project hooks are the enforcement candidate. |
| Provider session persistence as source of truth | not implemented | **E REQUIRES VERIFICATION** | `Agent.resume` may recover provider context. Orchestra assignment identity remains authoritative. |
| ChatGPT / Codex import of Cursor context | not in repo | **E REQUIRES VERIFICATION** | Must not become the authoritative store. |
| Cursor ACP | not in repo | **E REQUIRES VERIFICATION** | Prove whether ACP is needed beside the SDK or is an IDE-facing duplicate. |
| Codex SDK as second provider | not in repo | **E REQUIRES VERIFICATION** | Optional adapter only if it satisfies the same governed contract. |
| Cloud agent `autoCreatePR` | not used | **D POTENTIALLY REDUNDANT** and prohibited without new authority | Would weaken push policy. |
| Multi-agent custom runtime | not implemented | **D POTENTIALLY REDUNDANT** | Role separation is Orchestra’s; process multiplexing is the provider’s. |
| In-memory Domain 3 store as engineering-state store | runtime | **A KEEP** for product runtime; **E** for reuse | Execution-governance project state should be a separate store. Do not overload constitutional Domain 3 records. |

---

## 5. Transport versus governance

**Transport** is provider-specific mechanism:

- starting an agent
- sending an assignment
- streaming events
- receiving a result
- canceling a run
- performing repository edits
- requesting provider permissions
- maintaining provider session state

**Governance** is Orchestra decision:

- whether the run may start
- what assignment is lawful
- which files may change
- which commands may execute
- what evidence is required
- whether a result counts
- whether independent verification is required
- whether a correction is allowed
- whether commit is authorized
- whether push is authorized
- whether work must suspend
- whether work may resume
- whether human approval is required

Transport remains subordinate to governance. If a provider can do a thing, that does not make the thing lawful.

---

## 6. Vendor-neutral execution provider contract

Minimum adapter. Not a generic agent framework. Constitutional core must not import Cursor or Codex types.

### 6.1 Required operations

| Operation | Purpose |
|-----------|---------|
| `createSession(target)` | Open a provider session against an Orchestra-identified repository and working directory. |
| `resumeSession(providerSessionId)` | Reattach provider resources. Does not resume Orchestra assignment authority by itself. |
| `submitAssignment(session, assignment)` | Deliver one bounded assignment. The assignment document is Orchestra-authored. |
| `streamEvents(run)` | Yield normalized events. Unknown provider events are wrapped, not dropped silently. |
| `requestCancellation(run)` | Ask the provider to stop. Cancellation of transport is not Withdrawal, Recall, or Suspension. |
| `awaitResult(run)` | Obtain the provider terminal report. Not Orchestra PASS. |
| `getSessionIdentity(session)` | Return opaque provider ids for correlation only. |
| `closeSession(session)` | Dispose provider resources. |

Repository execution evidence is **not** obtained from the provider as authority. Orchestra inspects Git and test runners itself, then may attach provider ids as correlators.

Permission requests are surfaced as normalized `permission_requested` events. Orchestra policy or a human decides. The adapter must not auto-approve out-of-policy permissions.

### 6.2 Assignment object Orchestra authors

Minimum fields:

- `assignmentId`
- `projectId`
- `role` (`planner` \| `executor` \| `independent_verifier`)
- `boundedScope`
- `protectedPaths`
- `workingTreeExceptions`
- `requiredEvidence`
- `commitAuthorization`
- `pushAuthorization`
- `startingHead`
- `hash` of the assignment body

The provider receives the assignment as opaque prompt/payload text plus any provider-required targeting fields. The hash stays in Orchestra state.

### 6.3 Normalized events

`run_started` · `progress` · `permission_requested` · `blocked_action` · `run_finished` · `run_failed` · `run_cancelled`

Optional, adapter-local, not constitutional: tool names, token counts, provider model ids.

### 6.4 Explicitly excluded from the core

- Cursor `Agent` / `Run` types
- ACP protocol messages
- Codex thread types
- Cloud `autoCreatePR`
- Chat history as state
- HGA act types as transport verbs

---

## 7. Cursor adapter boundary

Future Cursor adapter maps the contract onto official Cursor capabilities. Classification is architectural, not a marketing choice. **No mechanism is committed until the listed proof exists.**

Local runtime against an already checked-out repository is the intended first path. Cloud runtime is optional and must not create pull requests or push.

| Contract concern | Official mechanism | Class | Proof required before commitment |
|------------------|--------------------|-------|----------------------------------|
| Create session | Cursor SDK `Agent.create` with explicit `local.cwd` | **PRIMARY CANDIDATE** + **REQUIRES PROOF OF CONCEPT** | Session opens against this repository only |
| Resume session | Cursor SDK `Agent.resume` | **PRIMARY CANDIDATE** + **REQUIRES PROOF OF CONCEPT** | Resume restores provider context without becoming Orchestra assignment authority |
| Submit assignment | `agent.send` or one-shot `Agent.prompt` | **PRIMARY CANDIDATE** + **REQUIRES PROOF OF CONCEPT** | Bounded text is delivered intact; model cannot widen scope by SDK default |
| Stream events | `run.stream()` / `run.messages()` | **PRIMARY CANDIDATE** + **REQUIRES PROOF OF CONCEPT** | Events can be captured without making transcript authoritative |
| Final result | `run.wait()` | **PRIMARY CANDIDATE** + **REQUIRES PROOF OF CONCEPT** | Terminal status is distinct from thrown startup errors |
| Cancel | `run.cancel()` when `supports("cancel")` | **PRIMARY CANDIDATE** + **REQUIRES PROOF OF CONCEPT** | Cancel stops the run; unsupported cancel is a recorded limitation, not a custom bridge trigger by itself |
| Session / run identity | `agent.agentId`, `run.id` | **PRIMARY CANDIDATE** | Opaque correlators only |
| Repository targeting | SDK `local.cwd` | **PRIMARY CANDIDATE** + **REQUIRES PROOF OF CONCEPT** | Before/after Git identity is this repo; no extra clone |
| Dispose | SDK context-manager dispose | **PRIMARY CANDIDATE** | No leaked local executor |
| Cloud runtime | SDK `cloud.repos` | **OPTIONAL** + **REQUIRES PROOF OF CONCEPT** | Only if local cannot satisfy a documented requirement |
| Cloud PR creation | `autoCreatePR` | **ALWAYS PROHIBITED** without new authority | Conflicts with push policy |
| ACP | Cursor Agent Client Protocol | **REQUIRES PROOF OF CONCEPT** | Prove whether ACP is required for session control that the SDK cannot provide. If it only duplicates SDK transport, do not adopt it in the core. |
| Hooks | Project `.cursor/hooks.json` command hooks | **PRIMARY CANDIDATE** for enforcement, not transport | Fail-closed deny of a prohibited write or command; evidence reaches Orchestra |
| Prompt hooks | `type: "prompt"` hooks | **FALLBACK** | Non-deterministic; not sufficient for protected-path enforcement |
| Cursor CLI | agent CLI if present | **FALLBACK** | Use only if SDK session control fails a required proof |
| Cloud REST `/v1/agents/*` | HTTP API | **FALLBACK** | Languages without first-party SDK, or a documented SDK gap |
| User/team settings sources | SDK `settingSources` | **OPTIONAL** | Default to inline config only unless a governed reason exists |
| MCP servers passed into the agent | SDK MCP options | **OPTIONAL** | Must not grant tools that bypass Orchestra policy |

SDK and hooks are complementary: SDK is transport; hooks are provider-side enforcement. ACP is not assumed necessary.

---

## 8. Optional Codex adapter boundary

A future Codex adapter is optional. The constitutional core must not require Cursor-specific semantics.

| Rule | Requirement |
|------|-------------|
| Same contract | Codex must implement Section 6 or it is not an Orchestra provider |
| Official mechanisms only | OpenAI Codex SDK / agent orchestration APIs; no custom ChatGPT-to-Cursor bridge |
| Context import | ChatGPT or Codex import of Cursor context is **not** authoritative project state |
| Role separation | A Codex executor and a Codex verifier are still distinct Orchestra assignments |
| Adoption | Requires human approval (Section 13) and the same class of proofs as Cursor, mapped to Codex APIs |

If Codex cannot supply session control, cancellation, or repository targeting, that is a documented gap. It does not justify weakening Orchestra governance or inventing a custom low-level bridge unless Section 21 applies.

---

## 9. Authoritative project state

Orchestra, not chat history, is the store.

Minimum persistent state per project:

| Field | Purpose |
|-------|---------|
| `projectId` | Orchestra project identity |
| `repositoryIdentity` | Path, remotes, expected Git identity |
| `branch` | Expected branch |
| `authoritativeHead` | Last Orchestra-acknowledged HEAD |
| `remotePosture` | Ahead / behind relative to the tracked remote |
| `frozenRequirementGroup` | Current frozen standard or implementation group in force |
| `assignmentId` | Active bounded assignment, or none |
| `assignmentRole` | `planner` / `executor` / `independent_verifier` |
| `protectedPaths` | Paths that must not change |
| `allowedScope` | Paths and change classes that may change |
| `requiredTests` | Commands Orchestra will run or require evidence for |
| `evidenceRequirements` | What must exist before a result counts |
| `workingTreeExceptions` | Known dirty paths that are not the assignment |
| `lifecyclePosture` | Engineering-process posture: idle, assigned, executing, verifying, blocked, awaiting_human, complete |
| `commitAuthorization` | Whether the active assignment may create a commit |
| `pushAuthorization` | Whether the active assignment may push |
| `humanApprovalRequirements` | Outstanding human gates |
| `lastVerifiedCommit` | Last independently verified commit |
| `pendingCorrection` | Narrow correction, if any |
| `nextFrozenDependency` | Next lawful frozen or implementation dependency |
| `ideaInboxRefs` | Captured ideas that must not mutate the active assignment |

Lifecycle posture here is **engineering-process** state. It is not HSLM and must not reuse HGA type names as if they were transport operations.

No implementation of this store is authorized by this sprint.

---

## 10. Execution evidence model

Provider prose is never sufficient when machine evidence is available.

| Evidence | Source of truth | Provider claim status |
|----------|-----------------|-----------------------|
| Provider run id / session id | Provider, stored as correlator | Correlation only |
| Assignment hash | Orchestra | Authoritative |
| Start / finish timestamps | Orchestra clock plus provider timestamps if present | Orchestra records both |
| Files changed | `git status` / `git diff` inspected by Orchestra | Provider list is advisory |
| Commands executed | Provider event log plus hook audit if present | Must be reconciled with Git and test artifacts |
| Test results | Orchestra-invoked or independently inspected runner output | Provider “tests passed” is a claim |
| TypeScript result | Orchestra-invoked `tsc` or equivalent | Claim until inspected |
| Git diff | Git | Authoritative |
| Starting HEAD / ending HEAD | Git | Authoritative |
| Commit identity | Git | Authoritative |
| Working tree state | Git | Authoritative |
| Permission requests | Provider events / hooks | Recorded; decision is Orchestra or human |
| Blocked actions | Hooks / policy engine | Recorded |
| Hook decisions | Hook stdout/audit | Recorded; still checked against Git |
| Provider final report | Provider | Non-authoritative narrative |

Independent verification inspects the repository, not the executor’s self-report.

---

## 11. Hook and enforcement model

Prompts remain guidance. Deterministic enforcement must replace instruction where failure is costly.

| Concern | Prompt guidance | Orchestra policy check | Provider hook | Git enforcement | Human approval |
|---------|-----------------|------------------------|---------------|-----------------|----------------|
| Protected file writes | yes | yes, before result counts | **command** `preToolUse` / `afterFileEdit` fail-closed | detect after the fact | not a substitute |
| Out-of-scope writes | yes | yes | same | detect after the fact | scope expansion |
| Prohibited shell commands | yes | yes | `beforeShellExecution` fail-closed | n/a | exceptions |
| Commit before authorization | yes | yes | `beforeShellExecution` on `git commit` | commit exists or not | may authorize |
| Push before authorization | yes | yes | `beforeShellExecution` on `git push` | remote posture | required under current cadence |
| Branch change | yes | yes | shell hook | `git branch` | required |
| Repository change | yes | yes | targeting check at session create | remotes / cwd | required |
| Destructive Git | yes | deny | fail-closed shell hook | may be too late | new authority |
| Unauthorized dependency install | yes | deny | fail-closed shell hook | lockfile diff | required |
| Modify frozen authority | yes | deny | path hook | diff against STD files | new authority |
| Bypass independent verification | yes | deny in state machine | cannot be the only control | lastVerifiedCommit | required to waive |

Rules:

- Prefer **command hooks** over prompt hooks for deny/allow.
- Default hook failure for enforcement points is **fail closed**.
- Git inspection remains mandatory even when a hook reports deny or allow.
- Do not implement hooks in this sprint.
- Do not use `playbook/writing-quality/PILOT_FINDINGS_9A2.md`, `playbook/writing-quality/README.md`, or `playbook/writing-quality/pilot-9A.2/BLOCKER.md` as destructive test targets.

---

## 12. Planner, executor, verifier, human

| Role | May do | Must not do |
|------|--------|-------------|
| **Planner** | Read authoritative state; propose the next lawful bounded assignment | Mutate the repository; approve its own plan as verification |
| **Executor** | Perform one authorized assignment | Verify its own work as independent verification; push unless authorized |
| **Independent verifier** | Inspect repository facts; evaluate evidence; record PASS or correction | Collapse into the executor session; treat executor prose as proof |
| **Human authority (James)** | Final decision; freeze changes; provider changes; push; exceptions | Be replaced by provider defaults |

Roles **may share provider technology** (two Cursor SDK sessions, or Cursor plus Codex). They **must not share assignment identity**. Independent verification does not collapse because both runs happen in Cursor.

Product Brain remains a fifth, advisory system. It is not Planner, Executor, or Verifier for this engineering loop.

---

## 13. First self-helping loop

Smallest loop that materially removes copy-and-paste. No multi-project scheduling.

1. Orchestra reads authoritative project state.
2. Orchestra determines the next lawful assignment, or stops for a human checkpoint.
3. Orchestra generates a bounded implementation assignment from that state.
4. Executor is dispatched through the provider contract.
5. Normalized execution events are captured as correlators.
6. Orchestra independently inspects repository identity, diff, status, and required tests.
7. Implementation evidence is evaluated against the assignment.
8. A **separate** verifier assignment is dispatched.
9. Verification evidence is evaluated independently.
10. PASS or correction is recorded in Orchestra state.
11. Human checkpoint is honored where Section 14 policy requires it.
12. The next assignment becomes eligible only after recorded PASS or an authorized correction path.

This loop is designed, not implemented, in ORCH ARCH 001.

---

## 14. Human approval policy

James remains final decision authority where frozen or deliberately configured.

| Action | Classification |
|--------|----------------|
| Routine bounded implementation dispatch after recorded plan | **REQUIRES HUMAN APPROVAL** until a later sprint explicitly auto-allows a named assignment class |
| Independent verification dispatch of an already authorized implementation | **AUTO ALLOWED UNDER GOVERNANCE** once the implementation assignment is recorded |
| Narrow P0/P1 correction wholly inside the authorized group | **AUTO ALLOWED UNDER GOVERNANCE** when the verifier role is authorized to correct |
| Architecture change | **REQUIRES HUMAN APPROVAL** |
| Frozen standard change | **ALWAYS PROHIBITED WITHOUT NEW AUTHORITY** |
| Dependency installation | **REQUIRES HUMAN APPROVAL** |
| Commit on an authorized implementation or authorized narrow correction | **AUTO ALLOWED UNDER GOVERNANCE** |
| Push | **REQUIRES HUMAN APPROVAL** (current cadence: end-of-day sync unless specifically requested) |
| Branch creation | **REQUIRES HUMAN APPROVAL** |
| Destructive Git operation | **ALWAYS PROHIBITED WITHOUT NEW AUTHORITY** |
| Provider change (Cursor ↔ Codex, local ↔ cloud, ACP adoption) | **REQUIRES HUMAN APPROVAL** |
| Scope expansion | **REQUIRES HUMAN APPROVAL** |
| Cloud `autoCreatePR` | **ALWAYS PROHIBITED WITHOUT NEW AUTHORITY** |

---

## 15. Commit and push policy

Current project cadence remains binding on providers:

- Implementation may create governed commits where authorized.
- Verification may create narrow correction commits where authorized.
- Nothing pushes until end-of-day sync unless specifically requested.

External agent capability must not weaken this. Provider PR automation is out of policy. Orchestra independently inspects whether a push occurred.

---

## 16. Idea inbox boundary

A new idea may be captured as an inbox reference while governed work continues.

- Capture must not mutate `assignmentId`, scope, protected paths, or commit/push authorization.
- Inbox items are not assignments.
- Promotion from inbox to assignment requires the Planner path and any required human approval.

No inbox implementation is authorized by this sprint. No additional Design Library change is required.

---

## 17. Multi-project future boundary

One Orchestra core may later govern multiple projects.

Each project retains isolated:

- authoritative state
- repository identity
- governance state
- assignments
- evidence

No scheduling, prioritization, or cross-project dispatch is designed beyond that isolation requirement.

---

## 18. Security and trust

Providers are untrusted claim generators.

| Provider says | Orchestra does |
|---------------|----------------|
| Tests passed | Run or inspect the test runner output |
| No protected files changed | Inspect `git diff` / `git status` against `protectedPaths` |
| Commit created | Read `git log` / `rev-parse` |
| Nothing pushed | Read remote posture |
| Assignment completed | Compare assignment hash, role, and repository facts |

Trust the repository. Correlate provider ids. Do not promote vendor narrative to verified evidence.

---

## 19. First proof of concept

**ORCH POC 001 — read-only Cursor session.** Do not implement in this sprint.

Target:

1. Use the official Cursor execution mechanism (SDK local runtime is the primary candidate).
2. Open or create one agent session against this F.I. Forgot repository.
3. Give it a **read-only** bounded assignment.
4. Stream events.
5. Capture the provider final result.
6. Capture repository identity before and after.
7. Prove no file changed.
8. Cancel or close cleanly.

Forbidden during that POC: writes, commits, pushes, hook installation, Codex, ACP unless the SDK cannot open a session at all.

---

## 20. Second proof of concept

**ORCH POC 002 — disposable enforcement.** Do not implement in this sprint.

Target:

1. Create a disposable test path or fixture that is not a real protected writing-quality file.
2. Use an official provider enforcement mechanism (project Cursor command hooks are the primary candidate).
3. Instruct a test agent to attempt a prohibited modification of that disposable path.
4. Prove the operation is blocked.
5. Prove block evidence reaches Orchestra-correlatable logs.
6. Prove the real protected writing-quality trio is untouched.

---

## 21. Acceptance criteria for adopting Cursor SDK or ACP

Orchestra may commit to a Cursor transport mechanism only after proof of:

- stable session control
- bounded assignment delivery
- streaming
- result retrieval
- cancellation, or a recorded unsupported-cancel limitation with an official fallback
- repository targeting
- machine-readable evidence sufficient for correlation
- permission handling that does not auto-approve out-of-policy actions
- hook or enforcement compatibility (SDK respects project hooks)
- failure handling that distinguishes startup failure from run failure
- restart or session recovery that does not promote provider state to Orchestra state
- no hidden requirement that provider chat, cloud task state, or PR automation become authoritative

ACP is adopted only if a required criterion cannot be met by the SDK and hooks. Passing a demo is not adoption.

---

## 22. Fallback hierarchy

If a preferred official mechanism fails a required criterion:

1. Another official Cursor mechanism (hooks, CLI, then REST) for that specific gap.
2. Official Codex / OpenAI provider for the same vendor-neutral contract, if human-approved.
3. Custom bridge engineering **only** for a specifically documented unsatisfied requirement after 1 and 2.

Custom ChatGPT-to-Cursor messaging, custom session buses, and custom process supervisors are last, not first.

---

## 23. Documentation location choice

This architecture is recorded in `playbook/orchestra/`, not in frozen Design Library files and not in runtime source.

Reasons:

- Frozen `FI-DSN-STD-014` and `FI-DSN-STD-015` must not be edited to absorb vendor transport.
- Volume 06 architecture governs product creative-production law, not Cursor adapters.
- Runtime barrels are implementation, and this sprint forbids runtime change.
- No prior Orchestra execution-provider architecture document existed, so this is not a duplicate update.

`playbook/79_CURSOR_DEVELOPMENT_GUIDE.md` remains product-assistant guidance. It is not this architecture.

---

## 24. Recommended next sprint

**ORCH POC 001 — read-only Cursor SDK session against this repository.**

Do not implement it from this document. Do not install SDKs until that sprint is separately authorized.
