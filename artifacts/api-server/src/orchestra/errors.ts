import type { Std012RequirementId } from "./authority.js";
import type { Std013RequirementId } from "./domain2-authority.js";
import type { Std014RequirementId } from "./domain3-authority.js";

export type OrchestraRequirementId =
  | Std012RequirementId
  | Std013RequirementId
  | Std014RequirementId;

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
  | "invalid_domain2_persistence_state"
  | "invalid_review_entry_readiness"
  | "invalid_shared_source_linkage"
  | "invalid_compliance_boundary_change"
  | "invalid_licensed_acquired_intake"
  | "invalid_rework_trigger"
  | "invalid_brain_domain2_proposal"
  | "invalid_review_entry_eligibility"
  | "invalid_domain3_persistence_state"
  | "invalid_review_activity"
  | "invalid_design_time_feasibility"
  | "invalid_review_determination"
  | "invalid_approval_authority"
  | "invalid_gpra_grant"
  | "invalid_downstream_disposition"
  | "invalid_gpra_invalidation"
  | "invalid_gpra_supersession"
  | "invalid_domain3_brain_advisory"
  | "invalid_handoff_preparation";

export function isOrchestraConstitutionalError(
  error: unknown,
): error is OrchestraConstitutionalError {
  return error instanceof OrchestraConstitutionalError;
}
