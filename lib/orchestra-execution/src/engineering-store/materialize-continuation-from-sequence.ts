import { DEFAULT_PROHIBITED_COMMAND_CLASSES } from "../assignment.js";
import { FileEngineeringStore, EngineeringStoreError } from "./store.js";
import {
  buildGovernedContinuationSequenceConfig,
  buildSequenceFulfillmentRecord,
  validateGovernedContinuationSequenceConfig,
  validateSequenceFulfillment,
} from "./governed-continuation-target-record.js";
import { registerGovernedContinuationTarget } from "./register-governed-continuation-target.js";
import { validateVerificationDecision } from "./verification-decision-record.js";
import { GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE } from "./types.js";
import type {
  GovernedContinuationSequenceConfigRecord,
  GovernedContinuationSequenceFulfillmentRecord,
  GovernedContinuationTargetRecord,
} from "./types.js";

export const SEQUENCE_CONFIG_REFUSALS = [
  "config_corrupt",
  "authority_invalid",
  "duplicate_version_conflict",
  "policy_invalid",
] as const;

export type SequenceConfigRefusal = (typeof SEQUENCE_CONFIG_REFUSALS)[number];

export const MATERIALIZE_SEQUENCE_REFUSALS = [
  "decision_not_found",
  "decision_corrupt",
  "decision_not_verified",
  "executor_not_found",
  "sequence_not_found",
  "sequence_corrupt",
  "sequence_project_mismatch",
  "sequence_repository_mismatch",
  "sequence_branch_mismatch",
  "bootstrap_ambiguous",
  "bootstrap_already_fulfilled",
  "unrelated_verified_predecessor",
  "predecessor_not_fulfilled",
  "no_next_entry",
  "next_entry_ambiguous",
  "next_entry_already_fulfilled",
  "scope_broadening",
  "protected_path_weakening",
  "registration_failed",
  "target_corrupt",
] as const;

export type MaterializeSequenceRefusal = (typeof MATERIALIZE_SEQUENCE_REFUSALS)[number];

/**
 * Persist a project governed continuation sequence configuration.
 * Does not execute. Does not authorize. Does not invent entries from prose.
 */
export function persistGovernedContinuationSequenceConfig(input: {
  store: FileEngineeringStore;
  projectId: string;
  sequenceKey: string;
  configurationVersion: number;
  repositoryPath: string;
  branch: string;
  entries: Array<{
    entryKey: string;
    orderingKey: number;
    predecessorEntryKey: string | null;
    assignmentText: string;
    allowedPaths: string[];
    protectedPaths: string[];
    prohibitedCommandClasses: string[];
    requiredEvidence?: string[];
    structuredObligations?: Array<{
      obligationId: string;
      summary: string;
      verificationMode?: string;
    }>;
  }>;
}): {
  persisted: boolean;
  refused: boolean;
  reason: SequenceConfigRefusal | null;
  warnings: string[];
  config: GovernedContinuationSequenceConfigRecord | null;
  duplicateReused: boolean;
} {
  let config: GovernedContinuationSequenceConfigRecord;
  try {
    config = buildGovernedContinuationSequenceConfig(input);
  } catch (error) {
    return {
      persisted: false,
      refused: true,
      reason: "policy_invalid",
      warnings: [String(error)],
      config: null,
      duplicateReused: false,
    };
  }
  if (!validateGovernedContinuationSequenceConfig(config)) {
    return {
      persisted: false,
      refused: true,
      reason: "config_corrupt",
      warnings: [],
      config: null,
      duplicateReused: false,
    };
  }
  if (config.authoritySource !== "projectGovernedContinuationSequence") {
    return {
      persisted: false,
      refused: true,
      reason: "authority_invalid",
      warnings: [],
      config: null,
      duplicateReused: false,
    };
  }
  try {
    const persisted = input.store.persistGovernedContinuationSequenceConfig(config);
    return {
      persisted: true,
      refused: false,
      reason: null,
      warnings: [
        "governed continuation sequence configuration persisted",
        "configuration is not execution authorization",
      ],
      config: persisted,
      duplicateReused: persisted.configHash === config.configHash && persisted !== config,
    };
  } catch (error) {
    if (error instanceof EngineeringStoreError) {
      if (String(error.message).includes("different hash")) {
        return {
          persisted: false,
          refused: true,
          reason: "duplicate_version_conflict",
          warnings: [error.message],
          config: null,
          duplicateReused: false,
        };
      }
      return {
        persisted: false,
        refused: true,
        reason: "policy_invalid",
        warnings: [error.message],
        config: null,
        duplicateReused: false,
      };
    }
    throw error;
  }
}

