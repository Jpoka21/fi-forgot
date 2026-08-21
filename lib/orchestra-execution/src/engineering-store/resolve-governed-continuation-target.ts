import type { FileEngineeringStore } from "./store.js";
import { validateGovernedContinuationTarget } from "./governed-continuation-target-record.js";
import { evaluatePredecessorPathAuthority } from "./predecessor-path-authority.js";
import type {
  GovernedContinuationTargetRecord,
  GovernedContinuationTargetStatus,
  PostDecisionActionRecord,
} from "./types.js";

export const CONTINUATION_TARGET_RESOLUTION_REFUSALS = [
  "continuation_target_not_available",
  "continuation_target_ambiguous",
  "continuation_target_stale",
  "continuation_target_superseded",
  "continuation_target_blocked",
  "continuation_target_consumed",
  "continuation_target_corrupt",
  "continuation_target_repository_mismatch",
  "continuation_target_branch_mismatch",
  "continuation_target_head_mismatch",
  "continuation_target_predecessor_mismatch",
  "continuation_target_project_mismatch",
  "continuation_target_policy_invalid",
  "continuation_target_scope_broadening",
  "continuation_target_protected_path_weakening",
] as const;

export type ContinuationTargetResolutionRefusal =
  (typeof CONTINUATION_TARGET_RESOLUTION_REFUSALS)[number];

export interface ResolveGovernedContinuationTargetResult {
  resolved: boolean;
  refused: boolean;
  reason: ContinuationTargetResolutionRefusal | null;
  warnings: string[];
  target: GovernedContinuationTargetRecord | null;
  effectiveStatus: GovernedContinuationTargetStatus | null;
  eligibleCount: number;
}

function refused(
  reason: ContinuationTargetResolutionRefusal,
  extras: Partial<ResolveGovernedContinuationTargetResult> = {},
): ResolveGovernedContinuationTargetResult {
  return {
    resolved: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    target: extras.target ?? null,
    effectiveStatus: extras.effectiveStatus ?? null,
    eligibleCount: extras.eligibleCount ?? 0,
  };
}

/**
 * Deterministically resolve the unique eligible governed continuation target
 * for a PREPARE_CONTINUATION action from Orchestra store authority only.
 */
export function resolveGovernedContinuationTargetForAction(input: {
  store: FileEngineeringStore;
  action: PostDecisionActionRecord;
  /**
   * When set, require this exact target id+hash (authorization binding).
   */
  boundContinuationTargetId?: string | null;
  boundContinuationTargetHash?: string | null;
}): ResolveGovernedContinuationTargetResult {
  const { store, action } = input;
  if (action.preparedAction !== "PREPARE_CONTINUATION") {
    return refused("continuation_target_not_available", {
      warnings: ["resolution requires PREPARE_CONTINUATION"],
    });
  }

  const registered = store
    .loadValidGovernedContinuationTargets(action.verifierAssignmentId)
    .filter((row) => row.verificationDecisionId === action.verificationDecisionId);

  if (input.boundContinuationTargetId) {
    // Bound lookups must still fail closed if raw storage holds a hash-valid but
    // predecessor-path-invalid target (defense in depth beyond loadValid filtering).
    const rawBound = store
      .loadGovernedContinuationTargets(action.verifierAssignmentId)
      .filter((row) => validateGovernedContinuationTarget(row))
      .find((row) => row.continuationTargetId === input.boundContinuationTargetId);
    if (!rawBound) {
      return refused("continuation_target_not_available", {
        warnings: ["bound continuation target not found"],
      });
    }
    if (
      input.boundContinuationTargetHash &&
      rawBound.targetHash !== input.boundContinuationTargetHash
    ) {
      return refused("continuation_target_stale", {
        target: rawBound,
        warnings: ["authorization target hash does not match registered target"],
      });
    }
    return validateCandidate(store, action, rawBound);
  }

  const eligible: GovernedContinuationTargetRecord[] = [];
  const refusals: ResolveGovernedContinuationTargetResult[] = [];
  for (const row of registered) {
    const check = validateCandidate(store, action, row);
    if (check.resolved && check.target) eligible.push(check.target);
    else refusals.push(check);
  }

  if (eligible.length === 0) {
    if (refusals.length === 1) {
      return refusals[0]!;
    }
    if (
      refusals.length > 1 &&
      refusals.every((row) => row.reason === refusals[0]!.reason)
    ) {
      return {
        ...refusals[0]!,
        eligibleCount: 0,
        warnings: [
          ...(refusals[0]!.warnings ?? []),
          `all ${refusals.length} registered targets ineligible`,
        ],
      };
    }
    return refused("continuation_target_not_available", {
      eligibleCount: 0,
      warnings: refusals.map((row) => row.reason ?? "unknown").filter(Boolean) as string[],
    });
  }

  const minKey = Math.min(...eligible.map((row) => row.orderingKey));
  const winners = eligible.filter((row) => row.orderingKey === minKey);
  if (winners.length !== 1) {
    return refused("continuation_target_ambiguous", {
      eligibleCount: eligible.length,
      warnings: [
        `multiple eligible targets share orderingKey ${minKey}`,
        "frozen authority does not define a unique winner",
      ],
    });
  }

  return {
    resolved: true,
    refused: false,
    reason: null,
    warnings: [],
    target: winners[0]!,
    effectiveStatus: "eligible",
    eligibleCount: eligible.length,
  };
}

