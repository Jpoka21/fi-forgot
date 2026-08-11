/**
 * Mandatory constitutional core Review dimensions — FI-DSN-STD-014-R15 / MCCGE.
 * Exact frozen category terms mapped to stable machine identifiers.
 */

import { createDomain3GovernanceTraceability } from "./domain3-authority.js";
import { OrchestraConstitutionalError } from "./errors.js";

/**
 * Machine identifiers mapping 1:1 to frozen R15 / architecture §6.2 categories.
 */
export const MANDATORY_REVIEW_DIMENSION_IDS = [
  "identity_and_character_compliance",
  "surface_and_spatial_fit",
  "contextual_and_personalization_obligations",
  "design_time_feasibility",
] as const;

export type MandatoryReviewDimensionId = (typeof MANDATORY_REVIEW_DIMENSION_IDS)[number];

/** Frozen display terminology for each mandatory core dimension. */
export const MANDATORY_REVIEW_DIMENSION_LABELS: Readonly<
  Record<MandatoryReviewDimensionId, string>
> = Object.freeze({
  identity_and_character_compliance: "Identity and character compliance",
  surface_and_spatial_fit: "Surface and spatial fit",
  contextual_and_personalization_obligations: "Contextual and personalization obligations",
  design_time_feasibility: "Design-Time Feasibility",
});

/**
 * Review evidence is organized by the Review dimension category it supports (R20).
 * Frozen authority does not enumerate a separate evidence-category catalog beyond
 * dimension-organized Review evidence architecture owned by G3.
 */
export type ReviewEvidenceCategoryId = MandatoryReviewDimensionId;

export const REVIEW_ACTIVITY_TRACEABILITY = createDomain3GovernanceTraceability([
  "FI-DSN-STD-014-R14",
  "FI-DSN-STD-014-R15",
  "FI-DSN-STD-014-R16",
  "FI-DSN-STD-014-R17",
  "FI-DSN-STD-014-R18",
  "FI-DSN-STD-014-R19",
  "FI-DSN-STD-014-R20",
]);

export function isMandatoryReviewDimensionId(
  value: unknown,
): value is MandatoryReviewDimensionId {
  return (
    typeof value === "string" &&
    (MANDATORY_REVIEW_DIMENSION_IDS as readonly string[]).includes(value)
  );
}

export function assertMandatoryReviewDimensionId(
  value: unknown,
): asserts value is MandatoryReviewDimensionId {
  if (!isMandatoryReviewDimensionId(value)) {
    throw new OrchestraConstitutionalError(
      "Unknown or ad hoc Review dimension is not permitted",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R15", "FI-DSN-STD-014-R19"],
    );
  }
}

export function listMandatoryReviewDimensionIds(): readonly MandatoryReviewDimensionId[] {
  return MANDATORY_REVIEW_DIMENSION_IDS;
}

/** Deferred: governed non-core dimension activation (R17–R18) beyond mandatory core. */
export const GOVERNED_NON_CORE_DIMENSION_ACTIVATION_DEFERRED =
  "FI-DSN-STD-014-NON-CORE-DIMENSION-ACTIVATION-DEFERRED" as const;
