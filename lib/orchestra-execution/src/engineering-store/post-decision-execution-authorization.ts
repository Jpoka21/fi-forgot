import { sortKeys } from "../assignment.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  POST_DECISION_EXECUTION_AUTHORIZATION_SCOPE,
  POST_DECISION_EXECUTION_AUTHORIZATION_SOURCE,
  type PostDecisionAction,
  type PostDecisionExecutionAuthorizationRecord,
} from "./types.js";

export type PostDecisionExecutionAuthorizationRecordBody = Omit<
  PostDecisionExecutionAuthorizationRecord,
  "authorizationHash"
>;

export function postDecisionExecutionAuthorizationId(postDecisionActionId: string): string {
  return `pdea-${postDecisionActionId}`;
}

export function hashPostDecisionExecutionAuthorization(
  body: PostDecisionExecutionAuthorizationRecordBody,
): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildPostDecisionExecutionAuthorizationRecord(input: {
  postDecisionActionId: string;
  postDecisionActionHash: string;
  verificationDecisionId: string;
  preparedAction: PostDecisionAction;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  startingBranch: string;
  startingHead: string;
  continuationTargetId?: string | null;
  continuationTargetHash?: string | null;
  authorizedAt?: string;
}): PostDecisionExecutionAuthorizationRecord {
  const continuationTargetId =
    input.preparedAction === "PREPARE_CONTINUATION"
      ? (input.continuationTargetId ?? null)
      : null;
  const continuationTargetHash =
    input.preparedAction === "PREPARE_CONTINUATION"
      ? (input.continuationTargetHash ?? null)
      : null;
  if (input.preparedAction === "PREPARE_CONTINUATION") {
    if (!continuationTargetId || !continuationTargetHash) {
      throw new Error(
        "PREPARE_CONTINUATION authorization requires continuationTargetId and continuationTargetHash",
      );
    }
  }
  const body: PostDecisionExecutionAuthorizationRecordBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "post_decision_execution_authorization",
    authorizationId: postDecisionExecutionAuthorizationId(input.postDecisionActionId),
    postDecisionActionId: input.postDecisionActionId,
    postDecisionActionHash: input.postDecisionActionHash,
    verificationDecisionId: input.verificationDecisionId,
    preparedAction: input.preparedAction,
    executorAssignmentId: input.executorAssignmentId,
    executorExecutionEvidenceId: input.executorExecutionEvidenceId,
    continuationTargetId,
    continuationTargetHash,
    authorizedBy: "explicit_human",
    authorizedAt: input.authorizedAt ?? new Date().toISOString(),
    authorizationScope: POST_DECISION_EXECUTION_AUTHORIZATION_SCOPE,
    startingBranch: input.startingBranch,
    startingHead: input.startingHead.toLowerCase(),
    humanAuthorized: true,
    source: POST_DECISION_EXECUTION_AUTHORIZATION_SOURCE,
    recordVersion: 1,
  };
  return {
    ...body,
    authorizationHash: hashPostDecisionExecutionAuthorization(body),
  };
}

export function validatePostDecisionExecutionAuthorization(
  record: PostDecisionExecutionAuthorizationRecord,
): boolean {
  if (record.recordKind !== "post_decision_execution_authorization") return false;
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (record.source !== POST_DECISION_EXECUTION_AUTHORIZATION_SOURCE) return false;
  if (record.humanAuthorized !== true) return false;
  if (record.authorizedBy !== "explicit_human") return false;
  if (record.authorizationScope !== POST_DECISION_EXECUTION_AUTHORIZATION_SCOPE) return false;
  if (record.recordVersion !== 1) return false;
  if (record.authorizationId !== postDecisionExecutionAuthorizationId(record.postDecisionActionId)) {
    return false;
  }
  if (record.preparedAction === "PREPARE_CONTINUATION") {
    if (!record.continuationTargetId || !record.continuationTargetHash) return false;
  } else if (
    record.continuationTargetId !== null ||
    record.continuationTargetHash !== null
  ) {
    return false;
  }
  const { authorizationHash, ...body } = record;
  return hashPostDecisionExecutionAuthorization(body) === authorizationHash;
}
