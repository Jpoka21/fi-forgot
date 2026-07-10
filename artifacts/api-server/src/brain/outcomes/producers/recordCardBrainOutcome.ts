/**
 * Records and projects a single card Brain outcome after card persistence.
 */

import type { RecordAndProjectBrainOutcomeDependencies } from "../recordAndProjectBrainOutcome";
import { formatCardOutcomeSourceActionId } from "../sourceActionId";
import type {
  CardBrainOutcomeProducerResult,
  CardOutcomeTransitionType,
  PersistedPersonalCard,
} from "./cardOutcomeTypes";
import { resolveCardOutcomeContext } from "./resolveCardOutcomeContext";

export interface RecordCardBrainOutcomeInput {
  persistedCard: PersistedPersonalCard;
  outcomeType: CardOutcomeTransitionType;
  authenticatedUserId: string;
  dependencies: RecordAndProjectBrainOutcomeDependencies;
}

export async function recordCardBrainOutcome(
  input: RecordCardBrainOutcomeInput,
): Promise<CardBrainOutcomeProducerResult> {
  const { persistedCard, outcomeType, authenticatedUserId, dependencies } = input;

  if (persistedCard.userId !== authenticatedUserId) {
    throw new Error("Card does not belong to authenticated user");
  }

  const context = resolveCardOutcomeContext(persistedCard);
  if (!context) {
    return { status: "ignored_not_brain_originated", outcomeType };
  }

  const appendResult = await dependencies.outcomeRepository.appendOnceForSourceAction({
    userId: context.userId,
    recipientId: context.recipientId,
    opportunityKey: context.opportunityKey,
    outcomeType,
    occurredAt: persistedCard.occurredAt,
    metadata: context.metadata,
    sourceActionId: formatCardOutcomeSourceActionId(outcomeType, persistedCard.id),
  });

  const outcome = appendResult.event;

  try {
    const projection = await dependencies.projector.project(outcome);

    if (appendResult.status === "already_exists") {
      return {
        status: "already_recorded",
        outcomeType,
        outcomeEventId: outcome.id,
        projection,
      };
    }

    return {
      status: "recorded_and_projected",
      outcomeType,
      outcomeEventId: outcome.id,
      projection,
    };
  } catch (projectionError) {
    return {
      status: "recorded_projection_failed",
      outcomeType,
      outcomeEventId: outcome.id,
      projectionError,
    };
  }
}
