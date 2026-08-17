import { sortKeys } from "../assignment.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  VERIFIER_AUTHORIZATION_SOURCE,
  type VerifierAuthorizationReceipt,
} from "./types.js";

export type VerifierAuthorizationReceiptBody = Omit<VerifierAuthorizationReceipt, "receiptHash">;

export function hashVerifierAuthorizationReceipt(body: VerifierAuthorizationReceiptBody): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildVerifierAuthorizationReceipt(input: {
  assignmentId: string;
  assignmentHash: string;
  executorAssignmentId: string;
  executionEvidenceId: string;
  authorizedAt?: string;
}): VerifierAuthorizationReceipt {
  const body: VerifierAuthorizationReceiptBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "verifier_authorization_receipt",
    receiptId: `vauth-${input.assignmentId}`,
    assignmentId: input.assignmentId,
    assignmentHash: input.assignmentHash,
    authorizedAt: input.authorizedAt ?? new Date().toISOString(),
    source: VERIFIER_AUTHORIZATION_SOURCE,
    humanAuthorized: true,
    executorAssignmentId: input.executorAssignmentId,
    executionEvidenceId: input.executionEvidenceId,
  };
  return { ...body, receiptHash: hashVerifierAuthorizationReceipt(body) };
}

export function validateVerifierAuthorizationReceipt(
  receipt: VerifierAuthorizationReceipt,
): boolean {
  if (receipt.recordKind !== "verifier_authorization_receipt") return false;
  if (receipt.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (receipt.source !== VERIFIER_AUTHORIZATION_SOURCE) return false;
  if (receipt.humanAuthorized !== true) return false;
  const { receiptHash, ...body } = receipt;
  return hashVerifierAuthorizationReceipt(body) === receiptHash;
}
