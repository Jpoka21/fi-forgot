/**
 * PVTA invalidation trigger families — IT-1 / IT-2 / IT-3 (R56 / R58).
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type { InvalidationTriggerFamily } from "./domain3-types.js";

export const MANDATORY_INVALIDATION_TRIGGER_FAMILIES: readonly InvalidationTriggerFamily[] =
  Object.freeze([
    "governing_law_failure",
    "material_compliance_boundary_change",
    "post_grant_discovered_non_compliance",
  ]);

export function isMandatoryInvalidationTriggerFamily(
  value: unknown,
): value is InvalidationTriggerFamily {
  return (
    typeof value === "string" &&
    (MANDATORY_INVALIDATION_TRIGGER_FAMILIES as readonly string[]).includes(value)
  );
}

export function assertInvalidationTriggerFamily(
  family: unknown,
): asserts family is InvalidationTriggerFamily {
  if (!isMandatoryInvalidationTriggerFamily(family)) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires exactly one PVTA IT family (IT-1, IT-2, or IT-3); NR paths and unknown families cannot establish Invalidated posture",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R56"],
    );
  }
}
