/**
 * Server-side Brain opportunity resolution for persisted question answers.
 *
 * Resolves only Brain catalog follow-up questions — not scheduled follow-ups,
 * profile-gap fields, or legacy fresh-update prompts.
 */

import { buildOpportunityKey } from "../../attention/buildOpportunityKey";
import { findFollowUpCatalogQuestionById } from "../../questions/questionCatalog";
import { sourceRuleIdForQuestionCategory } from "../../questions/ruleIdQuestionCategoryMapping";
import type {
  PersistedQuestionAnswer,
  ResolvedQuestionAnswerOutcomeContext,
} from "./questionAnsweredOutcomeTypes";

export function resolveQuestionAnswerOutcomeContext(
  answer: PersistedQuestionAnswer,
): ResolvedQuestionAnswerOutcomeContext | null {
  const catalogQuestion = findFollowUpCatalogQuestionById(answer.fieldKey);
  if (!catalogQuestion) {
    return null;
  }

  const sourceRuleId = sourceRuleIdForQuestionCategory(catalogQuestion.category);
  if (!sourceRuleId) {
    return null;
  }

  const metadata: ResolvedQuestionAnswerOutcomeContext["metadata"] = {
    fieldKey: answer.fieldKey,
    triggerType: answer.triggerType,
  };

  if (answer.followUpId) {
    metadata.followUpId = answer.followUpId;
  }

  return {
    userId: answer.userId,
    recipientId: answer.recipientId,
    opportunityKey: buildOpportunityKey(answer.recipientId, sourceRuleId),
    metadata,
  };
}
