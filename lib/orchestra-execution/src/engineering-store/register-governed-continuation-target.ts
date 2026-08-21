import { DEFAULT_PROHIBITED_COMMAND_CLASSES } from "../assignment.js";
import { FileEngineeringStore, EngineeringStoreError } from "./store.js";
import {
  buildGovernedContinuationTargetRecord,
  validateGovernedContinuationTarget,
} from "./governed-continuation-target-record.js";
import { validateVerificationDecision } from "./verification-decision-record.js";
import type { GovernedContinuationTargetRecord } from "./types.js";

export const GOVERNED_CONTINUATION_TARGET_REGISTRATION_REFUSALS = [
  "decision_not_found",
  "decision_corrupt",
  "decision_not_verified",
  "executor_not_found",
  "repository_mismatch",
  "branch_mismatch",
  "head_mismatch",
  "project_mismatch",
  "scope_broadening",
  "protected_path_weakening",
  "policy_invalid",
  "target_corrupt",
  "duplicate_target_conflict",
] as const;

function isSubsetPaths(candidate: string[], allowed: string[]): boolean {
  const set = new Set(allowed.map((p) => p.replace(/\\/g, "/")));
  return candidate.every((p) => set.has(p.replace(/\\/g, "/")));
}

function includesAllPaths(candidate: string[], required: string[]): boolean {
  const set = new Set(candidate.map((p) => p.replace(/\\/g, "/")));
  return required.every((p) => set.has(p.replace(/\\/g, "/")));
}

export type GovernedContinuationTargetRegistrationRefusal =
  (typeof GOVERNED_CONTINUATION_TARGET_REGISTRATION_REFUSALS)[number];

export interface RegisterGovernedContinuationTargetInput {
  store: FileEngineeringStore;
  verificationDecisionId: string;
  /** Stable machine key unique per decision; becomes part of continuationTargetId. */
  targetKey: string;
  /** Lower wins. Equal keys among eligible targets fail closed at resolve. */
  orderingKey: number;
  projectId: string;
  repositoryPath: string;
  branch: string;
  baselineHead: string;
  assignmentText: string;
  allowedPaths: string[];
  protectedPaths: string[];
  prohibitedCommandClasses?: string[];
  requiredEvidence?: string[];
  structuredObligations?: Array<{
    obligationId: string;
    summary: string;
    verificationMode?: string;
  }>;
}

export interface RegisterGovernedContinuationTargetResult {
  registered: boolean;
  refused: boolean;
  reason: GovernedContinuationTargetRegistrationRefusal | null;
  warnings: string[];
  target: GovernedContinuationTargetRecord | null;
  duplicateRegistrationReused: boolean;
}

function refused(
  reason: GovernedContinuationTargetRegistrationRefusal,
  extras: Partial<RegisterGovernedContinuationTargetResult> = {},
): RegisterGovernedContinuationTargetResult {
  return {
    registered: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    target: extras.target ?? null,
    duplicateRegistrationReused: extras.duplicateRegistrationReused ?? false,
  };
}

/**
 * Register an already-authorized governed continuation target.
 * Does not authorize execution and does not invent requirements from prose.
 */
