/**
 * Fatigue Engine entry point.
 *
 * Preserves planner order, evaluates per opportunity, and fail-opens to visible.
 */

import type { GlobalOpportunity } from "../attention/globalOpportunityTypes";
import { logger } from "../../lib/logger";
import { evaluateFatigueOpportunity } from "./evaluateFatigueOpportunity";
import {
  isRecentlySurfacedEnforced,
  isRecentlySurfacedShadowEnabled,
} from "./fatigueEnforcementConfig";
import { FATIGUE_SUPPRESSION_REASON_RECENTLY_SURFACED } from "./fatigueSuppressionReasons";
import type { FatigueContext, FatigueOpportunity } from "./fatigueTypes";

function logRecentlySurfacedShadow(input: {
  userId: string;
  opportunityKey: string;
  lastSurfacedAt: string;
  evaluatedAt: string;
}): void {
  logger.info(
    {
      userId: input.userId,
      opportunityKey: input.opportunityKey,
      rule: FATIGUE_SUPPRESSION_REASON_RECENTLY_SURFACED,
      wouldSuppress: true,
      lastSurfacedAt: input.lastSurfacedAt,
      evaluatedAt: input.evaluatedAt,
    },
    "fatigue shadow: recently_surfaced would suppress",
  );
}

function visibleFatigueOpportunity(opportunity: GlobalOpportunity): FatigueOpportunity {
  return {
    opportunity,
    fatigueDecision: "visible",
    suppressionReason: null,
    deferUntil: null,
  };
}

export function applyFatigue(
  ranked: GlobalOpportunity[],
  context: FatigueContext,
): FatigueOpportunity[] {
  const enforceRecentlySurfaced = isRecentlySurfacedEnforced();
  const shadowRecentlySurfaced = isRecentlySurfacedShadowEnabled();

  return ranked.map((opportunity) => {
    try {
      const evaluated = evaluateFatigueOpportunity(opportunity, context);
      const wouldSuppress = evaluated.fatigueDecision === "suppressed";

      if (!enforceRecentlySurfaced) {
        if (wouldSuppress && shadowRecentlySurfaced) {
          const lastSurfacedAt =
            context.exposureSnapshot.byOpportunityKey[opportunity.opportunityKey]?.lastSurfacedAt;
          if (lastSurfacedAt) {
            try {
              logRecentlySurfacedShadow({
                userId: context.userId,
                opportunityKey: opportunity.opportunityKey,
                lastSurfacedAt,
                evaluatedAt: context.evaluatedAt,
              });
            } catch {
              // fail-open: shadow logging must never block fatigue evaluation
            }
          }
        }

        return visibleFatigueOpportunity(opportunity);
      }

      return {
        opportunity,
        fatigueDecision: evaluated.fatigueDecision,
        suppressionReason: evaluated.suppressionReason,
        deferUntil: null,
      };
    } catch {
      return visibleFatigueOpportunity(opportunity);
    }
  });
}
