import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createAssignment } from "../assignment-hash.js";
import { createDisposableExecutionFixture } from "../fixture.js";
import { collectGitEvidence, diffGitEvidence } from "../git-evidence.js";
import { readHookInvocations } from "../hooks/hook-evidence.js";
import { MockExecutionProvider } from "../providers/mock-provider.js";
import { filesystemMarkerPresent, runBoundedAssignment } from "../run-assignment.js";
import { synthesizeExecutionResult } from "../result.js";
import { expect, expectFalse, expectTrue, section } from "./harness.js";

function invokeGuard(repositoryPath: string, payload: unknown): { stdout: string; status: number } {
  const guard = join(repositoryPath, ".cursor", "hooks", "orchestra-guard.mjs");
  const result = spawnSync(process.execPath, [guard], {
    input: typeof payload === "string" ? payload : JSON.stringify(payload),
    encoding: "utf8",
    windowsHide: true,
  });
  return { stdout: result.stdout ?? "", status: result.status ?? 1 };
}

export async function runFixtureIntegrationTests(): Promise<void> {
  section("disposable fixture integration");
  const fixture = createDisposableExecutionFixture({ assignmentId: "fixture-e2e" });
  expectTrue("fixture has allowed.txt", existsSync(fixture.allowedPath));
  expectTrue("fixture has protected.txt", existsSync(fixture.protectedPath));
  expectTrue("projected hooks.json", existsSync(join(fixture.repositoryPath, ".cursor", "hooks.json")));
  expectTrue(
    "projected guard",
    existsSync(join(fixture.repositoryPath, ".cursor", "hooks", "orchestra-guard.mjs")),
  );

  const pre = await collectGitEvidence(fixture.repositoryPath);
  const allowedDecision = invokeGuard(fixture.repositoryPath, {
    hook_event_name: "preToolUse",
    tool_name: "Write",
    tool_use_id: "tool-allowed",
    session_id: "sess-1",
    tool_input: { path: "allowed.txt" },
  });
  expectTrue("allowed write permission allow", allowedDecision.stdout.includes('"allow"'));

  appendFileSync(fixture.allowedPath, "ADAPTER_ALLOWED_TEST\n");

  const blockedDirect = invokeGuard(fixture.repositoryPath, {
    hook_event_name: "preToolUse",
    tool_name: "edit",
    tool_use_id: "tool-blocked",
    session_id: "sess-1",
    tool_input: { path: "protected.txt" },
  });
  expectTrue("protected direct write denied", blockedDirect.stdout.includes('"deny"'));

  const blockedShell = invokeGuard(fixture.repositoryPath, {
    hook_event_name: "preToolUse",
    tool_name: "Shell",
    tool_use_id: "tool-shell",
    session_id: "sess-1",
    tool_input: { command: "echo ADAPTER_BLOCKED_TEST >> protected.txt" },
  });
  expectTrue("protected shell write denied", blockedShell.stdout.includes('"deny"'));

  const malformed = invokeGuard(fixture.repositoryPath, "this is not json");
  expectTrue("malformed hook input denied", malformed.stdout.includes('"deny"'));

  const post = await collectGitEvidence(fixture.repositoryPath);
  const delta = diffGitEvidence(pre, post);
  const denials = readHookInvocations(fixture.repositoryPath).filter((row) => row.permission === "deny");
  expectTrue("allowed.txt changed", filesystemMarkerPresent(fixture.repositoryPath, "allowed.txt", "ADAPTER_ALLOWED_TEST"));
  expectFalse(
    "protected.txt unchanged",
    filesystemMarkerPresent(fixture.repositoryPath, "protected.txt", "ADAPTER_BLOCKED_TEST"),
  );
  expect("HEAD unchanged", post.head, pre.head);
  expect("no commit", delta.commitOccurred, false);
  expectTrue("hook denials captured", denials.length >= 2);
  expectTrue(
    "denials include assignmentId",
    denials.every((row) => row.assignmentId === "fixture-e2e"),
  );

  const synthesized = synthesizeExecutionResult({
    frozen: fixture.assignment,
    providerId: "fixture",
    providerSessionId: "sess-1",
    runId: null,
    providerStatus: "finished",
    normalizedEvents: [],
    providerFinalResultText: "I definitely changed protected.txt",
    preRunGitEvidence: pre,
    postRunGitEvidence: post,
    policyDenials: denials,
    changedPaths: delta.changedPaths,
    protectedPathMutationOccurred: false,
    branchChanged: delta.branchChanged,
    headChanged: delta.headChanged,
    commitOccurred: delta.commitOccurred,
    unexpectedChanges: [],
  });
  expect("machine evidence beats provider prose", synthesized.executionVerdict, "completed_with_policy_denial");
  expectFalse("prose claim is not trusted", synthesized.providerFinalResultText === null);
}

