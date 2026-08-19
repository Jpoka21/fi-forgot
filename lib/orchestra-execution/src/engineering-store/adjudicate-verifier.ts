import { EngineeringStoreError, FileEngineeringStore } from "./store.js";
import type {
  ExecutionEvidence,
  FrozenAssignmentRecord,
  VerificationDecision,
  VerificationDecisionRecord,
  VerifierAuthorizationReceipt,
} from "./types.js";
import { deriveVerificationDecision } from "./verification-decision-logic.js";
import {
  buildVerificationDecisionRecord,
  validateVerificationDecision,
} from "./verification-decision-record.js";

export const VERIFICATION_ADJUDICATION_REFUSALS = [
  "verifier_not_found",
  "verifier_corrupt",
  "verifier_role_required",
  "governed_authorization_required",
  "authorization_provenance_corrupt",
  "verifier_execution_evidence_not_found",
  "verifier_evidence_corrupt",
  "verifier_evidence_assignment_mismatch",
  "executor_assignment_not_found",
  "executor_evidence_not_found",
  "executor_evidence_corrupt",
  "relationship_mismatch",
  "evidence_incomplete",
  "decision_already_conflicts",
] as const;

export type VerificationAdjudicationRefusal = (typeof VERIFICATION_ADJUDICATION_REFUSALS)[number];

export interface AdjudicateVerifierExecutionInput {
  store: FileEngineeringStore;
  verifierAssignmentId: string;
}

export interface AdjudicateVerifierExecutionResult {
  adjudicated: boolean;
  refused: boolean;
  reason: VerificationAdjudicationRefusal | null;
  warnings: string[];
  verifierAssignmentId: string;
  verifierAssignmentHash: string | null;
  verifierExecutionEvidenceId: string | null;
  verifiedExecutorAssignmentId: string | null;
  verifiedExecutorExecutionEvidenceId: string | null;
  authorization: VerifierAuthorizationReceipt | null;
  verifierEvidence: ExecutionEvidence | null;
  executorEvidence: ExecutionEvidence | null;
  decision: VerificationDecision | null;
  decisionRecord: VerificationDecisionRecord | null;
  duplicateDecisionReused: boolean;
}

function refused(
  input: AdjudicateVerifierExecutionInput,
  reason: VerificationAdjudicationRefusal,
  extras: Partial<AdjudicateVerifierExecutionResult> = {},
): AdjudicateVerifierExecutionResult {
  return {
    adjudicated: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    verifierAssignmentId: input.verifierAssignmentId,
    verifierAssignmentHash: extras.verifierAssignmentHash ?? null,
    verifierExecutionEvidenceId: extras.verifierExecutionEvidenceId ?? null,
    verifiedExecutorAssignmentId: extras.verifiedExecutorAssignmentId ?? null,
    verifiedExecutorExecutionEvidenceId: extras.verifiedExecutorExecutionEvidenceId ?? null,
    authorization: extras.authorization ?? null,
    verifierEvidence: extras.verifierEvidence ?? null,
    executorEvidence: extras.executorEvidence ?? null,
    decision: extras.decision ?? null,
    decisionRecord: extras.decisionRecord ?? null,
    duplicateDecisionReused: extras.duplicateDecisionReused ?? false,
  };
}

function adjudicated(
  input: AdjudicateVerifierExecutionInput,
  extras: Partial<AdjudicateVerifierExecutionResult>,
): AdjudicateVerifierExecutionResult {
  return {
    adjudicated: true,
    refused: false,
    reason: null,
    warnings: extras.warnings ?? [
      "semantic decision is machine evidence only; provider prose is not authority",
      "human final authority remains outside automatic continuation",
    ],
    verifierAssignmentId: input.verifierAssignmentId,
    verifierAssignmentHash: extras.verifierAssignmentHash ?? null,
    verifierExecutionEvidenceId: extras.verifierExecutionEvidenceId ?? null,
    verifiedExecutorAssignmentId: extras.verifiedExecutorAssignmentId ?? null,
    verifiedExecutorExecutionEvidenceId: extras.verifiedExecutorExecutionEvidenceId ?? null,
    authorization: extras.authorization ?? null,
    verifierEvidence: extras.verifierEvidence ?? null,
    executorEvidence: extras.executorEvidence ?? null,
    decision: extras.decision ?? null,
    decisionRecord: extras.decisionRecord ?? null,
    duplicateDecisionReused: extras.duplicateDecisionReused ?? false,
  };
}

/**
 * Governed semantic verification decision from persisted authoritative evidence only.
 * Does not invoke providers, rerun verifiers, or trust provider prose.
 */
