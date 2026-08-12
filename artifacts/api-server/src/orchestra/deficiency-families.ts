/**
 * EGDF — Enumerated Governed Deficiency Families (R46 / PD-STD-014-008).
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type { GovernedDeficiencyFamily } from "./domain3-types.js";

export const MANDATORY_GOVERNED_DEFICIENCY_FAMILIES: readonly GovernedDeficiencyFamily[] =
  Object.freeze([
    "identity_compliance",
    "surface_fit",
    "contextual_obligations",
    "design_time_feasibility",
  ]);

export function isMandatoryGovernedDeficiencyFamily(
  value: unknown,
): value is GovernedDeficiencyFamily {
  return (
    typeof value === "string" &&
    (MANDATORY_GOVERNED_DEFICIENCY_FAMILIES as readonly string[]).includes(value)
  );
}

export function assertGovernedDeficiencyFamily(
  family: unknown,
): asserts family is GovernedDeficiencyFamily {
  if (!isMandatoryGovernedDeficiencyFamily(family)) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency record requires a mandatory EGDF family; additional families are not established in the frozen G7 runtime catalog",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46"],
    );
  }
}
