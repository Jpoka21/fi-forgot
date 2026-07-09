/**
 * Life Event Classification — pure, deterministic, read-only.
 *
 * Identifies supported life events from structured RelationshipContext data.
 * Does not emit Brain Signals, evaluate opportunities, or touch the Rule Engine.
 */

import {
  LIFE_EVENT_EXCLUDED_QUESTION_KEYS,
  LIFE_EVENT_QUESTION_KEY_MAPPING,
} from "../config/lifeEventQuestionKeyMapping";
import { LIFE_EVENT_FOLLOW_UP_WINDOWS } from "../config/lifeEventFollowUpWindows";
import type { RelationshipContext } from "../types";
import type { LifeEventClassification } from "./lifeEventTypes";

function classifyFreshUpdate(
  questionKey: string,
  daysAgo: number,
  capturedAt: string,
): LifeEventClassification | null {
  if (LIFE_EVENT_EXCLUDED_QUESTION_KEYS.has(questionKey)) {
    return null;
  }

  const mapping = LIFE_EVENT_QUESTION_KEY_MAPPING[questionKey];
  if (!mapping) {
    return null;
  }

  const followUpWindowDays = LIFE_EVENT_FOLLOW_UP_WINDOWS[mapping.type];
  if (followUpWindowDays == null) {
    return null;
  }

  return {
    type: mapping.type,
    category: mapping.category,
    daysAgo,
    followUpWindowDays,
    followUpReady: daysAgo >= followUpWindowDays,
    source: "fresh_update",
    capturedAt,
    classified: true,
    supported: true,
  };
}

/**
 * Returns zero or more life event classifications from structured relationship
 * captures, ordered newest first. Does not read answer text.
 */
export function classifyLifeEvents(
  relationshipContext: RelationshipContext,
): LifeEventClassification[] {
  const classifications: LifeEventClassification[] = [];

  for (const update of relationshipContext.freshUpdates) {
    const classification = classifyFreshUpdate(
      update.questionKey,
      update.daysAgo,
      update.createdAt,
    );
    if (classification) {
      classifications.push(classification);
    }
  }

  classifications.sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime(),
  );

  return classifications;
}
