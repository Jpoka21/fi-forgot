import type { VerificationRequirementRef } from "../verification-requirements.js";
import { resolveEvidenceReferences } from "./evidence-reference-resolution.js";
import { resolveMachineRequirement } from "./machine-requirement-resolver.js";
import { buildAuthoritativeSemanticFindingRecord } from "./semantic-finding-record.js";
import { EngineeringStoreError, FileEngineeringStore } from "./store.js";
import type {
  ExecutionEvidence,
  FrozenAssignmentRecord,
  VerifierRequirementOutcome,
  VerifierSemanticFindingProposal,
  VerifierSemanticFindingRecord,
} from "./types.js";

export interface ResolveVerifierSemanticFindingsInput {
  store: FileEngineeringStore;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
}

export interface ResolveVerifierSemanticFindingsResult {
  resolved: boolean;
  refused: boolean;
  reason: string | null;
  warnings: string[];
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  findings: VerifierSemanticFindingRecord[];
  proposals: VerifierSemanticFindingProposal[];
  duplicateFindingsReused: boolean;
}

function refused(
  input: ResolveVerifierSemanticFindingsInput,
  reason: string,
  extras: Partial<ResolveVerifierSemanticFindingsResult> = {},
): ResolveVerifierSemanticFindingsResult {
  return {
    resolved: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    executorAssignmentId: input.executorAssignmentId,
    executorExecutionEvidenceId: input.executorExecutionEvidenceId,
    findings: extras.findings ?? [],
    proposals: extras.proposals ?? [],
    duplicateFindingsReused: extras.duplicateFindingsReused ?? false,
  };
}

function proposalsForRequirement(
  proposals: VerifierSemanticFindingProposal[],
  requirementId: string,
): VerifierSemanticFindingProposal[] {
  return proposals.filter((row) => row.requirementId === requirementId);
}

function proposalSupportsPromotion(
  proposal: VerifierSemanticFindingProposal,
  context: {
    executorRecord: FrozenAssignmentRecord;
    executorEvidence: ExecutionEvidence;
    verifierEvidences: ExecutionEvidence[];
  },
): boolean {
  if (
    proposal.executorAssignmentId !== context.executorRecord.frozen.assignment.assignmentId ||
    proposal.executorExecutionEvidenceId !== context.executorEvidence.evidenceId
  ) {
    return false;
  }
  const resolution = resolveEvidenceReferences(proposal.evidenceReferences, {
    executorRecord: context.executorRecord,
    executorEvidence: context.executorEvidence,
    verifierEvidences: context.verifierEvidences,
    proposingVerifierExecutionEvidenceId: proposal.verifierExecutionEvidenceId,
  });
  return resolution.validForSemanticSatisfaction;
}

/**
 * Promote semantic proposals into authoritative findings only under corroboration policy.
 * Distinct verifier execution evidence IDs required. Same-execution duplicates are not independent.
 */
function resolveSemanticRequirement(input: {
  requirement: VerificationRequirementRef;
  proposals: VerifierSemanticFindingProposal[];
  executorRecord: FrozenAssignmentRecord;
  executorEvidence: ExecutionEvidence;
  verifierEvidences: ExecutionEvidence[];
}): {
  outcome: VerifierRequirementOutcome;
  reasonCode: string;
  evidenceReferences: string[];
  supportingProposalIds: string[];
  supportingVerifierExecutionEvidenceIds: string[];
} {
  const candidates = proposalsForRequirement(input.proposals, input.requirement.requirementId).filter((proposal) =>
    proposalSupportsPromotion(proposal, {
      executorRecord: input.executorRecord,
      executorEvidence: input.executorEvidence,
      verifierEvidences: input.verifierEvidences,
    }),
  );

  const byEvidence = new Map<string, VerifierSemanticFindingProposal>();
  for (const proposal of candidates) {
    if (!byEvidence.has(proposal.verifierExecutionEvidenceId)) {
      byEvidence.set(proposal.verifierExecutionEvidenceId, proposal);
    }
  }
  const independent = [...byEvidence.values()];
  if (independent.length < 2) {
    return {
      outcome: "requirement_not_evaluated",
      reasonCode: independent.length === 0 ? "semantic_proposals_missing_or_invalid" : "semantic_corroboration_missing",
      evidenceReferences: [],
      supportingProposalIds: independent.map((row) => row.proposalId),
      supportingVerifierExecutionEvidenceIds: independent.map((row) => row.verifierExecutionEvidenceId),
    };
  }

  const first = independent[0]!;
  const second = independent[1]!;
  if (first.proposedOutcome !== second.proposedOutcome) {
    return {
      outcome: "evidence_insufficient",
      reasonCode: "semantic_proposal_disagreement",
      evidenceReferences: [...first.evidenceReferences, ...second.evidenceReferences],
      supportingProposalIds: [first.proposalId, second.proposalId],
      supportingVerifierExecutionEvidenceIds: [
        first.verifierExecutionEvidenceId,
        second.verifierExecutionEvidenceId,
      ],
    };
  }
  if (
    first.proposedOutcome !== "requirement_satisfied" &&
    first.proposedOutcome !== "requirement_failed"
  ) {
    return {
      outcome: first.proposedOutcome,
      reasonCode: `corroborated_${first.proposedOutcome}`,
      evidenceReferences: [...first.evidenceReferences, ...second.evidenceReferences],
      supportingProposalIds: [first.proposalId, second.proposalId],
      supportingVerifierExecutionEvidenceIds: [
        first.verifierExecutionEvidenceId,
        second.verifierExecutionEvidenceId,
      ],
    };
  }
  return {
    outcome: first.proposedOutcome,
    reasonCode: `governed_corroboration_${first.proposedOutcome}`,
    evidenceReferences: [...new Set([...first.evidenceReferences, ...second.evidenceReferences])],
    supportingProposalIds: [first.proposalId, second.proposalId],
    supportingVerifierExecutionEvidenceIds: [
      first.verifierExecutionEvidenceId,
      second.verifierExecutionEvidenceId,
    ],
  };
}

