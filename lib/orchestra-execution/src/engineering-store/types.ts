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

export const VERIFICATION_POSTURES = ["pending"] as const;
export type VerificationPosture = (typeof VERIFICATION_POSTURES)[number];

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
