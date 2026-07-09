/**
 * Deterministic follow-up question selection — v1 returns first question per category.
 *
 * No rotation, history, or personalization yet.
 */

import { FOLLOW_UP_QUESTION_CATALOG } from "./questionCatalog";
import type { FollowUpQuestion, FollowUpQuestionCategory } from "./questionTypes";

export interface SelectFollowUpQuestionInput {
  category: FollowUpQuestionCategory | string;
}

export function selectFollowUpQuestion(
  input: SelectFollowUpQuestionInput,
): FollowUpQuestion | null {
  const questions = FOLLOW_UP_QUESTION_CATALOG.filter(
    (question) => question.category === input.category,
  );

  if (questions.length === 0) {
    return null;
  }

  return [...questions].sort((a, b) => a.rotationOrder - b.rotationOrder)[0] ?? null;
}
