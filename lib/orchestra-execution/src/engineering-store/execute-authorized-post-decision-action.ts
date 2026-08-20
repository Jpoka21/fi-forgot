import { collectGitEvidence } from "../git-evidence.js";
import { CURSOR_PROVIDER_ID } from "../provider-contract.js";
import type { ExecutionProvider } from "../provider-contract.js";
import { resolveActiveExecutionProvider } from "./route-verifier.js";
import { dispatchFrozenAssignment } from "./dispatch.js";
import { buildCorrectionAssignmentFromPreparedAction, correctionAssignmentId } from "./build-correction-assignment.js";
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
  "decision_not_found",
  "decision_corrupt",
  "decision_action_mismatch",
  "relationship_mismatch",
  "human_decision_required",
  "continuation_target_not_available",
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
 * PREPARE_CONTINUATION → refuse unless architecture has a continuation target (none yet).
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
    return refused(input, "continuation_target_not_available", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      verificationDecisionId: decision.verificationDecisionId,
      warnings: [
        "no governed continuation target assignment exists in closed architecture",
        "IMP 039 does not invent next requirements",
      ],
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
  if (input.provider) {
    provider = input.provider;
  } else if (input.providerId && input.providerId !== CURSOR_PROVIDER_ID) {
    return refused(input, "provider_required", {
      action,
      authorization,
      decision,
      preparedAction: action.preparedAction,
      authorizationId: authorization.authorizationId,
      generatedAssignmentId: corrId,
      assignmentHash: correctionFrozen.assignmentHash,
      warnings: [`unsupported providerId ${input.providerId}; pass ExecutionProvider explicitly`],
    });
  } else {
    provider = resolveActiveExecutionProvider();
  }

  const dispatched = await dispatchFrozenAssignment({
    store: input.store,
    provider,
    assignmentId: corrId,
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
