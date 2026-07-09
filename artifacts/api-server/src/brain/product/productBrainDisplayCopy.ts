/**
 * Static display copy for ProductBrainDecision — keyed by sourceRuleId.
 *
 * Factual labels and explanations only. No AI, prompts, or dynamic wording.
 */

import type { ProductBrainDisplay } from "./productBrainDecisionTypes";

const DISPLAY_BY_RULE_ID: Record<string, ProductBrainDisplay> = {
  wait: {
    title: "No opportunity",
    explanation: "No opportunity rule matched.",
  },
  fresh_update: {
    title: "Fresh update",
    explanation: "Profile information is stale.",
  },
  life_event_follow_up: {
    title: "Life event follow-up",
    explanation: "A supported life event has reached its follow-up window.",
  },
  accomplishment_follow_up: {
    title: "Accomplishment follow-up",
    explanation: "A recent accomplishment is within the follow-up window.",
  },
  inactivity: {
    title: "Relationship inactivity",
    explanation: "The relationship timeline has exceeded the inactivity threshold.",
  },
  memory_accumulation: {
    title: "Memory collection",
    explanation: "Memory inventory is below the threshold for this relationship depth.",
  },
  card_gap: {
    title: "Card channel gap",
    explanation: "The card channel has exceeded the quiet-period threshold.",
  },
  birthday: {
    title: "Birthday preparation",
    explanation: "Their birthday is inside the preparation window.",
  },
  anniversary: {
    title: "Anniversary preparation",
    explanation: "Their anniversary is inside the preparation window.",
  },
  valentines_day: {
    title: "Valentine's Day preparation",
    explanation: "Valentine's Day is inside the preparation window.",
  },
};

const FALLBACK_DISPLAY: ProductBrainDisplay = {
  title: "Opportunity",
  explanation: "An opportunity rule matched.",
};

export function resolveProductBrainDisplay(sourceRuleId: string): ProductBrainDisplay {
  return DISPLAY_BY_RULE_ID[sourceRuleId] ?? FALLBACK_DISPLAY;
}

/** All registered rule ids with their static display copy (for tests). */
export const PRODUCT_BRAIN_DISPLAY_BY_RULE_ID = DISPLAY_BY_RULE_ID;
