/**
 * Selects fatigue-visible opportunities in planner order.
 */

import type { FatigueOpportunity } from "./fatigueTypes";

export function getVisibleFatigueOpportunities(
  fatigued: FatigueOpportunity[],
): FatigueOpportunity[] {
  return fatigued.filter((item) => item.fatigueDecision === "visible");
}
