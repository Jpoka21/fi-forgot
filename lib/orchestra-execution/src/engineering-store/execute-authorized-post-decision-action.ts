import { collectGitEvidence } from "../git-evidence.js";
import { dispatchAuthorizedGovernedExecutorAssignment } from "../governed-executor-capability.js";
import type { ExecutionProvider } from "../provider-contract.js";
import { resolveConfiguredExecutionProvider } from "./route-verifier.js";
import { buildCorrectionAssignmentFromPreparedAction, correctionAssignmentId } from "./build-correction-assignment.js";
import {
  buildContinuationAssignmentFromTarget,
  continuationAssignmentId,
} from "./build-continuation-assignment.js";
import { buildGovernedContinuationTargetLifecycleRecord } from "./governed-continuation-target-record.js";
import { resolveGovernedContinuationTargetForAction } from "./resolve-governed-continuation-target.js";
import { EngineeringStoreError, FileEngineeringStore } from "./store.js";
import { validatePostDecisionAction } from "./post-decision-action-record.js";
import { validatePostDecisionExecutionAuthorization } from "./post-decision-execution-authorization.js";
import { validateVerificationDecision } from "./verification-decision-record.js";
import { preparedActionMatchesDecision } from "./post-decision-action-record.js";
import type {
  ExecutionEvidence,
  PostDecisionAction,
  PostDecisionActionRecord,
  PostDecisionExecutionAuthorizationRecord,
  VerificationDecisionRecord,
} from "./types.js";

export const POST_DECISION_EXECUTION_REFUSALS = [
  "action_not_found",
  "action_corrupt",
  "authorization_not_found",
  "authorization_corrupt",
  "authorization_action_mismatch",
  "authorization_hash_mismatch",
  "authorization_target_mismatch",
  "decision_not_found",
  "decision_corrupt",
  "decision_action_mismatch",
  "relationship_mismatch",
  "human_decision_required",
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
  "continuation_scope_invalid",
  "branch_drift",
  "head_drift",
  "baseline_incomplete",
  "executor_not_found",
  "correction_scope_invalid",
  "crash_ambiguous",
  "provider_required",
] as const;

export type PostDecisionExecutionRefusal = (typeof POST_DECISION_EXECUTION_REFUSALS)[number];

export interface ExecuteAuthorizedPostDecisionActionInput {
  store: FileEngineeringStore;
  postDecisionActionId: string;
  /** Optional; defaults to valid authorization for the action. */
  authorizationId?: string;
  provider?: ExecutionProvider;
  providerId?: string;
  projectHooks?: boolean;
}

export interface ExecuteAuthorizedPostDecisionActionResult {
  executed: boolean;
  refused: boolean;
  reason: PostDecisionExecutionRefusal | null;
  warnings: string[];
  postDecisionActionId: string;
  preparedAction: PostDecisionAction | null;
  authorizationId: string | null;
  verificationDecisionId: string | null;
  generatedAssignmentId: string | null;
  assignmentHash: string | null;
  providerStarted: boolean;
  executionEvidenceId: string | null;
  technicalStatus: string | null;
  duplicateExecutionReused: boolean;
  action: PostDecisionActionRecord | null;
  authorization: PostDecisionExecutionAuthorizationRecord | null;
  decision: VerificationDecisionRecord | null;
  evidence: ExecutionEvidence | null;
}

function refused(
  input: ExecuteAuthorizedPostDecisionActionInput,
  reason: PostDecisionExecutionRefusal,
  extras: Partial<ExecuteAuthorizedPostDecisionActionResult> = {},
): ExecuteAuthorizedPostDecisionActionResult {
  return {
    executed: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    postDecisionActionId: input.postDecisionActionId,
    preparedAction: extras.preparedAction ?? null,
    authorizationId: extras.authorizationId ?? null,
    verificationDecisionId: extras.verificationDecisionId ?? null,
    generatedAssignmentId: extras.generatedAssignmentId ?? null,
    assignmentHash: extras.assignmentHash ?? null,
    providerStarted: extras.providerStarted ?? false,
    executionEvidenceId: extras.executionEvidenceId ?? null,
    technicalStatus: extras.technicalStatus ?? null,
    duplicateExecutionReused: extras.duplicateExecutionReused ?? false,
    action: extras.action ?? null,
    authorization: extras.authorization ?? null,
    decision: extras.decision ?? null,
    evidence: extras.evidence ?? null,
  };
}

