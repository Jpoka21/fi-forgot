/**
 * Internal Fatigue Engine types.
 *
 * Never exposed through public API responses.
 */

import type { GlobalOpportunity } from "../attention/globalOpportunityTypes";
import type { ExposureSnapshot } from "./exposure/exposureTypes";

export type { ExposureSnapshot } from "./exposure/exposureTypes";

export interface FatigueContext {
  userId: string;
  evaluatedAt: string;
  exposureSnapshot: ExposureSnapshot;
}

export type FatigueDecision = "visible" | "suppressed" | "deferred";

export type FatigueSuppressionReason = "recently_surfaced";

/**
 * Internal wrapper after fatigue evaluation.
 * Planner fields remain owned by the nested GlobalOpportunity.
 */
export type FatigueOpportunity = {
  opportunity: GlobalOpportunity;
  fatigueDecision: FatigueDecision;
  suppressionReason: FatigueSuppressionReason | null;
  deferUntil: Date | null;
};
