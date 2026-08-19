import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { FrozenAssignment } from "./assignment.js";
import { isReadOnlyVerifierAssignment } from "./execution-policy.js";
import { collectGitEvidence, diffGitEvidence } from "./git-evidence.js";
import { correlateHookDenials, readHookInvocations } from "./hooks/hook-evidence.js";
import { normalizePathKey, pathMentionsProtected } from "./hooks/path-normalize.js";
import { isForgotIdentifierRepository, projectCursorHookPolicy } from "./hooks/project-hook.js";
import type { NormalizedExecutionEvent } from "./events.js";
import {
  CURSOR_PROVIDER_ID,
  type ExecutionProvider,
  type ProviderSession,
} from "./provider-contract.js";
import { synthesizeExecutionResult, type ExecutionResult } from "./result.js";
import { runIsolatedWorkspaceAssignment } from "./run-isolated-assignment.js";

export interface RunBoundedAssignmentOptions {
  projectHooks?: boolean;
  deferIsolationCleanup?: boolean;
}

function protectedMutationOccurred(
  changedPaths: string[],
  protectedPaths: string[],
  repositoryPath: string,
): boolean {
  return changedPaths.some((path) => pathMentionsProtected(path, protectedPaths, repositoryPath));
}

function unexpectedChangedPaths(
  changedPaths: string[],
  allowedPaths: string[],
  protectedPaths: string[],
  repositoryPath: string,
): string[] {
  const withinAllowedScope = (path: string): boolean => {
    const candidate = normalizePathKey(path);
    return allowedPaths.some((allowedPath) => {
      const allowed = normalizePathKey(allowedPath).replace(/^\.\//, "");
      return candidate === allowed || candidate.startsWith(`${allowed}/`);
    });
  };
  return changedPaths.filter((path) => {
    if (withinAllowedScope(path)) return false;
    if (path.startsWith(".cursor/") || path.startsWith(".cursor\\")) return false;
    if (pathMentionsProtected(path, protectedPaths, repositoryPath)) return true;
    return true;
  });
}

function fileContains(path: string, needle: string): boolean {
  try {
    return readFileSync(path, "utf8").includes(needle);
  } catch {
    return false;
  }
}

/**
 * Orchestrate one bounded assignment through a vendor-neutral provider.
 * Does not commit or push. Governed Codex writes are isolated and only an
 * entirely authorized candidate patch may update the governed working tree.
 */
export async function runBoundedAssignment(
  provider: ExecutionProvider,
  frozen: FrozenAssignment,
  options: RunBoundedAssignmentOptions = {},
): Promise<ExecutionResult> {
  const assignment = frozen.assignment;
  if (
    isForgotIdentifierRepository(assignment.repositoryPath) &&
    !isReadOnlyVerifierAssignment(assignment)
  ) {
    throw new Error(
      "Refusing to run a modifying assignment against the F.I. Forgot repository in this slice.",
    );
  }

  const preRunGitEvidence = await collectGitEvidence(assignment.repositoryPath);
  const events: NormalizedExecutionEvent[] = [];
  let sessionId: string | undefined;
  let runId: string | undefined;
  let providerStatus = "not_started";
  let providerFinalResultText: string | null = null;
  let providerFailed = false;
  let evidenceIncomplete = false;

  if (!preRunGitEvidence.head || !preRunGitEvidence.branch) {
    evidenceIncomplete = true;
  } else if (
    preRunGitEvidence.head !== assignment.startingHead.toLowerCase() ||
    preRunGitEvidence.branch !== assignment.branch
  ) {
    const postRunGitEvidence = await collectGitEvidence(assignment.repositoryPath);
    const delta = diffGitEvidence(preRunGitEvidence, postRunGitEvidence);
    return synthesizeExecutionResult({
      frozen,
      providerId: provider.providerId,
      providerSessionId: null,
      runId: null,
      providerStatus: "not_started",
      normalizedEvents: events,
      providerFinalResultText: null,
      preRunGitEvidence,
      postRunGitEvidence,
      policyDenials: [],
      changedPaths: delta.changedPaths,
      protectedPathMutationOccurred: protectedMutationOccurred(
        delta.changedPaths,
        assignment.protectedPaths,
        assignment.repositoryPath,
      ),
      branchChanged: delta.branchChanged,
      headChanged: delta.headChanged,
      commitOccurred: delta.commitOccurred,
      unexpectedChanges: [
        ...(preRunGitEvidence.head !== assignment.startingHead.toLowerCase()
          ? ["starting_head_mismatch"]
          : []),
        ...(preRunGitEvidence.branch !== assignment.branch ? ["branch_mismatch"] : []),
      ],
      evidenceIncomplete: false,
      providerFailed: false,
    });
  }

  if (
    provider.providerId === "codex" &&
    (provider as ExecutionProvider & { executionMode?: string }).executionMode === "governed-workspace-write"
  ) {
    return runIsolatedWorkspaceAssignment(provider, frozen, preRunGitEvidence, options.deferIsolationCleanup === true);
  }

  if (
    options.projectHooks !== false &&
    provider.providerId === CURSOR_PROVIDER_ID &&
    !isForgotIdentifierRepository(assignment.repositoryPath)
  ) {
    projectCursorHookPolicy(assignment.repositoryPath, assignment);
  }

  let session: ProviderSession | undefined;
  try {
    session = await provider.createSession({
      repositoryPath: assignment.repositoryPath,
      branch: assignment.branch,
      startingHead: assignment.startingHead,
      governedReadOnlyVerifier:
        isForgotIdentifierRepository(assignment.repositoryPath) &&
        isReadOnlyVerifierAssignment(assignment),
    });
    sessionId = session.sessionId;
    events.push({
      type: "session_started",
      timestamp: new Date().toISOString(),
      correlation: { providerId: provider.providerId, sessionId },
    });
    const run = await provider.submitAssignment(session, frozen);
    runId = run.runId;
    events.push({
      type: "run_started",
      timestamp: new Date().toISOString(),
      correlation: { providerId: provider.providerId, sessionId, runId },
    });
    for await (const event of provider.streamEvents(run)) {
      events.push(event);
    }
    const terminal = await provider.awaitResult(run);
    providerStatus = terminal.status;
    providerFinalResultText = terminal.resultText;
    if (terminal.status === "error") {
      providerFailed = true;
      events.push({
        type: "provider_error",
        timestamp: new Date().toISOString(),
        message: terminal.errorMessage ?? "provider error",
        correlation: { providerId: provider.providerId, sessionId, runId },
      });
    } else {
      events.push({
        type: "run_finished",
        timestamp: new Date().toISOString(),
        message: terminal.status,
        correlation: { providerId: provider.providerId, sessionId, runId },
      });
    }
  } catch (error) {
    providerFailed = true;
    providerStatus = "error";
    events.push({
      type: "provider_error",
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : String(error),
      correlation: { providerId: provider.providerId, sessionId, runId },
    });
  } finally {
    if (session) {
      try {
        await provider.closeSession(session);
      } catch {
        // Session close failure is recorded as incomplete evidence, not repaired.
        evidenceIncomplete = true;
      }
    }
  }

  const postRunGitEvidence = await collectGitEvidence(assignment.repositoryPath);
  const delta = diffGitEvidence(preRunGitEvidence, postRunGitEvidence);
  const denials = correlateHookDenials(readHookInvocations(assignment.repositoryPath), {
    assignmentId: assignment.assignmentId,
    sessionId,
    runId,
  });
  for (const denial of denials) {
    events.push({
      type: "policy_denied",
      timestamp: denial.timestamp,
      toolName: denial.toolName,
      targetPath: denial.targetPath,
      permission: "deny",
      reason: denial.reason,
      correlation: {
        providerId: provider.providerId,
        sessionId: denial.providerSessionId ?? sessionId ?? undefined,
        runId: denial.runId ?? runId ?? undefined,
        toolUseId: denial.toolUseId ?? undefined,
      },
    });
  }

  const protectedMutated = protectedMutationOccurred(
    delta.changedPaths,
    assignment.protectedPaths,
    assignment.repositoryPath,
  );
  const unexpected = unexpectedChangedPaths(
    delta.changedPaths,
    assignment.allowedPaths,
    assignment.protectedPaths,
    assignment.repositoryPath,
  ).filter((path) => !pathMentionsProtected(path, assignment.protectedPaths, assignment.repositoryPath));

  if (preRunGitEvidence.untrackedPaths.length > 0) {
    unexpected.push(
      ...preRunGitEvidence.untrackedPaths
        .filter((path) => !path.startsWith(".cursor"))
        .map((path) => `unexpected_untracked:${path}`),
    );
  }

  return synthesizeExecutionResult({
    frozen,
    providerId: provider.providerId,
    providerSessionId: sessionId ?? null,
    runId: runId ?? null,
    providerStatus,
    normalizedEvents: events,
    providerFinalResultText,
    preRunGitEvidence,
    postRunGitEvidence,
    policyDenials: denials,
    changedPaths: delta.changedPaths,
    protectedPathMutationOccurred: protectedMutated,
    branchChanged: delta.branchChanged,
    headChanged: delta.headChanged,
    commitOccurred: delta.commitOccurred,
    unexpectedChanges: unexpected,
    evidenceIncomplete,
    providerFailed,
  });
}

export function filesystemMarkerPresent(repositoryPath: string, relativePath: string, marker: string): boolean {
  return fileContains(join(repositoryPath, relativePath), marker);
}
