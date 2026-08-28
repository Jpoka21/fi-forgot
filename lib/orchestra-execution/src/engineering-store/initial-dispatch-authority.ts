import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sortKeys, type FrozenAssignment } from "../assignment.js";
import { appendLineAtomic } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  INITIAL_DISPATCH_AUTHORITY_SOURCE,
  OWNER_SUBMISSION_SOURCE,
  type InitialDispatchAuthorityRecord,
  type OwnerSubmissionReceipt,
} from "./types.js";

type InitialDispatchAuthorityBody = Omit<InitialDispatchAuthorityRecord, "authorityHash">;

function hashInitialDispatchAuthorityBody(body: InitialDispatchAuthorityBody): string {
  return createHash("sha256").update(JSON.stringify(sortKeys(body)), "utf8").digest("hex");
}

function expectedAuthorityId(assignmentId: string, assignmentHash: string, authorizedAt: string): string {
  const suffix = createHash("sha256").update(assignmentHash + authorizedAt).digest("hex").slice(0, 16);
  return `initial-${assignmentId}-${suffix}`;
}

function authorityPath(storeRoot: string, assignmentId: string): string {
  return join(storeRoot, "assignments", assignmentId, "initial-dispatch-authorities.ndjson");
}

function submissionPath(storeRoot: string, assignmentId: string): string {
  return join(storeRoot, "assignments", assignmentId, "owner-submission.json");
}

export function persistOwnerSubmissionReceipt(storeRoot: string, frozen: FrozenAssignment): OwnerSubmissionReceipt {
  const path = submissionPath(storeRoot, frozen.assignment.assignmentId);
  if (existsSync(path)) return loadOwnerSubmissionReceipt(storeRoot, frozen.assignment.assignmentId)!;
  const body = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION as typeof ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "owner_submission_receipt" as const,
    source: OWNER_SUBMISSION_SOURCE,
    assignmentId: frozen.assignment.assignmentId,
    assignmentHash: frozen.assignmentHash,
    projectId: frozen.assignment.projectId,
    repositoryPath: frozen.assignment.repositoryPath,
    submittedAt: frozen.assignment.createdAt,
  };
  const receipt = { ...body, receiptHash: createHash("sha256").update(JSON.stringify(sortKeys(body))).digest("hex") };
  appendLineAtomic(path, JSON.stringify(receipt));
  return receipt;
}

export function loadOwnerSubmissionReceipt(storeRoot: string, assignmentId: string): OwnerSubmissionReceipt | null {
  const path = submissionPath(storeRoot, assignmentId);
  if (!existsSync(path)) return null;
  const receipt = JSON.parse(readFileSync(path, "utf8")) as OwnerSubmissionReceipt;
  const { receiptHash, ...body } = receipt;
  return receipt.recordKind === "owner_submission_receipt" && receipt.source === OWNER_SUBMISSION_SOURCE &&
    createHash("sha256").update(JSON.stringify(sortKeys(body))).digest("hex") === receiptHash ? receipt : null;
}

export function validateInitialDispatchAuthority(record: InitialDispatchAuthorityRecord): boolean {
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION ||
      record.recordKind !== "initial_dispatch_authority" ||
      record.source !== INITIAL_DISPATCH_AUTHORITY_SOURCE ||
      record.explicitOwnerConfirmation !== true ||
      record.ownerConfirmation !== record.assignmentId ||
      record.requireNoPush !== true || record.commitAuthorization !== false ||
      record.pushAuthorization !== false || !record.authorityId || !record.authorityHash) return false;
  const { authorityHash, ...body } = record;
  return hashInitialDispatchAuthorityBody(body) === authorityHash &&
    record.authorityId === expectedAuthorityId(record.assignmentId, record.assignmentHash, record.authorizedAt);
}

export function loadInitialDispatchAuthorities(
  storeRoot: string,
  assignmentId: string,
): InitialDispatchAuthorityRecord[] {
  const path = authorityPath(storeRoot, assignmentId);
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split(/\r?\n/).filter(Boolean)
    .map((line) => JSON.parse(line) as InitialDispatchAuthorityRecord);
}