function validateCandidate(
  store: FileEngineeringStore,
  action: PostDecisionActionRecord,
  target: GovernedContinuationTargetRecord,
): ResolveGovernedContinuationTargetResult {
  if (!validateGovernedContinuationTarget(target)) {
    return refused("continuation_target_corrupt", { target });
  }

  const effectiveStatus = store.effectiveGovernedContinuationTargetStatus(
    target.continuationTargetId,
    target.targetHash,
  );
  if (effectiveStatus === "consumed") {
    return refused("continuation_target_consumed", {
      target,
      effectiveStatus,
    });
  }
  if (effectiveStatus === "superseded") {
    return refused("continuation_target_superseded", {
      target,
      effectiveStatus,
    });
  }
  if (effectiveStatus === "blocked") {
    return refused("continuation_target_blocked", {
      target,
      effectiveStatus,
    });
  }
  if (effectiveStatus !== "eligible") {
    return refused("continuation_target_stale", {
      target,
      effectiveStatus,
    });
  }

  if (target.predecessorExecutorAssignmentId !== action.executorAssignmentId) {
    return refused("continuation_target_predecessor_mismatch", { target, effectiveStatus });
  }
  if (
    target.predecessorExecutorExecutionEvidenceId !== action.executorExecutionEvidenceId
  ) {
    return refused("continuation_target_predecessor_mismatch", {
      target,
      effectiveStatus,
      warnings: ["predecessor execution evidence mismatch"],
    });
  }
  if (!action.startingBranch || target.branch !== action.startingBranch) {
    return refused("continuation_target_branch_mismatch", { target, effectiveStatus });
  }
  if (
    !action.startingHead ||
    target.baselineHead.toLowerCase() !== action.startingHead.toLowerCase()
  ) {
    return refused("continuation_target_head_mismatch", { target, effectiveStatus });
  }

  let executorRecord;
  try {
    executorRecord = store.loadAssignmentRecord(action.executorAssignmentId);
  } catch {
    return refused("continuation_target_predecessor_mismatch", { target, effectiveStatus });
  }
  const predecessor = executorRecord.frozen.assignment;
  if (predecessor.role !== "executor") {
    return refused("continuation_target_predecessor_mismatch", { target, effectiveStatus });
  }
  if (target.projectId !== predecessor.projectId) {
    return refused("continuation_target_project_mismatch", { target, effectiveStatus });
  }
  if (target.repositoryPath !== predecessor.repositoryPath) {
    return refused("continuation_target_repository_mismatch", { target, effectiveStatus });
  }
  if (target.requireNoPush !== true || target.commitAuthorization !== false || target.pushAuthorization !== false) {
    return refused("continuation_target_policy_invalid", { target, effectiveStatus });
  }

  const pathAuthority = evaluatePredecessorPathAuthority({ target, predecessor });
  if (!pathAuthority.valid) {
    if (pathAuthority.reason === "scope_broadening") {
      return refused("continuation_target_scope_broadening", {
        target,
        effectiveStatus,
        warnings: ["target allowedPaths exceed authoritative predecessor allowedPaths"],
      });
    }
    if (pathAuthority.reason === "protected_path_weakening") {
      return refused("continuation_target_protected_path_weakening", {
        target,
        effectiveStatus,
        warnings: ["target protectedPaths omit authoritative predecessor protections"],
      });
    }
    if (pathAuthority.reason === "project_mismatch") {
      return refused("continuation_target_project_mismatch", { target, effectiveStatus });
    }
    if (pathAuthority.reason === "repository_mismatch") {
      return refused("continuation_target_repository_mismatch", { target, effectiveStatus });
    }
    if (pathAuthority.reason === "branch_mismatch") {
      return refused("continuation_target_branch_mismatch", { target, effectiveStatus });
    }
    return refused("continuation_target_predecessor_mismatch", {
      target,
      effectiveStatus,
      warnings: [pathAuthority.reason ?? "predecessor path authority failed"],
    });
  }

  return {
    resolved: true,
    refused: false,
    reason: null,
    warnings: [],
    target,
    effectiveStatus: "eligible",
    eligibleCount: 1,
  };
}
