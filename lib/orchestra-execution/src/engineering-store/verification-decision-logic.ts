import type { FrozenAssignment } from "../assignment.js";
import type { ExecutionResult } from "../result.js";
import type { ExecutionEvidence, FrozenAssignmentRecord, VerificationDecision } from "./types.js";

export const VERIFICATION_DECISION_REASON_CODES = [
  "verifier_execution_reviewable",
  "verifier_required_evidence_complete",
  "verifier_repository_posture_clean",
  "verifier_policy_denial_noninvalidating",
  "verifier_relationship_coherent",
  "executor_implementation_posture_clean",
  "executor_required_tests_passed",
  "executor_repository_state_violation",
  "executor_protected_mutation",
  "executor_unexpected_mutation",
  "executor_commit_violation",
  "executor_push_violation",
  "executor_required_test_failure",
  "executor_scope_violation",
  "verifier_provider_failed",
  "verifier_evidence_incomplete",
  "verifier_required_evidence_missing",
  "verifier_repository_state_unresolved",
  "verifier_baseline_unresolved",
  "verifier_protected_mutation",
  "verifier_unauthorized_mutation",
  "verifier_commit_violation",
  "verifier_push_violation",
  "verifier_execution_not_terminal",
  "executor_provider_failed_indeterminate",
  "executor_evidence_incomplete_indeterminate",
] as const;

export type VerificationDecisionReasonCode = (typeof VERIFICATION_DECISION_REASON_CODES)[number];

function isBaselineMismatch(result: ExecutionResult): boolean {
  return (
    result.unexpectedChanges.includes("starting_head_mismatch") ||
    result.unexpectedChanges.includes("branch_mismatch")
  );
}

function isScopeViolation(result: ExecutionResult, allowedPaths: string[]): boolean {
  if (result.unexpectedChanges.length === 0) return false;
  const nonBaseline = result.unexpectedChanges.filter(
    (item) => item !== "starting_head_mismatch" && item !== "branch_mismatch",
  );
  return nonBaseline.length > 0;
}

export function machineTestOutcome(result: ExecutionResult): "pass" | "fail" | "missing" {
  for (const event of result.normalizedEvents) {
    const summary = event.rawSummary?.testOutcome;
    if (summary === "pass" || summary === "fail") return summary;
  }
  return "missing";
}

export function evaluateExecutorImplementation(
  executorAssignment: FrozenAssignment,
  executorEvidence: ExecutionEvidence,
): { decision: VerificationDecision | null; reasonCodes: string[]; indeterminate: boolean } {
  const result = executorEvidence.result;
  const assignment = executorAssignment.assignment;
  const codes: string[] = [];

  if (result.executionVerdict === "provider_failed") {
    return {
      decision: "INDETERMINATE",
      reasonCodes: ["executor_provider_failed_indeterminate"],
      indeterminate: true,
    };
  }
  if (result.executionVerdict === "evidence_incomplete") {
    return {
      decision: "INDETERMINATE",
      reasonCodes: ["executor_evidence_incomplete_indeterminate"],
      indeterminate: true,
    };
  }

  let defect = false;

  if (result.protectedPathMutationOccurred) {
    codes.push("executor_protected_mutation");
    defect = true;
  }
  if (result.executionVerdict === "repository_state_violation" && !isBaselineMismatch(result)) {
    codes.push("executor_repository_state_violation");
    defect = true;
  }
  if (isScopeViolation(result, assignment.allowedPaths)) {
    codes.push("executor_unexpected_mutation");
    defect = true;
  }
  if (result.commitOccurred && assignment.commitAuthorization !== true) {
    codes.push("executor_commit_violation");
    defect = true;
  }
  if (result.pushIndependentlyEvidenced && assignment.requireNoPush) {
    codes.push("executor_push_violation");
    defect = true;
  }

  const requiresTests =
    assignment.requiredEvidence.some((item) => item.toLowerCase() === "tests" || item.toLowerCase() === "test") ||
    executorEvidence.requiredEvidence.some((item) => item.toLowerCase() === "tests" || item.toLowerCase() === "test");
  if (requiresTests) {
    const testOutcome = machineTestOutcome(result);
    if (testOutcome === "fail") {
      codes.push("executor_required_test_failure");
      defect = true;
    } else if (testOutcome === "missing") {
      return {
        decision: "INDETERMINATE",
        reasonCodes: ["verifier_required_evidence_missing"],
        indeterminate: true,
      };
    } else {
      codes.push("executor_required_tests_passed");
    }
  }

  if (defect) {
    return { decision: "CORRECTION_REQUIRED", reasonCodes: codes, indeterminate: false };
  }

  codes.push("executor_implementation_posture_clean");
  return { decision: null, reasonCodes: codes, indeterminate: false };
}

