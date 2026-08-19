import type { FrozenAssignment } from "./assignment.js";
import type { NormalizedExecutionEvent } from "./events.js";
import { collectGitEvidence, diffGitEvidence, type GitEvidence } from "./git-evidence.js";
import {
  applyCandidatePatch,
  cleanupIsolatedExecutionWorkspace,
  createIsolatedExecutionWorkspace,
  extractCandidateChanges,
  governedStateUnchanged,
} from "./isolated-workspace.js";
import type { ExecutionProvider, ProviderSession } from "./provider-contract.js";
import { synthesizeExecutionResult, type ExecutionResult } from "./result.js";

export async function runIsolatedWorkspaceAssignment(
  provider: ExecutionProvider,
  frozen: FrozenAssignment,
  governedPreRun: GitEvidence,
  deferCleanup = false,
): Promise<ExecutionResult> {
  const assignment = frozen.assignment;
  const workspace = createIsolatedExecutionWorkspace(assignment.repositoryPath, assignment.startingHead);
  const isolatedPre = await collectGitEvidence(workspace.path);
  const events: NormalizedExecutionEvent[] = [];
  let session: ProviderSession | undefined;
  let sessionId: string | undefined;
  let runId: string | undefined;
  let providerStatus = "not_started";
  let providerFinalResultText: string | null = null;
  let providerFailed = false;
  let evidenceIncomplete = false;

  try {
    session = await provider.createSession({
      repositoryPath: workspace.path,
      branch: assignment.branch,
      startingHead: assignment.startingHead,
    });
    sessionId = session.sessionId;
    events.push({ type: "session_started", timestamp: new Date().toISOString(), correlation: { providerId: provider.providerId, sessionId } });
    const run = await provider.submitAssignment(session, frozen);
    runId = run.runId;
    events.push({ type: "run_started", timestamp: new Date().toISOString(), correlation: { providerId: provider.providerId, sessionId, runId } });
    for await (const event of provider.streamEvents(run)) events.push(event);
    const terminal = await provider.awaitResult(run);
    providerStatus = terminal.status;
    providerFinalResultText = terminal.resultText;
    providerFailed = terminal.status === "error";
    events.push({
      type: providerFailed ? "provider_error" : "run_finished",
      timestamp: new Date().toISOString(),
      message: providerFailed ? (terminal.errorMessage ?? "provider error") : terminal.status,
      correlation: { providerId: provider.providerId, sessionId, runId },
    });
  } catch (error) {
    providerFailed = true;
    providerStatus = "error";
    events.push({
      type: "provider_error",
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : String(error),
      correlation: { providerId: provider.providerId, sessionId, runId },
    });
  }

  let candidate;
  try {
    candidate = extractCandidateChanges(workspace, assignment);
  } catch {
    evidenceIncomplete = true;
    candidate = { paths: [], statuses: [], authorizedPaths: [], unauthorizedPaths: [], protectedPaths: [], patch: Buffer.alloc(0) };
  }
  const isolatedPost = await collectGitEvidence(workspace.path);
  const isolatedDelta = diffGitEvidence(isolatedPre, isolatedPost);
  const governedPreApplication = await collectGitEvidence(assignment.repositoryPath);
  const governedStable = governedStateUnchanged(governedPreRun, governedPreApplication);
  let applicationAttempted = false;
  let applicationSucceeded = false;
  const unexpectedChanges = [...candidate.unauthorizedPaths];
  if (!governedStable) unexpectedChanges.push("governed_repository_changed_before_application");
  if (isolatedDelta.headChanged) unexpectedChanges.push("isolated_workspace_commit_occurred");

  if (
    !providerFailed &&
    !evidenceIncomplete &&
    governedStable &&
    !isolatedDelta.headChanged &&
    candidate.unauthorizedPaths.length === 0 &&
    candidate.protectedPaths.length === 0
  ) {
    applicationAttempted = true;
    try {
      applyCandidatePatch(assignment.repositoryPath, candidate);
      applicationSucceeded = true;
    } catch {
      unexpectedChanges.push("candidate_application_failed");
    }
  }

  const governedPostApplication = await collectGitEvidence(assignment.repositoryPath);
  const governedDelta = diffGitEvidence(governedPreRun, governedPostApplication);

  if (session) {
    try {
      await provider.closeSession(session);
    } catch {
      evidenceIncomplete = true;
    }
  }
  const cleanupSucceeded = deferCleanup ? null : cleanupIsolatedExecutionWorkspace(workspace);

  return synthesizeExecutionResult({
    frozen,
    providerId: provider.providerId,
    providerSessionId: sessionId ?? null,
    runId: runId ?? null,
    providerStatus,
    normalizedEvents: events,
    providerFinalResultText,
    preRunGitEvidence: governedPreRun,
    postRunGitEvidence: governedPostApplication,
    policyDenials: [],
    changedPaths: candidate.paths,
    protectedPathMutationOccurred: candidate.protectedPaths.length > 0,
    branchChanged: governedDelta.branchChanged,
    headChanged: governedDelta.headChanged,
    commitOccurred: isolatedDelta.commitOccurred || governedDelta.commitOccurred,
    unexpectedChanges,
    evidenceIncomplete,
    providerFailed,
    isolationEvidence: {
      workspacePath: workspace.path,
      startingHead: workspace.startingHead,
      candidateChangedPaths: candidate.paths,
      authorizedCandidatePaths: candidate.authorizedPaths,
      unauthorizedCandidatePaths: candidate.unauthorizedPaths,
      protectedCandidatePaths: candidate.protectedPaths,
      candidateStatuses: candidate.statuses,
      applicationAttempted,
      applicationSucceeded,
      governedPreApplicationGitEvidence: governedPreApplication,
      governedPostApplicationGitEvidence: governedPostApplication,
      cleanupStatus: cleanupSucceeded === null ? "pending" : cleanupSucceeded ? "completed" : "failed",
    },
  });
}
