/**
 * Records all applicable card Brain outcomes for one persisted card write.
 */

import type { RecordAndProjectBrainOutcomeDependencies } from "../recordAndProjectBrainOutcome";
import { detectCardOutcomeTransitions } from "./detectCardOutcomeTransitions";
import { recordCardBrainOutcome } from "./recordCardBrainOutcome";
import type {
  CardBrainOutcomeProducerResult,
  PersistedPersonalCard,
  RecordCardBrainOutcomesResult,
} from "./cardOutcomeTypes";

export interface RecordCardBrainOutcomesInput {
  persistedCard: PersistedPersonalCard;
  authenticatedUserId: string;
  isInsert: boolean;
  previousStatus: string | null;
  dependencies: RecordAndProjectBrainOutcomeDependencies;
}

export async function recordCardBrainOutcomes(
  input: RecordCardBrainOutcomesInput,
): Promise<RecordCardBrainOutcomesResult> {
  const transitions = detectCardOutcomeTransitions({
    isInsert: input.isInsert,
    previousStatus: input.previousStatus,
    newStatus: input.persistedCard.status,
  });

  const results: CardBrainOutcomeProducerResult[] = [];

  for (const outcomeType of transitions) {
    results.push(
      await recordCardBrainOutcome({
        persistedCard: input.persistedCard,
        outcomeType,
        authenticatedUserId: input.authenticatedUserId,
        dependencies: input.dependencies,
      }),
    );
  }

  return { results };
}
