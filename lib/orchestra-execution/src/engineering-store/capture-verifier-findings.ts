import { EngineeringStoreError, FileEngineeringStore } from "./store.js";
import type { ExecutionEvidence, VerifierSemanticFindingRecord } from "./types.js";
import { parseStructuredFindingEvent } from "../structured-finding-event.js";
import {
  buildVerifierSemanticFindingRecord,
  validateVerifierSemanticFinding,
} from "./semantic-finding-record.js";

export const SEMANTIC_FINDING_CAPTURE_REFUSALS = [
  "verifier_not_found",
  "verifier_role_required",
  "verifier_execution_evidence_not_found",
  "verifier_evidence_corrupt",
  "relationship_mismatch",
  "unknown_requirement_finding",
  "duplicate_conflicting_finding",
] as const;

export type SemanticFindingCaptureRefusal = (typeof SEMANTIC_FINDING_CAPTURE_REFUSALS)[number];

export interface CaptureVerifierSemanticFindingsInput {
  store: FileEngineeringStore;
  verifierAssignmentId: string;
}

export interface CaptureVerifierSemanticFindingsResult {
  captured: boolean;
  refused: boolean;
  reason: SemanticFindingCaptureRefusal | null;
  warnings: string[];
  verifierAssignmentId: string;
  verifierExecutionEvidenceId: string | null;
  findings: VerifierSemanticFindingRecord[];
  duplicateFindingsReused: boolean;
}

function refused(
  input: CaptureVerifierSemanticFindingsInput,
  reason: SemanticFindingCaptureRefusal,
  extras: Partial<CaptureVerifierSemanticFindingsResult> = {},
): CaptureVerifierSemanticFindingsResult {
  return {
    captured: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    verifierAssignmentId: input.verifierAssignmentId,
    verifierExecutionEvidenceId: extras.verifierExecutionEvidenceId ?? null,
    findings: extras.findings ?? [],
    duplicateFindingsReused: extras.duplicateFindingsReused ?? false,
  };
}

/**
 * Capture governed structured semantic findings from persisted verifier execution events.
 * Provider prose is never parsed or promoted.
 */
export function captureVerifierSemanticFindingsFromEvidence(
  input: CaptureVerifierSemanticFindingsInput,
): CaptureVerifierSemanticFindingsResult {
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

  const existing = input.store.loadVerifierSemanticFindings(
    input.verifierAssignmentId,
    verifierEvidence.evidenceId,
  );
  if (existing.length > 0) {
    return {
      captured: true,
      refused: false,
      reason: null,
      warnings: ["existing structured semantic findings reused"],
      verifierAssignmentId: input.verifierAssignmentId,
      verifierExecutionEvidenceId: verifierEvidence.evidenceId,
      findings: existing,
      duplicateFindingsReused: true,
    };
  }

  const byRequirement = new Map<string, ReturnType<typeof parseStructuredFindingEvent>>();
  for (const finding of parsed) {
    if (!requiredIds.has(finding.requirementId)) {
      return refused(input, "unknown_requirement_finding", {
        verifierExecutionEvidenceId: verifierEvidence.evidenceId,
      });
    }
    if (byRequirement.has(finding.requirementId)) {
      return refused(input, "duplicate_conflicting_finding", {
        verifierExecutionEvidenceId: verifierEvidence.evidenceId,
      });
    }
    byRequirement.set(finding.requirementId, finding);
  }

  const persisted: VerifierSemanticFindingRecord[] = [];
  for (const finding of byRequirement.values()) {
    if (!finding) continue;
    const record = buildVerifierSemanticFindingRecord({
      verifierAssignmentId: verifierRecord.frozen.assignment.assignmentId,
      verifierAssignmentHash: verifierRecord.frozen.assignmentHash,
      verifierExecutionEvidenceId: verifierEvidence.evidenceId,
      executorAssignmentId,
      executorExecutionEvidenceId: executorEvidenceId,
      requirementId: finding.requirementId,
      outcome: finding.outcome,
      reasonCode: finding.reasonCode,
      evidenceReferences: finding.evidenceReferences,
      capturedAt: finding.eventTimestamp,
    });
    persisted.push(input.store.persistVerifierSemanticFinding(record));
  }

  return {
    captured: true,
    refused: false,
    reason: null,
    warnings: [],
    verifierAssignmentId: input.verifierAssignmentId,
    verifierExecutionEvidenceId: verifierEvidence.evidenceId,
    findings: persisted,
    duplicateFindingsReused: false,
  };
}
