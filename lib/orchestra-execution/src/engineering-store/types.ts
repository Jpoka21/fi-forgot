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

export const VERIFIER_REQUIREMENT_OUTCOMES = [
  "requirement_satisfied",
  "requirement_failed",
  "requirement_not_evaluated",
  "evidence_insufficient",
] as const;
export type VerifierRequirementOutcome = (typeof VERIFIER_REQUIREMENT_OUTCOMES)[number];

export const VERIFIER_SEMANTIC_PROPOSAL_SOURCE = "provider_verification_finding_proposal" as const;

export const VERIFIER_SEMANTIC_FINDING_RESOLUTION = [
  "machine_evidence_resolution",
  "acceptance_check_resolution",
  "human_judgment_unresolved",
] as const;
export type VerifierSemanticFindingResolution = (typeof VERIFIER_SEMANTIC_FINDING_RESOLUTION)[number];

export const VERIFIER_SEMANTIC_FINDING_SOURCE = "orchestra_authoritative_resolution" as const;

/**
 * Append-only provider semantic proposal. Not Orchestra authority.
 */
export interface VerifierSemanticFindingProposal {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "verifier_semantic_finding_proposal";
  proposalId: string;
  verifierAssignmentId: string;
  verifierAssignmentHash: string;
  verifierExecutionEvidenceId: string;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  requirementId: string;
  proposedOutcome: VerifierRequirementOutcome;
  reasonCode: string;
  evidenceReferences: string[];
  providerSessionId: string | null;
  providerRunId: string | null;
  capturedAt: string;
  source: typeof VERIFIER_SEMANTIC_PROPOSAL_SOURCE;
  recordVersion: 1;
  proposalHash: string;
}

/**
 * Append-only Orchestra authoritative semantic finding.
 * Provider proposals never become this record without governed resolution.
 */
export interface VerifierSemanticFindingRecord {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "verifier_semantic_finding";
  findingId: string;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  requirementId: string;
  outcome: VerifierRequirementOutcome;
  reasonCode: string;
  evidenceReferences: string[];
  resolutionAuthority: VerifierSemanticFindingResolution;
  supportingProposalIds: string[];
  supportingVerifierExecutionEvidenceIds: string[];
  resolvedAt: string;
  source: typeof VERIFIER_SEMANTIC_FINDING_SOURCE;
  recordVersion: 1;
  findingHash: string;
}

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

/**
 * Bounded post-decision action vocabulary (IMP 038).
 * Preparation only — never implies dispatch, commit, or push.
 */
export const POST_DECISION_ACTIONS = [
  "PREPARE_CONTINUATION",
  "PREPARE_CORRECTION",
  "REQUIRE_HUMAN_DECISION",
] as const;
export type PostDecisionAction = (typeof POST_DECISION_ACTIONS)[number];

export const POST_DECISION_ACTION_SOURCE = "orchestra_post_decision_preparation" as const;

/**
 * Append-only prepared next-action intent bound to a persisted verification decision.
 * Does not dispatch correction, continuation, commit, or push.
 */
export interface PostDecisionActionRecord {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "post_decision_action";
  postDecisionActionId: string;
  verificationDecisionId: string;
  verifierAssignmentId: string;
  verifierExecutionEvidenceId: string;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  decision: VerificationDecision;
  preparedAction: PostDecisionAction;
  reasonCodes: string[];
  failedRequirementIds: string[];
  acceptanceCheckIds: string[];
  machineViolationReasonCodes: string[];
  startingBranch: string | null;
  startingHead: string | null;
  allowedPaths: string[];
  protectedPaths: string[];
  humanAuthorityRequired: true;
  preparedAt: string;
  source: typeof POST_DECISION_ACTION_SOURCE;
  recordVersion: 1;
  actionHash: string;
}

/**
 * Explicit human authorization to execute one prepared post-decision action (IMP 039).
 * Existence of a PostDecisionActionRecord is not execution authority.
 */
export const POST_DECISION_EXECUTION_AUTHORIZATION_SOURCE =
  "authorizePostDecisionExecution" as const;

export const POST_DECISION_EXECUTION_AUTHORIZATION_SCOPE = "single_post_decision_action" as const;

export interface PostDecisionExecutionAuthorizationRecord {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "post_decision_execution_authorization";
  authorizationId: string;
  postDecisionActionId: string;
  postDecisionActionHash: string;
  verificationDecisionId: string;
  preparedAction: PostDecisionAction;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  /**
   * Bound only for PREPARE_CONTINUATION (IMP 040). Null for PREPARE_CORRECTION.
   * Authorization for continuation is invalid without an exact target binding.
   */
  continuationTargetId: string | null;
  continuationTargetHash: string | null;
  authorizedBy: "explicit_human";
  authorizedAt: string;
  authorizationScope: typeof POST_DECISION_EXECUTION_AUTHORIZATION_SCOPE;
  startingBranch: string;
  startingHead: string;
  humanAuthorized: true;
  source: typeof POST_DECISION_EXECUTION_AUTHORIZATION_SOURCE;
  recordVersion: 1;
  authorizationHash: string;
}