function refusedMaterialize(
  reason: MaterializeSequenceRefusal,
  extras: {
    warnings?: string[];
    config?: GovernedContinuationSequenceConfigRecord | null;
    target?: GovernedContinuationTargetRecord | null;
  } = {},
): {
  materialized: boolean;
  refused: boolean;
  reason: MaterializeSequenceRefusal | null;
  warnings: string[];
  config: GovernedContinuationSequenceConfigRecord | null;
  target: GovernedContinuationTargetRecord | null;
  fulfillment: GovernedContinuationSequenceFulfillmentRecord | null;
  duplicateTargetReused: boolean;
} {
  return {
    materialized: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    config: extras.config ?? null,
    target: extras.target ?? null,
    fulfillment: null,
    duplicateTargetReused: false,
  };
}

/**
 * After a trusted VERIFIED decision, deterministically materialize the next
 * governed continuation target from project sequence configuration.
 * Does not authorize. Does not dispatch.
 */
export function materializeNextGovernedContinuationTargetFromSequence(input: {
  store: FileEngineeringStore;
  verificationDecisionId: string;
  /** Optional; when omitted, active sequence for the predecessor project is used. */
  sequenceId?: string;
}): {
  materialized: boolean;
  refused: boolean;
  reason: MaterializeSequenceRefusal | null;
  warnings: string[];
  config: GovernedContinuationSequenceConfigRecord | null;
  target: GovernedContinuationTargetRecord | null;
  fulfillment: GovernedContinuationSequenceFulfillmentRecord | null;
  duplicateTargetReused: boolean;
} {
  const decision = input.store.findVerificationDecisionById(input.verificationDecisionId);
  if (!decision) return refusedMaterialize("decision_not_found");
  if (!validateVerificationDecision(decision)) return refusedMaterialize("decision_corrupt");
  if (decision.decision !== "VERIFIED") {
    return refusedMaterialize("decision_not_verified");
  }

  let executorRecord;
  try {
    executorRecord = input.store.loadAssignmentRecord(decision.verifiedExecutorAssignmentId);
  } catch {
    return refusedMaterialize("executor_not_found");
  }
  const predecessor = executorRecord.frozen.assignment;
  if (predecessor.role !== "executor") return refusedMaterialize("executor_not_found");

  const config = input.sequenceId
    ? input.store.findActiveGovernedContinuationSequenceConfig(input.sequenceId)
    : input.store.findActiveGovernedContinuationSequenceConfigForProject(predecessor.projectId);
  if (!config) return refusedMaterialize("sequence_not_found");
  if (!validateGovernedContinuationSequenceConfig(config)) {
    return refusedMaterialize("sequence_corrupt", { config });
  }
  if (config.projectId !== predecessor.projectId) {
    return refusedMaterialize("sequence_project_mismatch", { config });
  }
  if (config.repositoryPath !== predecessor.repositoryPath) {
    return refusedMaterialize("sequence_repository_mismatch", { config });
  }
  if (config.branch !== predecessor.branch) {
    return refusedMaterialize("sequence_branch_mismatch", { config });
  }

  // Determine which entry this VERIFIED decision fulfills.
  let fulfilledEntryKey: string | null = null;
  let fulfilledEntryHash: string | null = null;
  const existingByExecutor = input.store.findSequenceFulfillmentByExecutor(
    config.sequenceId,
    decision.verifiedExecutorAssignmentId,
  );
  if (existingByExecutor && validateSequenceFulfillment(existingByExecutor)) {
    fulfilledEntryKey = existingByExecutor.entryKey;
    fulfilledEntryHash = existingByExecutor.entryHash;
  } else {
    // Continuation executor: target binding carries sequence entry.
    const contTargetId = executorRecord.relationship.continuationTargetId;
    if (contTargetId) {
      const target = input.store.findGovernedContinuationTargetById(contTargetId);
      if (
        target &&
        target.sequenceId === config.sequenceId &&
        target.sequenceEntryKey &&
        target.sequenceEntryHash
      ) {
        const entry = config.entries.find((e) => e.entryKey === target.sequenceEntryKey);
        if (entry && entry.entryHash === target.sequenceEntryHash) {
          fulfilledEntryKey = entry.entryKey;
          fulfilledEntryHash = entry.entryHash;
        }
      }
    }
  }

  let predecessorFulfillment: GovernedContinuationSequenceFulfillmentRecord | null = null;
  if (!fulfilledEntryKey) {
    // Bootstrap is a one-time governed predecessor relationship for this sequence.
    // Same project/repo/branch + VERIFIED alone is not sufficient after bootstrap is bound.
    const bootstraps = config.entries.filter((e) => e.predecessorEntryKey === null);
    if (bootstraps.length !== 1) {
      return refusedMaterialize("bootstrap_ambiguous", { config });
    }
    const bootstrap = bootstraps[0]!;
    const existingBootstrap = input.store.findSequenceFulfillmentByEntryKey(
      config.sequenceId,
      bootstrap.entryKey,
    );
    if (existingBootstrap && validateSequenceFulfillment(existingBootstrap)) {
      const samePredecessor =
        existingBootstrap.executorAssignmentId === decision.verifiedExecutorAssignmentId &&
        existingBootstrap.verificationDecisionId === decision.verificationDecisionId;
      if (!samePredecessor) {
        return refusedMaterialize("bootstrap_already_fulfilled", {
          config,
          warnings: [
            "bootstrap entry already fulfilled by a governed predecessor",
            "unrelated VERIFIED cannot rebind bootstrap or unlock the next entry",
          ],
        });
      }
      // Idempotent replay of the exact bootstrap predecessor.
      predecessorFulfillment = existingBootstrap;
      fulfilledEntryKey = existingBootstrap.entryKey;
      fulfilledEntryHash = existingBootstrap.entryHash;
    } else {
      const fulfillment = buildSequenceFulfillmentRecord({
        sequenceId: config.sequenceId,
        sequenceConfigHash: config.configHash,
        entryKey: bootstrap.entryKey,
        entryHash: bootstrap.entryHash,
        verificationDecisionId: decision.verificationDecisionId,
        executorAssignmentId: decision.verifiedExecutorAssignmentId,
        executorExecutionEvidenceId: decision.verifiedExecutorExecutionEvidenceId,
      });
      try {
        predecessorFulfillment = input.store.persistSequenceFulfillment(fulfillment);
      } catch (error) {
        if (error instanceof EngineeringStoreError) {
          // Race: another executor may have claimed bootstrap first.
          const raced = input.store.findSequenceFulfillmentByEntryKey(
            config.sequenceId,
            bootstrap.entryKey,
          );
          if (
            raced &&
            validateSequenceFulfillment(raced) &&
            (raced.executorAssignmentId !== decision.verifiedExecutorAssignmentId ||
              raced.verificationDecisionId !== decision.verificationDecisionId)
          ) {
            return refusedMaterialize("bootstrap_already_fulfilled", {
              config,
              warnings: [error.message],
            });
          }
          return refusedMaterialize("predecessor_not_fulfilled", {
            config,
            warnings: [error.message],
          });
        }
        throw error;
      }
      fulfilledEntryKey = bootstrap.entryKey;
      fulfilledEntryHash = bootstrap.entryHash;
    }
  } else {
    const entry = config.entries.find((e) => e.entryKey === fulfilledEntryKey);
    if (!entry || entry.entryHash !== fulfilledEntryHash) {
      return refusedMaterialize("predecessor_not_fulfilled", {
        config,
        warnings: ["fulfilled entry does not match active sequence configuration"],
      });
    }
    if (!existingByExecutor) {
      const fulfillment = buildSequenceFulfillmentRecord({
        sequenceId: config.sequenceId,
        sequenceConfigHash: config.configHash,
        entryKey: entry.entryKey,
        entryHash: entry.entryHash,
        verificationDecisionId: decision.verificationDecisionId,
        executorAssignmentId: decision.verifiedExecutorAssignmentId,
        executorExecutionEvidenceId: decision.verifiedExecutorExecutionEvidenceId,
      });
      try {
        predecessorFulfillment = input.store.persistSequenceFulfillment(fulfillment);
      } catch (error) {
        if (error instanceof EngineeringStoreError) {
          // Duplicate fulfillment for same decision/entry is reuse.
          const prior = input.store.findSequenceFulfillmentByDecision(
            config.sequenceId,
            decision.verificationDecisionId,
          );
          if (prior && validateSequenceFulfillment(prior)) {
            predecessorFulfillment = prior;
          } else {
            return refusedMaterialize("predecessor_not_fulfilled", {
              config,
              warnings: [error.message],
            });
          }
        } else {
          throw error;
        }
      }
    } else {
      predecessorFulfillment = existingByExecutor;
    }
  }

  if (!fulfilledEntryKey || !fulfilledEntryHash) {
    return refusedMaterialize("unrelated_verified_predecessor", {
      config,
      warnings: ["VERIFIED decision is not bound to a governed sequence predecessor"],
    });
  }
  const activeFulfilledEntry = config.entries.find((e) => e.entryKey === fulfilledEntryKey);
  if (!activeFulfilledEntry || activeFulfilledEntry.entryHash !== fulfilledEntryHash) {
    return refusedMaterialize("predecessor_not_fulfilled", {
      config,
      warnings: ["fulfilled entry does not match active sequence configuration"],
    });
  }
  const priorEntryFulfillment = input.store.findSequenceFulfillmentByEntryKey(
    config.sequenceId,
    fulfilledEntryKey,
  );
  if (
    priorEntryFulfillment &&
    validateSequenceFulfillment(priorEntryFulfillment) &&
    (priorEntryFulfillment.executorAssignmentId !==
      decision.verifiedExecutorAssignmentId ||
      priorEntryFulfillment.verificationDecisionId !== decision.verificationDecisionId)
  ) {
    return refusedMaterialize("unrelated_verified_predecessor", {
      config,
      warnings: [
        "sequence entry already fulfilled by a different governed predecessor",
      ],
    });
  }

  const nextCandidates = config.entries.filter(
    (e) => e.predecessorEntryKey === fulfilledEntryKey,
  );
  if (nextCandidates.length === 0) {
    return {
      materialized: false,
      refused: true,
      reason: "no_next_entry",
      warnings: ["sequence has no eligible next entry after fulfilled predecessor"],
      config,
      target: null,
      fulfillment: predecessorFulfillment,
      duplicateTargetReused: false,
    };
  }
  const minKey = Math.min(...nextCandidates.map((e) => e.orderingKey));
  const winners = nextCandidates.filter((e) => e.orderingKey === minKey);
  if (winners.length !== 1) {
    return refusedMaterialize("next_entry_ambiguous", {
      config,
      warnings: [`multiple next entries share orderingKey ${minKey}`],
    });
  }
  const next = winners[0]!;

  const alreadyFulfilled = input.store
    .loadSequenceFulfillments(config.sequenceId)
    .filter(validateSequenceFulfillment)
    .some(
      (row) =>
        row.entryKey === next.entryKey &&
        (row.sequenceConfigHash === config.configHash || row.entryHash === next.entryHash),
    );
  if (alreadyFulfilled) {
    return refusedMaterialize("next_entry_already_fulfilled", { config });
  }

  const targetId = `gct-${decision.verificationDecisionId}-${next.entryKey}`;
  const existingTarget = input.store.findGovernedContinuationTargetById(targetId);
  if (
    existingTarget &&
    existingTarget.sequenceId === config.sequenceId &&
    existingTarget.sequenceEntryKey === next.entryKey &&
    existingTarget.sequenceConfigHash === config.configHash &&
    existingTarget.sequenceEntryHash === next.entryHash
  ) {
    return {
      materialized: true,
      refused: false,
      reason: null,
      warnings: [
        "next governed continuation target already materialized; reusing",
        "materialization is not execution authorization",
      ],
      config,
      target: existingTarget,
      fulfillment: predecessorFulfillment,
      duplicateTargetReused: true,
    };
  }

  const registered = registerGovernedContinuationTarget({
    store: input.store,
    verificationDecisionId: decision.verificationDecisionId,
    targetKey: next.entryKey,
    orderingKey: next.orderingKey,
    projectId: config.projectId,
    repositoryPath: config.repositoryPath,
    branch: config.branch,
    baselineHead: predecessor.startingHead,
    assignmentText: next.assignmentText,
    allowedPaths: [...next.allowedPaths],
    protectedPaths: [...next.protectedPaths],
    prohibitedCommandClasses:
      next.prohibitedCommandClasses.length > 0
        ? [...next.prohibitedCommandClasses]
        : [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
    requiredEvidence: [...next.requiredEvidence],
    structuredObligations: next.structuredObligations,
    authoritySource: GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE,
    sequenceId: config.sequenceId,
    sequenceConfigHash: config.configHash,
    sequenceEntryKey: next.entryKey,
    sequenceEntryHash: next.entryHash,
  });

  if (!registered.registered || !registered.target) {
    const mapped =
      registered.reason === "scope_broadening"
        ? "scope_broadening"
        : registered.reason === "protected_path_weakening"
          ? "protected_path_weakening"
          : "registration_failed";
    return refusedMaterialize(mapped, {
      config,
      warnings: registered.warnings,
    });
  }

  return {
    materialized: true,
    refused: false,
    reason: null,
    warnings: [
      "next governed continuation target materialized from project sequence configuration",
      "materialization is not execution authorization",
      "explicit authorizePostDecisionExecution still required",
      `sequence entry ${next.entryKey} bound to config ${config.configHash.slice(0, 12)}…`,
    ],
    config,
    target: registered.target,
    fulfillment: predecessorFulfillment,
    duplicateTargetReused: registered.duplicateRegistrationReused,
  };
}
