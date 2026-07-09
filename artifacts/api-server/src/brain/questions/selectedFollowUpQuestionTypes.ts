/**
 * Selected follow-up question — conversation selection object, not a rule result.
 */

import type {
  FollowUpQuestionCategory,
  FollowUpQuestionSensitivity,
} from "./questionTypes";

export interface SelectedFollowUpQuestion {
  questionId: string;
  questionText: string;
  category: FollowUpQuestionCategory;
  sourceRuleId: string;
  reason: string;
  sensitivity: FollowUpQuestionSensitivity;
  rotationKey: string;
}
