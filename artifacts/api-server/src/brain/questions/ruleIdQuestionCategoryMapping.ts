/**
 * Maps winning ActionPlan source rule ids to Follow Up Question catalog categories.
 */

import type { FollowUpQuestionCategory } from "./questionTypes";

export const RULE_ID_TO_QUESTION_CATEGORY: Readonly<
  Partial<Record<string, FollowUpQuestionCategory>>
> = {
  life_event_follow_up: "life_event_follow_up",
  fresh_update: "fresh_update_follow_up",
  accomplishment_follow_up: "accomplishment_follow_up",
  inactivity: "inactivity_reconnect",
  memory_accumulation: "memory_collection",
  card_gap: "card_gap_context",
};

export function questionCategoryForSourceRuleId(
  sourceRuleId: string,
): FollowUpQuestionCategory | null {
  return RULE_ID_TO_QUESTION_CATEGORY[sourceRuleId] ?? null;
}
