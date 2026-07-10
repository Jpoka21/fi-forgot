/**
 * Database-backed Brain outcome recorder factory.
 *
 * Not wired into production flows until outcome producers land in later steps.
 */

import type { BrainOutcomeRecorder } from "./brainOutcomeRecorder";
import type { BrainOutcomeRepository } from "./outcomeRepository";

export function createPersistentBrainOutcomeRecorder(
  repository: BrainOutcomeRepository,
): BrainOutcomeRecorder {
  return {
    async record(input): Promise<void> {
      await repository.append(input);
    },
  };
}
