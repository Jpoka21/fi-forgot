/**
 * Fatigue Engine entry point — pass-through in Sprint 5b.
 *
 * Does not filter, sort, suppress, or mutate planner output.
 */

import type { GlobalOpportunity } from "../attention/globalOpportunityTypes";
import type { FatigueContext, FatigueOpportunity } from "./fatigueTypes";

export function applyFatigue(
  ranked: GlobalOpportunity[],
  _context: FatigueContext,
): FatigueOpportunity[] {
  return ranked.map((opportunity) => ({
    opportunity,
    fatigueDecision: "visible",
    suppressionReason: null,
    deferUntil: null,
  }));
}
