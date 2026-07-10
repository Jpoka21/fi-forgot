/**
 * Card Brain outcome producer contracts.
 */

import type { CardOutcomeMetadata } from "../outcomeTypes";
import type { BrainOutcomeProjectionResult } from "../projection/outcomeProjectionTypes";
import type { BrainOutcomeType } from "../outcomeTypes";

export interface PersistedPersonalCard {
  id: string;
  userId: string;
  recipientId: string;
  status: string;
  brainSourceRuleId: string | null;
  occurredAt: Date;
}

export interface ResolvedCardOutcomeContext {
  userId: string;
  recipientId: string;
  opportunityKey: string;
  metadata: CardOutcomeMetadata;
}

export type CardOutcomeTransitionType = Extract<
  BrainOutcomeType,
  "card_created" | "card_approved" | "card_sent"
>;

export type CardBrainOutcomeProducerResult =
  | {
      status: "recorded_and_projected";
      outcomeType: CardOutcomeTransitionType;
      outcomeEventId: string;
      projection: BrainOutcomeProjectionResult;
    }
  | {
      status: "already_recorded";
      outcomeType: CardOutcomeTransitionType;
      outcomeEventId: string;
      projection: BrainOutcomeProjectionResult;
    }
  | {
      status: "ignored_not_brain_originated";
      outcomeType: CardOutcomeTransitionType;
    }
  | {
      status: "recorded_projection_failed";
      outcomeType: CardOutcomeTransitionType;
      outcomeEventId: string;
      projectionError: unknown;
    };

export interface RecordCardBrainOutcomesResult {
  results: CardBrainOutcomeProducerResult[];
}
