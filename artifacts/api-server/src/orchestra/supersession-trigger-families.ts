/**
 * Supersession trigger families — ST-1 / ST-2 / ST-3 (R66).
 *
 * Exactly three families. NR/Review alone cannot supersede.
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type { SupersessionTriggerFamily } from "./domain3-types.js";

export const MANDATORY_SUPERSESSION_TRIGGER_FAMILIES: readonly SupersessionTriggerFamily[] =
  Object.freeze([
    "replacement_gpra_grant",
    "authoritative_succession_rule",
    "context_rebinding",
  ]);

export function isMandatorySupersessionTriggerFamily(
  value: unknown,
): value is SupersessionTriggerFamily {
  return (
    typeof value === "string" &&
    (MANDATORY_SUPERSESSION_TRIGGER_FAMILIES as readonly string[]).includes(value)
  );
}

export function assertSupersessionTriggerFamily(
  family: unknown,
): asserts family is SupersessionTriggerFamily {
  if (!isMandatorySupersessionTriggerFamily(family)) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires exactly one ST family (ST-1 replacement_gpra_grant, ST-2 authoritative_succession_rule, or ST-3 context_rebinding); NR paths, Review alone, and unknown families cannot establish Superseded posture",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R66"],
    );
  }
}
