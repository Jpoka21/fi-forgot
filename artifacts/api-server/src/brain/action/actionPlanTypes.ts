/**
 * Action Planner types — structured HOW layer after DecideResult.
 *
 * Not part of BrainResponse. No user-facing copy or execution strategy.
 */

import type { DecideResult } from "../decision/decide";
import type { BrainDecisionOutcome } from "../types";

export type ActionPlanType = BrainDecisionOutcome;

export type ActionCategory =
  | "none"
  | "fresh_update"
  | "profile_information"
  | "follow_up"
  | "birthday"
  | "anniversary"
  | "holiday"
  | "card_opportunity"
  | "dashboard_insight";

export type ActionPriority = "low" | "medium" | "high";

/** Caller-supplied input — DecideResult contract remains unchanged. */
export interface ActionPlanningInput {
  decideResult: DecideResult;
  sourceRuleId: string;
}

export interface ActionPlan {
  type: ActionPlanType;
  category: ActionCategory;
  priority: ActionPriority;
  sourceRuleId: string;
  primaryReason: string;
  reasons: string[];
  confidence: number;
  debugNotes: string[];
}