export function registerGovernedContinuationTarget(
  input: RegisterGovernedContinuationTargetInput,
): RegisterGovernedContinuationTargetResult {
  const decision = input.store.findVerificationDecisionById(input.verificationDecisionId);
  if (!decision) return refused("decision_not_found");
  if (!validateVerificationDecision(decision)) return refused("decision_corrupt");
  if (decision.decision !== "VERIFIED") {
    return refused("decision_not_verified", {
      warnings: ["continuation targets may only bind to VERIFIED decisions"],
    });
  }

  let executorRecord;
  try {
    executorRecord = input.store.loadAssignmentRecord(decision.verifiedExecutorAssignmentId);
  } catch (error) {
    if (error instanceof EngineeringStoreError) return refused("executor_not_found");
    throw error;
  }
  const predecessor = executorRecord.frozen.assignment;
  if (predecessor.role !== "executor") return refused("executor_not_found");

  if (input.projectId.trim() !== predecessor.projectId) {
    return refused("project_mismatch");
  }
  if (input.repositoryPath.trim() !== predecessor.repositoryPath) {
    return refused("repository_mismatch");
  }
  if (input.branch.trim() !== predecessor.branch) {
    return refused("branch_mismatch", {
      warnings: ["continuation target branch must match predecessor assignment branch"],
    });
  }
  if (!isSubsetPaths(input.allowedPaths, predecessor.allowedPaths)) {
    return refused("scope_broadening", {
      warnings: ["continuation allowedPaths must be a subset of predecessor allowedPaths"],
    });
  }
  if (!includesAllPaths(input.protectedPaths, predecessor.protectedPaths)) {
    return refused("protected_path_weakening", {
      warnings: ["continuation protectedPaths must include all predecessor protectedPaths"],
    });
  }

  // Baseline must match the verified executor starting head captured on the decision chain
  // via post-run evidence head when available; at minimum match predecessor startingHead
  // unless caller supplies the same value as current PDA baseline later.
  if (input.baselineHead.trim().toLowerCase() !== predecessor.startingHead.toLowerCase()) {
    let evidenceHead: string | null = null;
    try {
      const evidence = input.store.loadExecutionEvidenceById(
        decision.verifiedExecutorAssignmentId,
        decision.verifiedExecutorExecutionEvidenceId,
      );
      evidenceHead =
        evidence.result.postRunGitEvidence?.head ??
        evidence.result.preRunGitEvidence?.head ??
        null;
    } catch {
      evidenceHead = null;
    }
    if (
      !evidenceHead ||
      input.baselineHead.trim().toLowerCase() !== evidenceHead.toLowerCase()
    ) {
      return refused("head_mismatch", {
        warnings: [
          "baselineHead must match predecessor startingHead or verified execution evidence HEAD",
        ],
      });
    }
  }

  let record: GovernedContinuationTargetRecord;
  try {
    record = buildGovernedContinuationTargetRecord({
      verificationDecisionId: decision.verificationDecisionId,
      targetKey: input.targetKey,
      projectId: input.projectId,
      predecessorExecutorAssignmentId: decision.verifiedExecutorAssignmentId,
      predecessorExecutorExecutionEvidenceId: decision.verifiedExecutorExecutionEvidenceId,
      repositoryPath: input.repositoryPath,
      branch: input.branch,
      baselineHead: input.baselineHead,
      assignmentText: input.assignmentText,
      allowedPaths: input.allowedPaths,
      protectedPaths: input.protectedPaths,
      prohibitedCommandClasses:
        input.prohibitedCommandClasses && input.prohibitedCommandClasses.length > 0
          ? input.prohibitedCommandClasses
          : [...DEFAULT_PROHIBITED_COMMAND_CLASSES],
      requiredEvidence: input.requiredEvidence ?? ["git", "hooks", "filesystem"],
      structuredObligations: input.structuredObligations,
      orderingKey: input.orderingKey,
    });
  } catch (error) {
    return refused("policy_invalid", { warnings: [String(error)] });
  }

  if (!validateGovernedContinuationTarget(record)) {
    return refused("target_corrupt");
  }

  try {
    const persisted = input.store.persistGovernedContinuationTarget(record);
    const reused = persisted === record ? false : persisted.targetHash === record.targetHash;
    return {
      registered: true,
      refused: false,
      reason: null,
      warnings: [
        "governed continuation target registered from Orchestra authority",
        "registration is not execution authorization",
        "explicit authorizePostDecisionExecution still required",
      ],
      target: persisted,
      duplicateRegistrationReused: reused,
    };
  } catch (error) {
    if (error instanceof EngineeringStoreError) {
      if (String(error.message).includes("different hash")) {
        return refused("duplicate_target_conflict", { warnings: [error.message] });
      }
      return refused("policy_invalid", { warnings: [error.message] });
    }
    throw error;
  }
}
