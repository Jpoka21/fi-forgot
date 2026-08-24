import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createAssignment, hashAssignment } from "../assignment-hash.js";
import { deepFreeze, type FrozenAssignment, type OrchestraAssignment } from "../assignment.js";
import { isForgotIdentifierRepository } from "../hooks/project-hook.js";
import { appendLineAtomic, writeFileExclusiveAtomic } from "./atomic-write.js";
import {
  buildVerifierAuthorizationReceipt,
  validateVerifierAuthorizationReceipt,
} from "./authorization-receipt.js";
import { validateEvidenceHash } from "./evidence.js";
import {
  validateVerificationDecision,
} from "./verification-decision-record.js";
import {
  validatePostDecisionAction,
} from "./post-decision-action-record.js";
import {
  validatePostDecisionExecutionAuthorization,
} from "./post-decision-execution-authorization.js";
import {
  validateGovernedContinuationTarget,
  validateGovernedContinuationTargetLifecycle,
  validateGovernedContinuationSequenceConfig,
  validateSequenceFulfillment,
  selectAuthoritativeSequenceFulfillments,
} from "./governed-continuation-target-record.js";
import { evaluatePredecessorPathAuthority } from "./predecessor-path-authority.js";
import {
  validateVerifierSemanticFinding,
} from "./semantic-finding-record.js";
import {
  validateVerifierSemanticProposal,
} from "./semantic-proposal-record.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  type AssignmentCurrentState,
  type AssignmentRelationship,
  type AssignmentStatus,
  type AuditEvent,
  type CrashReceipt,
  type ExecutionEvidence,
  type FrozenAssignmentRecord,
  type GovernedContinuationSequenceConfigRecord,
  type GovernedContinuationSequenceFulfillmentRecord,
  type GovernedContinuationTargetLifecycleRecord,
  type GovernedContinuationTargetRecord,
  type GovernedContinuationTargetStatus,
  type PostDecisionActionRecord,
  type PostDecisionExecutionAuthorizationRecord,
  type StatusEvent,
  type VerificationDecisionRecord,
  type VerificationPosture,
  type VerifierAuthorizationReceipt,
  type VerifierSemanticFindingProposal,
  type VerifierSemanticFindingRecord,
} from "./types.js";

const SAFE_ID = /^[A-Za-z0-9._-]+$/;

function assertSafeId(name: string, value: string): string {
  if (!SAFE_ID.test(value)) {
    throw new Error(`${name} contains unsupported characters`);
  }
  return value;
}

export class EngineeringStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineeringStoreError";
  }
}

export interface PersistAssignmentOptions {
  relationship?: AssignmentRelationship;
}

export class FileEngineeringStore {
  readonly storeRoot: string;

  constructor(storeRoot: string) {
    if (isForgotIdentifierRepository(storeRoot)) {
      throw new EngineeringStoreError(
        "Refusing to place the Orchestra engineering store inside the F.I. Forgot repository.",
      );
    }
    this.storeRoot = storeRoot;
    mkdirSync(this.assignmentsDir(), { recursive: true });
    mkdirSync(this.executionsDir(), { recursive: true });
    if (!existsSync(this.manifestPath())) {
      writeFileExclusiveAtomic(
        this.manifestPath(),
        `${JSON.stringify(
          {
            schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
            recordKind: "engineering_store",
            createdAt: new Date().toISOString(),
            humanAuthority: "explicit_human",
            notes: "Orchestra engineering records. Not constitutional Domain 3 authority.",
          },
          null,
          2,
        )}\n`,
      );
    }
  }

  persistFrozenAssignment(
    frozen: FrozenAssignment,
    options: PersistAssignmentOptions = {},
  ): FrozenAssignmentRecord {
    this.assertHashCoherence(frozen);
    const assignmentId = assertSafeId("assignmentId", frozen.assignment.assignmentId);
    const dest = this.assignmentPath(assignmentId);
    const record: FrozenAssignmentRecord = {
      schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
      recordKind: "frozen_assignment",
      persistedAt: new Date().toISOString(),
      frozen,
      humanAuthority: "explicit_human",
      relationship: options.relationship ?? {},
    };
    if (existsSync(dest)) {
      const existing = this.loadFrozenAssignment(assignmentId);
      if (existing.assignmentHash !== frozen.assignmentHash) {
        throw new EngineeringStoreError(
          `duplicate assignmentId ${assignmentId} with a different hash; refusing to overwrite frozen history`,
        );
      }
      this.audit({
        timestamp: new Date().toISOString(),
        action: "persist_frozen_assignment_idempotent",
        assignmentId,
      });
      return this.readAssignmentRecord(assignmentId);
    }
    writeFileExclusiveAtomic(dest, `${JSON.stringify(record, null, 2)}\n`);
    this.appendStatus({
      timestamp: record.persistedAt,
      assignmentId,
      assignmentHash: frozen.assignmentHash,
      status: "frozen",
      verificationPosture: "pending",
      detail: "assignment frozen and persisted before any provider dispatch",
    });
    this.audit({
      timestamp: record.persistedAt,
      action: "persist_frozen_assignment",
      assignmentId,
    });
    return record;
  }

  loadFrozenAssignment(assignmentId: string): FrozenAssignment {
    const record = this.readAssignmentRecord(assignmentId);
    this.assertHashCoherence(record.frozen);
    return record.frozen;
  }

  loadAssignmentRecord(assignmentId: string): FrozenAssignmentRecord {
    const record = this.readAssignmentRecord(assignmentId);
    this.assertHashCoherence(record.frozen);
    return record;
  }

  persistExecutionEvidence(evidence: ExecutionEvidence): ExecutionEvidence {
    validateEvidenceHash(evidence);
    const assignment = this.loadFrozenAssignment(evidence.assignmentId);
    if (assignment.assignmentHash !== evidence.assignmentHash) {
      throw new EngineeringStoreError("execution evidence assignmentHash does not match frozen assignment");
    }
    const assignmentId = assertSafeId("assignmentId", evidence.assignmentId);
    const evidenceId = assertSafeId("evidenceId", evidence.evidenceId);
    const dest = this.evidencePath(assignmentId, evidenceId);
    if (existsSync(dest)) {
      const existing = this.readEvidenceFile(dest);
      if (existing.evidenceHash !== evidence.evidenceHash) {
        throw new EngineeringStoreError("duplicate evidenceId with a different hash; refusing overwrite");
      }
      return existing;
    }
    writeFileExclusiveAtomic(dest, `${JSON.stringify(evidence, null, 2)}\n`);
    const status: AssignmentStatus = evidence.result.providerStatus === "not_started"
      ? evidence.result.unexpectedChanges.includes("starting_head_mismatch") ||
          evidence.result.unexpectedChanges.includes("branch_mismatch")
        ? "baseline_mismatch"
        : "execution_recorded"
      : evidence.providerStarted && evidence.result.executionVerdict === "provider_failed"
        ? "provider_failed"
        : "execution_recorded";
    this.appendStatus({
      timestamp: evidence.recordedAt,
      assignmentId,
      assignmentHash: evidence.assignmentHash,
      status,
      verificationPosture: "pending",
      detail: `evidence ${evidenceId} recorded; verification remains pending`,
    });
    this.appendStatus({
      timestamp: evidence.recordedAt,
      assignmentId,
      assignmentHash: evidence.assignmentHash,
      status: "verification_pending",
      verificationPosture: "pending",
      detail: "independent verification is not automatic",
    });
    this.audit({
      timestamp: evidence.recordedAt,
      action: "persist_execution_evidence",
      assignmentId,
      evidenceId,
    });
    return evidence;
  }

