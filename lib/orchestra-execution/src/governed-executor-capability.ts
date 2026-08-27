import type { FrozenAssignment } from "./assignment.js";
import { collectGitEvidence } from "./git-evidence.js";
import type { ExecutionProvider } from "./provider-contract.js";
import { buildCorrectionAssignmentFromPreparedAction, correctionAssignmentId } from "./engineering-store/build-correction-assignment.js";
import { buildContinuationAssignmentFromTarget, continuationAssignmentId } from "./engineering-store/build-continuation-assignment.js";
import { dispatchFrozenAssignment, type DispatchFrozenAssignmentOutput } from "./engineering-store/dispatch.js";
import { validatePostDecisionAction, preparedActionMatchesDecision } from "./engineering-store/post-decision-action-record.js";
import { validatePostDecisionExecutionAuthorization } from "./engineering-store/post-decision-execution-authorization.js";
import { resolveGovernedContinuationTargetForAction } from "./engineering-store/resolve-governed-continuation-target.js";
import type { FileEngineeringStore } from "./engineering-store/store.js";
import { validateVerificationDecision } from "./engineering-store/verification-decision-record.js";

const CAPABILITY_BRAND = Symbol("GovernedExecutorExecutionCapability");
type CapabilityPhase = "issued" | "dispatching" | "running";
const issuedCapabilities = new WeakMap<object, CapabilityPhase>();

/** Ephemeral proof that authoritative validation immediately preceded this dispatch. */
export interface GovernedExecutorExecutionCapability {
  readonly [CAPABILITY_BRAND]: true;
  readonly assignmentId: string;
  readonly assignmentHash: string;
  readonly projectId: string;
  readonly repositoryPath: string;
  readonly branch: string;
  readonly startingHead: string;
  readonly postDecisionActionId: string;
  readonly authorizationHash: string;
  readonly actionHash: string;
  readonly action: "PREPARE_CORRECTION" | "PREPARE_CONTINUATION";
}

export interface DispatchAuthorizedGovernedExecutorInput {
  store: FileEngineeringStore;
  provider: ExecutionProvider;
  assignmentId: string;
  postDecisionActionId: string;
  authorizationId: string;
  projectHooks?: boolean;
}

function sameFrozen(left: FrozenAssignment, right: FrozenAssignment): boolean {
  return left.assignmentHash === right.assignmentHash &&
    JSON.stringify(left.assignment) === JSON.stringify(right.assignment);
}

function refuse(message: string): never {
  throw new Error(`governed executor issuance refused: ${message}`);
}

/**
 * The only executor-capability issuance boundary. It dispatches directly and never
 * returns the capability. Every input is treated as an identifier/hint and is
 * independently resolved against persisted authority before the private mint.
 */
