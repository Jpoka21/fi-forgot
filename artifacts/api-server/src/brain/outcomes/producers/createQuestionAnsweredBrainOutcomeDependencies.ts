/**
 * Lazy production dependencies for the question-answered Brain outcome producer.
 */

import { createPgExposureEventRepository } from "../../fatigue/exposure/pgExposureRepository";
import { createPgBrainOutcomeRepository } from "../pgOutcomeRepository";
import { createBrainOutcomeExposureProjector } from "../projection/createBrainOutcomeExposureProjector";
import type { RecordAndProjectBrainOutcomeDependencies } from "../recordAndProjectBrainOutcome";

let cachedDependencies: RecordAndProjectBrainOutcomeDependencies | null = null;

export function createQuestionAnsweredBrainOutcomeDependencies(): RecordAndProjectBrainOutcomeDependencies {
  const outcomeRepository = createPgBrainOutcomeRepository();
  const exposureRepository = createPgExposureEventRepository();
  const projector = createBrainOutcomeExposureProjector(exposureRepository);

  return { outcomeRepository, projector };
}

export function getQuestionAnsweredBrainOutcomeDependencies(): RecordAndProjectBrainOutcomeDependencies {
  if (!cachedDependencies) {
    cachedDependencies = createQuestionAnsweredBrainOutcomeDependencies();
  }
  return cachedDependencies;
}