export function adjudicateVerifierExecution(
  input: AdjudicateVerifierExecutionInput,
): AdjudicateVerifierExecutionResult {
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
  const extras: Partial<AdjudicateVerifierExecutionResult> = {
    verifierAssignmentHash: verifier.assignmentHash,
    verifiedExecutorAssignmentId: verifierRecord.relationship.verifiesAssignmentId ?? null,
    verifiedExecutorExecutionEvidenceId: verifierRecord.relationship.verifiesExecutionEvidenceId ?? null,
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
  if (provenance !== "valid") {
    return refused(input, "authorization_provenance_corrupt", extras);
  }

  const authorization = input.store.findValidVerifierAuthorizationReceipt(
    verifier.assignment.assignmentId,
    verifier.assignmentHash,
  );
  extras.authorization = authorization;

  const executorAssignmentId = verifierRecord.relationship.verifiesAssignmentId?.trim() ?? "";
  const executorEvidenceId = verifierRecord.relationship.verifiesExecutionEvidenceId?.trim() ?? "";
  if (!executorAssignmentId || !executorEvidenceId) {
    return refused(input, "relationship_mismatch", extras);
  }
  if (
    authorization &&
    (authorization.executorAssignmentId !== executorAssignmentId ||
      authorization.executionEvidenceId !== executorEvidenceId)
  ) {
    return refused(input, "relationship_mismatch", extras);
  }

  extras.verifiedExecutorAssignmentId = executorAssignmentId;
  extras.verifiedExecutorExecutionEvidenceId = executorEvidenceId;

  let executorRecord: FrozenAssignmentRecord;
  try {
    executorRecord = input.store.loadAssignmentRecord(executorAssignmentId);
  } catch (error) {
    if (error instanceof EngineeringStoreError && String(error.message).includes("not found")) {
      return refused(input, "executor_assignment_not_found", extras);
    }
    return refused(input, "verifier_corrupt", extras);
  }

  let executorEvidence: ExecutionEvidence;
  try {
    executorEvidence = input.store.loadExecutionEvidenceById(executorAssignmentId, executorEvidenceId);
  } catch (error) {
    if (error instanceof EngineeringStoreError && String(error.message).includes("not found")) {
      return refused(input, "executor_evidence_not_found", extras);
    }
    return refused(input, "executor_evidence_corrupt", extras);
  }
  extras.executorEvidence = executorEvidence;

  if (
    executorEvidence.assignmentId !== executorRecord.frozen.assignment.assignmentId ||
    executorEvidence.assignmentHash !== executorRecord.frozen.assignmentHash
  ) {
    return refused(input, "relationship_mismatch", extras);
  }

  let verifierEvidence: ExecutionEvidence | null;
  try {
    verifierEvidence = input.store.loadLatestExecutionEvidence(verifier.assignment.assignmentId);
  } catch {
    return refused(input, "verifier_evidence_corrupt", extras);
  }
  if (!verifierEvidence) {
    return refused(input, "verifier_execution_evidence_not_found", extras);
  }
  extras.verifierEvidence = verifierEvidence;
  extras.verifierExecutionEvidenceId = verifierEvidence.evidenceId;

  try {
    input.store.assertTrustedExecutionEvidence(verifierEvidence);
  } catch {
    return refused(input, "verifier_evidence_corrupt", extras);
  }

  if (
    verifierEvidence.assignmentId !== verifier.assignment.assignmentId ||
    verifierEvidence.assignmentHash !== verifier.assignmentHash
  ) {
    return refused(input, "verifier_evidence_assignment_mismatch", extras);
  }

  if (verifierEvidence.requiredEvidenceMissing.length > 0) {
    return refused(input, "evidence_incomplete", extras);
  }

  const existing = input.store.findVerificationDecisionForEvidence(
    verifier.assignment.assignmentId,
    verifierEvidence.evidenceId,
  );
  if (existing) {
    if (!validateVerificationDecision(existing)) {
      return refused(input, "verifier_evidence_corrupt", extras);
    }
    return adjudicated(input, {
      ...extras,
      decision: existing.decision,
      decisionRecord: existing,
      duplicateDecisionReused: true,
      warnings: ["existing semantic verification decision reused"],
    });
  }

  const derived = deriveVerificationDecision({
    verifierRecord,
    verifierEvidence,
    executorRecord,
    executorEvidence,
  });

  const conflicting = input.store.loadVerificationDecisions(verifier.assignment.assignmentId).find(
    (row) =>
      row.verifierExecutionEvidenceId === verifierEvidence.evidenceId &&
      validateVerificationDecision(row) &&
      row.decision !== derived.decision,
  );
  if (conflicting) {
    return refused(input, "decision_already_conflicts", {
      ...extras,
      decisionRecord: conflicting,
      decision: conflicting.decision,
    });
  }

  const record = buildVerificationDecisionRecord({
    verifierAssignmentId: verifier.assignment.assignmentId,
    verifierAssignmentHash: verifier.assignmentHash,
    verifierExecutionEvidenceId: verifierEvidence.evidenceId,
    verifiedExecutorAssignmentId: executorAssignmentId,
    verifiedExecutorExecutionEvidenceId: executorEvidenceId,
    decision: derived.decision,
    decisionReasonCodes: derived.reasonCodes,
  });

  const persisted = input.store.persistVerificationDecision(record);
  return adjudicated(input, {
    ...extras,
    decision: persisted.decision,
    decisionRecord: persisted,
    duplicateDecisionReused: false,
  });
}
