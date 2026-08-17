# @workspace/orchestra-execution

Thin Orchestra execution-provider package. Orchestra owns governance and assignment identity. This package supplies replaceable transport, starting with official `@cursor/sdk`.

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

Deterministic tests use mocks and a disposable temporary Git repository. They do not require live Cursor authentication.

## How to run the authorized live disposable integration test

Requires an already authenticated official Cursor SDK environment (`Cursor.auth.status()` logged in). Credentials stay in the SDK environment (`~/.cursor`); they are not stored in this repository.

```
pnpm --filter @workspace/orchestra-execution test:live
```

The live test creates a disposable temporary Git repository, projects hooks there, and asks Cursor to change `allowed.txt` while attempting to change `protected.txt`. It must not target F.I. Forgot.

If authentication is unavailable, the live test is skipped and reported blocked. Production code is not weakened to fake a pass.
