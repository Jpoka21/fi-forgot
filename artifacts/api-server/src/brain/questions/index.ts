/**
 * Follow Up Question Engine — deterministic question catalog and selection.
 */

export { FOLLOW_UP_QUESTION_CATALOG } from "./questionCatalog";
export { RULE_ID_TO_QUESTION_CATEGORY, questionCategoryForSourceRuleId } from "./ruleIdQuestionCategoryMapping";
export { selectFollowUpQuestion } from "./selectFollowUpQuestion";
export { selectQuestionForActionPlan } from "./selectQuestionForActionPlan";
export type { SelectFollowUpQuestionInput } from "./selectFollowUpQuestion";
export type { SelectQuestionForActionPlanInput } from "./selectQuestionForActionPlan";
export type { SelectedFollowUpQuestion } from "./selectedFollowUpQuestionTypes";
export type {
  FollowUpQuestion,
  FollowUpQuestionCategory,
  FollowUpQuestionSensitivity,
} from "./questionTypes";