/**
 * Governed continuation target (IMP 040).
 * Already-authorized next bounded work unit — never invented from provider prose.
 */
export const GOVERNED_CONTINUATION_TARGET_SOURCE = "registerGovernedContinuationTarget" as const;
export const GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE =
  "materializeFromGovernedContinuationSequence" as const;
export const GOVERNED_CONTINUATION_TARGET_AUTHORITY_SOURCES = [
  GOVERNED_CONTINUATION_TARGET_SOURCE,
  GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE,
] as const;
export type GovernedContinuationTargetAuthoritySource =
  (typeof GOVERNED_CONTINUATION_TARGET_AUTHORITY_SOURCES)[number];

export const GOVERNED_CONTINUATION_TARGET_STATUSES = [
  "eligible",
  "consumed",
  "superseded",
  "blocked",
] as const;
export type GovernedContinuationTargetStatus =
  (typeof GOVERNED_CONTINUATION_TARGET_STATUSES)[number];

export const GOVERNED_CONTINUATION_TARGET_LIFECYCLE_SOURCE =
  "governedContinuationTargetLifecycle" as const;

export interface GovernedContinuationTargetRecord {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "governed_continuation_target";
  continuationTargetId: string;
  targetKey: string;
  projectId: string;
  verificationDecisionId: string;
  predecessorExecutorAssignmentId: string;
  predecessorExecutorExecutionEvidenceId: string;
  repositoryPath: string;
  branch: string;
  baselineHead: string;
  assignmentText: string;
  allowedPaths: string[];
  protectedPaths: string[];
  prohibitedCommandClasses: string[];
  requireNoPush: true;
  commitAuthorization: false;
  pushAuthorization: false;
  requiredEvidence: string[];
  structuredObligations: Array<{
    obligationId: string;
    summary: string;
    verificationMode?: string;
  }>;
  orderingKey: number;
  status: "eligible";
  /** Null when manually registered; set when materialized from sequence. */
  sequenceId: string | null;
  sequenceConfigHash: string | null;
  sequenceEntryKey: string | null;
  sequenceEntryHash: string | null;
  authoritySource: GovernedContinuationTargetAuthoritySource;
  registeredAt: string;
  source: GovernedContinuationTargetAuthoritySource;
  recordVersion: 1;
  targetHash: string;
}

/**
 * Append-only lifecycle transition for a governed continuation target.
 * Registration records stay immutable; eligibility is registration + latest lifecycle.
 */
export interface GovernedContinuationTargetLifecycleRecord {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "governed_continuation_target_lifecycle";
  lifecycleId: string;
  continuationTargetId: string;
  targetHash: string;
  status: Exclude<GovernedContinuationTargetStatus, "eligible">;
  postDecisionActionId: string | null;
  generatedAssignmentId: string | null;
  executionEvidenceId: string | null;
  reasonCode: string;
  recordedAt: string;
  source: typeof GOVERNED_CONTINUATION_TARGET_LIFECYCLE_SOURCE;
  recordVersion: 1;
  lifecycleHash: string;
}

/** Project-supplied governed continuation sequence (IMP 041). */
export const GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE =
  "projectGovernedContinuationSequence" as const;

export interface GovernedContinuationSequenceEntry {
  entryKey: string;
  orderingKey: number;
  /**
   * null = bootstrap entry (fulfilled by first matching VERIFIED predecessor for the project).
   * otherwise must equal a prior entryKey in the same sequence.
   */
  predecessorEntryKey: string | null;
  assignmentText: string;
  allowedPaths: string[];
  protectedPaths: string[];
  prohibitedCommandClasses: string[];
  requiredEvidence: string[];
  structuredObligations: Array<{
    obligationId: string;
    summary: string;
    verificationMode?: string;
  }>;
  entryHash: string;
}

export interface GovernedContinuationSequenceConfigRecord {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "governed_continuation_sequence_config";
  sequenceId: string;
  projectId: string;
  configurationVersion: number;
  repositoryPath: string;
  branch: string;
  entries: GovernedContinuationSequenceEntry[];
  authoritySource: typeof GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE;
  registeredAt: string;
  source: typeof GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE;
  recordVersion: 1;
  configHash: string;
}

export const GOVERNED_CONTINUATION_SEQUENCE_FULFILLMENT_SOURCE =
  "governedContinuationSequenceFulfillment" as const;

/** Records that a VERIFIED decision fulfilled a sequence entry (append-only). */
export interface GovernedContinuationSequenceFulfillmentRecord {
  schemaVersion: typeof ENGINEERING_STORE_SCHEMA_VERSION;
  recordKind: "governed_continuation_sequence_fulfillment";
  fulfillmentId: string;
  sequenceId: string;
  sequenceConfigHash: string;
  entryKey: string;
  entryHash: string;
  verificationDecisionId: string;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  fulfilledAt: string;
  source: typeof GOVERNED_CONTINUATION_SEQUENCE_FULFILLMENT_SOURCE;
  recordVersion: 1;
  fulfillmentHash: string;
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
  continuationOfAssignmentId?: string;
  continuationTargetId?: string;
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
