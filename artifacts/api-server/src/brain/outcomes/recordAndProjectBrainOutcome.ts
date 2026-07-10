/**
 * Outcome persistence followed by exposure projection — future producer boundary.
 *
 * Not wired into production routes in Step 6d.
 */

import type { RecordBrainOutcomeInput } from "./brainOutcomeRecorder";
import type { BrainOutcomeRepository } from "./outcomeRepository";
import type { BrainOutcomeEvent } from "./outcomeTypes";
import type {
  BrainOutcomeExposureProjector,
  BrainOutcomeProjectionResult,
} from "./projection/outcomeProjectionTypes";

export interface RecordAndProjectBrainOutcomeDependencies {
  outcomeRepository: BrainOutcomeRepository;
  projector: BrainOutcomeExposureProjector;
}

export interface RecordAndProjectBrainOutcomeResult {
  outcome: BrainOutcomeEvent;
  projection: BrainOutcomeProjectionResult;
}

export async function recordAndProjectBrainOutcome(
  input: RecordBrainOutcomeInput,
  dependencies: RecordAndProjectBrainOutcomeDependencies,
): Promise<RecordAndProjectBrainOutcomeResult> {
  const outcome = await dependencies.outcomeRepository.append(input);
  const projection = await dependencies.projector.project(outcome);
  return { outcome, projection };
}
