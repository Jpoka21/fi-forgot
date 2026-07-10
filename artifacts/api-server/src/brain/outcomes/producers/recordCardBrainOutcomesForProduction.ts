/**
 * Production entry point for card Brain outcome recording.
 */

import { getCardBrainOutcomeDependencies } from "./createCardBrainOutcomeDependencies";
import { recordCardBrainOutcomes } from "./recordCardBrainOutcomes";
import type { PersistedPersonalCard, RecordCardBrainOutcomesResult } from "./cardOutcomeTypes";

export async function recordCardBrainOutcomesForProduction(input: {
  persistedCard: PersistedPersonalCard;
  authenticatedUserId: string;
  isInsert: boolean;
  previousStatus: string | null;
}): Promise<RecordCardBrainOutcomesResult> {
  return recordCardBrainOutcomes({
    ...input,
    dependencies: getCardBrainOutcomeDependencies(),
  });
}
