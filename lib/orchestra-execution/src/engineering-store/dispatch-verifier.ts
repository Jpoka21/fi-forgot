import { DEFAULT_PROHIBITED_COMMAND_CLASSES } from "../assignment.js";
import { isReadOnlyVerifierAssignment } from "../execution-policy.js";
import { createGovernedVerifierExecutionCapability } from "../governed-verifier-capability.js";
import { collectGitEvidence } from "../git-evidence.js";
import { isForgotIdentifierRepository } from "../hooks/project-hook.js";
import type { ExecutionProvider } from "../provider-contract.js";
import type { ExecutionResult } from "../result.js";
import { dispatchFrozenAssignment } from "./dispatch.js";
import { EngineeringStoreError, FileEngineeringStore } from "./store.js";
import type {
  ExecutionEvidence,
  FrozenAssignmentRecord,
  VerifierAuthorizationReceipt,
} from "./types.js";

export const VERIFIER_DISPATCH_REFUSALS = [
  "verifier_not_found",
  "verifier_corrupt",
  "verifier_role_required",
  "governed_authorization_required",
  "authorization_assignment_id_mismatch",
  "authorization_assignment_hash_mismatch",
  "authorization_provenance_corrupt",
  "verifies_assignment_id_required",
  "verifies_execution_evidence_id_required",
  "executor_not_found",
  "referenced_assignment_not_executor",
  "executor_evidence_not_found",
  "executor_evidence_corrupt",
  "executor_evidence_linkage_mismatch",
  "verifier_starting_branch_ambiguous",
  "verifier_starting_head_ambiguous",
  "current_branch_mismatch",
  "current_head_mismatch",
  "write_capable_verifier_refused",
  "commit_authorization_forbidden",
  "push_authorization_forbidden",
  "require_no_push_required",
  "protected_path_policy_incoherent",
  "evidence_persistence_failed",
] as const;

export type VerifierDispatchRefusal = (typeof VERIFIER_DISPATCH_REFUSALS)[number];

export interface DispatchGovernedVerifierAssignmentInput {
  store: FileEngineeringStore;
  provider: ExecutionProvider;
  verifierAssignmentId: string;
  projectHooks?: boolean;
}

export interface GovernedVerifierDispatchResult {
  dispatched: boolean;
  refused: boolean;
  reason: VerifierDispatchRefusal | null;
  warnings: string[];
  verifierAssignmentId: string;
  verifierAssignmentHash: string | null;
  executorAssignmentId: string | null;
  executorAssignmentHash: string | null;
  executorExecutionEvidenceId: string | null;
  authorization: VerifierAuthorizationReceipt | null;
  assignmentRecord: FrozenAssignmentRecord | null;
  evidence: ExecutionEvidence | null;
  result: ExecutionResult | null;
  providerStarted: boolean;
  duplicateEvidenceReused: boolean;
}

function refused(
  input: DispatchGovernedVerifierAssignmentInput,
  reason: VerifierDispatchRefusal,
  extras: Partial<GovernedVerifierDispatchResult> = {},
): GovernedVerifierDispatchResult {
  return {
    dispatched: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    verifierAssignmentId: input.verifierAssignmentId,
    verifierAssignmentHash: extras.verifierAssignmentHash ?? null,
    executorAssignmentId: extras.executorAssignmentId ?? null,
    executorAssignmentHash: extras.executorAssignmentHash ?? null,
    executorExecutionEvidenceId: extras.executorExecutionEvidenceId ?? null,
    authorization: extras.authorization ?? null,
    assignmentRecord: extras.assignmentRecord ?? null,
    evidence: extras.evidence ?? null,
    result: extras.result ?? null,
    providerStarted: false,
    duplicateEvidenceReused: extras.duplicateEvidenceReused ?? false,
  };
}

