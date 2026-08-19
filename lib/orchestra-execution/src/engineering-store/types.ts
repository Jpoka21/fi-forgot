import type { FrozenAssignment } from "../assignment.js";
import type { ExecutionResult } from "../result.js";

export const ENGINEERING_STORE_SCHEMA_VERSION = 1;

export const ASSIGNMENT_STATUSES = [
  "frozen",
  "dispatched",
  "baseline_mismatch",
  "provider_failed",
  "execution_recorded",
  "verification_pending",
] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const VERIFICATION_POSTURES = [
  "pending",
  "verified",
  "correction_required",
  "indeterminate",
] as const;
export type VerificationPosture = (typeof VERIFICATION_POSTURES)[number];

export const VERIFICATION_DECISIONS = ["VERIFIED", "CORRECTION_REQUIRED", "INDETERMINATE"] as const;
export type VerificationDecision = (typeof VERIFICATION_DECISIONS)[number];

export const VERIFICATION_DECISION_AUTHORITY = "orchestra_machine_adjudication" as const;

/**
 * Append-only semantic verification decision bound to persisted verifier evidence.
 * Provider prose is never an authoritative field.
 */
export interface VerificationDecisionRecord {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "verification_decision";
  verificationDecisionId: string;
  verifierAssignmentId: string;
  verifierAssignmentHash: string;
  verifierExecutionEvidenceId: string;
  verifiedExecutorAssignmentId: string;
  verifiedExecutorExecutionEvidenceId: string;
  decision: VerificationDecision;
  decisionReasonCodes: string[];
  decidedAt: string;
  decisionAuthority: typeof VERIFICATION_DECISION_AUTHORITY;
  humanFinalAuthority: "explicit_human";
  recordVersion: 1;
  decisionHash: string;
}

export type EvidenceSourceClass =
  | "orchestra_authoritative"
  | "machine"
  | "provider_correlator"
  | "untrusted_prose";

export interface EvidenceSourceClassification {
  assignmentHash: EvidenceSourceClass;
  git: EvidenceSourceClass;
  filesystem: EvidenceSourceClass;
  hooks: EvidenceSourceClass;
  providerEvents: EvidenceSourceClass;
  providerText: EvidenceSourceClass;
  technicalVerdict: EvidenceSourceClass;
}

export const DEFAULT_EVIDENCE_SOURCES: EvidenceSourceClassification = {
  assignmentHash: "orchestra_authoritative",
  git: "machine",
  filesystem: "machine",
  hooks: "machine",
  providerEvents: "provider_correlator",
  providerText: "untrusted_prose",
  technicalVerdict: "machine",
};

export interface AssignmentRelationship {
  parentAssignmentId?: string;
  verifiesAssignmentId?: string;
  verifiesExecutionEvidenceId?: string;
  correctionOfAssignmentId?: string;
}

export interface FrozenAssignmentRecord {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "frozen_assignment";
  persistedAt: string;
  frozen: FrozenAssignment;
  humanAuthority: "explicit_human";
  relationship: AssignmentRelationship;
}

export interface StatusEvent {
  timestamp: string;
  assignmentId: string;
  assignmentHash: string;
  status: AssignmentStatus;
  verificationPosture: VerificationPosture;
  detail?: string;
}

export interface ExecutionEvidence {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "execution_evidence";
  evidenceId: string;
  evidenceHash: string;
  assignmentId: string;
  assignmentHash: string;
  recordedAt: string;
  verificationPosture: VerificationPosture;
  providerStarted: boolean;
  sources: EvidenceSourceClassification;
  requiredEvidence: string[];
  requiredEvidencePresent: string[];
  requiredEvidenceMissing: string[];
  result: ExecutionResult;
}

export interface CrashReceipt {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "crash_receipt";
  timestamp: string;
  assignmentId: string;
  assignmentHash: string;
  providerSessionId: string | null;
  runId: string | null;
  reason: string;
}

export const VERIFIER_AUTHORIZATION_SOURCE = "authorizeAndFreezeVerifierAssignment" as const;

/**
 * Append-only proof that a verifier assignment passed the governed IMP 035
 * human-authorization path. `humanAuthority` on FrozenAssignmentRecord is an
 * IMP 034 schema constant and does not prove this gate.
 */
export interface VerifierAuthorizationReceipt {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "verifier_authorization_receipt";
  receiptId: string;
  assignmentId: string;
  assignmentHash: string;
  authorizedAt: string;
  source: typeof VERIFIER_AUTHORIZATION_SOURCE;
  humanAuthorized: true;
  executorAssignmentId: string;
  executionEvidenceId: string;
  receiptHash: string;
}

export interface AuditEvent {
  timestamp: string;
  action: string;
  assignmentId?: string;
  evidenceId?: string;
  detail?: string;
}

export interface AssignmentCurrentState {
  assignmentId: string;
  assignmentHash: string;
  status: AssignmentStatus;
  verificationPosture: VerificationPosture;
  frozen: FrozenAssignment;
  latestEvidence: ExecutionEvidence | null;
  crashReceipts: CrashReceipt[];
}