  persistCrashReceipt(receipt: CrashReceipt): void {
    appendLineAtomic(this.crashPath(), `${JSON.stringify(receipt)}\n`);
    this.audit({
      timestamp: receipt.timestamp,
      action: "persist_crash_receipt",
      assignmentId: receipt.assignmentId,
      detail: receipt.reason,
    });
  }

  recordDispatchStarted(frozen: FrozenAssignment, detail: string): void {
    this.appendStatus({
      timestamp: new Date().toISOString(),
      assignmentId: frozen.assignment.assignmentId,
      assignmentHash: frozen.assignmentHash,
      status: "dispatched",
      verificationPosture: "pending",
      detail,
    });
  }

  loadExecutionEvidence(assignmentId: string): ExecutionEvidence[] {
    const dir = join(this.executionsDir(), assertSafeId("assignmentId", assignmentId));
    if (!existsSync(dir)) return [];
    if (!lstatSync(dir).isDirectory()) {
      return [];
    }
    const files = readdirSync(dir)
      .filter((name) => name.endsWith(".json") && !name.startsWith("."))
      .sort();
    return files.map((name) => this.readEvidenceFile(join(dir, name)));
  }

  loadLatestExecutionEvidence(assignmentId: string): ExecutionEvidence | null {
    const all = this.loadExecutionEvidence(assignmentId);
    return all.length === 0 ? null : all[all.length - 1] ?? null;
  }

  loadExecutionEvidenceById(assignmentId: string, evidenceId: string): ExecutionEvidence {
    const dest = this.evidencePath(assertSafeId("assignmentId", assignmentId), assertSafeId("evidenceId", evidenceId));
    if (!existsSync(dest)) {
      throw new EngineeringStoreError(`execution evidence not found: ${assignmentId}/${evidenceId}`);
    }
    return this.readEvidenceFile(dest);
  }

  listAssignmentIds(): string[] {
    if (!existsSync(this.assignmentsDir())) return [];
    return readdirSync(this.assignmentsDir())
      .filter((name) => existsSync(this.assignmentPath(name)))
      .sort();
  }

  persistVerifierAuthorizationReceipt(input: {
    assignmentId: string;
    assignmentHash: string;
    executorAssignmentId: string;
    executionEvidenceId: string;
  }): VerifierAuthorizationReceipt {
    const assignmentId = assertSafeId("assignmentId", input.assignmentId);
    const frozen = this.loadFrozenAssignment(assignmentId);
    if (frozen.assignmentHash !== input.assignmentHash) {
      throw new EngineeringStoreError(
        "verifier authorization receipt assignmentHash does not match frozen assignment",
      );
    }
    if (frozen.assignment.role !== "verifier") {
      throw new EngineeringStoreError("verifier authorization receipts require role verifier");
    }
    const existing = this.findValidVerifierAuthorizationReceipt(assignmentId, input.assignmentHash);
    if (existing) return existing;
    const receipt = buildVerifierAuthorizationReceipt(input);
    appendLineAtomic(this.authorizationPath(assignmentId), JSON.stringify(receipt));
    this.audit({
      timestamp: receipt.authorizedAt,
      action: "persist_verifier_authorization_receipt",
      assignmentId,
      detail: receipt.receiptId,
    });
    return receipt;
  }

