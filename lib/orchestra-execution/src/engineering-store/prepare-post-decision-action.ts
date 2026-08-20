import type { VerificationRequirementRef } from "../verification-requirements.js";
import { EngineeringStoreError, FileEngineeringStore } from "./store.js";
import {
  buildPostDecisionActionRecord,
  validatePostDecisionAction,
} from "./post-decision-action-record.js";
import { validateVerificationDecision } from "./verification-decision-record.js";
import type {
  PostDecisionAction,
  PostDecisionActionRecord,
  VerificationDecisionRecord,
  VerifierSemanticFindingRecord,
} from "./types.js";

export const POST_DECISION_PREPARATION_REFUSALS = [
  "decision_not_found",
  "decision_corrupt",
  "decision_conflict",
  "verifier_not_found",
  "executor_not_found",
  "relationship_mismatch",
  "evidence_not_found",
  "evidence_corrupt",
  "correction_context_empty",
  "verified_preconditions_unmet",
  "indeterminate_cannot_continue",
] as const;

export type PostDecisionPreparationRefusal = (typeof POST_DECISION_PREPARATION_REFUSALS)[number];

export interface PreparePostDecisionActionInput {
  store: FileEngineeringStore;
  /** Preferred: exact persisted decision identity. */
  verificationDecisionId?: string;
  /** Alternate: load trusted decision for this verifier (latest evidence). */
  verifierAssignmentId?: string;
}

export interface PreparePostDecisionActionResult {
  prepared: boolean;
  refused: boolean;
  reason: PostDecisionPreparationRefusal | null;
  warnings: string[];
  verificationDecisionId: string | null;
  decision: VerificationDecisionRecord["decision"] | null;
  preparedAction: PostDecisionAction | null;
  actionRecord: PostDecisionActionRecord | null;
  duplicateActionReused: boolean;
}

function refused(
  input: PreparePostDecisionActionInput,
  reason: PostDecisionPreparationRefusal,
  extras: Partial<PreparePostDecisionActionResult> = {},
): PreparePostDecisionActionResult {
  return {
    prepared: false,
    refused: true,
    reason,
    warnings: extras.warnings ?? [],
    verificationDecisionId: extras.verificationDecisionId ?? input.verificationDecisionId ?? null,
    decision: extras.decision ?? null,
    preparedAction: extras.preparedAction ?? null,
    actionRecord: extras.actionRecord ?? null,
    duplicateActionReused: extras.duplicateActionReused ?? false,
  };
}

function prepared(
  extras: Partial<PreparePostDecisionActionResult> & {
    actionRecord: PostDecisionActionRecord;
  },
): PreparePostDecisionActionResult {
  return {
    prepared: true,
    refused: false,
    reason: null,
    warnings: extras.warnings ?? [
      "post-decision action is preparation only",
      "does not dispatch correction, continuation, commit, or push",
      "human final authority required before any governed execution of the prepared action",
    ],
    verificationDecisionId: extras.actionRecord.verificationDecisionId,
    decision: extras.actionRecord.decision,
    preparedAction: extras.actionRecord.preparedAction,
    actionRecord: extras.actionRecord,
    duplicateActionReused: extras.duplicateActionReused ?? false,
  };
}

const MACHINE_VIOLATION_PREFIXES = [
  "executor_protected_mutation",
  "executor_repository_state_violation",
  "executor_unexpected_mutation",
  "executor_scope_violation",
  "executor_commit_violation",
  "executor_push_violation",
  "semantic_requirement_failed",
] as const;

function isMachineViolationCode(code: string): boolean {
  return MACHINE_VIOLATION_PREFIXES.some((prefix) => code === prefix || code.startsWith(`${prefix}`));
}

function extractFailedRequirementIds(findings: VerifierSemanticFindingRecord[]): string[] {
  return findings
    .filter((row) => row.outcome === "requirement_failed")
    .map((row) => row.requirementId);
}

function extractAcceptanceCheckIds(
  findings: VerifierSemanticFindingRecord[],
  requirements: VerificationRequirementRef[],
): string[] {
  const failed = new Set(
    findings.filter((row) => row.outcome === "requirement_failed").map((row) => row.requirementId),
  );
  const ids: string[] = [];
  for (const requirement of requirements) {
    if (!failed.has(requirement.requirementId)) continue;
    if (requirement.verificationMode !== "ACCEPTANCE_CHECK") continue;
    if (requirement.acceptanceCheckId) ids.push(requirement.acceptanceCheckId);
    else if (requirement.acceptanceCheck?.acceptanceCheckId) {
      ids.push(requirement.acceptanceCheck.acceptanceCheckId);
    }
  }
  return ids;
}

