/**
 * Production entry point for question-answered Brain outcome recording.
 */

import { getQuestionAnsweredBrainOutcomeDependencies } from "./createQuestionAnsweredBrainOutcomeDependencies";
import { recordQuestionAnsweredBrainOutcome } from "./recordQuestionAnsweredBrainOutcome";
import type {
  PersistedQuestionAnswer,
  QuestionAnsweredBrainOutcomeProducerResult,
} from "./questionAnsweredOutcomeTypes";

export async function recordQuestionAnsweredBrainOutcomeForProduction(input: {
  persistedAnswer: PersistedQuestionAnswer;
  authenticatedUserId: string;
}): Promise<QuestionAnsweredBrainOutcomeProducerResult> {
  return recordQuestionAnsweredBrainOutcome({
    ...input,
    dependencies: getQuestionAnsweredBrainOutcomeDependencies(),
  });
}
