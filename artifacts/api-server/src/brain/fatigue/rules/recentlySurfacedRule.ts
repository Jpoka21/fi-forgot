/**
 * Suppress opportunities surfaced within the configured cooldown window.
 */

import type { GlobalOpportunity } from "../../attention/globalOpportunityTypes";
import { RECENTLY_SURFACED_COOLDOWN_MS } from "../fatiguePolicyConstants";
import { FATIGUE_SUPPRESSION_REASON_RECENTLY_SURFACED } from "../fatigueSuppressionReasons";
import type { FatigueContext, FatigueSuppressionReason } from "../fatigueTypes";
import { isWithinCooldown } from "../utils/isWithinCooldown";
import { parseExposureTimestamp } from "../utils/parseExposureTimestamp";

export type RecentlySurfacedRuleResult = {
  fatigueDecision: "visible" | "suppressed";
  suppressionReason: FatigueSuppressionReason | null;
};

export function evaluateRecentlySurfacedRule(
  opportunity: GlobalOpportunity,
  context: FatigueContext,
): RecentlySurfacedRuleResult {
  const record = context.exposureSnapshot.byOpportunityKey[opportunity.opportunityKey];
  const lastSurfacedAt = record?.lastSurfacedAt ?? null;

  if (lastSurfacedAt === null) {
    return { fatigueDecision: "visible", suppressionReason: null };
  }

  const lastSurfacedAtMs = parseExposureTimestamp(lastSurfacedAt);
  const evaluatedAtMs = parseExposureTimestamp(context.evaluatedAt);

  if (lastSurfacedAtMs === null || evaluatedAtMs === null) {
    return { fatigueDecision: "visible", suppressionReason: null };
  }

  const withinCooldown = isWithinCooldown({
    lastEventAtMs: lastSurfacedAtMs,
    evaluatedAtMs,
    cooldownMs: RECENTLY_SURFACED_COOLDOWN_MS,
  });

  if (!withinCooldown) {
    return { fatigueDecision: "visible", suppressionReason: null };
  }

  return {
    fatigueDecision: "suppressed",
    suppressionReason: FATIGUE_SUPPRESSION_REASON_RECENTLY_SURFACED,
  };
}
