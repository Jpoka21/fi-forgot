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

export const VERIFIER_REQUIREMENT_CLASSES = ["MACHINE_RESOLVABLE", "SEMANTIC_REVIEW_REQUIRED"] as const;
export type VerifierRequirementClass = (typeof VERIFIER_REQUIREMENT_CLASSES)[number];

export interface StructuredObligation {
  obligationId: string;
  summary: string;
}

export interface VerificationRequirementRef {
  requirementId: string;
  requirementKind: VerifierRequirementKind;
  requirementClass: VerifierRequirementClass;
  obligationId?: string;
}

export function standardRequirementId(kind: VerifierRequirementKind): string {
  return `req:${kind}`;
}

export function obligationRequirementId(obligationId: string): string {
  return `req:obligation:${obligationId}`;
}

export function classifyRequirementKind(kind: VerifierRequirementKind): VerifierRequirementClass {
  return kind === "structured_obligation" ? "SEMANTIC_REVIEW_REQUIRED" : "MACHINE_RESOLVABLE";
}

export function deriveVerifierVerificationRequirements(
  executor: OrchestraAssignment,
  _evidence: ExecutionEvidence,
): VerificationRequirementRef[] {
  const machineKinds: VerifierRequirementKind[] = [
    "repository_identity",
    "repository_scope",
    "protected_paths",
    "git_posture",
    "executor_evidence_linkage",
    "required_evidence",
  ];
  const requirements: VerificationRequirementRef[] = machineKinds.map((kind) => ({
    requirementId: standardRequirementId(kind),
    requirementKind: kind,
    requirementClass: "MACHINE_RESOLVABLE",
  }));
  if (
    executor.requiredEvidence.some((item) => item.toLowerCase() === "tests" || item.toLowerCase() === "test")
  ) {
    requirements.push({
      requirementId: standardRequirementId("required_tests"),
      requirementKind: "required_tests",
      requirementClass: "MACHINE_RESOLVABLE",
    });
  }
  for (const obligation of executor.structuredObligations ?? []) {
    requirements.push({
      requirementId: obligationRequirementId(obligation.obligationId),
      requirementKind: "structured_obligation",
      requirementClass: "SEMANTIC_REVIEW_REQUIRED",
      obligationId: obligation.obligationId,
    });
  }
  return requirements;
}
