import { FileEngineeringStore } from "./store.js";
import {
  buildPostDecisionExecutionAuthorizationRecord,
  validatePostDecisionExecutionAuthorization,
} from "./post-decision-execution-authorization.js";
import { validatePostDecisionAction } from "./post-decision-action-record.js";
import { validateVerificationDecision } from "./verification-decision-record.js";
import { resolveGovernedContinuationTargetForAction } from "./resolve-governed-continuation-target.js";
import type {
  PostDecisionAction,
  PostDecisionActionRecord,
  PostDecisionExecutionAuthorizationRecord,
} from "./types.js";

export const POST_DECISION_AUTHORIZATION_REFUSALS = [
  "action_not_found",
  "action_corrupt",
  "decision_not_found",
  "decision_corrupt",
  "decision_action_mismatch",
  "human_authorization_required",
  "human_decision_not_executable",
  "starting_baseline_missing",
  "relationship_mismatch",
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
] as const;

export type PostDecisionAuthorizationRefusal =
  (typeof POST_DECISION_AUTHORIZATION_REFUSALS)[number];

export interface AuthorizePostDecisionExecutionInput {
  store: FileEngineeringStore;
  postDecisionActionId: string;
  /** Must be explicitly true. Never inferred. */
  humanAuthorized: boolean;
}

export interface AuthorizePostDecisionExecutionResult {
  authorized: boolean;
  refused: boolean;
  reason: PostDecisionAuthorizationRefusal | null;
  warnings: string[];
  postDecisionActionId: string;
  preparedAction: PostDecisionAction | null;
  authorization: PostDecisionExecutionAuthorizationRecord | null;
  duplicateAuthorizationReused: boolean;
}

function refused(
  input: AuthorizePostDecisionExecutionInput,
  reason: PostDecisionAuthorizationRefusal,
  extras: Partial<AuthorizePostDecisionExecutionResult> = {},
): AuthorizePostDecisionExecutionResult {
  return {
    authorized: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    postDecisionActionId: input.postDecisionActionId,
    preparedAction: extras.preparedAction ?? null,
    authorization: extras.authorization ?? null,
    duplicateAuthorizationReused: extras.duplicateAuthorizationReused ?? false,
  };
}

/**
 * Record explicit human authorization to execute one prepared post-decision action.
 * Does not execute. Does not invent authorization from VERIFIED/CORRECTION_REQUIRED.
 * For PREPARE_CONTINUATION, binds authorization to the unique eligible governed target.
 */
export function authorizePostDecisionExecution(
  input: AuthorizePostDecisionExecutionInput,
): AuthorizePostDecisionExecutionResult {
  if (input.humanAuthorized !== true) {
    return refused(input, "human_authorization_required");
  }

  const action = input.store.findPostDecisionActionById(input.postDecisionActionId);
  if (!action) return refused(input, "action_not_found");
  if (!validatePostDecisionAction(action)) return refused(input, "action_corrupt");

  if (action.preparedAction === "REQUIRE_HUMAN_DECISION") {
    return refused(input, "human_decision_not_executable", {
      preparedAction: action.preparedAction,
      warnings: ["REQUIRE_HUMAN_DECISION cannot be converted into execution authorization"],
    });
  }

  const decision = input.store.findVerificationDecisionById(action.verificationDecisionId);
  if (!decision) return refused(input, "decision_not_found", { preparedAction: action.preparedAction });
  if (!validateVerificationDecision(decision)) {
    return refused(input, "decision_corrupt", { preparedAction: action.preparedAction });
  }
  if (decision.decision !== action.decision) {
    return refused(input, "decision_action_mismatch", { preparedAction: action.preparedAction });
  }
  if (
    decision.verifiedExecutorAssignmentId !== action.executorAssignmentId ||
    decision.verifiedExecutorExecutionEvidenceId !== action.executorExecutionEvidenceId
  ) {
    return refused(input, "relationship_mismatch", { preparedAction: action.preparedAction });
  }
  if (!action.startingBranch || !action.startingHead) {
    return refused(input, "starting_baseline_missing", { preparedAction: action.preparedAction });
  }

  const existing = input.store.findValidPostDecisionExecutionAuthorization(
    action.postDecisionActionId,
    action.actionHash,
  );
  if (existing) {
    return {
      authorized: true,
      refused: false,
      reason: null,
      warnings: [
        "existing post-decision execution authorization reused",
        "authorization is not execution; call executeAuthorizedPostDecisionAction separately",
      ],
      postDecisionActionId: action.postDecisionActionId,
      preparedAction: action.preparedAction,
      authorization: existing,
      duplicateAuthorizationReused: true,
    };
  }

  let continuationTargetId: string | null = null;
  let continuationTargetHash: string | null = null;
  if (action.preparedAction === "PREPARE_CONTINUATION") {
    const resolved = resolveGovernedContinuationTargetForAction({
      store: input.store,
      action,
    });
    if (!resolved.resolved || !resolved.target) {
      const reason =
        (resolved.reason as PostDecisionAuthorizationRefusal | null) ??
        "continuation_target_not_available";
      return refused(input, reason, {
        preparedAction: action.preparedAction,
        warnings: resolved.warnings,
      });
    }
    continuationTargetId = resolved.target.continuationTargetId;
    continuationTargetHash = resolved.target.targetHash;
  }

  const record = buildPostDecisionExecutionAuthorizationRecord({
    postDecisionActionId: action.postDecisionActionId,
    postDecisionActionHash: action.actionHash,
    verificationDecisionId: action.verificationDecisionId,
    preparedAction: action.preparedAction,
    executorAssignmentId: action.executorAssignmentId,
    executorExecutionEvidenceId: action.executorExecutionEvidenceId,
    startingBranch: action.startingBranch,
    startingHead: action.startingHead,
    continuationTargetId,
    continuationTargetHash,
  });
  const persisted = input.store.persistPostDecisionExecutionAuthorization(record);
  return {
    authorized: true,
    refused: false,
    reason: null,
    warnings: [
      "explicit human authorization recorded for a single prepared post-decision action",
      "authorization is not execution; call executeAuthorizedPostDecisionAction separately",
      "does not grant standing continuation or automatic commit/push",
      ...(action.preparedAction === "PREPARE_CONTINUATION"
        ? [
            `continuation authorization bound to target ${continuationTargetId}`,
            "authorization does not transfer across continuation targets",
          ]
        : []),
    ],
    postDecisionActionId: action.postDecisionActionId,
    preparedAction: action.preparedAction,
    authorization: persisted,
    duplicateAuthorizationReused: false,
  };
}

export type { PostDecisionActionRecord };
