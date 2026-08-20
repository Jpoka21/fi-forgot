import { sortKeys } from "../assignment.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  VERIFIER_SEMANTIC_FINDING_SOURCE,
  type VerifierRequirementOutcome,
  type VerifierSemanticFindingRecord,
  type VerifierSemanticFindingResolution,
} from "./types.js";

export type VerifierSemanticFindingRecordBody = Omit<VerifierSemanticFindingRecord, "findingHash">;

export function semanticFindingId(
  executorAssignmentId: string,
  executorExecutionEvidenceId: string,
  requirementId: string,
): string {
  return `vfind-${executorAssignmentId}-${executorExecutionEvidenceId}-${requirementId}`;
}

export function hashVerifierSemanticFinding(body: VerifierSemanticFindingRecordBody): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildAuthoritativeSemanticFindingRecord(input: {
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  requirementId: string;
  outcome: VerifierRequirementOutcome;
  reasonCode: string;
  evidenceReferences: string[];
  resolutionAuthority: VerifierSemanticFindingResolution;
  supportingProposalIds?: string[];
  supportingVerifierExecutionEvidenceIds?: string[];
  resolvedAt?: string;
}): VerifierSemanticFindingRecord {
  const body: VerifierSemanticFindingRecordBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "verifier_semantic_finding",
    findingId: semanticFindingId(
      input.executorAssignmentId,
      input.executorExecutionEvidenceId,
      input.requirementId,
    ),
    executorAssignmentId: input.executorAssignmentId,
    executorExecutionEvidenceId: input.executorExecutionEvidenceId,
    requirementId: input.requirementId,
    outcome: input.outcome,
    reasonCode: input.reasonCode,
    evidenceReferences: [...input.evidenceReferences].sort(),
    resolutionAuthority: input.resolutionAuthority,
    supportingProposalIds: [...(input.supportingProposalIds ?? [])].sort(),
    supportingVerifierExecutionEvidenceIds: [
      ...(input.supportingVerifierExecutionEvidenceIds ?? []),
    ].sort(),
    resolvedAt: input.resolvedAt ?? new Date().toISOString(),
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
  if (
    record.resolutionAuthority !== "machine_evidence_resolution" &&
    record.resolutionAuthority !== "governed_semantic_corroboration"
  ) {
    return false;
  }
  const { findingHash, ...body } = record;
  return hashVerifierSemanticFinding(body) === findingHash;
}

/** @deprecated Use buildAuthoritativeSemanticFindingRecord */
export const buildVerifierSemanticFindingRecord = buildAuthoritativeSemanticFindingRecord;