function loadTrustedDecision(
  store: FileEngineeringStore,
  input: PreparePostDecisionActionInput,
):
  | { ok: true; decision: VerificationDecisionRecord }
  | { ok: false; reason: PostDecisionPreparationRefusal } {
  if (input.verificationDecisionId) {
    const found = store.findVerificationDecisionById(input.verificationDecisionId);
    if (!found) return { ok: false, reason: "decision_not_found" };
    if (!validateVerificationDecision(found)) return { ok: false, reason: "decision_corrupt" };
    if (input.verifierAssignmentId && found.verifierAssignmentId !== input.verifierAssignmentId) {
      return { ok: false, reason: "relationship_mismatch" };
    }
    // Conflict: multiple valid rows for same evidence with different hashes already refused at persist;
    // still detect multiple distinct decisions for same evidence identity.
    const siblings = store
      .loadVerificationDecisions(found.verifierAssignmentId)
      .filter(
        (row) =>
          validateVerificationDecision(row) &&
          row.verifierExecutionEvidenceId === found.verifierExecutionEvidenceId,
      );
    const distinct = new Set(siblings.map((row) => row.decisionHash));
    if (distinct.size > 1) return { ok: false, reason: "decision_conflict" };
    return { ok: true, decision: found };
  }

  if (!input.verifierAssignmentId) {
    return { ok: false, reason: "decision_not_found" };
  }

  const evidence = store.loadLatestExecutionEvidence(input.verifierAssignmentId);
  if (!evidence) return { ok: false, reason: "evidence_not_found" };
  const matches = store
    .loadVerificationDecisions(input.verifierAssignmentId)
    .filter(
      (row) =>
        validateVerificationDecision(row) && row.verifierExecutionEvidenceId === evidence.evidenceId,
    );
  if (matches.length === 0) return { ok: false, reason: "decision_not_found" };
  const distinct = new Set(matches.map((row) => row.decisionHash));
  if (distinct.size > 1) return { ok: false, reason: "decision_conflict" };
  const decision = matches[matches.length - 1]!;
  if (!validateVerificationDecision(decision)) return { ok: false, reason: "decision_corrupt" };
  return { ok: true, decision };
}

/**
 * Derive and persist a governed post-decision action from a trusted VerificationDecisionRecord.
 * Deterministic. No provider calls. Preparation only — never dispatches.
 */
