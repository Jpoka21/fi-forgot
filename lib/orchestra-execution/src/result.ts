import type { FrozenAssignment } from "./assignment.js";
import type { NormalizedExecutionEvent } from "./events.js";
import type { GitEvidence } from "./git-evidence.js";
import type { HookDecisionRecord } from "./hooks/policy-decision.js";

export const EXECUTION_VERDICTS = [
  "completed_within_policy",
  "completed_with_policy_denial",
  "provider_failed",
  "repository_state_violation",
  "evidence_incomplete",
] as const;

export type ExecutionVerdict = (typeof EXECUTION_VERDICTS)[number];

export interface ExecutionResult {
  assignmentId: string;
  assignmentHash: string;
  providerId: string;
  providerSessionId: string | null;
  runId: string | null;
  providerStatus: string;
  normalizedEvents: NormalizedExecutionEvent[];
  providerFinalResultText: string | null;
  preRunGitEvidence: GitEvidence | null;
  postRunGitEvidence: GitEvidence | null;
  changedPaths: string[];
  policyDenials: HookDecisionRecord[];
  protectedPathViolationAttempted: boolean;
  protectedPathMutationOccurred: boolean;
  branchChanged: boolean;
  headChanged: boolean;
  commitOccurred: boolean;
  pushKnown: boolean;
  pushIndependentlyEvidenced: boolean;
  unexpectedChanges: string[];
  executionVerdict: ExecutionVerdict;
  isolationEvidence?: IsolationEvidence;
}

export interface IsolationEvidence {
  workspacePath: string;
  startingHead: string;
  candidateChangedPaths: string[];
  authorizedCandidatePaths: string[];
  unauthorizedCandidatePaths: string[];
  protectedCandidatePaths: string[];
  candidateStatuses: string[];
  applicationAttempted: boolean;
  applicationSucceeded: boolean;
  governedPreApplicationGitEvidence: GitEvidence;
  governedPostApplicationGitEvidence: GitEvidence;
  cleanupStatus: "pending" | "completed" | "failed";
}

export interface SynthesizeResultInput {
  frozen: FrozenAssignment;
  providerId: string;
  providerSessionId: string | null;
  runId: string | null;
  providerStatus: string;
  normalizedEvents: NormalizedExecutionEvent[];
  providerFinalResultText: string | null;
  preRunGitEvidence: GitEvidence | null;
  postRunGitEvidence: GitEvidence | null;
  policyDenials: HookDecisionRecord[];
  changedPaths: string[];
  protectedPathMutationOccurred: boolean;
  branchChanged: boolean;
  headChanged: boolean;
  commitOccurred: boolean;
  unexpectedChanges: string[];
  evidenceIncomplete?: boolean;
  providerFailed?: boolean;
  isolationEvidence?: IsolationEvidence;
}

export function synthesizeExecutionResult(input: SynthesizeResultInput): ExecutionResult {
  const protectedPathViolationAttempted = input.policyDenials.some(
    (denial) =>
      denial.permission === "deny" &&
      (denial.reason.startsWith("protected_path_") ||
        denial.reason.includes("protected") ||
        denial.reason.includes("fail_closed")),
  );

  let executionVerdict: ExecutionVerdict;
  if (input.evidenceIncomplete) {
    executionVerdict = "evidence_incomplete";
  } else if (input.providerFailed) {
    executionVerdict = "provider_failed";
  } else if (
    input.protectedPathMutationOccurred ||
    input.branchChanged ||
    input.headChanged ||
    input.commitOccurred ||
    input.unexpectedChanges.length > 0
  ) {
    executionVerdict = "repository_state_violation";
  } else if (protectedPathViolationAttempted || input.policyDenials.length > 0) {
    executionVerdict = "completed_with_policy_denial";
  } else {
    executionVerdict = "completed_within_policy";
  }

  return {
    assignmentId: input.frozen.assignment.assignmentId,
    assignmentHash: input.frozen.assignmentHash,
    providerId: input.providerId,
    providerSessionId: input.providerSessionId,
    runId: input.runId,
    providerStatus: input.providerStatus,
    normalizedEvents: input.normalizedEvents,
    providerFinalResultText: input.providerFinalResultText,
    preRunGitEvidence: input.preRunGitEvidence,
    postRunGitEvidence: input.postRunGitEvidence,
    changedPaths: input.changedPaths,
    policyDenials: input.policyDenials,
    protectedPathViolationAttempted,
    protectedPathMutationOccurred: input.protectedPathMutationOccurred,
    branchChanged: input.branchChanged,
    headChanged: input.headChanged,
    commitOccurred: input.commitOccurred,
    pushKnown: false,
    pushIndependentlyEvidenced: false,
    unexpectedChanges: input.unexpectedChanges,
    executionVerdict,
    ...(input.isolationEvidence ? { isolationEvidence: input.isolationEvidence } : {}),
  };
}