export function evaluateVerifierExecution(
  verifierEvidence: ExecutionEvidence,
): { adjudicable: boolean; reasonCodes: string[]; indeterminateDecision: VerificationDecision | null } {
  const result = verifierEvidence.result;
  const codes: string[] = [];

  if (result.executionVerdict === "provider_failed") {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_provider_failed"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (result.executionVerdict === "evidence_incomplete") {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_evidence_incomplete"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (result.providerStatus === "not_started") {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_execution_not_terminal"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (isBaselineMismatch(result)) {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_baseline_unresolved"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (verifierEvidence.requiredEvidenceMissing.length > 0) {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_required_evidence_missing"],
      indeterminateDecision: "INDETERMINATE",
    };
  }

  if (result.protectedPathMutationOccurred) {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_protected_mutation"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (result.branchChanged || result.headChanged) {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_repository_state_unresolved"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (result.commitOccurred) {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_commit_violation"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (result.pushIndependentlyEvidenced) {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_push_violation"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (result.executionVerdict === "repository_state_violation") {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_repository_state_unresolved"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (isScopeViolation(result, [])) {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_unauthorized_mutation"],
      indeterminateDecision: "INDETERMINATE",
    };
  }

  codes.push("verifier_execution_reviewable");
  codes.push("verifier_required_evidence_complete");
  codes.push("verifier_repository_posture_clean");
  if (result.executionVerdict === "completed_with_policy_denial") {
    codes.push("verifier_policy_denial_noninvalidating");
  }
  return { adjudicable: true, reasonCodes: codes, indeterminateDecision: null };
}

export function deriveVerificationDecision(input: {
  verifierRecord: FrozenAssignmentRecord;
  verifierEvidence: ExecutionEvidence;
  executorRecord: FrozenAssignmentRecord;
  executorEvidence: ExecutionEvidence;
}): { decision: VerificationDecision; reasonCodes: string[] } {
  const verifierEval = evaluateVerifierExecution(input.verifierEvidence);
  if (!verifierEval.adjudicable) {
    return {
      decision: verifierEval.indeterminateDecision ?? "INDETERMINATE",
      reasonCodes: verifierEval.reasonCodes,
    };
  }

  const executorEval = evaluateExecutorImplementation(
    input.executorRecord.frozen,
    input.executorEvidence,
  );
  if (executorEval.indeterminate) {
    return {
      decision: executorEval.decision ?? "INDETERMINATE",
      reasonCodes: executorEval.reasonCodes,
    };
  }
  if (executorEval.decision === "CORRECTION_REQUIRED") {
    return {
      decision: "CORRECTION_REQUIRED",
      reasonCodes: [...verifierEval.reasonCodes, "verifier_relationship_coherent", ...executorEval.reasonCodes],
    };
  }

  return {
    decision: "VERIFIED",
    reasonCodes: [
      ...verifierEval.reasonCodes,
      "verifier_relationship_coherent",
      ...executorEval.reasonCodes,
    ],
  };
}