export async function dispatchAuthorizedGovernedExecutorAssignment(
  input: DispatchAuthorizedGovernedExecutorInput,
): Promise<DispatchFrozenAssignmentOutput> {
  const action = input.store.findPostDecisionActionById(input.postDecisionActionId);
  if (!action || !validatePostDecisionAction(action)) refuse("action is absent or corrupt");
  if (action.preparedAction === "REQUIRE_HUMAN_DECISION") refuse("human decision is not executable");
  if (action.preparedAction !== "PREPARE_CORRECTION" && action.preparedAction !== "PREPARE_CONTINUATION") {
    refuse("action kind is not executable");
  }

  const authorization = input.store.findPostDecisionExecutionAuthorizationById(input.authorizationId);
  if (!authorization || !validatePostDecisionExecutionAuthorization(authorization)) {
    refuse("explicit-human authorization is absent or corrupt");
  }
  if (authorization.postDecisionActionId !== action.postDecisionActionId ||
      authorization.postDecisionActionHash !== action.actionHash ||
      authorization.verificationDecisionId !== action.verificationDecisionId ||
      authorization.preparedAction !== action.preparedAction ||
      authorization.executorAssignmentId !== action.executorAssignmentId ||
      authorization.executorExecutionEvidenceId !== action.executorExecutionEvidenceId) {
    refuse("authorization is not exactly bound to the action");
  }

  const decision = input.store.findVerificationDecisionById(action.verificationDecisionId);
  if (!decision || !validateVerificationDecision(decision) ||
      decision.decision !== action.decision ||
      !preparedActionMatchesDecision(decision.decision, action.preparedAction)) {
    refuse("trusted decision is absent, corrupt, stale, or incompatible");
  }
  if (decision.verifiedExecutorAssignmentId !== action.executorAssignmentId ||
      decision.verifiedExecutorExecutionEvidenceId !== action.executorExecutionEvidenceId) {
    refuse("action is not bound to the decided predecessor");
  }

  const predecessor = input.store.loadAssignmentRecord(action.executorAssignmentId);
  if (predecessor.frozen.assignment.role !== "executor") refuse("predecessor is not an executor");
  const predecessorEvidence = input.store.loadExecutionEvidenceById(
    action.executorAssignmentId,
    action.executorExecutionEvidenceId,
  );
  if (predecessorEvidence.assignmentHash !== predecessor.frozen.assignmentHash) {
    refuse("predecessor evidence assignment hash mismatch");
  }

  const generated = input.store.loadAssignmentRecord(input.assignmentId);
  let expected: FrozenAssignment;
  if (action.preparedAction === "PREPARE_CORRECTION") {
    if (input.assignmentId !== correctionAssignmentId(action.postDecisionActionId) ||
        generated.relationship.correctionOfAssignmentId !== action.executorAssignmentId ||
        generated.relationship.parentAssignmentId !== action.executorAssignmentId ||
        generated.relationship.continuationOfAssignmentId !== undefined ||
        generated.relationship.continuationTargetId !== undefined) {
      refuse("correction assignment relationship mismatch");
    }
    expected = buildCorrectionAssignmentFromPreparedAction({
      action,
      decision,
      originalExecutor: predecessor.frozen.assignment,
    });
  } else {
    if (!authorization.continuationTargetId || !authorization.continuationTargetHash) {
      refuse("continuation authorization lacks exact target binding");
    }
    const resolved = resolveGovernedContinuationTargetForAction({
      store: input.store,
      action,
      boundContinuationTargetId: authorization.continuationTargetId,
      boundContinuationTargetHash: authorization.continuationTargetHash,
    });
    if (!resolved.resolved || !resolved.target) refuse(`continuation target ${resolved.reason ?? "unavailable"}`);
    if (resolved.target.projectId !== predecessor.frozen.assignment.projectId) {
      refuse("continuation project mismatch");
    }
    if (input.assignmentId !== continuationAssignmentId(action.postDecisionActionId) ||
        generated.relationship.continuationOfAssignmentId !== action.executorAssignmentId ||
        generated.relationship.parentAssignmentId !== action.executorAssignmentId ||
        generated.relationship.continuationTargetId !== resolved.target.continuationTargetId ||
        generated.relationship.correctionOfAssignmentId !== undefined) {
      refuse("continuation assignment relationship mismatch");
    }
    expected = buildContinuationAssignmentFromTarget({ action, target: resolved.target });
  }

  if (!sameFrozen(generated.frozen, expected)) refuse("persisted generated assignment is not authoritative reconstruction");
  const assignment = generated.frozen.assignment;
  if (assignment.role !== "executor" || assignment.commitAuthorization !== false ||
      assignment.pushAuthorization !== false || assignment.requireNoPush !== true) {
    refuse("generated assignment expands commit/push authority");
  }
  if (input.store.loadLatestExecutionEvidence(input.assignmentId)) refuse("duplicate execution evidence exists");
  if (input.store.getCurrentState(input.assignmentId).crashReceipts.length > 0) {
    refuse("crash ambiguity prevents replay");
  }

  const git = await collectGitEvidence(assignment.repositoryPath);
  if (!git.branch || !git.head || git.branch !== assignment.branch ||
      git.branch !== authorization.startingBranch ||
      git.head.toLowerCase() !== assignment.startingHead.toLowerCase() ||
      git.head.toLowerCase() !== authorization.startingHead.toLowerCase() ||
      git.branch !== action.startingBranch ||
      git.head.toLowerCase() !== (action.startingHead ?? "").toLowerCase()) {
    refuse("repository branch or starting HEAD no longer matches authority");
  }

  const capability = Object.freeze({
    [CAPABILITY_BRAND]: true as const,
    assignmentId: assignment.assignmentId,
    assignmentHash: generated.frozen.assignmentHash,
    projectId: assignment.projectId,
    repositoryPath: assignment.repositoryPath,
    branch: assignment.branch,
    startingHead: assignment.startingHead.toLowerCase(),
    postDecisionActionId: action.postDecisionActionId,
    authorizationHash: authorization.authorizationHash,
    actionHash: action.actionHash,
    action: action.preparedAction,
  });
  issuedCapabilities.set(capability, "issued");
  return dispatchFrozenAssignment({
    store: input.store,
    provider: input.provider,
    assignmentId: input.assignmentId,
    projectHooks: input.projectHooks,
    governedExecutorCapability: capability,
  });
}

function matchesFrozenAssignment(value: unknown, frozen: FrozenAssignment): value is GovernedExecutorExecutionCapability {
  if (typeof value !== "object" || value === null || !issuedCapabilities.has(value)) return false;
  const candidate = value as GovernedExecutorExecutionCapability;
  const assignment = frozen.assignment;
  return candidate[CAPABILITY_BRAND] === true &&
    candidate.assignmentId === assignment.assignmentId &&
    candidate.assignmentHash === frozen.assignmentHash &&
    candidate.projectId === assignment.projectId &&
    candidate.repositoryPath === assignment.repositoryPath &&
    candidate.branch === assignment.branch &&
    candidate.startingHead === assignment.startingHead.toLowerCase();
}

export function beginGovernedExecutorDispatch(value: unknown, frozen: FrozenAssignment): value is GovernedExecutorExecutionCapability {
  if (!matchesFrozenAssignment(value, frozen) || issuedCapabilities.get(value) !== "issued") return false;
  issuedCapabilities.set(value, "dispatching");
  return true;
}

export function beginGovernedExecutorRun(value: unknown, frozen: FrozenAssignment): value is GovernedExecutorExecutionCapability {
  if (!matchesFrozenAssignment(value, frozen) || issuedCapabilities.get(value) !== "dispatching") return false;
  issuedCapabilities.set(value, "running");
  return true;
}
