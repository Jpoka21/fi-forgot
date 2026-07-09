/**
 * Maps structured fresh-update question keys to life event type and category.
 *
 * Does not define follow-up windows — see lifeEventFollowUpWindows.ts.
 */

import type { LifeEventCategory } from "../lifeEvents/lifeEventTypes";

export interface LifeEventQuestionKeyMapping {
  type: string;
  category: LifeEventCategory;
}

/**
 * Question keys excluded from life event classification.
 * Owned by separate opportunity rules or future dedicated rules.
 */
export const LIFE_EVENT_EXCLUDED_QUESTION_KEYS = new Set([
  "recent_accomplishment",
  "current_excitement",
  "current_challenge",
]);

export const LIFE_EVENT_QUESTION_KEY_MAPPING: Record<string, LifeEventQuestionKeyMapping> =
  {
    family_news: {
      type: "family_update",
      category: "family",
    },
  };
