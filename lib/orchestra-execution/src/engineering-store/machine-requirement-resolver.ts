import type { VerificationRequirementRef } from "../verification-requirements.js";
import type { ExecutionEvidence, FrozenAssignmentRecord, VerifierRequirementOutcome } from "./types.js";

function pushKnown(result: ExecutionEvidence["result"]): boolean {
  return result.pushKnown || result.pushIndependentlyEvidenced;
}

function commitKnown(result: ExecutionEvidence["result"]): boolean {
  return result.commitKnown || result.commitOccurred;
}

function isBaselineMismatch(result: ExecutionEvidence["result"]): boolean {
  return (
    result.unexpectedChanges.includes("starting_head_mismatch") ||
    result.unexpectedChanges.includes("branch_mismatch")
  );
}

function isScopeViolation(result: ExecutionEvidence["result"]): boolean {
  if (result.unexpectedChanges.length === 0) return false;
  return result.unexpectedChanges.some(
    (item) => item !== "starting_head_mismatch" && item !== "branch_mismatch",
  );
}

/**
 * Derive authoritative MACHINE_RESOLVABLE outcomes from trusted Orchestra evidence only.
 * Provider proposals are never consulted.
 */
export function resolveMachineRequirement(input: {
  requirement: VerificationRequirementRef;
  executorRecord: FrozenAssignmentRecord;
  executorEvidence: ExecutionEvidence;
}): { outcome: VerifierRequirementOutcome; reasonCode: string; evidenceReferences: string[] } {
  const assignment = input.executorRecord.frozen.assignment;
  const result = input.executorEvidence.result;
  const refs = [
    `orchestra:executor_evidence:${input.executorEvidence.evidenceId}`,
    `orchestra:assignment:frozen:${assignment.assignmentId}`,
  ];

  switch (input.requirement.requirementKind) {
    case "repository_identity": {
      if (!result.postRunGitEvidence?.head || !result.postRunGitEvidence.branch) {
        return { outcome: "evidence_insufficient", reasonCode: "unknown_repository_identity", evidenceReferences: refs };
      }
      if (
        result.postRunGitEvidence.branch !== assignment.branch ||
        result.unexpectedChanges.includes("branch_mismatch")
      ) {
        return { outcome: "requirement_failed", reasonCode: "repository_identity_mismatch", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "repository_identity_matched", evidenceReferences: refs };
    }
    case "repository_scope": {
      if (isScopeViolation(result)) {
        return { outcome: "requirement_failed", reasonCode: "scope_violation", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "scope_clean", evidenceReferences: refs };
    }
    case "protected_paths": {
      if (result.protectedPathMutationOccurred) {
        return { outcome: "requirement_failed", reasonCode: "protected_path_mutation", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "protected_paths_intact", evidenceReferences: refs };
    }
    case "git_posture": {
      if (!result.postRunGitEvidence) {
        return { outcome: "evidence_insufficient", reasonCode: "unknown_git_posture", evidenceReferences: refs };
      }
      if (assignment.requireNoPush && !pushKnown(result)) {
        return { outcome: "evidence_insufficient", reasonCode: "unknown_push_evidence", evidenceReferences: refs };
      }
      if (!assignment.commitAuthorization && !commitKnown(result)) {
        return { outcome: "evidence_insufficient", reasonCode: "unknown_commit_evidence", evidenceReferences: refs };
      }
      if (result.commitOccurred && assignment.commitAuthorization !== true) {
        return { outcome: "requirement_failed", reasonCode: "unauthorized_commit", evidenceReferences: refs };
      }
      if (result.pushIndependentlyEvidenced && assignment.requireNoPush) {
        return { outcome: "requirement_failed", reasonCode: "unauthorized_push", evidenceReferences: refs };
      }
      if (isBaselineMismatch(result)) {
        return { outcome: "requirement_failed", reasonCode: "git_baseline_mismatch", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "git_posture_clean", evidenceReferences: refs };
    }
    case "executor_evidence_linkage": {
      if (
        input.executorEvidence.assignmentId !== assignment.assignmentId ||
        input.executorEvidence.assignmentHash !== input.executorRecord.frozen.assignmentHash
      ) {
        return { outcome: "requirement_failed", reasonCode: "executor_evidence_linkage_broken", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "executor_evidence_linked", evidenceReferences: refs };
    }
    case "required_evidence": {
      if (input.executorEvidence.requiredEvidenceMissing.length > 0) {
        return {
          outcome: "evidence_insufficient",
          reasonCode: "required_evidence_missing",
          evidenceReferences: refs,
        };
      }
      return { outcome: "requirement_satisfied", reasonCode: "required_evidence_present", evidenceReferences: refs };
    }
    case "required_tests": {
      // No trusted machine test source in current evidence architecture.
      return {
        outcome: "evidence_insufficient",
        reasonCode: "trusted_test_evidence_unavailable",
        evidenceReferences: refs,
      };
    }
    default:
      return { outcome: "requirement_not_evaluated", reasonCode: "not_machine_resolvable", evidenceReferences: refs };
  }
}
