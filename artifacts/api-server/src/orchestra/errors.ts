import type { Std012RequirementId } from "./authority.js";
import type { Std013RequirementId } from "./domain2-authority.js";

export type OrchestraRequirementId = Std012RequirementId | Std013RequirementId;

/**
 * Constitutional invariant or transition violation within Orchestra Domain 1.
 * Distinguishes governed constraint failures from ordinary programming errors.
 */
export class OrchestraConstitutionalError extends Error {
  readonly code: OrchestraErrorCode;
  readonly requirementIds: readonly OrchestraRequirementId[];

  constructor(
    message: string,
    code: OrchestraErrorCode,
    requirementIds: readonly OrchestraRequirementId[] = [],
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
  | "identity_violation"
  | "invalid_persistence_state"
  | "invalid_program_split"
  | "invalid_current_program"
  | "invalid_exploration_posture"
  | "invalid_realization_commitment"
  | "invalid_rva"
  | "domain2_not_ready"
  | "invalid_domain2_persistence_state";

export function isOrchestraConstitutionalError(
  error: unknown,
): error is OrchestraConstitutionalError {
  return error instanceof OrchestraConstitutionalError;
}
