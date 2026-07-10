/**
 * Action Planner types — structured HOW layer after DecideResult.
 *
 * Not part of BrainResponse. No user-facing copy or execution strategy.
 */

import type { DecideResult } from "../decision/decide";
import type { BrainEventId } from "../events/brainEventCatalogTypes";
import type { BrainDecisionOutcome } from "../types";

export type ActionPlanType = BrainDecisionOutcome;

/** Server-side product experience vocabulary — no URLs. */
export type ProductExperienceKind =
  | "catalog_follow_up_question"
  | "event_briefing"
  | "card_preparation_briefing"
  | "profile_navigation"
  | "none";

export interface ActionPlanRouting {
  experience: ProductExperienceKind;
  eventId?: BrainEventId;
  briefingEventLabel?: string;
}

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
  routing?: ActionPlanRouting;
}
