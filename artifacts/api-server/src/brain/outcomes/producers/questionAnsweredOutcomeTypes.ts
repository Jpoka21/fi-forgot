/**
 * Question-answered Brain outcome producer contracts.
 */

import type { QuestionAnsweredOutcomeMetadata } from "../outcomeTypes";
import type { BrainOutcomeProjectionResult } from "../projection/outcomeProjectionTypes";

export interface PersistedQuestionAnswer {
  answerId: string;
  userId: string;
  recipientId: string;
  fieldKey: string;
  triggerType: QuestionAnsweredOutcomeMetadata["triggerType"];
  followUpId?: string;
  createdAt: Date;
}

export interface ResolvedQuestionAnswerOutcomeContext {
  userId: string;
  recipientId: string;
  opportunityKey: string;
  metadata: QuestionAnsweredOutcomeMetadata;
}

export type QuestionAnsweredBrainOutcomeProducerResult =
  | {
      status: "recorded_and_projected";
      outcomeEventId: string;
      projection: BrainOutcomeProjectionResult;
    }
  | {
      status: "already_recorded";
      outcomeEventId: string;
      projection: BrainOutcomeProjectionResult;
    }
  | {
      status: "ignored_not_brain_originated";
    }
  | {
      status: "recorded_projection_failed";
      outcomeEventId: string;
      projectionError: unknown;
    };
