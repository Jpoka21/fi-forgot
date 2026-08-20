import type { FrozenAssignment } from "../assignment.js";
import type { VerificationRequirementRef } from "../verification-requirements.js";
import type { ExecutionResult } from "../result.js";
import type {
  ExecutionEvidence,
  FrozenAssignmentRecord,
  VerificationDecision,
  VerifierRequirementOutcome,
  VerifierSemanticFindingRecord,
} from "./types.js";

export const VERIFICATION_DECISION_REASON_CODES = [
  "verifier_execution_reviewable",
  "verifier_required_evidence_complete",
  "verifier_repository_posture_clean",
  "verifier_policy_denial_noninvalidating",
  "verifier_relationship_coherent",
  "executor_implementation_posture_clean",
  "executor_repository_state_violation",
  "executor_protected_mutation",
  "executor_unexpected_mutation",
  "executor_commit_violation",
  "executor_push_violation",
  "executor_scope_violation",
  "semantic_findings_missing",
  "semantic_findings_incomplete",
  "semantic_requirement_failed",
  "semantic_requirement_not_evaluated",
  "semantic_evidence_insufficient",
  "semantic_findings_corrupt",
  "unknown_push_evidence",
  "unknown_commit_evidence",
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
  "verifier_tolerated_executor_dirty_paths",
  "executor_provider_failed_indeterminate",
  "executor_evidence_incomplete_indeterminate",
  "semantic_requirements_satisfied",
] as const;

export type VerificationDecisionReasonCode = (typeof VERIFICATION_DECISION_REASON_CODES)[number];

function isBaselineMismatch(result: ExecutionResult): boolean {
  return (
    result.unexpectedChanges.includes("starting_head_mismatch") ||
    result.unexpectedChanges.includes("branch_mismatch")
  );
}

function isScopeViolation(result: ExecutionResult): boolean {
  if (result.unexpectedChanges.length === 0) return false;
  return result.unexpectedChanges.some(
    (item) => item !== "starting_head_mismatch" && item !== "branch_mismatch",
  );
}

function pushEvidenceKnown(result: ExecutionResult): boolean {
  return result.pushKnown || result.pushIndependentlyEvidenced;
}

function commitEvidenceKnown(result: ExecutionResult): boolean {
  return result.commitKnown || result.commitOccurred;
}

