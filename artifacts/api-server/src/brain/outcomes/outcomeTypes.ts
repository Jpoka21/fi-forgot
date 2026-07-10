/**
 * Brain outcome event types — append-only immutable facts.
 *
 * Internal only — never exposed through domain models or product DTOs.
 *
 * Outcomes describe meaningful user or system actions that may later project
 * into exposure events for fatigue. Outcome summaries are derived at read time
 * and are not part of this contract.
 *
 * Future correlation: an opaque BrainExecutionId is the preferred long-term
 * mechanism for linking domain actions to a specific Brain delivery. Execution
 * records are intentionally deferred until after core outcome infrastructure
 * and at least one producer have been validated.
 */

/** Approved Sprint 6 outcome vocabulary. */
export type BrainOutcomeType =
  | "question_answered"
  | "card_created"
  | "card_approved"
  | "card_sent"
  | "opportunity_dismissed";

export const BRAIN_OUTCOME_TYPES: readonly BrainOutcomeType[] = [
  "question_answered",
  "card_created",
  "card_approved",
  "card_sent",
  "opportunity_dismissed",
] as const;

export interface QuestionAnsweredOutcomeMetadata {
  fieldKey: string;
  triggerType: "profile_gap" | "fresh_update" | "follow_up" | "event_briefing";
  followUpId?: string;
}

export interface CardOutcomeMetadata {
  cardId: string;
  /** Domain card status at the time of the outcome (e.g. Approved, Mailed to me). */
  cardStatus: string;
}

export interface OpportunityDismissedOutcomeMetadata {
  dismissSource: string;
}

export type BrainOutcomeMetadata =
  | QuestionAnsweredOutcomeMetadata
  | CardOutcomeMetadata
  | OpportunityDismissedOutcomeMetadata;

/** Stored append-only outcome fact. IDs and timestamps are persistence-owned. */
export interface BrainOutcomeEvent {
  id: string;
  userId: string;
  recipientId: string;
  /** Brain-internal identity — recipientId:sourceRuleId */
  opportunityKey: string;
  outcomeType: BrainOutcomeType;
  /** UTC ISO-8601 timestamp */
  occurredAt: string;
  metadata?: BrainOutcomeMetadata;
}

export function isBrainOutcomeType(value: string): value is BrainOutcomeType {
  return (BRAIN_OUTCOME_TYPES as readonly string[]).includes(value);
}

export function assertValidBrainOutcomeOpportunityIdentity(input: {
  opportunityKey: string;
  recipientId: string;
}): void {
  const prefix = `${input.recipientId}:`;
  if (!input.opportunityKey.startsWith(prefix)) {
    throw new Error(
      `Invalid brain outcome opportunity identity: opportunityKey "${input.opportunityKey}" does not belong to recipient "${input.recipientId}"`,
    );
  }

  const sourceRuleId = input.opportunityKey.slice(prefix.length);
  if (!sourceRuleId) {
    throw new Error(
      `Invalid brain outcome opportunity identity: opportunityKey "${input.opportunityKey}" is missing sourceRuleId`,
    );
  }
}