function samePathSet(left: string[], right: string[]): boolean {
  const a = [...left].map((row) => row.trim()).filter(Boolean).sort();
  const b = [...right].map((row) => row.trim()).filter(Boolean).sort();
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function requiredProhibitedPresent(classes: string[]): boolean {
  return DEFAULT_PROHIBITED_COMMAND_CLASSES.every((item) => classes.includes(item));
}

/**
 * Dispatch a persisted verifier only after proving governed human authorization
 * and read-only policy. Does not record PASS/FAIL or create a correction.
 */
export async function dispatchGovernedVerifierAssignment(
  input: DispatchGovernedVerifierAssignmentInput,
): Promise<GovernedVerifierDispatchResult> {
  let verifierRecord: FrozenAssignmentRecord;
  try {
    verifierRecord = input.store.loadAssignmentRecord(input.verifierAssignmentId);
  } catch (error) {
    if (error instanceof EngineeringStoreError && String(error.message).includes("not found")) {
      return refused(input, "verifier_not_found");
    }
    return refused(input, "verifier_corrupt");
  }

  const verifier = verifierRecord.frozen;
  const extras: Partial<GovernedVerifierDispatchResult> = {
    assignmentRecord: verifierRecord,
    verifierAssignmentHash: verifier.assignmentHash,
    executorAssignmentId: verifierRecord.relationship.verifiesAssignmentId ?? null,
    executorExecutionEvidenceId: verifierRecord.relationship.verifiesExecutionEvidenceId ?? null,
  };

  if (verifier.assignment.role !== "verifier") {
    return refused(input, "verifier_role_required", extras);
  }

  const provenance = input.store.inspectVerifierAuthorizationProvenance(
    verifier.assignment.assignmentId,
    verifier.assignmentHash,
  );
  if (provenance === "missing") {
    return refused(input, "governed_authorization_required", extras);
  }
  if (provenance === "corrupt") {
    return refused(input, "authorization_provenance_corrupt", extras);
  }
  if (provenance === "assignment_id_mismatch") {
    return refused(input, "authorization_assignment_id_mismatch", extras);
  }
  if (provenance === "assignment_hash_mismatch") {
    return refused(input, "authorization_assignment_hash_mismatch", extras);
  }
  const authorization = input.store.findValidVerifierAuthorizationReceipt(
    verifier.assignment.assignmentId,
    verifier.assignmentHash,
  );
  extras.authorization = authorization;

  const executorAssignmentId = verifierRecord.relationship.verifiesAssignmentId?.trim() ?? "";
  const executorEvidenceId = verifierRecord.relationship.verifiesExecutionEvidenceId?.trim() ?? "";
  if (!executorAssignmentId) {
    return refused(input, "verifies_assignment_id_required", extras);
  }
  if (!executorEvidenceId) {
    return refused(input, "verifies_execution_evidence_id_required", extras);
  }
  extras.executorAssignmentId = executorAssignmentId;
  extras.executorExecutionEvidenceId = executorEvidenceId;

  let executorRecord: FrozenAssignmentRecord;
  try {
    executorRecord = input.store.loadAssignmentRecord(executorAssignmentId);
  } catch (error) {
    if (error instanceof EngineeringStoreError && String(error.message).includes("not found")) {
      return refused(input, "executor_not_found", extras);
    }
    return refused(input, "verifier_corrupt", extras);
  }
  if (executorRecord.frozen.assignment.role !== "executor") {
    return refused(input, "referenced_assignment_not_executor", {
      ...extras,
      executorAssignmentHash: executorRecord.frozen.assignmentHash,
    });
  }
  extras.executorAssignmentHash = executorRecord.frozen.assignmentHash;

  let executorEvidence: ExecutionEvidence;
  try {
    executorEvidence = input.store.loadExecutionEvidenceById(executorAssignmentId, executorEvidenceId);
  } catch (error) {
    if (error instanceof EngineeringStoreError && String(error.message).includes("not found")) {
      return refused(input, "executor_evidence_not_found", extras);
    }
    return refused(input, "executor_evidence_corrupt", extras);
  }
  if (
    executorEvidence.assignmentId !== executorRecord.frozen.assignment.assignmentId ||
    executorEvidence.assignmentHash !== executorRecord.frozen.assignmentHash
  ) {
    return refused(input, "executor_evidence_linkage_mismatch", extras);
  }

  const assignment = verifier.assignment;
  if (assignment.allowedPaths.length > 0 || !requiredProhibitedPresent(assignment.prohibitedCommandClasses)) {
    return refused(input, "write_capable_verifier_refused", extras);
  }
  if (assignment.commitAuthorization !== false) {
    return refused(input, "commit_authorization_forbidden", extras);
  }
  if (assignment.pushAuthorization !== false) {
    return refused(input, "push_authorization_forbidden", extras);
  }
  if (assignment.requireNoPush !== true) {
    return refused(input, "require_no_push_required", extras);
  }
  if (!samePathSet(assignment.protectedPaths, executorRecord.frozen.assignment.protectedPaths)) {
    return refused(input, "protected_path_policy_incoherent", extras);
  }

  const post = executorEvidence.result.postRunGitEvidence;
  if (!post?.branch) {
    return refused(input, "verifier_starting_branch_ambiguous", extras);
  }
  if (!post.head) {
    return refused(input, "verifier_starting_head_ambiguous", extras);
  }
  if (assignment.branch !== post.branch) {
    return refused(input, "verifier_starting_branch_ambiguous", extras);
  }
  if (assignment.startingHead !== post.head.toLowerCase()) {
    return refused(input, "verifier_starting_head_ambiguous", extras);
  }

  const current = await collectGitEvidence(assignment.repositoryPath);
  if (!current.branch || current.branch !== assignment.branch) {
    return refused(input, "current_branch_mismatch", extras);
  }
  if (!current.head || current.head !== assignment.startingHead) {
    return refused(input, "current_head_mismatch", extras);
  }

  const existing = input.store.loadLatestExecutionEvidence(assignment.assignmentId);
  if (existing) {
    return {
      dispatched: true,
      refused: false,
      reason: null,
      warnings: ["existing verifier execution evidence reused; refusing to dispatch again"],
      verifierAssignmentId: assignment.assignmentId,
      verifierAssignmentHash: verifier.assignmentHash,
      executorAssignmentId,
      executorAssignmentHash: executorRecord.frozen.assignmentHash,
      executorExecutionEvidenceId: executorEvidenceId,
      authorization,
      assignmentRecord: verifierRecord,
      evidence: existing,
      result: existing.result,
      providerStarted: existing.providerStarted,
      duplicateEvidenceReused: true,
    };
  }

  const projectHooks =
    input.projectHooks ??
    !(
      isForgotIdentifierRepository(assignment.repositoryPath) &&
      isReadOnlyVerifierAssignment(assignment)
    );

  try {
    const governedVerifierCapability = createGovernedVerifierExecutionCapability(
      assignment.assignmentId,
      verifier.assignmentHash,
    );
    const output = await dispatchFrozenAssignment({
      store: input.store,
      provider: input.provider,
      assignmentId: assignment.assignmentId,
      projectHooks,
      governedVerifierCapability,
    });
    return {
      dispatched: true,
      refused: false,
      reason: null,
      warnings: [
        "technical execution verdict is not a verification PASS or FAIL",
        "provider prose is untrusted",
      ],
      verifierAssignmentId: assignment.assignmentId,
      verifierAssignmentHash: verifier.assignmentHash,
      executorAssignmentId,
      executorAssignmentHash: executorRecord.frozen.assignmentHash,
      executorExecutionEvidenceId: executorEvidenceId,
      authorization,
      assignmentRecord: output.assignmentRecord,
      evidence: output.evidence,
      result: output.result,
      providerStarted: output.evidence.providerStarted,
      duplicateEvidenceReused: false,
    };
  } catch (error) {
    const crash = input.store.getCurrentState(assignment.assignmentId).crashReceipts;
    if (crash.length > 0 || String(error instanceof Error ? error.message : error).includes("persist")) {
      return refused(input, "evidence_persistence_failed", {
        ...extras,
        warnings: [error instanceof Error ? error.message : String(error)],
      });
    }
    throw error;
  }
}
