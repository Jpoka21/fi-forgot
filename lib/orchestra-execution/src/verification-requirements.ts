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

/** @deprecated Prefer verificationMode. Kept for frozen-record compatibility aliases. */
export const VERIFIER_REQUIREMENT_CLASSES = ["MACHINE_RESOLVABLE", "SEMANTIC_REVIEW_REQUIRED"] as const;
export type VerifierRequirementClass = (typeof VERIFIER_REQUIREMENT_CLASSES)[number];

export const VERIFICATION_MODES = [
  "MACHINE_EVIDENCE",
  "ACCEPTANCE_CHECK",
  "HUMAN_JUDGMENT_REQUIRED",
] as const;
export type VerificationMode = (typeof VERIFICATION_MODES)[number];

export const ACCEPTANCE_CHECK_KINDS = [
  "filesystem_contains",
  "filesystem_not_contains",
  "executor_changed_paths_includes",
  "executor_protected_mutation_absent",
] as const;
export type AcceptanceCheckKind = (typeof ACCEPTANCE_CHECK_KINDS)[number];

export interface FrozenAcceptanceCheckSpec {
  acceptanceCheckId: string;
  checkKind: AcceptanceCheckKind;
  parameters: Record<string, string>;
  expectedResult: Record<string, string | boolean | number>;
  requiredEvidenceClass: "filesystem" | "executor_evidence" | "git";
}

export interface StructuredObligation {
  obligationId: string;
  summary: string;
  verificationMode?: VerificationMode;
  acceptanceCheck?: FrozenAcceptanceCheckSpec;
}

export interface VerificationRequirementRef {
  requirementId: string;
  requirementKind: VerifierRequirementKind;
  /** Legacy class mirrored from verificationMode for compatibility. */
  requirementClass: VerifierRequirementClass;
  verificationMode: VerificationMode;
  obligationId?: string;
  acceptanceCheckId?: string;
  acceptanceCheck?: FrozenAcceptanceCheckSpec;
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

function obligationVerificationMode(obligation: StructuredObligation): VerificationMode {
  if (obligation.verificationMode) return obligation.verificationMode;
  if (obligation.acceptanceCheck) return "ACCEPTANCE_CHECK";
  return "HUMAN_JUDGMENT_REQUIRED";
}

function modeToClass(mode: VerificationMode): VerifierRequirementClass {
  return mode === "MACHINE_EVIDENCE" ? "MACHINE_RESOLVABLE" : "SEMANTIC_REVIEW_REQUIRED";
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
    verificationMode: "MACHINE_EVIDENCE",
  }));
  if (
    executor.requiredEvidence.some((item) => item.toLowerCase() === "tests" || item.toLowerCase() === "test")
  ) {
    requirements.push({
      requirementId: standardRequirementId("required_tests"),
      requirementKind: "required_tests",
      requirementClass: "MACHINE_RESOLVABLE",
      verificationMode: "MACHINE_EVIDENCE",
    });
  }
  for (const obligation of executor.structuredObligations ?? []) {
    const mode = obligationVerificationMode(obligation);
    requirements.push({
      requirementId: obligationRequirementId(obligation.obligationId),
      requirementKind: "structured_obligation",
      requirementClass: modeToClass(mode),
      verificationMode: mode,
      obligationId: obligation.obligationId,
      acceptanceCheckId: obligation.acceptanceCheck?.acceptanceCheckId,
      acceptanceCheck: obligation.acceptanceCheck,
    });
  }
  return requirements;
}