export async function runAdapterNegativeTests(): Promise<void> {
  section("adapter negative tests");
  const fixture = createDisposableExecutionFixture({ assignmentId: "negative" });
  const wrongHead = createAssignment({
    ...fixture.assignment.assignment,
    startingHead: "0".repeat(40),
    createdAt: "2026-08-17T00:00:00.000Z",
  });
  const headResult = await runBoundedAssignment(new MockExecutionProvider(), wrongHead, {
    projectHooks: false,
  });
  expect("wrong starting HEAD", headResult.unexpectedChanges.includes("starting_head_mismatch"), true);
  expect("wrong HEAD does not start provider", headResult.providerStatus, "not_started");

  const wrongBranch = createAssignment({
    ...fixture.assignment.assignment,
    branch: "not-the-fixture-branch",
    createdAt: "2026-08-17T00:00:00.000Z",
  });
  const branchResult = await runBoundedAssignment(new MockExecutionProvider(), wrongBranch, {
    projectHooks: false,
  });
  expect("branch mismatch", branchResult.unexpectedChanges.includes("branch_mismatch"), true);

  writeFileSync(join(fixture.repositoryPath, "surprise.txt"), "nope\n");
  const untracked = await runBoundedAssignment(new MockExecutionProvider(), fixture.assignment, {
    projectHooks: false,
  });
  expectTrue(
    "unexpected untracked file recorded",
    untracked.unexpectedChanges.some((item) => item.includes("surprise.txt")),
  );

  const failed = await runBoundedAssignment(
    new MockExecutionProvider({ failOnCreate: true }),
    createDisposableExecutionFixture({ assignmentId: "provider-error" }).assignment,
    { projectHooks: false },
  );
  expect("provider error", failed.executionVerdict, "provider_failed");

  const scopeFixture = createDisposableExecutionFixture({ assignmentId: "scope-violation" });
  const scopeResult = await runBoundedAssignment(
    new MockExecutionProvider({
      resultText: "Everything was within policy: PASS",
      onSubmit: () => {
        appendFileSync(scopeFixture.allowedPath, "AUTHORIZED\n");
        writeFileSync(join(scopeFixture.repositoryPath, "unauthorized.txt"), "UNAUTHORIZED\n");
        appendFileSync(scopeFixture.protectedPath, "PROTECTED_MUTATION\n");
      },
    }),
    scopeFixture.assignment,
    { projectHooks: false },
  );
  expect("scope violation technical verdict", scopeResult.executionVerdict, "repository_state_violation");
  expectTrue("authorized change evidenced", scopeResult.changedPaths.includes("allowed.txt"));
  expectTrue("unauthorized change evidenced", scopeResult.unexpectedChanges.includes("unauthorized.txt"));
  expectTrue("protected mutation evidenced", scopeResult.protectedPathMutationOccurred);
  expectFalse("technical violation is not semantic FAIL", scopeResult.executionVerdict === ("FAIL" as never));
  expect("provider prose cannot hide machine violation", scopeResult.providerFinalResultText, "Everything was within policy: PASS");

  const preexistingProtectedFixture = createDisposableExecutionFixture({
    assignmentId: "preexisting-protected-dirt",
  });
  const preexistingProtectedVerifier = createAssignment({
    ...preexistingProtectedFixture.assignment.assignment,
    role: "verifier",
    allowedPaths: [],
  });
  appendFileSync(preexistingProtectedFixture.protectedPath, "PREEXISTING_DIRT\n");
  const preexistingProtectedResult = await runBoundedAssignment(
    new MockExecutionProvider(),
    preexistingProtectedVerifier,
    { projectHooks: false },
  );
  expectFalse(
    "preexisting protected dirt is not attributed to verifier execution",
    preexistingProtectedResult.protectedPathMutationOccurred,
  );

  const verifierProtectedMutationFixture = createDisposableExecutionFixture({
    assignmentId: "verifier-protected-mutation",
  });
  const verifierProtectedMutationAssignment = createAssignment({
    ...verifierProtectedMutationFixture.assignment.assignment,
    role: "verifier",
    allowedPaths: [],
  });
  appendFileSync(verifierProtectedMutationFixture.protectedPath, "PREEXISTING_DIRT\n");
  const verifierProtectedMutationResult = await runBoundedAssignment(
    new MockExecutionProvider({
      onSubmit: () =>
        appendFileSync(verifierProtectedMutationFixture.protectedPath, "VERIFIER_MUTATION\n"),
    }),
    verifierProtectedMutationAssignment,
    { projectHooks: false },
  );
  expectTrue(
    "a verifier change to already-dirty protected content remains fail closed",
    verifierProtectedMutationResult.protectedPathMutationOccurred,
  );

  const basenameFixture = createDisposableExecutionFixture({ assignmentId: "same-basename-violation" });
  const basenameAssignment = createAssignment({
    ...basenameFixture.assignment.assignment,
    allowedPaths: ["authorized/shared.txt"],
    protectedPaths: [],
  });
  const basenameResult = await runBoundedAssignment(
    new MockExecutionProvider({
      onSubmit: () => writeFileSync(join(basenameFixture.repositoryPath, "shared.txt"), "OUTSIDE_SCOPE\n"),
    }),
    basenameAssignment,
    { projectHooks: false },
  );
  expectTrue("same basename outside authorized directory detected", basenameResult.unexpectedChanges.includes("shared.txt"));
  expect("same basename technical violation", basenameResult.executionVerdict, "repository_state_violation");
}
