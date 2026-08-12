/**
 * Domain 3 Brain Decision-Stage Interaction Boundary (DSIB) — FI-DSN-STD-014-R73–R77, R82.
 * Brain is consumer / evaluator / recommender / routing participant only — not authority.
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type {
  Domain3BrainOutputClass,
  Domain3DecisionStage,
} from "./domain3-types.js";

/** Exhaustive DSIB Decision-stage catalog (R77). */
export const DOMAIN3_DECISION_STAGES = [
  "pre_review",
  "active_review",
  "completed_review",
  "approval_consideration",
  "gpra_grant_consumed",
  "retention",
  "invalidated",
  "superseded",
  "downstream_disposition",
  "handoff_preparation",
] as const satisfies readonly Domain3DecisionStage[];

/** Exhaustive BOCM permitted output classes (R75). */
export const DOMAIN3_BRAIN_OUTPUT_CLASSES = [
  "evidence_consumption_analysis",
  "evaluative_treatment",
  "nonbinding_recommendation",
  "inconsistency_detection_signal",
  "routing_suggestion",
  "nonbinding_reevaluation_request",
] as const satisfies readonly Domain3BrainOutputClass[];

/**
 * Stage → allowed BOCM output classes per DSIB §20.22.5 / R77.
 * Forbidden constitutional claims are rejected separately (R74).
 */
export const DOMAIN3_STAGE_ALLOWED_OUTPUT_CLASSES: Readonly<
  Record<Domain3DecisionStage, readonly Domain3BrainOutputClass[]>
> = {
  pre_review: [
    "evidence_consumption_analysis",
    "routing_suggestion",
    "nonbinding_reevaluation_request",
  ],
  active_review: [
    "evidence_consumption_analysis",
    "evaluative_treatment",
    "nonbinding_recommendation",
    "inconsistency_detection_signal",
    "routing_suggestion",
    "nonbinding_reevaluation_request",
  ],
  completed_review: [
    "evidence_consumption_analysis",
    "evaluative_treatment",
    "nonbinding_recommendation",
    "inconsistency_detection_signal",
    "routing_suggestion",
  ],
  approval_consideration: [
    "evidence_consumption_analysis",
    "evaluative_treatment",
    "nonbinding_recommendation",
    "inconsistency_detection_signal",
    "routing_suggestion",
    "nonbinding_reevaluation_request",
  ],
  gpra_grant_consumed: ["evidence_consumption_analysis"],
  retention: [
    "evidence_consumption_analysis",
    "inconsistency_detection_signal",
    "nonbinding_recommendation",
    "routing_suggestion",
    "nonbinding_reevaluation_request",
  ],
  invalidated: [
    "evidence_consumption_analysis",
    "inconsistency_detection_signal",
    "nonbinding_reevaluation_request",
  ],
  superseded: [
    "evidence_consumption_analysis",
    "inconsistency_detection_signal",
    "nonbinding_reevaluation_request",
  ],
  downstream_disposition: [
    "evidence_consumption_analysis",
    "evaluative_treatment",
    "nonbinding_recommendation",
    "inconsistency_detection_signal",
    "routing_suggestion",
    "nonbinding_reevaluation_request",
  ],
  handoff_preparation: [
    "evidence_consumption_analysis",
    "inconsistency_detection_signal",
    "routing_suggestion",
    "nonbinding_recommendation",
    "nonbinding_reevaluation_request",
  ],
};

/** Forbidden constitutional mutation actions Brain must never exercise (R74). */
export const FORBIDDEN_BRAIN_DOMAIN3_CONSTITUTIONAL_ACTIONS = [
  "record_review_determination",
  "alter_determination_outcome",
  "perform_approval",
  "perform_approval_withholding",
  "grant_gpra",
  "establish_retention",
  "establish_invalidated",
  "establish_superseded",
  "perform_ddac_disposition",
  "perform_dsra_authorization",
  "perform_invalidation_act",
  "perform_supersession_act",
  "perform_handoff",
  "mint_magac",
  "mint_ddac",
  "mint_ivac",
  "mint_ssac",
  "establish_return_posture",
  "establish_resubmission_eligibility",
  "lifecycle_termination",
] as const;

export type ForbiddenBrainDomain3ConstitutionalAction =
  (typeof FORBIDDEN_BRAIN_DOMAIN3_CONSTITUTIONAL_ACTIONS)[number];

const G10_REQ = [
  "FI-DSN-STD-014-R73",
  "FI-DSN-STD-014-R74",
  "FI-DSN-STD-014-R75",
  "FI-DSN-STD-014-R76",
  "FI-DSN-STD-014-R77",
  "FI-DSN-STD-014-R82",
] as const;

export function isDomain3DecisionStage(value: unknown): value is Domain3DecisionStage {
  return (
    typeof value === "string" &&
    (DOMAIN3_DECISION_STAGES as readonly string[]).includes(value)
  );
}

export function isDomain3BrainOutputClass(value: unknown): value is Domain3BrainOutputClass {
  return (
    typeof value === "string" &&
    (DOMAIN3_BRAIN_OUTPUT_CLASSES as readonly string[]).includes(value)
  );
}

export function assertDecisionStage(stage: unknown): asserts stage is Domain3DecisionStage {
  if (!isDomain3DecisionStage(stage)) {
    throw new OrchestraConstitutionalError(
      `Unknown Domain 3 Decision-stage: ${String(stage)}`,
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R77"],
    );
  }
}

export function assertOutputClassAllowedForStage(
  stage: Domain3DecisionStage,
  outputClass: Domain3BrainOutputClass,
): void {
  assertDecisionStage(stage);
  if (!isDomain3BrainOutputClass(outputClass)) {
    throw new OrchestraConstitutionalError(
      `Unknown Domain 3 Brain output class: ${String(outputClass)}`,
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R75", "FI-DSN-STD-014-R77"],
    );
  }
  const allowed = DOMAIN3_STAGE_ALLOWED_OUTPUT_CLASSES[stage];
  if (!(allowed as readonly string[]).includes(outputClass)) {
    throw new OrchestraConstitutionalError(
      `Brain output class "${outputClass}" is not permitted at Decision-stage "${stage}"`,
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R75", "FI-DSN-STD-014-R77"],
    );
  }
}

export function isForbiddenBrainDomain3ConstitutionalAction(
  action: string,
): action is ForbiddenBrainDomain3ConstitutionalAction {
  return (FORBIDDEN_BRAIN_DOMAIN3_CONSTITUTIONAL_ACTIONS as readonly string[]).includes(action);
}

/**
 * Reject any Brain attempt to exercise forbidden constitutional Domain 3 authority — R74.
 */
export function rejectBrainDomain3ConstitutionalMutationAttempt(
  action: ForbiddenBrainDomain3ConstitutionalAction,
): never {
  throw new OrchestraConstitutionalError(
    `Brain Runtime SHALL NOT exercise constitutional Domain 3 authority: ${action}`,
    "invalid_domain3_brain_advisory",
    [...G10_REQ],
  );
}
