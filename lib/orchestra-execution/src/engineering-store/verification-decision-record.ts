import { sortKeys } from "../assignment.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  VERIFICATION_DECISION_AUTHORITY,
  type VerificationDecision,
  type VerificationDecisionRecord,
} from "./types.js";

export type VerificationDecisionRecordBody = Omit<VerificationDecisionRecord, "decisionHash">;

export function verificationDecisionId(
  verifierAssignmentId: string,
  verifierExecutionEvidenceId: string,
): string {
  return `vdec-${verifierAssignmentId}-${verifierExecutionEvidenceId}`;
}

export function hashVerificationDecision(body: VerificationDecisionRecordBody): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildVerificationDecisionRecord(input: {
  verifierAssignmentId: string;
  verifierAssignmentHash: string;
  verifierExecutionEvidenceId: string;
  verifiedExecutorAssignmentId: string;
  verifiedExecutorExecutionEvidenceId: string;
  decision: VerificationDecision;
  decisionReasonCodes: string[];
  decidedAt?: string;
}): VerificationDecisionRecord {
  const body: VerificationDecisionRecordBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "verification_decision",
    verificationDecisionId: verificationDecisionId(
      input.verifierAssignmentId,
      input.verifierExecutionEvidenceId,
    ),
    verifierAssignmentId: input.verifierAssignmentId,
    verifierAssignmentHash: input.verifierAssignmentHash,
    verifierExecutionEvidenceId: input.verifierExecutionEvidenceId,
    verifiedExecutorAssignmentId: input.verifiedExecutorAssignmentId,
    verifiedExecutorExecutionEvidenceId: input.verifiedExecutorExecutionEvidenceId,
    decision: input.decision,
    decisionReasonCodes: [...input.decisionReasonCodes].sort(),
    decidedAt: input.decidedAt ?? new Date().toISOString(),
    decisionAuthority: VERIFICATION_DECISION_AUTHORITY,
    humanFinalAuthority: "explicit_human",
    recordVersion: 1,
  };
  return { ...body, decisionHash: hashVerificationDecision(body) };
}

export function validateVerificationDecision(record: VerificationDecisionRecord): boolean {
  if (record.recordKind !== "verification_decision") return false;
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (record.decisionAuthority !== VERIFICATION_DECISION_AUTHORITY) return false;
  if (record.humanFinalAuthority !== "explicit_human") return false;
  if (record.recordVersion !== 1) return false;
  const { decisionHash, ...body } = record;
  return hashVerificationDecision(body) === decisionHash;
}
