import { sortKeys } from "../assignment.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  VERIFIER_SEMANTIC_FINDING_SOURCE,
  type VerifierRequirementOutcome,
  type VerifierSemanticFindingRecord,
} from "./types.js";

export type VerifierSemanticFindingRecordBody = Omit<VerifierSemanticFindingRecord, "findingHash">;

export function semanticFindingId(
  verifierAssignmentId: string,
  verifierExecutionEvidenceId: string,
  requirementId: string,
): string {
  return `vfind-${verifierAssignmentId}-${verifierExecutionEvidenceId}-${requirementId}`;
}

export function hashVerifierSemanticFinding(body: VerifierSemanticFindingRecordBody): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildVerifierSemanticFindingRecord(input: {
  verifierAssignmentId: string;
  verifierAssignmentHash: string;
  verifierExecutionEvidenceId: string;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  requirementId: string;
  outcome: VerifierRequirementOutcome;
  reasonCode: string;
  evidenceReferences: string[];
  capturedAt?: string;
}): VerifierSemanticFindingRecord {
  const body: VerifierSemanticFindingRecordBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "verifier_semantic_finding",
    findingId: semanticFindingId(
      input.verifierAssignmentId,
      input.verifierExecutionEvidenceId,
      input.requirementId,
    ),
    verifierAssignmentId: input.verifierAssignmentId,
    verifierAssignmentHash: input.verifierAssignmentHash,
    verifierExecutionEvidenceId: input.verifierExecutionEvidenceId,
    executorAssignmentId: input.executorAssignmentId,
    executorExecutionEvidenceId: input.executorExecutionEvidenceId,
    requirementId: input.requirementId,
    outcome: input.outcome,
    reasonCode: input.reasonCode,
    evidenceReferences: [...input.evidenceReferences].sort(),
    capturedAt: input.capturedAt ?? new Date().toISOString(),
    source: VERIFIER_SEMANTIC_FINDING_SOURCE,
    recordVersion: 1,
  };
  return { ...body, findingHash: hashVerifierSemanticFinding(body) };
}

export function validateVerifierSemanticFinding(record: VerifierSemanticFindingRecord): boolean {
  if (record.recordKind !== "verifier_semantic_finding") return false;
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (record.source !== VERIFIER_SEMANTIC_FINDING_SOURCE) return false;
  if (record.recordVersion !== 1) return false;
  const { findingHash, ...body } = record;
  return hashVerifierSemanticFinding(body) === findingHash;
}
