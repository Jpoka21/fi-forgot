import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createAssignment, hashAssignment } from "../assignment-hash.js";
import { deepFreeze, type FrozenAssignment } from "../assignment.js";
import { isForgotIdentifierRepository } from "../hooks/project-hook.js";
import { appendLineAtomic, writeFileExclusiveAtomic } from "./atomic-write.js";
import {
  buildVerifierAuthorizationReceipt,
  validateVerifierAuthorizationReceipt,
} from "./authorization-receipt.js";
import { validateEvidenceHash } from "./evidence.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  type AssignmentCurrentState,
  type AssignmentRelationship,
  type AssignmentStatus,
  type AuditEvent,
  type CrashReceipt,
  type ExecutionEvidence,
  type FrozenAssignmentRecord,
  type StatusEvent,
  type VerificationPosture,
  type VerifierAuthorizationReceipt,
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

  private evidencePath(assignmentId: string, evidenceId: string): string {
    return join(this.executionsDir(), assignmentId, `${evidenceId}.json`);
  }
}

export function createFileEngineeringStore(storeRoot: string): FileEngineeringStore {
  return new FileEngineeringStore(storeRoot);
}
