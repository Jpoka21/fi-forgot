/**
 * Brain outcome recorder contract — persistence-agnostic write boundary.
 *
 * Callers record immutable outcome facts without knowing whether the backing
 * implementation is no-op, database-backed, or projected into exposure.
 */

import type {
  BrainOutcomeType,
  CardOutcomeMetadata,
  OpportunityDismissedOutcomeMetadata,
  QuestionAnsweredOutcomeMetadata,
} from "./outcomeTypes";

interface RecordBrainOutcomeBase {
  userId: string;
  recipientId: string;
  /** Brain-internal identity — not for domain models or product DTOs. */
  opportunityKey: string;
  occurredAt?: Date;
}

export type RecordBrainOutcomeInput =
  | (RecordBrainOutcomeBase & {
      outcomeType: "question_answered";
      metadata?: QuestionAnsweredOutcomeMetadata;
    })
  | (RecordBrainOutcomeBase & {
      outcomeType: "card_created" | "card_approved" | "card_sent";
      metadata?: CardOutcomeMetadata;
    })
  | (RecordBrainOutcomeBase & {
      outcomeType: "opportunity_dismissed";
      metadata?: OpportunityDismissedOutcomeMetadata;
    });

export type RecordBrainOutcomeInputFor<T extends BrainOutcomeType> = Extract<
  RecordBrainOutcomeInput,
  { outcomeType: T }
>;

export interface BrainOutcomeRecorder {
  record(input: RecordBrainOutcomeInput): Promise<void>;
}
