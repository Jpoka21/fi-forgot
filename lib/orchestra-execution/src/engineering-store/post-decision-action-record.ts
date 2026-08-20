import { sortKeys } from "../assignment.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  POST_DECISION_ACTION_SOURCE,
  POST_DECISION_ACTIONS,
  type PostDecisionAction,
  type PostDecisionActionRecord,
  type VerificationDecision,
} from "./types.js";

export type PostDecisionActionRecordBody = Omit<PostDecisionActionRecord, "actionHash">;

export function postDecisionActionId(verificationDecisionId: string): string {
  return `pda-${verificationDecisionId}`;
}

export function hashPostDecisionAction(body: PostDecisionActionRecordBody): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildPostDecisionActionRecord(input: {
  verificationDecisionId: string;
  verifierAssignmentId: string;
  verifierExecutionEvidenceId: string;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  decision: VerificationDecision;
  preparedAction: PostDecisionAction;
  reasonCodes: string[];
  failedRequirementIds?: string[];
  acceptanceCheckIds?: string[];
  machineViolationReasonCodes?: string[];
  startingBranch?: string | null;
  startingHead?: string | null;
  allowedPaths?: string[];
  protectedPaths?: string[];
  preparedAt?: string;
}): PostDecisionActionRecord {
  if (!POST_DECISION_ACTIONS.includes(input.preparedAction)) {
    throw new Error(`unsupported preparedAction: ${input.preparedAction}`);
  }
  const body: PostDecisionActionRecordBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "post_decision_action",
    postDecisionActionId: postDecisionActionId(input.verificationDecisionId),
    verificationDecisionId: input.verificationDecisionId,
    verifierAssignmentId: input.verifierAssignmentId,
    verifierExecutionEvidenceId: input.verifierExecutionEvidenceId,
    executorAssignmentId: input.executorAssignmentId,
    executorExecutionEvidenceId: input.executorExecutionEvidenceId,
    decision: input.decision,
    preparedAction: input.preparedAction,
    reasonCodes: [...input.reasonCodes].sort(),
    failedRequirementIds: [...(input.failedRequirementIds ?? [])].sort(),
    acceptanceCheckIds: [...(input.acceptanceCheckIds ?? [])].sort(),
    machineViolationReasonCodes: [...(input.machineViolationReasonCodes ?? [])].sort(),
    startingBranch: input.startingBranch ?? null,
    startingHead: input.startingHead ?? null,
    allowedPaths: [...(input.allowedPaths ?? [])].sort(),
    protectedPaths: [...(input.protectedPaths ?? [])].sort(),
    humanAuthorityRequired: true,
    preparedAt: input.preparedAt ?? new Date().toISOString(),
    source: POST_DECISION_ACTION_SOURCE,
    recordVersion: 1,
  };
  return { ...body, actionHash: hashPostDecisionAction(body) };
}

export function validatePostDecisionAction(record: PostDecisionActionRecord): boolean {
  if (record.recordKind !== "post_decision_action") return false;
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (record.source !== POST_DECISION_ACTION_SOURCE) return false;
  if (record.humanAuthorityRequired !== true) return false;
  if (record.recordVersion !== 1) return false;
  if (!POST_DECISION_ACTIONS.includes(record.preparedAction)) return false;
  if (record.postDecisionActionId !== postDecisionActionId(record.verificationDecisionId)) return false;
  const { actionHash, ...body } = record;
  return hashPostDecisionAction(body) === actionHash;
}
