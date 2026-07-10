/**
 * Records and projects a question_answered Brain outcome after answer persistence.
 */

import type { RecordAndProjectBrainOutcomeDependencies } from "../recordAndProjectBrainOutcome";
import { formatQuestionAnswerSourceActionId } from "../sourceActionId";
import { resolveQuestionAnswerOutcomeContext } from "./resolveQuestionAnswerOutcomeContext";
import type {
  PersistedQuestionAnswer,
  QuestionAnsweredBrainOutcomeProducerResult,
} from "./questionAnsweredOutcomeTypes";

export interface RecordQuestionAnsweredBrainOutcomeInput {
  persistedAnswer: PersistedQuestionAnswer;
  authenticatedUserId: string;
  dependencies: RecordAndProjectBrainOutcomeDependencies;
}

export async function recordQuestionAnsweredBrainOutcome(
  input: RecordQuestionAnsweredBrainOutcomeInput,
): Promise<QuestionAnsweredBrainOutcomeProducerResult> {
  const { persistedAnswer, authenticatedUserId, dependencies } = input;

  if (persistedAnswer.userId !== authenticatedUserId) {
    throw new Error("Answer does not belong to authenticated user");
  }

  const context = resolveQuestionAnswerOutcomeContext(persistedAnswer);
  if (!context) {
    return { status: "ignored_not_brain_originated" };
  }

  const appendResult = await dependencies.outcomeRepository.appendOnceForSourceAction({
    userId: context.userId,
    recipientId: context.recipientId,
    opportunityKey: context.opportunityKey,
    outcomeType: "question_answered",
    occurredAt: persistedAnswer.createdAt,
    metadata: context.metadata,
    sourceActionId: formatQuestionAnswerSourceActionId(persistedAnswer.answerId),
  });

  const outcome = appendResult.event;

  try {
    const projection = await dependencies.projector.project(outcome);

    if (appendResult.status === "already_exists") {
      return {
        status: "already_recorded",
        outcomeEventId: outcome.id,
        projection,
      };
    }

    return {
      status: "recorded_and_projected",
      outcomeEventId: outcome.id,
      projection,
    };
  } catch (projectionError) {
    return {
      status: "recorded_projection_failed",
      outcomeEventId: outcome.id,
      projectionError,
    };
  }
}
