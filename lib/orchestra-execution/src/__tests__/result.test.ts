import { createAssignment } from "../assignment-hash.js";
import { synthesizeExecutionResult } from "../result.js";
import { correlateHookDenials } from "../hooks/hook-evidence.js";
import type { GitEvidence } from "../git-evidence.js";
import { expect, section } from "./harness.js";

function emptyGit(overrides: Partial<GitEvidence> = {}): GitEvidence {
  return {
    capturedAt: "2026-08-17T00:00:00.000Z",
    toplevel: "C:/tmp/fixture",
    branch: "fixture-main",
    head: "aaa",
    subject: "init",
    ahead: 0,
    behind: 0,
    statusShort: "",
    stagedPaths: [],
    unstagedChangedPaths: [],
    untrackedPaths: [],
    commitIdentity: { hash: "aaa", subject: "init", authorName: "x", authorEmail: "y" },
    ...overrides,
  };
}

export function runResultTests(): void {
  section("execution result synthesis and denial correlation");
  const frozen = createAssignment({
    assignmentId: "result",
    projectId: "p",
    role: "executor",
    repositoryPath: "C:/tmp/fixture",
    branch: "fixture-main",
    startingHead: "aaa",
    assignmentText: "work",
    createdAt: "2026-08-17T00:00:00.000Z",
  });
  const correlated = correlateHookDenials(
    [
      {
        timestamp: "t",
        assignmentId: "",
        providerSessionId: "sess",
        runId: null,
        toolUseId: "tool-1",
        hookEvent: "preToolUse",
        toolName: "edit",
        targetPath: "protected.txt",
        permission: "deny",
        reason: "protected_path_write_denied",
      },
    ],
    { assignmentId: "result", runId: "run-1" },
  );
  expect("correlates assignmentId", correlated[0]?.assignmentId, "result");
  expect("does not fabricate missing session", correlated[0]?.providerSessionId, "sess");
  expect("fills runId when absent", correlated[0]?.runId, "run-1");

  const denialResult = synthesizeExecutionResult({
    frozen,
    providerId: "cursor",
    providerSessionId: "sess",
    runId: "run-1",
    providerStatus: "finished",
    normalizedEvents: [],
    providerFinalResultText: "I changed protected.txt",
    preRunGitEvidence: emptyGit(),
    postRunGitEvidence: emptyGit({ unstagedChangedPaths: ["allowed.txt"], statusShort: " M allowed.txt" }),
    policyDenials: correlated,
    changedPaths: ["allowed.txt"],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
  });
  expect("provider prose is not the verdict", denialResult.executionVerdict, "completed_with_policy_denial");
  expect("provider finished is not orchestra pass", denialResult.providerStatus, "finished");

  const mutated = synthesizeExecutionResult({
    frozen,
    providerId: "cursor",
    providerSessionId: "sess",
    runId: "run-1",
    providerStatus: "finished",
    normalizedEvents: [],
    providerFinalResultText: "blocked successfully",
    preRunGitEvidence: emptyGit(),
    postRunGitEvidence: emptyGit({ unstagedChangedPaths: ["protected.txt"] }),
    policyDenials: [],
    changedPaths: ["protected.txt"],
    protectedPathMutationOccurred: true,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: ["protected.txt"],
  });
  expect(
    "provider finished but protected mutation detected",
    mutated.executionVerdict,
    "repository_state_violation",
  );

  const failed = synthesizeExecutionResult({
    frozen,
    providerId: "mock",
    providerSessionId: null,
    runId: null,
    providerStatus: "error",
    normalizedEvents: [],
    providerFinalResultText: null,
    preRunGitEvidence: emptyGit(),
    postRunGitEvidence: emptyGit(),
    policyDenials: [],
    changedPaths: [],
    protectedPathMutationOccurred: false,
    branchChanged: false,
    headChanged: false,
    commitOccurred: false,
    unexpectedChanges: [],
    providerFailed: true,
  });
  expect("provider error verdict", failed.executionVerdict, "provider_failed");
}
