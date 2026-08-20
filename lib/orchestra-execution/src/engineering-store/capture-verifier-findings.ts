import { EngineeringStoreError, FileEngineeringStore } from "./store.js";
import type { ExecutionEvidence, VerifierSemanticFindingProposal } from "./types.js";
import { parseStructuredFindingEvent } from "../structured-finding-event.js";
import { buildVerifierSemanticFindingProposal } from "./semantic-proposal-record.js";

export const SEMANTIC_PROPOSAL_CAPTURE_REFUSALS = [
  "verifier_not_found",
  "verifier_role_required",
  "verifier_execution_evidence_not_found",
  "verifier_evidence_corrupt",
  "relationship_mismatch",
  "unknown_requirement_proposal",
  "duplicate_conflicting_proposal",
] as const;

export type SemanticProposalCaptureRefusal = (typeof SEMANTIC_PROPOSAL_CAPTURE_REFUSALS)[number];

export interface CaptureVerifierSemanticProposalsInput {
  store: FileEngineeringStore;
  verifierAssignmentId: string;
}

export interface CaptureVerifierSemanticProposalsResult {
  captured: boolean;
  refused: boolean;
  reason: SemanticProposalCaptureRefusal | null;
  warnings: string[];
  verifierAssignmentId: string;
  verifierExecutionEvidenceId: string | null;
  proposals: VerifierSemanticFindingProposal[];
  duplicateProposalsReused: boolean;
}

function refused(
  input: CaptureVerifierSemanticProposalsInput,
  reason: SemanticProposalCaptureRefusal,
  extras: Partial<CaptureVerifierSemanticProposalsResult> = {},
): CaptureVerifierSemanticProposalsResult {
  return {
    captured: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [
      "captured records are provider proposals only and are not Orchestra semantic authority",
    ],
    verifierAssignmentId: input.verifierAssignmentId,
    verifierExecutionEvidenceId: extras.verifierExecutionEvidenceId ?? null,
    proposals: extras.proposals ?? [],
    duplicateProposalsReused: extras.duplicateProposalsReused ?? false,
  };
}

/**
 * Capture provider semantic proposals from persisted verifier execution events.
 * Proposals are never authoritative findings.
 */
export function captureVerifierSemanticProposalsFromEvidence(
  input: CaptureVerifierSemanticProposalsInput,
): CaptureVerifierSemanticProposalsResult {
  let verifierRecord;
  try {
    verifierRecord = input.store.loadAssignmentRecord(input.verifierAssignmentId);
  } catch (error) {
    if (error instanceof EngineeringStoreError && String(error.message).includes("not found")) {
      return refused(input, "verifier_not_found");
    }
    throw error;
  }
  if (verifierRecord.frozen.assignment.role !== "verifier") {
    return refused(input, "verifier_role_required");
  }

  const executorAssignmentId = verifierRecord.relationship.verifiesAssignmentId?.trim() ?? "";
  const executorEvidenceId = verifierRecord.relationship.verifiesExecutionEvidenceId?.trim() ?? "";
  if (!executorAssignmentId || !executorEvidenceId) {
    return refused(input, "relationship_mismatch");
  }

  let verifierEvidence: ExecutionEvidence | null;
  try {
    verifierEvidence = input.store.loadLatestExecutionEvidence(input.verifierAssignmentId);
  } catch {
    return refused(input, "verifier_evidence_corrupt");
  }
  if (!verifierEvidence) {
    return refused(input, "verifier_execution_evidence_not_found");
  }

  const requiredIds = new Set(
    (verifierRecord.frozen.assignment.verificationRequirements ?? []).map((row) => row.requirementId),
  );
  const parsed = verifierEvidence.result.normalizedEvents
    .map(parseStructuredFindingEvent)
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const existing = input.store.loadVerifierSemanticProposals(
    input.verifierAssignmentId,
    verifierEvidence.evidenceId,
  );
  if (existing.length > 0) {
    return {
      captured: true,
      refused: false,
      reason: null,
      warnings: [
        "existing semantic proposals reused",
        "proposals are not Orchestra semantic authority",
      ],
      verifierAssignmentId: input.verifierAssignmentId,
      verifierExecutionEvidenceId: verifierEvidence.evidenceId,
      proposals: existing,
      duplicateProposalsReused: true,
    };
  }

  const byRequirement = new Map<string, NonNullable<ReturnType<typeof parseStructuredFindingEvent>>>();
  for (const finding of parsed) {
    if (!requiredIds.has(finding.requirementId)) {
      return refused(input, "unknown_requirement_proposal", {
        verifierExecutionEvidenceId: verifierEvidence.evidenceId,
      });
    }
    if (byRequirement.has(finding.requirementId)) {
      return refused(input, "duplicate_conflicting_proposal", {
        verifierExecutionEvidenceId: verifierEvidence.evidenceId,
      });
    }
    byRequirement.set(finding.requirementId, finding);
  }

  const persisted: VerifierSemanticFindingProposal[] = [];
  for (const finding of byRequirement.values()) {
    const record = buildVerifierSemanticFindingProposal({
      verifierAssignmentId: verifierRecord.frozen.assignment.assignmentId,
      verifierAssignmentHash: verifierRecord.frozen.assignmentHash,
      verifierExecutionEvidenceId: verifierEvidence.evidenceId,
      executorAssignmentId,
      executorExecutionEvidenceId: executorEvidenceId,
      requirementId: finding.requirementId,
      proposedOutcome: finding.outcome,
      reasonCode: finding.reasonCode,
      evidenceReferences: finding.evidenceReferences,
      providerSessionId: verifierEvidence.result.providerSessionId,
      providerRunId: verifierEvidence.result.runId,
      capturedAt: finding.eventTimestamp,
    });
    persisted.push(input.store.persistVerifierSemanticProposal(record));
  }

  return {
    captured: true,
    refused: false,
    reason: null,
    warnings: ["captured provider proposals only; authoritative findings require resolveVerifierSemanticFindings"],
    verifierAssignmentId: input.verifierAssignmentId,
    verifierExecutionEvidenceId: verifierEvidence.evidenceId,
    proposals: persisted,
    duplicateProposalsReused: false,
  };
}

/** @deprecated Use captureVerifierSemanticProposalsFromEvidence */
export const captureVerifierSemanticFindingsFromEvidence = captureVerifierSemanticProposalsFromEvidence;
export const SEMANTIC_FINDING_CAPTURE_REFUSALS = SEMANTIC_PROPOSAL_CAPTURE_REFUSALS;
export type SemanticFindingCaptureRefusal = SemanticProposalCaptureRefusal;
export type CaptureVerifierSemanticFindingsInput = CaptureVerifierSemanticProposalsInput;
export type CaptureVerifierSemanticFindingsResult = CaptureVerifierSemanticProposalsResult;
