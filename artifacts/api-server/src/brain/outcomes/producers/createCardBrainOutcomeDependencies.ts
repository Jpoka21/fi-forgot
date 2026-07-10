/**
 * Lazy production dependencies for card Brain outcome producers.
 */

import { createPgExposureEventRepository } from "../../fatigue/exposure/pgExposureRepository";
import { createPgBrainOutcomeRepository } from "../pgOutcomeRepository";
import { createBrainOutcomeExposureProjector } from "../projection/createBrainOutcomeExposureProjector";
import type { RecordAndProjectBrainOutcomeDependencies } from "../recordAndProjectBrainOutcome";

let cachedDependencies: RecordAndProjectBrainOutcomeDependencies | null = null;

export function createCardBrainOutcomeDependencies(): RecordAndProjectBrainOutcomeDependencies {
  const outcomeRepository = createPgBrainOutcomeRepository();
  const exposureRepository = createPgExposureEventRepository();
  const projector = createBrainOutcomeExposureProjector(exposureRepository);

  return { outcomeRepository, projector };
}

export function getCardBrainOutcomeDependencies(): RecordAndProjectBrainOutcomeDependencies {
  if (!cachedDependencies) {
    cachedDependencies = createCardBrainOutcomeDependencies();
  }
  return cachedDependencies;
}
