import { sortKeys } from "../assignment.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  VERIFIER_SEMANTIC_PROPOSAL_SOURCE,
  type VerifierRequirementOutcome,
  type VerifierSemanticFindingProposal,
} from "./types.js";

export type VerifierSemanticFindingProposalBody = Omit<VerifierSemanticFindingProposal, "proposalHash">;

export function semanticProposalId(
  verifierAssignmentId: string,
  verifierExecutionEvidenceId: string,
  requirementId: string,
): string {
  return `vprop-${verifierAssignmentId}-${verifierExecutionEvidenceId}-${requirementId}`;
}

export function hashVerifierSemanticProposal(body: VerifierSemanticFindingProposalBody): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildVerifierSemanticFindingProposal(input: {
  verifierAssignmentId: string;
  verifierAssignmentHash: string;
  verifierExecutionEvidenceId: string;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  requirementId: string;
  proposedOutcome: VerifierRequirementOutcome;
  reasonCode: string;
  evidenceReferences: string[];
  providerSessionId: string | null;
  providerRunId: string | null;
  capturedAt?: string;
}): VerifierSemanticFindingProposal {
  const body: VerifierSemanticFindingProposalBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "verifier_semantic_finding_proposal",
    proposalId: semanticProposalId(
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
    proposedOutcome: input.proposedOutcome,
    reasonCode: input.reasonCode,
    evidenceReferences: [...input.evidenceReferences].sort(),
    providerSessionId: input.providerSessionId,
    providerRunId: input.providerRunId,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
    source: VERIFIER_SEMANTIC_PROPOSAL_SOURCE,
    recordVersion: 1,
  };
  return { ...body, proposalHash: hashVerifierSemanticProposal(body) };
}

export function validateVerifierSemanticProposal(record: VerifierSemanticFindingProposal): boolean {
  if (record.recordKind !== "verifier_semantic_finding_proposal") return false;
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (record.source !== VERIFIER_SEMANTIC_PROPOSAL_SOURCE) return false;
  if (record.recordVersion !== 1) return false;
  const { proposalHash, ...body } = record;
  return hashVerifierSemanticProposal(body) === proposalHash;
}
