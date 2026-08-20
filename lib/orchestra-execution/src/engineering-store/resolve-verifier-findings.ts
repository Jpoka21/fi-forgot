import type { VerificationRequirementRef } from "../verification-requirements.js";
import { evaluateFrozenAcceptanceCheck } from "./acceptance-check-evaluation.js";
import { resolveMachineRequirement } from "./machine-requirement-resolver.js";
import { buildAuthoritativeSemanticFindingRecord } from "./semantic-finding-record.js";
import { EngineeringStoreError, FileEngineeringStore } from "./store.js";
import type {
  ExecutionEvidence,
  FrozenAssignmentRecord,
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

function isAuthorizedVerifier(
  store: FileEngineeringStore,
  verifier: FrozenAssignmentRecord,
): boolean {
  if (verifier.frozen.assignment.role !== "verifier") return false;
  const provenance = store.inspectVerifierAuthorizationProvenance(
    verifier.frozen.assignment.assignmentId,
    verifier.frozen.assignmentHash,
  );
  return provenance === "valid";
}

/**
 * Governed resolution of authoritative semantic findings.
 * Provider proposals and verifier consensus are never semantic proof.
 * Does not invoke providers.
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

  const verifierRecords = input.store
    .findVerifierAssignments(input.executorAssignmentId, input.executorExecutionEvidenceId)
    .filter((row) => isAuthorizedVerifier(input.store, row));

  // Advisory proposals only from authorized verifiers; never used as proof.
  const proposals: VerifierSemanticFindingProposal[] = [];
  for (const verifier of verifierRecords) {
    let evidence: ExecutionEvidence | null = null;
    try {
      evidence = input.store.loadLatestExecutionEvidence(verifier.frozen.assignment.assignmentId);
    } catch {
      continue;
    }
    if (!evidence) continue;
    proposals.push(
      ...input.store.loadVerifierSemanticProposals(
        verifier.frozen.assignment.assignmentId,
        evidence.evidenceId,
      ),
    );
  }

  const requirementSet: VerificationRequirementRef[] =
    verifierRecords[0]?.frozen.assignment.verificationRequirements ??
    [];

  if (requirementSet.length === 0) {
    // Fall back to deriving from executor if no authorized verifier prepared yet.
    return refused(input, "verification_requirements_missing");
  }

  const findings: VerifierSemanticFindingRecord[] = [];
  const warnings: string[] = [
    "provider proposals are advisory only and never establish requirement_satisfied",
  ];

  for (const requirement of requirementSet) {
    if (requirement.verificationMode === "MACHINE_EVIDENCE") {
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

    if (requirement.verificationMode === "ACCEPTANCE_CHECK") {
      const spec = requirement.acceptanceCheck;
      if (!spec) {
        findings.push(
          input.store.persistAuthoritativeSemanticFinding(
            buildAuthoritativeSemanticFindingRecord({
              executorAssignmentId: input.executorAssignmentId,
              executorExecutionEvidenceId: input.executorExecutionEvidenceId,
              requirementId: requirement.requirementId,
              outcome: "evidence_insufficient",
              reasonCode: "acceptance_check_specification_missing",
              evidenceReferences: [],
              resolutionAuthority: "acceptance_check_resolution",
            }),
          ),
        );
        continue;
      }
      const evaluation = evaluateFrozenAcceptanceCheck({
        spec,
        executorRecord,
        executorEvidence,
      });
      findings.push(
        input.store.persistAuthoritativeSemanticFinding(
          buildAuthoritativeSemanticFindingRecord({
            executorAssignmentId: input.executorAssignmentId,
            executorExecutionEvidenceId: input.executorExecutionEvidenceId,
            requirementId: requirement.requirementId,
            outcome: evaluation.outcome,
            reasonCode: evaluation.reasonCode,
            evidenceReferences: [
              `orchestra:executor_evidence:${executorEvidence.evidenceId}`,
              `orchestra:acceptance_check:${spec.acceptanceCheckId}`,
              ...(requirement.obligationId
                ? [`orchestra:obligation:${requirement.obligationId}`]
                : []),
            ],
            resolutionAuthority: "acceptance_check_resolution",
          }),
        ),
      );
      continue;
    }

    // HUMAN_JUDGMENT_REQUIRED — provider consensus cannot satisfy.
    findings.push(
      input.store.persistAuthoritativeSemanticFinding(
        buildAuthoritativeSemanticFindingRecord({
          executorAssignmentId: input.executorAssignmentId,
          executorExecutionEvidenceId: input.executorExecutionEvidenceId,
          requirementId: requirement.requirementId,
          outcome: "requirement_not_evaluated",
          reasonCode: "human_judgment_required",
          evidenceReferences: [],
          resolutionAuthority: "human_judgment_unresolved",
        }),
      ),
    );
  }

  return {
    resolved: true,
    refused: false,
    reason: null,
    warnings,
    executorAssignmentId: input.executorAssignmentId,
    executorExecutionEvidenceId: input.executorExecutionEvidenceId,
    findings,
    proposals,
    duplicateFindingsReused: false,
  };
}
