import { FileEngineeringStore, EngineeringStoreError } from "./store.js";
import { buildGovernedContinuationTargetLifecycleRecord } from "./governed-continuation-target-record.js";
import type { GovernedContinuationTargetLifecycleRecord } from "./types.js";

export const GOVERNED_CONTINUATION_TARGET_LIFECYCLE_REFUSALS = [
  "target_not_found",
  "target_corrupt",
  "invalid_status",
] as const;

export type GovernedContinuationTargetLifecycleRefusal =
  (typeof GOVERNED_CONTINUATION_TARGET_LIFECYCLE_REFUSALS)[number];

/**
 * Mark a registered continuation target blocked or superseded (not consumed).
 * Consumed is reserved for successful authorized execution.
 */
export function markGovernedContinuationTargetStatus(input: {
  store: FileEngineeringStore;
  continuationTargetId: string;
  status: "blocked" | "superseded";
  reasonCode: string;
}): {
  recorded: boolean;
  refused: boolean;
  reason: GovernedContinuationTargetLifecycleRefusal | null;
  lifecycle: GovernedContinuationTargetLifecycleRecord | null;
} {
  if (input.status !== "blocked" && input.status !== "superseded") {
    return { recorded: false, refused: true, reason: "invalid_status", lifecycle: null };
  }
  const target = input.store.findGovernedContinuationTargetById(input.continuationTargetId);
  if (!target) {
    return { recorded: false, refused: true, reason: "target_not_found", lifecycle: null };
  }
  try {
    const lifecycle = input.store.persistGovernedContinuationTargetLifecycle(
      buildGovernedContinuationTargetLifecycleRecord({
        continuationTargetId: target.continuationTargetId,
        targetHash: target.targetHash,
        status: input.status,
        reasonCode: input.reasonCode,
      }),
    );
    return { recorded: true, refused: false, reason: null, lifecycle };
  } catch (error) {
    if (error instanceof EngineeringStoreError) {
      return { recorded: false, refused: true, reason: "target_corrupt", lifecycle: null };
    }
    throw error;
  }
}