  loadVerifierAuthorizationReceipts(assignmentId: string): VerifierAuthorizationReceipt[] {
    const path = this.authorizationPath(assertSafeId("assignmentId", assignmentId));
    if (!existsSync(path)) return [];
    return readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as VerifierAuthorizationReceipt);
  }

  findValidVerifierAuthorizationReceipt(
    assignmentId: string,
    assignmentHash: string,
  ): VerifierAuthorizationReceipt | null {
    const matches = this.loadVerifierAuthorizationReceipts(assignmentId).filter(
      (receipt) =>
        validateVerifierAuthorizationReceipt(receipt) &&
        receipt.assignmentId === assignmentId &&
        receipt.assignmentHash === assignmentHash,
    );
    return matches[matches.length - 1] ?? null;
  }

  inspectVerifierAuthorizationProvenance(
    assignmentId: string,
    assignmentHash: string,
  ): "missing" | "corrupt" | "assignment_id_mismatch" | "assignment_hash_mismatch" | "valid" {
    const rows = this.loadVerifierAuthorizationReceipts(assignmentId);
    if (rows.length === 0) return "missing";
    const validRows = rows.filter((receipt) => validateVerifierAuthorizationReceipt(receipt));
    if (validRows.length === 0) return "corrupt";
    if (validRows.some((receipt) => receipt.assignmentId !== assignmentId)) {
      return "assignment_id_mismatch";
    }
    const hashMatch = validRows.find((receipt) => receipt.assignmentHash === assignmentHash);
    if (!hashMatch) return "assignment_hash_mismatch";
    return "valid";
  }

  findVerifierAssignments(
    executorAssignmentId: string,
    executionEvidenceId?: string,
  ): FrozenAssignmentRecord[] {
    const matches: FrozenAssignmentRecord[] = [];
    for (const assignmentId of this.listAssignmentIds()) {
      const record = this.loadAssignmentRecord(assignmentId);
      if (record.frozen.assignment.role !== "verifier") continue;
      if (record.relationship.verifiesAssignmentId !== executorAssignmentId) continue;
      if (
        executionEvidenceId &&
        record.relationship.verifiesExecutionEvidenceId !== executionEvidenceId
      ) {
        continue;
      }
      matches.push(record);
    }
    return matches;
  }

  assertTrustedExecutionEvidence(evidence: ExecutionEvidence): void {
    validateEvidenceHash(evidence);
    const assignment = this.loadFrozenAssignment(evidence.assignmentId);
    if (assignment.assignmentHash !== evidence.assignmentHash) {
      throw new EngineeringStoreError("execution evidence assignmentHash does not match frozen assignment");
    }
  }

  persistVerificationDecision(record: VerificationDecisionRecord): VerificationDecisionRecord {
    if (!validateVerificationDecision(record)) {
      throw new EngineeringStoreError("verification decision record failed validation");
    }
    const assignmentId = assertSafeId("assignmentId", record.verifierAssignmentId);
    const frozen = this.loadFrozenAssignment(assignmentId);
    if (frozen.assignmentHash !== record.verifierAssignmentHash) {
      throw new EngineeringStoreError("verification decision assignmentHash does not match frozen assignment");
    }
    const existing = this.findVerificationDecisionForEvidence(
      record.verifierAssignmentId,
      record.verifierExecutionEvidenceId,
    );
    if (existing) {
      if (existing.decisionHash !== record.decisionHash) {
        throw new EngineeringStoreError(
          "duplicate verification decision for evidence with a different hash; refusing overwrite",
        );
      }
      return existing;
    }
    appendLineAtomic(this.verificationDecisionPath(assignmentId), JSON.stringify(record));
    const posture: VerificationPosture =
      record.decision === "VERIFIED"
        ? "verified"
        : record.decision === "CORRECTION_REQUIRED"
          ? "correction_required"
          : "indeterminate";
    this.appendStatus({
      timestamp: record.decidedAt,
      assignmentId,
      assignmentHash: record.verifierAssignmentHash,
      status: "verification_pending",
      verificationPosture: posture,
      detail: `semantic verification decision ${record.decision} recorded`,
    });
    this.audit({
      timestamp: record.decidedAt,
      action: "persist_verification_decision",
      assignmentId,
      evidenceId: record.verifierExecutionEvidenceId,
      detail: record.decision,
    });
    return record;
  }

  loadVerificationDecisions(verifierAssignmentId: string): VerificationDecisionRecord[] {
    const path = this.verificationDecisionPath(assertSafeId("assignmentId", verifierAssignmentId));
    if (!existsSync(path)) return [];
    return readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as VerificationDecisionRecord);
  }

  findVerificationDecisionForEvidence(
    verifierAssignmentId: string,
    verifierExecutionEvidenceId: string,
  ): VerificationDecisionRecord | null {
    const matches = this.loadVerificationDecisions(verifierAssignmentId).filter(
      (record) =>
        validateVerificationDecision(record) &&
        record.verifierExecutionEvidenceId === verifierExecutionEvidenceId,
    );
    return matches[matches.length - 1] ?? null;
  }

  findVerificationDecisionById(verificationDecisionId: string): VerificationDecisionRecord | null {
    assertSafeId("verificationDecisionId", verificationDecisionId);
    for (const assignmentId of this.listAssignmentIds()) {
      const matches = this.loadVerificationDecisions(assignmentId).filter(
        (record) =>
          validateVerificationDecision(record) &&
          record.verificationDecisionId === verificationDecisionId,
      );
      if (matches.length > 0) return matches[matches.length - 1] ?? null;
    }
    return null;
  }

  persistPostDecisionAction(record: PostDecisionActionRecord): PostDecisionActionRecord {
    if (!validatePostDecisionAction(record)) {
      throw new EngineeringStoreError("post-decision action record failed validation");
    }
    const assignmentId = assertSafeId("assignmentId", record.verifierAssignmentId);
    const frozen = this.loadFrozenAssignment(assignmentId);
    if (frozen.assignment.role !== "verifier") {
      throw new EngineeringStoreError("post-decision actions must be persisted under the verifier assignment");
    }
    const decision = this.findVerificationDecisionById(record.verificationDecisionId);
    if (!decision || !validateVerificationDecision(decision)) {
      throw new EngineeringStoreError("post-decision action requires a valid persisted verification decision");
    }
    if (
      decision.verifierAssignmentId !== record.verifierAssignmentId ||
      decision.verifierExecutionEvidenceId !== record.verifierExecutionEvidenceId ||
      decision.verifiedExecutorAssignmentId !== record.executorAssignmentId ||
      decision.verifiedExecutorExecutionEvidenceId !== record.executorExecutionEvidenceId ||
      decision.decision !== record.decision
    ) {
      throw new EngineeringStoreError("post-decision action relationship does not match verification decision");
    }
    const existing = this.findPostDecisionActionForDecision(record.verificationDecisionId);
    if (existing) {
      if (existing.actionHash !== record.actionHash) {
        throw new EngineeringStoreError(
          "duplicate post-decision action for decision with a different hash; refusing overwrite",
        );
      }
      return existing;
    }
    appendLineAtomic(this.postDecisionActionPath(assignmentId), JSON.stringify(record));
    this.appendStatus({
      timestamp: record.preparedAt,
      assignmentId,
      assignmentHash: frozen.assignmentHash,
      status: "verification_pending",
      verificationPosture:
        record.decision === "VERIFIED"
          ? "verified"
          : record.decision === "CORRECTION_REQUIRED"
            ? "correction_required"
            : "indeterminate",
      detail: `post-decision action ${record.preparedAction} prepared`,
    });
    this.audit({
      timestamp: record.preparedAt,
      action: "persist_post_decision_action",
      assignmentId,
      evidenceId: record.verifierExecutionEvidenceId,
      detail: `${record.preparedAction}:${record.verificationDecisionId}`,
    });
    return record;
  }

  loadPostDecisionActions(verifierAssignmentId: string): PostDecisionActionRecord[] {
    const path = this.postDecisionActionPath(assertSafeId("assignmentId", verifierAssignmentId));
    if (!existsSync(path)) return [];
    return readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as PostDecisionActionRecord);
  }

  findPostDecisionActionForDecision(verificationDecisionId: string): PostDecisionActionRecord | null {
    assertSafeId("verificationDecisionId", verificationDecisionId);
    for (const assignmentId of this.listAssignmentIds()) {
      const matches = this.loadPostDecisionActions(assignmentId).filter(
        (record) =>
          validatePostDecisionAction(record) &&
          record.verificationDecisionId === verificationDecisionId,
      );
      if (matches.length > 0) return matches[matches.length - 1] ?? null;
    }
    return null;
  }

  findPostDecisionActionById(postDecisionActionId: string): PostDecisionActionRecord | null {
    assertSafeId("postDecisionActionId", postDecisionActionId);
    for (const assignmentId of this.listAssignmentIds()) {
      const matches = this.loadPostDecisionActions(assignmentId).filter(
        (record) =>
          validatePostDecisionAction(record) &&
          record.postDecisionActionId === postDecisionActionId,
      );
      if (matches.length > 0) return matches[matches.length - 1] ?? null;
    }
    return null;
  }

  persistPostDecisionExecutionAuthorization(
    record: PostDecisionExecutionAuthorizationRecord,
  ): PostDecisionExecutionAuthorizationRecord {
    if (!validatePostDecisionExecutionAuthorization(record)) {
      throw new EngineeringStoreError("post-decision execution authorization failed validation");
    }
    const action = this.findPostDecisionActionById(record.postDecisionActionId);
    if (!action || !validatePostDecisionAction(action)) {
      throw new EngineeringStoreError(
        "post-decision execution authorization requires a valid prepared action",
      );
    }
    if (
      action.actionHash !== record.postDecisionActionHash ||
      action.preparedAction !== record.preparedAction ||
      action.verificationDecisionId !== record.verificationDecisionId ||
      action.executorAssignmentId !== record.executorAssignmentId ||
      action.executorExecutionEvidenceId !== record.executorExecutionEvidenceId
    ) {
      throw new EngineeringStoreError(
        "post-decision execution authorization does not match prepared action",
      );
    }
    if (action.preparedAction === "PREPARE_CONTINUATION") {
      if (!record.continuationTargetId || !record.continuationTargetHash) {
        throw new EngineeringStoreError(
          "PREPARE_CONTINUATION authorization requires continuation target binding",
        );
      }
    } else if (record.continuationTargetId !== null || record.continuationTargetHash !== null) {
      throw new EngineeringStoreError(
        "non-continuation authorization must not bind a continuation target",
      );
    }
    if (action.preparedAction === "REQUIRE_HUMAN_DECISION") {
      throw new EngineeringStoreError(
        "REQUIRE_HUMAN_DECISION cannot receive execution authorization",
      );
    }
    const assignmentId = assertSafeId("assignmentId", action.verifierAssignmentId);
    const existing = this.findValidPostDecisionExecutionAuthorization(
      record.postDecisionActionId,
      record.postDecisionActionHash,
    );
    if (existing) {
      if (existing.authorizationHash !== record.authorizationHash) {
        throw new EngineeringStoreError(
          "duplicate post-decision execution authorization with a different hash; refusing overwrite",
        );
      }
      return existing;
    }
    appendLineAtomic(this.postDecisionExecutionAuthorizationPath(assignmentId), JSON.stringify(record));
    this.audit({
      timestamp: record.authorizedAt,
      action: "persist_post_decision_execution_authorization",
      assignmentId,
      detail: `${record.authorizationId}:${record.preparedAction}`,
    });
    return record;
  }

  loadPostDecisionExecutionAuthorizations(
    verifierAssignmentId: string,
  ): PostDecisionExecutionAuthorizationRecord[] {
    const path = this.postDecisionExecutionAuthorizationPath(
      assertSafeId("assignmentId", verifierAssignmentId),
    );
    if (!existsSync(path)) return [];
    return readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as PostDecisionExecutionAuthorizationRecord);
  }

  findPostDecisionExecutionAuthorizationById(
    authorizationId: string,
  ): PostDecisionExecutionAuthorizationRecord | null {
    assertSafeId("authorizationId", authorizationId);
    for (const assignmentId of this.listAssignmentIds()) {
      const matches = this.loadPostDecisionExecutionAuthorizations(assignmentId).filter(
        (row) =>
          validatePostDecisionExecutionAuthorization(row) && row.authorizationId === authorizationId,
      );
      if (matches.length > 0) return matches[matches.length - 1] ?? null;
    }
    return null;
  }

  findValidPostDecisionExecutionAuthorization(
    postDecisionActionId: string,
    postDecisionActionHash: string,
  ): PostDecisionExecutionAuthorizationRecord | null {
    assertSafeId("postDecisionActionId", postDecisionActionId);
    for (const assignmentId of this.listAssignmentIds()) {
      const matches = this.loadPostDecisionExecutionAuthorizations(assignmentId).filter(
        (row) =>
          validatePostDecisionExecutionAuthorization(row) &&
          row.postDecisionActionId === postDecisionActionId &&
          row.postDecisionActionHash === postDecisionActionHash,
      );
      if (matches.length > 0) return matches[matches.length - 1] ?? null;
    }
    return null;
  }

  /**
   * Recompute predecessor path authority from authoritative executor assignment state.
   * Hash-valid targets that broaden allowedPaths or weaken protectedPaths fail closed.
   */
  predecessorPathAuthorityHolds(record: GovernedContinuationTargetRecord): boolean {
    return this.evaluateGovernedContinuationTargetPredecessorAuthority(record).valid;
  }

  evaluateGovernedContinuationTargetPredecessorAuthority(
    record: GovernedContinuationTargetRecord,
  ): ReturnType<typeof evaluatePredecessorPathAuthority> {
    let predecessor: OrchestraAssignment | null = null;
    try {
      const executorRecord = this.loadAssignmentRecord(record.predecessorExecutorAssignmentId);
      predecessor = executorRecord.frozen.assignment;
    } catch {
      predecessor = null;
    }
    return evaluatePredecessorPathAuthority({ target: record, predecessor });
  }

  persistGovernedContinuationTarget(
    record: GovernedContinuationTargetRecord,
  ): GovernedContinuationTargetRecord {
    if (!validateGovernedContinuationTarget(record)) {
      throw new EngineeringStoreError("governed continuation target failed validation");
    }
    const decision = this.findVerificationDecisionById(record.verificationDecisionId);
    if (!decision || !validateVerificationDecision(decision)) {
      throw new EngineeringStoreError(
        "governed continuation target requires a valid VERIFIED decision",
      );
    }
    if (decision.decision !== "VERIFIED") {
      throw new EngineeringStoreError(
        "governed continuation target requires a VERIFIED decision",
      );
    }
    if (
      decision.verifiedExecutorAssignmentId !== record.predecessorExecutorAssignmentId ||
      decision.verifiedExecutorExecutionEvidenceId !==
        record.predecessorExecutorExecutionEvidenceId
    ) {
      throw new EngineeringStoreError(
        "governed continuation target predecessor does not match verification decision",
      );
    }
    const pathAuthority = this.evaluateGovernedContinuationTargetPredecessorAuthority(record);
    if (!pathAuthority.valid) {
      throw new EngineeringStoreError(
        `governed continuation target predecessor path authority failed: ${pathAuthority.reason}`,
      );
    }
    const assignmentId = assertSafeId("assignmentId", decision.verifierAssignmentId);
    const frozen = this.loadFrozenAssignment(assignmentId);
    if (frozen.assignment.role !== "verifier") {
      throw new EngineeringStoreError(
        "governed continuation targets must be persisted under the verifier assignment",
      );
    }
    const existing = this.findGovernedContinuationTargetById(record.continuationTargetId);
    if (existing) {
      if (existing.targetHash !== record.targetHash) {
        throw new EngineeringStoreError(
          "duplicate governed continuation target with a different hash; refusing overwrite",
        );
      }
      return existing;
    }
    appendLineAtomic(this.governedContinuationTargetPath(assignmentId), JSON.stringify(record));
    this.audit({
      timestamp: record.registeredAt,
      action: "persist_governed_continuation_target",
      assignmentId,
      detail: `${record.continuationTargetId}:o${record.orderingKey}`,
    });
    return record;
  }

  loadGovernedContinuationTargets(
    verifierAssignmentId: string,
  ): GovernedContinuationTargetRecord[] {
    const path = this.governedContinuationTargetPath(
      assertSafeId("assignmentId", verifierAssignmentId),
    );
    if (!existsSync(path)) return [];
    return readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as GovernedContinuationTargetRecord);
  }

  /**
   * Load structurally valid targets, ignoring records that violate predecessor path authority.
   * Malicious/raw NDJSON broadened targets are not executable authority.
   */
  loadValidGovernedContinuationTargets(
    verifierAssignmentId: string,
  ): GovernedContinuationTargetRecord[] {
    return this.loadGovernedContinuationTargets(verifierAssignmentId).filter(
      (row) =>
        validateGovernedContinuationTarget(row) && this.predecessorPathAuthorityHolds(row),
    );
  }

  findGovernedContinuationTargetById(
    continuationTargetId: string,
  ): GovernedContinuationTargetRecord | null {
    assertSafeId("continuationTargetId", continuationTargetId);
    for (const assignmentId of this.listAssignmentIds()) {
      const matches = this.loadValidGovernedContinuationTargets(assignmentId).filter(
        (row) => row.continuationTargetId === continuationTargetId,
      );
      if (matches.length > 0) return matches[matches.length - 1] ?? null;
    }
    return null;
  }

  persistGovernedContinuationTargetLifecycle(
    record: GovernedContinuationTargetLifecycleRecord,
  ): GovernedContinuationTargetLifecycleRecord {
    if (!validateGovernedContinuationTargetLifecycle(record)) {
      throw new EngineeringStoreError(
        "governed continuation target lifecycle failed validation",
      );
    }
    const target = this.findGovernedContinuationTargetById(record.continuationTargetId);
    if (!target || target.targetHash !== record.targetHash) {
      throw new EngineeringStoreError(
        "lifecycle requires a matching persisted governed continuation target",
      );
    }
    const decision = this.findVerificationDecisionById(target.verificationDecisionId);
    if (!decision) {
      throw new EngineeringStoreError("lifecycle requires verification decision");
    }
    const assignmentId = assertSafeId("assignmentId", decision.verifierAssignmentId);
    appendLineAtomic(
      this.governedContinuationTargetLifecyclePath(assignmentId),
      JSON.stringify(record),
    );
    this.audit({
      timestamp: record.recordedAt,
      action: "persist_governed_continuation_target_lifecycle",
      assignmentId,
      detail: `${record.continuationTargetId}:${record.status}`,
    });
    return record;
  }

  loadGovernedContinuationTargetLifecycles(
    verifierAssignmentId: string,
  ): GovernedContinuationTargetLifecycleRecord[] {
    const path = this.governedContinuationTargetLifecyclePath(
      assertSafeId("assignmentId", verifierAssignmentId),
    );
    if (!existsSync(path)) return [];
    return readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as GovernedContinuationTargetLifecycleRecord);
  }

  effectiveGovernedContinuationTargetStatus(
    continuationTargetId: string,
    targetHash: string,
  ): GovernedContinuationTargetStatus {
    assertSafeId("continuationTargetId", continuationTargetId);
    let latest: GovernedContinuationTargetLifecycleRecord | null = null;
    for (const assignmentId of this.listAssignmentIds()) {
      for (const row of this.loadGovernedContinuationTargetLifecycles(assignmentId)) {
        if (!validateGovernedContinuationTargetLifecycle(row)) continue;
        if (row.continuationTargetId !== continuationTargetId) continue;
        if (row.targetHash !== targetHash) continue;
        latest = row;
      }
    }
    return latest?.status ?? "eligible";
  }

  persistGovernedContinuationSequenceConfig(
    record: GovernedContinuationSequenceConfigRecord,
  ): GovernedContinuationSequenceConfigRecord {
    if (!validateGovernedContinuationSequenceConfig(record)) {
      throw new EngineeringStoreError("governed continuation sequence config failed validation");
    }
    assertSafeId("projectId", record.projectId);
    assertSafeId("sequenceId", record.sequenceId);
    const existing = this.loadGovernedContinuationSequenceConfigs(record.projectId).filter(
      (row) =>
        validateGovernedContinuationSequenceConfig(row) &&
        row.sequenceId === record.sequenceId &&
        row.configurationVersion === record.configurationVersion,
    );
    if (existing.length > 0) {
      const prior = existing[existing.length - 1]!;
      if (prior.configHash !== record.configHash) {
        throw new EngineeringStoreError(
          "duplicate sequence configurationVersion with a different hash; refusing overwrite",
        );
      }
      return prior;
    }
    appendLineAtomic(this.sequenceConfigPath(record.projectId), JSON.stringify(record));
    this.audit({
      timestamp: record.registeredAt,
      action: "persist_governed_continuation_sequence_config",
      assignmentId: record.sequenceId,
      detail: `v${record.configurationVersion}:${record.configHash.slice(0, 12)}`,
    });
    return record;
  }

  loadGovernedContinuationSequenceConfigs(
    projectId: string,
  ): GovernedContinuationSequenceConfigRecord[] {
    const path = this.sequenceConfigPath(assertSafeId("projectId", projectId));
    if (!existsSync(path)) return [];
    return readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as GovernedContinuationSequenceConfigRecord);
  }

  findActiveGovernedContinuationSequenceConfig(
    sequenceId: string,
  ): GovernedContinuationSequenceConfigRecord | null {
    assertSafeId("sequenceId", sequenceId);
    let best: GovernedContinuationSequenceConfigRecord | null = null;
    for (const projectId of this.listSequenceProjectIds()) {
      for (const row of this.loadGovernedContinuationSequenceConfigs(projectId)) {
        if (!validateGovernedContinuationSequenceConfig(row)) continue;
        if (row.sequenceId !== sequenceId) continue;
        if (!best || row.configurationVersion > best.configurationVersion) best = row;
      }
    }
    return best;
  }

  findActiveGovernedContinuationSequenceConfigForProject(
    projectId: string,
  ): GovernedContinuationSequenceConfigRecord | null {
    assertSafeId("projectId", projectId);
    let best: GovernedContinuationSequenceConfigRecord | null = null;
    for (const row of this.loadGovernedContinuationSequenceConfigs(projectId)) {
      if (!validateGovernedContinuationSequenceConfig(row)) continue;
      if (!best || row.configurationVersion > best.configurationVersion) best = row;
    }
    return best;
  }

  persistSequenceFulfillment(
    record: GovernedContinuationSequenceFulfillmentRecord,
  ): GovernedContinuationSequenceFulfillmentRecord {
    if (!validateSequenceFulfillment(record)) {
      throw new EngineeringStoreError("sequence fulfillment failed validation");
    }
    const config = this.findActiveGovernedContinuationSequenceConfig(record.sequenceId);
    if (!config || !validateGovernedContinuationSequenceConfig(config)) {
      throw new EngineeringStoreError("sequence fulfillment requires a valid sequence config");
    }
    const authoritative = this.loadAuthoritativeSequenceFulfillments(
      record.sequenceId,
      config.projectId,
    );
    const existing = authoritative.filter(
      (row) => row.fulfillmentId === record.fulfillmentId,
    );
    if (existing.length > 0) {
      const prior = existing[0]!;
      if (prior.fulfillmentHash !== record.fulfillmentHash) {
        throw new EngineeringStoreError(
          "duplicate sequence fulfillment with a different hash; refusing overwrite",
        );
      }
      return prior;
    }
    // Same decision+entry under same config is reuse by content
    const sameDecision = authoritative.find(
      (row) =>
        row.verificationDecisionId === record.verificationDecisionId &&
        row.entryKey === record.entryKey,
    );
    if (sameDecision) {
      if (sameDecision.fulfillmentHash !== record.fulfillmentHash) {
        throw new EngineeringStoreError(
          "conflicting sequence fulfillment for decision/entry; refusing overwrite",
        );
      }
      return sameDecision;
    }
    // One governed fulfillment per sequence entry: different executor/decision cannot rebind.
    const sameEntry = authoritative.find((row) => row.entryKey === record.entryKey);
    if (sameEntry) {
      if (
        sameEntry.executorAssignmentId !== record.executorAssignmentId ||
        sameEntry.verificationDecisionId !== record.verificationDecisionId ||
        sameEntry.executorExecutionEvidenceId !== record.executorExecutionEvidenceId
      ) {
        throw new EngineeringStoreError(
          "sequence entry already fulfilled by a different governed predecessor; refusing rebind",
        );
      }
      if (sameEntry.fulfillmentHash !== record.fulfillmentHash) {
        throw new EngineeringStoreError(
          "conflicting sequence fulfillment for entry; refusing overwrite",
        );
      }
      return sameEntry;
    }

    const entryDef = config.entries.find((e) => e.entryKey === record.entryKey);
    if (!entryDef) {
      throw new EngineeringStoreError("sequence fulfillment entryKey is not in active config");
    }
    if (entryDef.entryHash !== record.entryHash) {
      throw new EngineeringStoreError(
        "sequence fulfillment entryHash does not match active sequence entry",
      );
    }
    // Non-bootstrap fulfillments require the executor to be the sequence-bound continuation
    // assignment for that entry — project/repo/branch VERIFIED alone is insufficient.
    if (entryDef.predecessorEntryKey !== null) {
      let boundOk = false;
      try {
        const executorRecord = this.loadAssignmentRecord(record.executorAssignmentId);
        const targetId = executorRecord.relationship.continuationTargetId;
        if (targetId) {
          const target = this.findGovernedContinuationTargetById(targetId);
          boundOk = Boolean(
            target &&
              target.sequenceId === record.sequenceId &&
              target.sequenceEntryKey === record.entryKey &&
              target.sequenceEntryHash === record.entryHash,
          );
        }
      } catch {
        boundOk = false;
      }
      if (!boundOk) {
        throw new EngineeringStoreError(
          "non-bootstrap sequence fulfillment requires governed continuation target binding",
        );
      }
    }

    appendLineAtomic(
      this.sequenceFulfillmentPath(config.projectId),
      JSON.stringify(record),
    );
    this.audit({
      timestamp: record.fulfilledAt,
      action: "persist_sequence_fulfillment",
      assignmentId: record.executorAssignmentId,
      detail: `${record.sequenceId}:${record.entryKey}`,
    });
    return record;
  }

  /**
   * Load fulfillment NDJSON for one project namespace only.
   * Alien sequences/{otherProject}/ files never participate — even with matching sequenceId.
   */
  loadSequenceFulfillments(
    sequenceId: string,
    projectId: string,
  ): GovernedContinuationSequenceFulfillmentRecord[] {
    assertSafeId("sequenceId", sequenceId);
    assertSafeId("projectId", projectId);
    const path = this.sequenceFulfillmentPath(projectId);
    if (!existsSync(path)) return [];
    const out: GovernedContinuationSequenceFulfillmentRecord[] = [];
    for (const line of readFileSync(path, "utf8").split(/\r?\n/).filter(Boolean)) {
      let row: GovernedContinuationSequenceFulfillmentRecord;
      try {
        row = JSON.parse(line) as GovernedContinuationSequenceFulfillmentRecord;
      } catch {
        continue;
      }
      if (row.sequenceId === sequenceId) out.push(row);
    }
    return out;
  }

  /**
   * Fail-closed reconstruction within one project namespace:
   * first valid fulfillment per entryKey wins; alien project files are never loaded.
   */
  loadAuthoritativeSequenceFulfillments(
    sequenceId: string,
    projectId: string,
  ): GovernedContinuationSequenceFulfillmentRecord[] {
    return selectAuthoritativeSequenceFulfillments(
      this.loadSequenceFulfillments(sequenceId, projectId),
    );
  }

  findSequenceFulfillmentByExecutor(
    sequenceId: string,
    projectId: string,
    executorAssignmentId: string,
  ): GovernedContinuationSequenceFulfillmentRecord | null {
    const matches = this.loadAuthoritativeSequenceFulfillments(sequenceId, projectId).filter(
      (row) => row.executorAssignmentId === executorAssignmentId,
    );
    return matches.length > 0 ? matches[0]! : null;
  }

  findSequenceFulfillmentByDecision(
    sequenceId: string,
    projectId: string,
    verificationDecisionId: string,
  ): GovernedContinuationSequenceFulfillmentRecord | null {
    const matches = this.loadAuthoritativeSequenceFulfillments(sequenceId, projectId).filter(
      (row) => row.verificationDecisionId === verificationDecisionId,
    );
    return matches.length > 0 ? matches[0]! : null;
  }

  findSequenceFulfillmentByEntryKey(
    sequenceId: string,
    projectId: string,
    entryKey: string,
  ): GovernedContinuationSequenceFulfillmentRecord | null {
    const matches = this.loadAuthoritativeSequenceFulfillments(sequenceId, projectId).filter(
      (row) => row.entryKey === entryKey,
    );
    return matches.length > 0 ? matches[0]! : null;
  }

  private listSequenceProjectIds(): string[] {
    const root = this.sequencesDir();
    if (!existsSync(root)) return [];
    return readdirSync(root).filter((name) => {
      try {
        return lstatSync(join(root, name)).isDirectory();
      } catch {
        return false;
      }
    });
  }

  persistAuthoritativeSemanticFinding(record: VerifierSemanticFindingRecord): VerifierSemanticFindingRecord {
    if (!validateVerifierSemanticFinding(record)) {
      throw new EngineeringStoreError("authoritative semantic finding record failed validation");
    }
    const assignmentId = assertSafeId("assignmentId", record.executorAssignmentId);
    const frozen = this.loadFrozenAssignment(assignmentId);
    if (frozen.assignment.role !== "executor") {
      throw new EngineeringStoreError("authoritative findings must be persisted under the executor assignment");
    }
    const existing = this.findAuthoritativeSemanticFindingForRequirement(
      record.executorAssignmentId,
      record.executorExecutionEvidenceId,
      record.requirementId,
    );
    if (existing) {
      if (existing.findingHash !== record.findingHash) {
        throw new EngineeringStoreError(
          "duplicate authoritative finding for requirement with a different hash; refusing overwrite",
        );
      }
      return existing;
    }
    appendLineAtomic(this.authoritativeFindingsPath(assignmentId), JSON.stringify(record));
    this.audit({
      timestamp: record.resolvedAt,
      action: "persist_authoritative_semantic_finding",
      assignmentId,
      evidenceId: record.executorExecutionEvidenceId,
      detail: `${record.requirementId}:${record.outcome}:${record.resolutionAuthority}`,
    });
    return record;
  }

  /** @deprecated Provider proposals must not be persisted as authoritative findings. */
  persistVerifierSemanticFinding(_record: VerifierSemanticFindingRecord): VerifierSemanticFindingRecord {
    throw new EngineeringStoreError(
      "persistVerifierSemanticFinding is closed; use resolveVerifierSemanticFindings for authoritative findings",
    );
  }

  loadAuthoritativeSemanticFindings(
    executorAssignmentId: string,
    executorExecutionEvidenceId?: string,
  ): VerifierSemanticFindingRecord[] {
    const path = this.authoritativeFindingsPath(assertSafeId("assignmentId", executorAssignmentId));
    if (!existsSync(path)) return [];
    const rows = readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as VerifierSemanticFindingRecord)
      .filter((row) => validateVerifierSemanticFinding(row));
    if (!executorExecutionEvidenceId) return rows;
    return rows.filter((row) => row.executorExecutionEvidenceId === executorExecutionEvidenceId);
  }

  findAuthoritativeSemanticFindingForRequirement(
    executorAssignmentId: string,
    executorExecutionEvidenceId: string,
    requirementId: string,
  ): VerifierSemanticFindingRecord | null {
    const matches = this.loadAuthoritativeSemanticFindings(executorAssignmentId, executorExecutionEvidenceId).filter(
      (row) => row.requirementId === requirementId,
    );
    return matches[matches.length - 1] ?? null;
  }

  /** Compatibility alias for authoritative findings load. */
  loadVerifierSemanticFindings(
    assignmentId: string,
    executionEvidenceId?: string,
  ): VerifierSemanticFindingRecord[] {
    return this.loadAuthoritativeSemanticFindings(assignmentId, executionEvidenceId);
  }

  findVerifierSemanticFindingForRequirement(
    assignmentId: string,
    executionEvidenceId: string,
    requirementId: string,
  ): VerifierSemanticFindingRecord | null {
    return this.findAuthoritativeSemanticFindingForRequirement(assignmentId, executionEvidenceId, requirementId);
  }

  persistVerifierSemanticProposal(record: VerifierSemanticFindingProposal): VerifierSemanticFindingProposal {
    if (!validateVerifierSemanticProposal(record)) {
      throw new EngineeringStoreError("verifier semantic proposal record failed validation");
    }
    const assignmentId = assertSafeId("assignmentId", record.verifierAssignmentId);
    const frozen = this.loadFrozenAssignment(assignmentId);
    if (frozen.assignmentHash !== record.verifierAssignmentHash) {
      throw new EngineeringStoreError("semantic proposal assignmentHash does not match frozen assignment");
    }
    const existing = this.findVerifierSemanticProposalForRequirement(
      record.verifierAssignmentId,
      record.verifierExecutionEvidenceId,
      record.requirementId,
    );
    if (existing) {
      if (existing.proposalHash !== record.proposalHash) {
        throw new EngineeringStoreError(
          "duplicate semantic proposal for requirement with a different hash; refusing overwrite",
        );
      }
      return existing;
    }
    appendLineAtomic(this.semanticProposalsPath(assignmentId), JSON.stringify(record));
    this.audit({
      timestamp: record.capturedAt,
      action: "persist_verifier_semantic_proposal",
      assignmentId,
      evidenceId: record.verifierExecutionEvidenceId,
      detail: `${record.requirementId}:${record.proposedOutcome}`,
    });
    return record;
  }

  loadVerifierSemanticProposals(
    verifierAssignmentId: string,
    verifierExecutionEvidenceId?: string,
  ): VerifierSemanticFindingProposal[] {
    const path = this.semanticProposalsPath(assertSafeId("assignmentId", verifierAssignmentId));
    if (!existsSync(path)) return [];
    const rows = readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as VerifierSemanticFindingProposal)
      .filter((row) => validateVerifierSemanticProposal(row));
    if (!verifierExecutionEvidenceId) return rows;
    return rows.filter((row) => row.verifierExecutionEvidenceId === verifierExecutionEvidenceId);
  }

  loadVerifierSemanticProposalsForExecutor(
    executorAssignmentId: string,
    executorExecutionEvidenceId: string,
  ): VerifierSemanticFindingProposal[] {
    const verifiers = this.findVerifierAssignments(executorAssignmentId, executorExecutionEvidenceId).filter(
      (row) =>
        this.inspectVerifierAuthorizationProvenance(
          row.frozen.assignment.assignmentId,
          row.frozen.assignmentHash,
        ) === "valid",
    );
    const out: VerifierSemanticFindingProposal[] = [];
    for (const verifier of verifiers) {
      out.push(...this.loadVerifierSemanticProposals(verifier.frozen.assignment.assignmentId));
    }
    return out.filter((row) => row.executorExecutionEvidenceId === executorExecutionEvidenceId);
  }

  findVerifierSemanticProposalForRequirement(
    verifierAssignmentId: string,
    verifierExecutionEvidenceId: string,
    requirementId: string,
  ): VerifierSemanticFindingProposal | null {
    const matches = this.loadVerifierSemanticProposals(verifierAssignmentId, verifierExecutionEvidenceId).filter(
      (row) => row.requirementId === requirementId,
    );
    return matches[matches.length - 1] ?? null;
  }

  getAssignmentStatus(assignmentId: string): AssignmentStatus {
    const events = this.readStatusEvents(assignmentId);
    const last = events[events.length - 1];
    if (!last) {
      throw new EngineeringStoreError(`no status history for assignment ${assignmentId}`);
    }
    return last.status;
  }

  getVerificationPosture(assignmentId: string): VerificationPosture {
    const events = this.readStatusEvents(assignmentId);
    const last = events[events.length - 1];
    return last?.verificationPosture ?? "pending";
  }

  getCurrentState(assignmentId: string): AssignmentCurrentState {
    const frozen = this.loadFrozenAssignment(assignmentId);
    return {
      assignmentId: frozen.assignment.assignmentId,
      assignmentHash: frozen.assignmentHash,
      status: this.getAssignmentStatus(assignmentId),
      verificationPosture: this.getVerificationPosture(assignmentId),
      frozen,
      latestEvidence: this.loadLatestExecutionEvidence(assignmentId),
      crashReceipts: this.loadCrashReceipts(assignmentId),
    };
  }

  listAuditTrail(): AuditEvent[] {
    if (!existsSync(this.auditPath())) return [];
    return readFileSync(this.auditPath(), "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AuditEvent);
  }

  private assertHashCoherence(frozen: FrozenAssignment): void {
    const recomputed = hashAssignment(frozen.assignment);
    if (recomputed !== frozen.assignmentHash) {
      throw new EngineeringStoreError("assignment hash coherence failed; refusing unfrozen or mutated assignment");
    }
    const rebuilt = createAssignment({ ...frozen.assignment, createdAt: frozen.assignment.createdAt });
    if (rebuilt.assignmentHash !== frozen.assignmentHash) {
      throw new EngineeringStoreError("assignment canonicalization drifted from persisted hash");
    }
  }

  private readAssignmentRecord(assignmentId: string): FrozenAssignmentRecord {
    const path = this.assignmentPath(assertSafeId("assignmentId", assignmentId));
    if (!existsSync(path)) {
      throw new EngineeringStoreError(`frozen assignment not found: ${assignmentId}`);
    }
    const parsed = JSON.parse(readFileSync(path, "utf8")) as FrozenAssignmentRecord;
    if (parsed.recordKind !== "frozen_assignment" || parsed.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) {
      throw new EngineeringStoreError("unsupported frozen assignment record");
    }
    parsed.frozen = deepFreeze(parsed.frozen);
    return parsed;
  }

  private readEvidenceFile(path: string): ExecutionEvidence {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as ExecutionEvidence;
    if (parsed.recordKind !== "execution_evidence" || parsed.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) {
      throw new EngineeringStoreError("unsupported execution evidence record");
    }
    validateEvidenceHash(parsed);
    return parsed;
  }

  private readStatusEvents(assignmentId: string): StatusEvent[] {
    const path = this.statusPath(assertSafeId("assignmentId", assignmentId));
    if (!existsSync(path)) return [];
    return readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as StatusEvent);
  }

  private loadCrashReceipts(assignmentId: string): CrashReceipt[] {
    if (!existsSync(this.crashPath())) return [];
    return readFileSync(this.crashPath(), "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as CrashReceipt)
      .filter((row) => row.assignmentId === assignmentId);
  }

  private appendStatus(event: StatusEvent): void {
    appendLineAtomic(this.statusPath(event.assignmentId), JSON.stringify(event));
  }

  private audit(event: AuditEvent): void {
    appendLineAtomic(this.auditPath(), JSON.stringify(event));
  }

  private manifestPath(): string {
    return join(this.storeRoot, "STORE.json");
  }

  private auditPath(): string {
    return join(this.storeRoot, "audit.ndjson");
  }

  private crashPath(): string {
    return join(this.storeRoot, "crash-receipts.ndjson");
  }

  private assignmentsDir(): string {
    return join(this.storeRoot, "assignments");
  }

  private executionsDir(): string {
    return join(this.storeRoot, "executions");
  }

  private assignmentPath(assignmentId: string): string {
    return join(this.assignmentsDir(), assignmentId, "assignment.json");
  }

  private statusPath(assignmentId: string): string {
    return join(this.assignmentsDir(), assignmentId, "status.ndjson");
  }

  private authorizationPath(assignmentId: string): string {
    return join(this.assignmentsDir(), assignmentId, "governed-authorization.ndjson");
  }

  private verificationDecisionPath(assignmentId: string): string {
    return join(this.assignmentsDir(), assignmentId, "verification-decisions.ndjson");
  }

  private postDecisionActionPath(assignmentId: string): string {
    return join(this.assignmentsDir(), assignmentId, "post-decision-actions.ndjson");
  }

  private postDecisionExecutionAuthorizationPath(assignmentId: string): string {
    return join(this.assignmentsDir(), assignmentId, "post-decision-execution-authorizations.ndjson");
  }

  private governedContinuationTargetPath(assignmentId: string): string {
    return join(this.assignmentsDir(), assignmentId, "governed-continuation-targets.ndjson");
  }

  private governedContinuationTargetLifecyclePath(assignmentId: string): string {
    return join(
      this.assignmentsDir(),
      assignmentId,
      "governed-continuation-target-lifecycle.ndjson",
    );
  }

  private sequencesDir(): string {
    return join(this.storeRoot, "sequences");
  }

  private sequenceConfigPath(projectId: string): string {
    return join(this.sequencesDir(), projectId, "governed-continuation-sequences.ndjson");
  }

  private sequenceFulfillmentPath(projectId: string): string {
    return join(this.sequencesDir(), projectId, "governed-continuation-sequence-fulfillments.ndjson");
  }

  private semanticProposalsPath(assignmentId: string): string {
    return join(this.assignmentsDir(), assignmentId, "semantic-proposals.ndjson");
  }

  private authoritativeFindingsPath(assignmentId: string): string {
    return join(this.assignmentsDir(), assignmentId, "authoritative-findings.ndjson");
  }

  private semanticFindingsPath(assignmentId: string): string {
    return this.authoritativeFindingsPath(assignmentId);
  }

  private evidencePath(assignmentId: string, evidenceId: string): string {
    return join(this.executionsDir(), assignmentId, `${evidenceId}.json`);
  }
}

export function createFileEngineeringStore(storeRoot: string): FileEngineeringStore {
  return new FileEngineeringStore(storeRoot);
}