/**
 * Governed resolution of authoritative semantic findings.
 * Does not invoke providers. Provider proposals are never authority by themselves.
 */
export function resolveVerifierSemanticFindings(
  input: ResolveVerifierSemanticFindingsInput,
): ResolveVerifierSemanticFindingsResult {
  let executorRecord: FrozenAssignmentRecord;
  try {
    executorRecord = input.store.loadAssignmentRecord(input.executorAssignmentId);
  } catch (error) {
    if (error instanceof EngineeringStoreError && String(error.message).includes("not found")) {
      return refused(input, "executor_not_found");
    }
    throw error;
  }
  if (executorRecord.frozen.assignment.role !== "executor") {
    return refused(input, "executor_role_required");
  }

  let executorEvidence: ExecutionEvidence;
  try {
    executorEvidence = input.store.loadExecutionEvidenceById(
      input.executorAssignmentId,
      input.executorExecutionEvidenceId,
    );
  } catch (error) {
    if (error instanceof EngineeringStoreError && String(error.message).includes("not found")) {
      return refused(input, "executor_evidence_not_found");
    }
    return refused(input, "executor_evidence_corrupt");
  }

  const existing = input.store.loadAuthoritativeSemanticFindings(
    input.executorAssignmentId,
    input.executorExecutionEvidenceId,
  );
  if (existing.length > 0) {
    const proposals = input.store.loadVerifierSemanticProposalsForExecutor(
      input.executorAssignmentId,
      input.executorExecutionEvidenceId,
    );
    return {
      resolved: true,
      refused: false,
      reason: null,
      warnings: ["existing authoritative semantic findings reused"],
      executorAssignmentId: input.executorAssignmentId,
      executorExecutionEvidenceId: input.executorExecutionEvidenceId,
      findings: existing,
      proposals,
      duplicateFindingsReused: true,
    };
  }

  const verifierRecords = input.store.findVerifierAssignments(
    input.executorAssignmentId,
    input.executorExecutionEvidenceId,
  );
  const verifierEvidences: ExecutionEvidence[] = [];
  const proposals: VerifierSemanticFindingProposal[] = [];
  for (const verifier of verifierRecords) {
    let evidence: ExecutionEvidence | null = null;
    try {
      evidence = input.store.loadLatestExecutionEvidence(verifier.frozen.assignment.assignmentId);
    } catch {
      continue;
    }
    if (!evidence) continue;
    verifierEvidences.push(evidence);
    proposals.push(
      ...input.store.loadVerifierSemanticProposals(
        verifier.frozen.assignment.assignmentId,
        evidence.evidenceId,
      ),
    );
  }

  const requirements =
    verifierRecords[0]?.frozen.assignment.verificationRequirements ??
    [];

  // Prefer requirements from any verifier; if none prepared, cannot resolve semantic set.
  if (requirements.length === 0 && verifierRecords.length === 0) {
    return refused(input, "verifier_assignments_required");
  }
  const requirementSet: VerificationRequirementRef[] =
    requirements.length > 0
      ? requirements
      : [];

  if (requirementSet.length === 0) {
    return refused(input, "verification_requirements_missing");
  }

  const findings: VerifierSemanticFindingRecord[] = [];
  for (const requirement of requirementSet) {
    if (requirement.requirementClass === "MACHINE_RESOLVABLE") {
      const machine = resolveMachineRequirement({
        requirement,
        executorRecord,
        executorEvidence,
      });
      findings.push(
        input.store.persistAuthoritativeSemanticFinding(
          buildAuthoritativeSemanticFindingRecord({
            executorAssignmentId: input.executorAssignmentId,
            executorExecutionEvidenceId: input.executorExecutionEvidenceId,
            requirementId: requirement.requirementId,
            outcome: machine.outcome,
            reasonCode: machine.reasonCode,
            evidenceReferences: machine.evidenceReferences,
            resolutionAuthority: "machine_evidence_resolution",
          }),
        ),
      );
      continue;
    }

    const semantic = resolveSemanticRequirement({
      requirement,
      proposals,
      executorRecord,
      executorEvidence,
      verifierEvidences,
    });
    findings.push(
      input.store.persistAuthoritativeSemanticFinding(
        buildAuthoritativeSemanticFindingRecord({
          executorAssignmentId: input.executorAssignmentId,
          executorExecutionEvidenceId: input.executorExecutionEvidenceId,
          requirementId: requirement.requirementId,
          outcome: semantic.outcome,
          reasonCode: semantic.reasonCode,
          evidenceReferences: semantic.evidenceReferences,
          resolutionAuthority: "governed_semantic_corroboration",
          supportingProposalIds: semantic.supportingProposalIds,
          supportingVerifierExecutionEvidenceIds: semantic.supportingVerifierExecutionEvidenceIds,
        }),
      ),
    );
  }

  return {
    resolved: true,
    refused: false,
    reason: null,
    warnings: [],
    executorAssignmentId: input.executorAssignmentId,
    executorExecutionEvidenceId: input.executorExecutionEvidenceId,
    findings,
    proposals,
    duplicateFindingsReused: false,
  };
}
