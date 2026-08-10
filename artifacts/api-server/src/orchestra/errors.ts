import type { Std012RequirementId } from "./authority.js";

/**
 * Constitutional invariant or transition violation within Orchestra Domain 1.
 * Distinguishes governed constraint failures from ordinary programming errors.
 */
export class OrchestraConstitutionalError extends Error {
  readonly code: OrchestraErrorCode;
  readonly requirementIds: readonly Std012RequirementId[];

  constructor(
    message: string,
    code: OrchestraErrorCode,
    requirementIds: readonly Std012RequirementId[] = [],
  ) {
    super(message);
    this.name = "OrchestraConstitutionalError";
    this.code = code;
    this.requirementIds = Object.freeze([...requirementIds]);
  }
}

export type OrchestraErrorCode =
  | "invalid_intent_declaration"
  | "invalid_intent_change"
  | "invalid_program_structure"
  | "invalid_program_transition"
  | "invalid_obligation"
  | "invalid_compliance_boundary"
  | "invalid_exploration_entry"
  | "invalid_waiver"
  | "invalid_amendment"
  | "program_not_active"
  | "identity_violation";

export function isOrchestraConstitutionalError(
  error: unknown,
): error is OrchestraConstitutionalError {
  return error instanceof OrchestraConstitutionalError;
}