export function preparePostDecisionAction(
  input: PreparePostDecisionActionInput,
): PreparePostDecisionActionResult {
  const loaded = loadTrustedDecision(input.store, input);
  if (!loaded.ok) return refused(input, loaded.reason);

  const decision = loaded.decision;
  const existing = input.store.findPostDecisionActionForDecision(decision.verificationDecisionId);
  if (existing) {
    if (!validatePostDecisionAction(existing)) {
      return refused(input, "decision_corrupt", {
        verificationDecisionId: decision.verificationDecisionId,
        decision: decision.decision,
      });
    }
    return prepared({
      actionRecord: existing,
      duplicateActionReused: true,
      warnings: [
        "existing post-decision action reused",
        "post-decision action is preparation only",
        "does not dispatch correction, continuation, commit, or push",
      ],
    });
  }

  let verifierRecord;
  let executorRecord;
  try {
    verifierRecord = input.store.loadAssignmentRecord(decision.verifierAssignmentId);
  } catch (error) {
    if (error instanceof EngineeringStoreError) return refused(input, "verifier_not_found");
    throw error;
  }
  try {
    executorRecord = input.store.loadAssignmentRecord(decision.verifiedExecutorAssignmentId);
  } catch (error) {
    if (error instanceof EngineeringStoreError) return refused(input, "executor_not_found");
    throw error;
  }

  if (verifierRecord.frozen.assignment.role !== "verifier") {
    return refused(input, "relationship_mismatch", {
      verificationDecisionId: decision.verificationDecisionId,
      decision: decision.decision,
    });
  }
  if (executorRecord.frozen.assignment.role !== "executor") {
    return refused(input, "relationship_mismatch", {
      verificationDecisionId: decision.verificationDecisionId,
      decision: decision.decision,
    });
  }
  if (verifierRecord.frozen.assignmentHash !== decision.verifierAssignmentHash) {
    return refused(input, "relationship_mismatch", {
      verificationDecisionId: decision.verificationDecisionId,
      decision: decision.decision,
    });
  }
  if (
    verifierRecord.relationship.verifiesAssignmentId !== decision.verifiedExecutorAssignmentId ||
    verifierRecord.relationship.verifiesExecutionEvidenceId !==
      decision.verifiedExecutorExecutionEvidenceId
  ) {
    return refused(input, "relationship_mismatch", {
      verificationDecisionId: decision.verificationDecisionId,
      decision: decision.decision,
    });
  }

  let verifierEvidence;
  let executorEvidence;
  try {
    verifierEvidence = input.store.loadExecutionEvidenceById(
      decision.verifierAssignmentId,
      decision.verifierExecutionEvidenceId,
    );
    executorEvidence = input.store.loadExecutionEvidenceById(
      decision.verifiedExecutorAssignmentId,
      decision.verifiedExecutorExecutionEvidenceId,
    );
  } catch {
    return refused(input, "evidence_not_found", {
      verificationDecisionId: decision.verificationDecisionId,
      decision: decision.decision,
    });
  }

  try {
    input.store.assertTrustedExecutionEvidence(verifierEvidence);
    input.store.assertTrustedExecutionEvidence(executorEvidence);
  } catch {
    return refused(input, "evidence_corrupt", {
      verificationDecisionId: decision.verificationDecisionId,
      decision: decision.decision,
    });
  }

  const findings = input.store.loadAuthoritativeSemanticFindings(
    decision.verifiedExecutorAssignmentId,
    decision.verifiedExecutorExecutionEvidenceId,
  );
  const requirements = verifierRecord.frozen.assignment.verificationRequirements ?? [];
  const failedRequirementIds = extractFailedRequirementIds(findings);
  const acceptanceCheckIds = extractAcceptanceCheckIds(findings, requirements);
  const machineViolationReasonCodes = decision.decisionReasonCodes.filter(isMachineViolationCode);
  const executor = executorRecord.frozen.assignment;

  let preparedAction: PostDecisionAction;
  let reasonCodes: string[];

  if (decision.decision === "VERIFIED") {
    const unresolvedHuman = findings.some(
      (row) =>
        row.resolutionAuthority === "human_judgment_unresolved" ||
        row.outcome === "requirement_not_evaluated",
    );
    const insufficient = findings.some((row) => row.outcome === "evidence_insufficient");
    const failed = failedRequirementIds.length > 0;
    if (unresolvedHuman || insufficient || failed) {
      return refused(input, "verified_preconditions_unmet", {
        verificationDecisionId: decision.verificationDecisionId,
        decision: decision.decision,
      });
    }
    preparedAction = "PREPARE_CONTINUATION";
    reasonCodes = [
      "decision_verified",
      "continuation_intent_prepared",
      "human_authorization_required_before_continuation",
      ...decision.decisionReasonCodes,
    ];
  } else if (decision.decision === "CORRECTION_REQUIRED") {
    if (failedRequirementIds.length === 0 && machineViolationReasonCodes.length === 0) {
      return refused(input, "correction_context_empty", {
        verificationDecisionId: decision.verificationDecisionId,
        decision: decision.decision,
      });
    }
    preparedAction = "PREPARE_CORRECTION";
    reasonCodes = [
      "decision_correction_required",
      "correction_intent_prepared",
      "human_authorization_required_before_correction_dispatch",
      ...decision.decisionReasonCodes,
    ];
  } else if (decision.decision === "INDETERMINATE") {
    preparedAction = "REQUIRE_HUMAN_DECISION";
    reasonCodes = [
      "decision_indeterminate",
      "machine_continuation_unsafe",
      "human_decision_required",
      ...decision.decisionReasonCodes,
    ];
  } else {
    return refused(input, "decision_corrupt", {
      verificationDecisionId: decision.verificationDecisionId,
    });
  }

  // Safety: INDETERMINATE must never become continuation/correction (enforced by branch above).
  if (
    decision.decision === "INDETERMINATE" &&
    (preparedAction === "PREPARE_CONTINUATION" || preparedAction === "PREPARE_CORRECTION")
  ) {
    return refused(input, "indeterminate_cannot_continue", {
      verificationDecisionId: decision.verificationDecisionId,
      decision: decision.decision,
    });
  }

  const record = buildPostDecisionActionRecord({
    verificationDecisionId: decision.verificationDecisionId,
    verifierAssignmentId: decision.verifierAssignmentId,
    verifierExecutionEvidenceId: decision.verifierExecutionEvidenceId,
    executorAssignmentId: decision.verifiedExecutorAssignmentId,
    executorExecutionEvidenceId: decision.verifiedExecutorExecutionEvidenceId,
    decision: decision.decision,
    preparedAction,
    reasonCodes,
    failedRequirementIds,
    acceptanceCheckIds,
    machineViolationReasonCodes,
    startingBranch: executor.branch,
    startingHead: executor.startingHead,
    allowedPaths: executor.allowedPaths ?? [],
    protectedPaths: executor.protectedPaths ?? [],
  });

  const persisted = input.store.persistPostDecisionAction(record);
  return prepared({ actionRecord: persisted, duplicateActionReused: false });
}
