import type { OrchestraAssignment } from "./assignment.js";
import type { ExecutionEvidence } from "./engineering-store/types.js";

export const VERIFIER_REQUIREMENT_KINDS = [
  "repository_identity",
  "repository_scope",
  "protected_paths",
  "git_posture",
  "executor_evidence_linkage",
  "required_evidence",
  "required_tests",
  "structured_obligation",
] as const;

export type VerifierRequirementKind = (typeof VERIFIER_REQUIREMENT_KINDS)[number];

export interface StructuredObligation {
  obligationId: string;
  summary: string;
}

export interface VerificationRequirementRef {
  requirementId: string;
  requirementKind: VerifierRequirementKind;
  obligationId?: string;
}

export function standardRequirementId(kind: VerifierRequirementKind): string {
  return `req:${kind}`;
}

export function obligationRequirementId(obligationId: string): string {
  return `req:obligation:${obligationId}`;
}

export function deriveVerifierVerificationRequirements(
  executor: OrchestraAssignment,
  evidence: ExecutionEvidence,
): VerificationRequirementRef[] {
  const requirements: VerificationRequirementRef[] = [
    { requirementId: standardRequirementId("repository_identity"), requirementKind: "repository_identity" },
    { requirementId: standardRequirementId("repository_scope"), requirementKind: "repository_scope" },
    { requirementId: standardRequirementId("protected_paths"), requirementKind: "protected_paths" },
    { requirementId: standardRequirementId("git_posture"), requirementKind: "git_posture" },
    {
      requirementId: standardRequirementId("executor_evidence_linkage"),
      requirementKind: "executor_evidence_linkage",
    },
    { requirementId: standardRequirementId("required_evidence"), requirementKind: "required_evidence" },
  ];
  if (
    executor.requiredEvidence.some((item) => item.toLowerCase() === "tests" || item.toLowerCase() === "test")
  ) {
    requirements.push({
      requirementId: standardRequirementId("required_tests"),
      requirementKind: "required_tests",
    });
  }
  for (const obligation of executor.structuredObligations ?? []) {
    requirements.push({
      requirementId: obligationRequirementId(obligation.obligationId),
      requirementKind: "structured_obligation",
      obligationId: obligation.obligationId,
    });
  }
  if (evidence.requiredEvidenceMissing.length > 0 || executor.requiredEvidence.length === 0) {
    // required_evidence requirement always present; obligations may still apply.
  }
  return requirements;
}
