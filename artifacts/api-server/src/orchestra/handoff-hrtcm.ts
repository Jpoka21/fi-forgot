/**
 * HRTCM — Handoff Recall Trigger Catalog Model (PD-STD-015-004 / §20.5.6).
 * Closed RTC-01 through RTC-04. Catalog membership does not mint recall.
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type { HrtcmRecallTriggerId } from "./domain3-types.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HRTCM_REQUIREMENTS = [
  "FI-DSN-STD-015-R112",
  "FI-DSN-STD-015-R113",
  "FI-DSN-STD-015-R115",
  "FI-DSN-STD-015-R117",
] as const satisfies readonly Std015RequirementId[];

export const HRTCM_RECALL_TRIGGER_TRACEABILITY =
  createStd015GovernanceTraceability([...HRTCM_REQUIREMENTS]);

export const HRTCM_RECALL_TRIGGER_IDS = Object.freeze([
  "RTC-01",
  "RTC-02",
  "RTC-03",
  "RTC-04",
] as const satisfies readonly HrtcmRecallTriggerId[]);

const RTC_SET = new Set<string>(HRTCM_RECALL_TRIGGER_IDS);

export function isHrtcmRecallTriggerId(value: unknown): value is HrtcmRecallTriggerId {
  return typeof value === "string" && RTC_SET.has(value);
}

export function assertHrtcmRecallTriggerId(
  value: unknown,
): asserts value is HrtcmRecallTriggerId {
  if (!isHrtcmRecallTriggerId(value)) {
    throw new OrchestraConstitutionalError(
      "HRTCM recall trigger must be one of closed RTC-01 through RTC-04 (R113/R117; PD-STD-015-004)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R113", "FI-DSN-STD-015-R117"],
    );
  }
}

export function assertNonEmptySatisfiedHrtcmTriggers(
  values: unknown,
): asserts values is readonly HrtcmRecallTriggerId[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new OrchestraConstitutionalError(
      "Handoff recall requires at least one satisfied HRTCM RTC-01 through RTC-04 trigger (R113b/R115)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R113", "FI-DSN-STD-015-R115"],
    );
  }
  const seen = new Set<string>();
  for (const v of values) {
    assertHrtcmRecallTriggerId(v);
    if (seen.has(v)) {
      throw new OrchestraConstitutionalError(
        "Duplicate HRTCM trigger ids are not separately attributable within one recall act (R117)",
        "invalid_handoff_recall",
        ["FI-DSN-STD-015-R117"],
      );
    }
    seen.add(v);
  }
}

export function normalizeSatisfiedHrtcmTriggers(
  values: unknown,
): readonly HrtcmRecallTriggerId[] {
  assertNonEmptySatisfiedHrtcmTriggers(values);
  return Object.freeze(
    [...(values as readonly HrtcmRecallTriggerId[])].sort((a, b) =>
      a.localeCompare(b),
    ),
  );
}