export function evaluateSemanticFindings(input: {
  requirements: VerificationRequirementRef[];
  findings: VerifierSemanticFindingRecord[];
}): { decision: VerificationDecision | null; reasonCodes: string[]; indeterminate: boolean } {
  const codes: string[] = [];
  const byRequirement = new Map<string, VerifierSemanticFindingRecord>();
  for (const finding of input.findings) {
    if (byRequirement.has(finding.requirementId)) {
      return {
        decision: "INDETERMINATE",
        reasonCodes: ["semantic_findings_corrupt"],
        indeterminate: true,
      };
    }
    byRequirement.set(finding.requirementId, finding);
  }

  if (input.requirements.length === 0) {
    return {
      decision: "INDETERMINATE",
      reasonCodes: ["semantic_findings_incomplete"],
      indeterminate: true,
    };
  }

  if (input.findings.length === 0) {
    return {
      decision: "INDETERMINATE",
      reasonCodes: ["semantic_findings_missing"],
      indeterminate: true,
    };
  }

  for (const requirement of input.requirements) {
    const finding = byRequirement.get(requirement.requirementId);
    if (!finding) {
      return {
        decision: "INDETERMINATE",
        reasonCodes: ["semantic_findings_incomplete"],
        indeterminate: true,
      };
    }
    const outcome = finding.outcome;
    if (outcome === "requirement_failed") {
      codes.push("semantic_requirement_failed");
      return { decision: "CORRECTION_REQUIRED", reasonCodes: codes, indeterminate: false };
    }
    if (outcome === "requirement_not_evaluated") {
      return {
        decision: "INDETERMINATE",
        reasonCodes: ["semantic_requirement_not_evaluated"],
        indeterminate: true,
      };
    }
    if (outcome === "evidence_insufficient") {
      return {
        decision: "INDETERMINATE",
        reasonCodes: ["semantic_evidence_insufficient"],
        indeterminate: true,
      };
    }
  }

  for (const requirement of input.requirements) {
    const extra = byRequirement.get(requirement.requirementId);
    if (extra && extra.outcome !== "requirement_satisfied") {
      return {
        decision: "INDETERMINATE",
        reasonCodes: ["semantic_findings_incomplete"],
        indeterminate: true,
      };
    }
  }

  const unknownFindings = input.findings.filter(
    (finding) => !input.requirements.some((req) => req.requirementId === finding.requirementId),
  );
  if (unknownFindings.length > 0) {
    return {
      decision: "INDETERMINATE",
      reasonCodes: ["semantic_findings_corrupt"],
      indeterminate: true,
    };
  }

  codes.push("semantic_requirements_satisfied");
  return { decision: null, reasonCodes: codes, indeterminate: false };
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
  if (assignment.requireNoPush && !pushEvidenceKnown(result)) {
    return {
      decision: "INDETERMINATE",
      reasonCodes: ["unknown_push_evidence"],
      indeterminate: true,
    };
  }
  if (!assignment.commitAuthorization && !commitEvidenceKnown(result)) {
    return {
      decision: "INDETERMINATE",
      reasonCodes: ["unknown_commit_evidence"],
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
  if (isScopeViolation(result)) {
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

  if (defect) {
    return { decision: "CORRECTION_REQUIRED", reasonCodes: codes, indeterminate: false };
  }

  codes.push("executor_implementation_posture_clean");
  return { decision: null, reasonCodes: codes, indeterminate: false };
}

function normalizeRepoPath(path: string): string {
  return path.replace(/\\/g, "/");
}

/** Provider/harness noise that must not block verifier adjudication. */
function isVerifierInfraNoisePath(path: string): boolean {
  const normalized = normalizeRepoPath(path);
  return normalized === ".cursor" || normalized.startsWith(".cursor/");
}

export function evaluateVerifierExecution(
  verifierEvidence: ExecutionEvidence,
  options?: {
    toleratedDirtyPaths?: string[];
    /** When the executor already evidenced a protected mutation, verifier observation of the same dirt is not independently disqualifying. */
    tolerateExecutorProtectedMutation?: boolean;
  },
): { adjudicable: boolean; reasonCodes: string[]; indeterminateDecision: VerificationDecision | null } {
  const result = verifierEvidence.result;
  const codes: string[] = [];
  const tolerated = new Set(
    (options?.toleratedDirtyPaths ?? []).map((path) => normalizeRepoPath(path)),
  );

  function isToleratedDirtyOnly(): boolean {
    const unexpected = result.unexpectedChanges.filter(
      (item) => item !== "starting_head_mismatch" && item !== "branch_mismatch",
    );
    if (unexpected.length === 0 && result.changedPaths.length === 0) return false;
    const dirty = [...new Set([...unexpected, ...result.changedPaths])]
      .map((path) => normalizeRepoPath(path))
      .filter((path) => !isVerifierInfraNoisePath(path));
    if (dirty.length === 0) {
      // Only harness/infra paths remain dirty.
      return true;
    }
    if (tolerated.size === 0) return false;
    return dirty.every((path) => tolerated.has(path));
  }

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

  if (result.protectedPathMutationOccurred && !options?.tolerateExecutorProtectedMutation) {
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
  if (result.executionVerdict === "repository_state_violation" && !isToleratedDirtyOnly()) {
    return {
      adjudicable: false,
      reasonCodes: ["verifier_repository_state_unresolved"],
      indeterminateDecision: "INDETERMINATE",
    };
  }
  if (isScopeViolation(result) && !isToleratedDirtyOnly()) {
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
  if (isToleratedDirtyOnly()) {
    codes.push("verifier_tolerated_executor_dirty_paths");
  }
  if (result.protectedPathMutationOccurred && options?.tolerateExecutorProtectedMutation) {
    codes.push("verifier_tolerated_executor_protected_mutation");
  }
  return { adjudicable: true, reasonCodes: codes, indeterminateDecision: null };
}

export function deriveVerificationDecision(input: {
  verifierRecord: FrozenAssignmentRecord;
  verifierEvidence: ExecutionEvidence;
  executorRecord: FrozenAssignmentRecord;
  executorEvidence: ExecutionEvidence;
  semanticFindings: VerifierSemanticFindingRecord[];
}): { decision: VerificationDecision; reasonCodes: string[] } {
  const executorEval = evaluateExecutorImplementation(
    input.executorRecord.frozen,
    input.executorEvidence,
  );
  const verifierEval = evaluateVerifierExecution(input.verifierEvidence, {
    toleratedDirtyPaths: [
      ...input.executorEvidence.result.changedPaths,
      ...input.executorEvidence.result.unexpectedChanges.filter(
        (item) => item !== "starting_head_mismatch" && item !== "branch_mismatch",
      ),
    ],
    tolerateExecutorProtectedMutation: input.executorEvidence.result.protectedPathMutationOccurred,
  });

  // Objective executor defects win over verifier dirt that merely observes the same mutation.
  if (executorEval.decision === "CORRECTION_REQUIRED") {
    const independentVerifierBlockers = new Set([
      "verifier_provider_failed",
      "verifier_evidence_incomplete",
      "verifier_execution_not_terminal",
      "verifier_baseline_unresolved",
      "verifier_required_evidence_missing",
      "verifier_commit_violation",
      "verifier_push_violation",
    ]);
    if (
      !verifierEval.adjudicable &&
      verifierEval.reasonCodes.some((code) => independentVerifierBlockers.has(code))
    ) {
      return {
        decision: verifierEval.indeterminateDecision ?? "INDETERMINATE",
        reasonCodes: verifierEval.reasonCodes,
      };
    }
    return {
      decision: "CORRECTION_REQUIRED",
      reasonCodes: [
        ...(verifierEval.adjudicable ? verifierEval.reasonCodes : ["verifier_shared_executor_defect_observed"]),
        "verifier_relationship_coherent",
        ...executorEval.reasonCodes,
      ],
    };
  }

  if (!verifierEval.adjudicable) {
    return {
      decision: verifierEval.indeterminateDecision ?? "INDETERMINATE",
      reasonCodes: verifierEval.reasonCodes,
    };
  }

  if (executorEval.indeterminate) {
    return {
      decision: executorEval.decision ?? "INDETERMINATE",
      reasonCodes: executorEval.reasonCodes,
    };
  }

  const requirements = input.verifierRecord.frozen.assignment.verificationRequirements ?? [];
  const semanticEval = evaluateSemanticFindings({
    requirements,
    findings: input.semanticFindings,
  });
  if (semanticEval.indeterminate) {
    return {
      decision: semanticEval.decision ?? "INDETERMINATE",
      reasonCodes: [...verifierEval.reasonCodes, ...semanticEval.reasonCodes],
    };
  }
  if (semanticEval.decision === "CORRECTION_REQUIRED") {
    return {
      decision: "CORRECTION_REQUIRED",
      reasonCodes: [
        ...verifierEval.reasonCodes,
        "verifier_relationship_coherent",
        ...executorEval.reasonCodes,
        ...semanticEval.reasonCodes,
      ],
    };
  }

  return {
    decision: "VERIFIED",
    reasonCodes: [
      ...verifierEval.reasonCodes,
      "verifier_relationship_coherent",
      ...executorEval.reasonCodes,
      ...semanticEval.reasonCodes,
    ],
  };
}