/**
 * Execute an explicitly human-authorized post-decision action from store authority only.
 * PREPARE_CORRECTION → generate bounded correction + dispatch.
 * PREPARE_CONTINUATION → resolve governed continuation target + dispatch.
 * REQUIRE_HUMAN_DECISION → always refuse.
 */
export async function executeAuthorizedPostDecisionAction(
  input: ExecuteAuthorizedPostDecisionActionInput,
): Promise<ExecuteAuthorizedPostDecisionActionResult> {
  const action = input.store.findPostDecisionActionById(input.postDecisionActionId);
  if (!action) return refused(input, "action_not_found");
  if (!validatePostDecisionAction(action)) return refused(input, "action_corrupt", { action });

  if (action.preparedAction === "REQUIRE_HUMAN_DECISION") {
    return refused(input, "human_decision_required", {
      action,
      preparedAction: action.preparedAction,
      verificationDecisionId: action.verificationDecisionId,
    });
  }

  let authorization: PostDecisionExecutionAuthorizationRecord | null = null;
  if (input.authorizationId) {
    authorization = input.store.findPostDecisionExecutionAuthorizationById(input.authorizationId);
  } else {
    authorization = input.store.findValidPostDecisionExecutionAuthorization(
      action.postDecisionActionId,
      action.actionHash,
    );
  }
  if (!authorization) {
    return refused(input, "authorization_not_found", {
      action,
      preparedAction: action.preparedAction,
    });
  }
  if (!validatePostDecisionExecutionAuthorization(authorization)) {
    return refused(input, "authorization_corrupt", {
      action,
      authorization,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }
  if (
    authorization.postDecisionActionId !== action.postDecisionActionId ||
    authorization.preparedAction !== action.preparedAction ||
    authorization.verificationDecisionId !== action.verificationDecisionId ||
    authorization.executorAssignmentId !== action.executorAssignmentId ||
    authorization.executorExecutionEvidenceId !== action.executorExecutionEvidenceId
  ) {
    return refused(input, "authorization_action_mismatch", {
      action,
      authorization,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }
  if (authorization.postDecisionActionHash !== action.actionHash) {
    return refused(input, "authorization_hash_mismatch", {
      action,
      authorization,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }

  const decision = input.store.findVerificationDecisionById(action.verificationDecisionId);
  if (!decision) {
    return refused(input, "decision_not_found", {
      action,
      authorization,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }
  if (!validateVerificationDecision(decision)) {
    return refused(input, "decision_corrupt", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }
  if (
    decision.decision !== action.decision ||
    !preparedActionMatchesDecision(decision.decision, action.preparedAction)
  ) {
    return refused(input, "decision_action_mismatch", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }

  let executorRecord;
  try {
    executorRecord = input.store.loadAssignmentRecord(action.executorAssignmentId);
  } catch (error) {
    if (error instanceof EngineeringStoreError) {
      return refused(input, "executor_not_found", {
        action,
        authorization,
        decision,
        preparedAction: action.preparedAction,
        authorizationId: authorization.authorizationId,
      });
    }
    throw error;
  }
  if (executorRecord.frozen.assignment.role !== "executor") {
    return refused(input, "relationship_mismatch", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }

  const repositoryPath = executorRecord.frozen.assignment.repositoryPath;
  const pre = await collectGitEvidence(repositoryPath);
  if (!pre.branch || !pre.head) {
    return refused(input, "baseline_incomplete", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }
  if (pre.branch !== authorization.startingBranch || pre.branch !== action.startingBranch) {
    return refused(input, "branch_drift", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      warnings: [`current=${pre.branch} authorized=${authorization.startingBranch}`],
    });
  }
  if (
    pre.head.toLowerCase() !== authorization.startingHead.toLowerCase() ||
    pre.head.toLowerCase() !== (action.startingHead ?? "").toLowerCase()
  ) {
    return refused(input, "head_drift", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      warnings: [`current=${pre.head} authorized=${authorization.startingHead}`],
    });
  }

  if (action.preparedAction === "PREPARE_CONTINUATION") {
    return executeContinuation({
      input,
      action,
      authorization,
      decision,
      predecessorProjectId: executorRecord.frozen.assignment.projectId,
    });
  }

  if (action.preparedAction !== "PREPARE_CORRECTION") {
    return refused(input, "decision_action_mismatch", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }

  const corrId = correctionAssignmentId(action.postDecisionActionId);
  const existingEvidence = input.store.loadLatestExecutionEvidence(corrId);
  if (existingEvidence) {
    let existingRecord;
    try {
      existingRecord = input.store.loadAssignmentRecord(corrId);
    } catch {
      existingRecord = null;
    }
    return {
      executed: true,
      refused: false,
      reason: null,
      warnings: [
        "existing correction execution evidence reused",
        "duplicate authorized execution refused",
      ],
      postDecisionActionId: action.postDecisionActionId,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      verificationDecisionId: decision.verificationDecisionId,
      generatedAssignmentId: corrId,
      assignmentHash: existingRecord?.frozen.assignmentHash ?? null,
      providerStarted: existingEvidence.providerStarted,
      executionEvidenceId: existingEvidence.evidenceId,
      technicalStatus: existingEvidence.result.executionVerdict,
      duplicateExecutionReused: true,
      action,
      authorization,
      decision,
      evidence: existingEvidence,
    };
  }

  const current = (() => {
    try {
      return input.store.getCurrentState(corrId);
    } catch {
      return null;
    }
  })();
  if (current && current.crashReceipts.length > 0) {
    return refused(input, "crash_ambiguous", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      generatedAssignmentId: corrId,
      warnings: ["correction assignment has crash receipts; refusing automatic replay"],
    });
  }

  let correctionFrozen;
  try {
    correctionFrozen = buildCorrectionAssignmentFromPreparedAction({
      action,
      decision,
      originalExecutor: executorRecord.frozen.assignment,
    });
  } catch (error) {
    return refused(input, "correction_scope_invalid", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      warnings: [String(error)],
    });
  }

  // Idempotent freeze: same id+hash reuses.
  input.store.persistFrozenAssignment(correctionFrozen, {
    relationship: {
      correctionOfAssignmentId: action.executorAssignmentId,
      parentAssignmentId: action.executorAssignmentId,
    },
  });

  let provider: ExecutionProvider;
  try {
    provider = resolveConfiguredExecutionProvider({
      provider: input.provider,
      providerId: input.providerId,
    });
  } catch (error) {
    return refused(input, "provider_required", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      generatedAssignmentId: corrId,
      assignmentHash: correctionFrozen.assignmentHash,
      warnings: [error instanceof Error ? error.message : String(error)],
    });
  }

  const dispatched = await dispatchAuthorizedGovernedExecutorAssignment({
    store: input.store,
    provider,
    assignmentId: corrId,
    postDecisionActionId: action.postDecisionActionId,
    authorizationId: authorization.authorizationId,
    projectHooks: input.projectHooks,
  });

  return {
    executed: true,
    refused: false,
    reason: null,
    warnings: [
      "authorized correction executed programmatically through governed provider path",
      "no Cursor chat courier",
      "no automatic commit or push",
      "authorization does not grant future continuation",
    ],
    postDecisionActionId: action.postDecisionActionId,
    preparedAction: action.preparedAction,
    authorizationId: authorization.authorizationId,
    verificationDecisionId: decision.verificationDecisionId,
    generatedAssignmentId: corrId,
    assignmentHash: correctionFrozen.assignmentHash,
    providerStarted: dispatched.evidence.providerStarted,
    executionEvidenceId: dispatched.evidence.evidenceId,
    technicalStatus: dispatched.result.executionVerdict,
    duplicateExecutionReused: false,
    action,
    authorization,
    decision,
    evidence: dispatched.evidence,
  };
}

async function executeContinuation(args: {
  input: ExecuteAuthorizedPostDecisionActionInput;
  action: PostDecisionActionRecord;
  authorization: PostDecisionExecutionAuthorizationRecord;
  decision: VerificationDecisionRecord;
  predecessorProjectId: string;
}): Promise<ExecuteAuthorizedPostDecisionActionResult> {
  const { input, action, authorization, decision } = args;

  if (!authorization.continuationTargetId || !authorization.continuationTargetHash) {
    return refused(input, "authorization_target_mismatch", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      warnings: ["continuation authorization missing target binding"],
    });
  }

  const contId = continuationAssignmentId(action.postDecisionActionId);
  const existingEvidence = input.store.loadLatestExecutionEvidence(contId);
  if (existingEvidence) {
    let existingRecord;
    try {
      existingRecord = input.store.loadAssignmentRecord(contId);
    } catch {
      existingRecord = null;
    }
    return {
      executed: true,
      refused: false,
      reason: null,
      warnings: [
        "existing continuation execution evidence reused",
        "duplicate authorized execution refused",
      ],
      postDecisionActionId: action.postDecisionActionId,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      verificationDecisionId: decision.verificationDecisionId,
      generatedAssignmentId: contId,
      assignmentHash: existingRecord?.frozen.assignmentHash ?? null,
      providerStarted: existingEvidence.providerStarted,
      executionEvidenceId: existingEvidence.evidenceId,
      technicalStatus: existingEvidence.result.executionVerdict,
      duplicateExecutionReused: true,
      action,
      authorization,
      decision,
      evidence: existingEvidence,
    };
  }

  const resolved = resolveGovernedContinuationTargetForAction({
    store: input.store,
    action,
    boundContinuationTargetId: authorization.continuationTargetId,
    boundContinuationTargetHash: authorization.continuationTargetHash,
  });
  if (!resolved.resolved || !resolved.target) {
    const reason =
      (resolved.reason as PostDecisionExecutionRefusal | null) ??
      "continuation_target_not_available";
    return refused(input, reason, {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      warnings: resolved.warnings,
    });
  }
  const target = resolved.target;
  if (target.projectId !== args.predecessorProjectId) {
    return refused(input, "continuation_target_project_mismatch", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
    });
  }

  const current = (() => {
    try {
      return input.store.getCurrentState(contId);
    } catch {
      return null;
    }
  })();
  if (current && current.crashReceipts.length > 0) {
    return refused(input, "crash_ambiguous", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      generatedAssignmentId: contId,
      warnings: ["continuation assignment has crash receipts; refusing automatic replay"],
    });
  }

  let continuationFrozen;
  try {
    continuationFrozen = buildContinuationAssignmentFromTarget({ action, target });
  } catch (error) {
    return refused(input, "continuation_scope_invalid", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      warnings: [String(error)],
    });
  }

  if (continuationFrozen.assignment.commitAuthorization !== false) {
    return refused(input, "continuation_scope_invalid", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      warnings: ["continuation assignment must not grant commitAuthorization"],
    });
  }
  if (continuationFrozen.assignment.pushAuthorization !== false) {
    return refused(input, "continuation_scope_invalid", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      warnings: ["continuation assignment must not grant pushAuthorization"],
    });
  }
  if (continuationFrozen.assignment.requireNoPush !== true) {
    return refused(input, "continuation_scope_invalid", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      warnings: ["continuation assignment must requireNoPush"],
    });
  }

  input.store.persistFrozenAssignment(continuationFrozen, {
    relationship: {
      parentAssignmentId: action.executorAssignmentId,
      continuationOfAssignmentId: action.executorAssignmentId,
      continuationTargetId: target.continuationTargetId,
    },
  });

  let provider: ExecutionProvider;
  try {
    provider = resolveConfiguredExecutionProvider({
      provider: input.provider,
      providerId: input.providerId,
    });
  } catch (error) {
    return refused(input, "provider_required", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      generatedAssignmentId: contId,
      assignmentHash: continuationFrozen.assignmentHash,
      warnings: [error instanceof Error ? error.message : String(error)],
    });
  }

  const dispatched = await dispatchAuthorizedGovernedExecutorAssignment({
    store: input.store,
    provider,
    assignmentId: contId,
    postDecisionActionId: action.postDecisionActionId,
    authorizationId: authorization.authorizationId,
    projectHooks: input.projectHooks,
  });

  input.store.persistGovernedContinuationTargetLifecycle(
    buildGovernedContinuationTargetLifecycleRecord({
      continuationTargetId: target.continuationTargetId,
      targetHash: target.targetHash,
      status: "consumed",
      postDecisionActionId: action.postDecisionActionId,
      generatedAssignmentId: contId,
      executionEvidenceId: dispatched.evidence.evidenceId,
      reasonCode: "continuation_executed",
    }),
  );

  return {
    executed: true,
    refused: false,
    reason: null,
    warnings: [
      "authorized continuation executed programmatically through governed provider path",
      "no Cursor chat courier",
      "no automatic commit or push",
      "continuation target marked consumed",
      "authorization does not grant standing automatic continuation",
    ],
    postDecisionActionId: action.postDecisionActionId,
    preparedAction: action.preparedAction,
    authorizationId: authorization.authorizationId,
    verificationDecisionId: decision.verificationDecisionId,
    generatedAssignmentId: contId,
    assignmentHash: continuationFrozen.assignmentHash,
    providerStarted: dispatched.evidence.providerStarted,
    executionEvidenceId: dispatched.evidence.evidenceId,
    technicalStatus: dispatched.result.executionVerdict,
    duplicateExecutionReused: false,
    action,
    authorization,
    decision,
    evidence: dispatched.evidence,
  };
}
