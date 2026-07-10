/**
 * Namespaced source_action_id values for brain_outcome_events producer idempotency.
 *
 * Rule: `{producerKind}:{stableDomainActionId}`
 *
 * The column has a global unique index. Each producer must prefix its domain
 * action identity so future producers (cards, dismissals) cannot collide.
 *
 * Examples:
 *   question_answer:fresh_update_r1_field_1710000000000
 *   card_sent:card-uuid
 *   opportunity_dismissed:dismiss-uuid
 */

export const QUESTION_ANSWER_SOURCE_ACTION_PREFIX = "question_answer:" as const;

export function formatQuestionAnswerSourceActionId(answerId: string): string {
  return `${QUESTION_ANSWER_SOURCE_ACTION_PREFIX}${answerId}`;
}

export function parseQuestionAnswerSourceActionId(sourceActionId: string): string | null {
  if (!sourceActionId.startsWith(QUESTION_ANSWER_SOURCE_ACTION_PREFIX)) {
    return null;
  }
  const answerId = sourceActionId.slice(QUESTION_ANSWER_SOURCE_ACTION_PREFIX.length);
  return answerId.length > 0 ? answerId : null;
}

export const CARD_CREATED_SOURCE_ACTION_PREFIX = "card_created:" as const;
export const CARD_APPROVED_SOURCE_ACTION_PREFIX = "card_approved:" as const;
export const CARD_SENT_SOURCE_ACTION_PREFIX = "card_sent:" as const;

export function formatCardCreatedSourceActionId(cardId: string): string {
  return `${CARD_CREATED_SOURCE_ACTION_PREFIX}${cardId}`;
}

export function formatCardApprovedSourceActionId(cardId: string): string {
  return `${CARD_APPROVED_SOURCE_ACTION_PREFIX}${cardId}`;
}

export function formatCardSentSourceActionId(cardId: string): string {
  return `${CARD_SENT_SOURCE_ACTION_PREFIX}${cardId}`;
}

export function formatCardOutcomeSourceActionId(
  outcomeType: "card_created" | "card_approved" | "card_sent",
  cardId: string,
): string {
  switch (outcomeType) {
    case "card_created":
      return formatCardCreatedSourceActionId(cardId);
    case "card_approved":
      return formatCardApprovedSourceActionId(cardId);
    case "card_sent":
      return formatCardSentSourceActionId(cardId);
  }
}
