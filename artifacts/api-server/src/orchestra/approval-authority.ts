/**
 * MAGAC — Multiple Authorized Governed Authority Classes (FI-DSN-STD-014-R36–R38).
 *
 * Canonical catalog established by PD-STD-014-002 / Section 20.16.
 * Injectable adapters cannot mint Approval authority classes (G4 manufacturing lesson).
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type {
  ApprovalAuthorityClassId,
  ApprovalAuthorityConstitutionalScope,
} from "./domain3-types.js";

export interface EstablishedApprovalAuthorityClass {
  readonly authorityClassId: ApprovalAuthorityClassId;
  /** Traceable governing source — PD-STD-014-002 / R36. */
  readonly governingSourceId: "PD-STD-014-002";
  readonly requirementIds: readonly [
    "FI-DSN-STD-014-R36",
    "FI-DSN-STD-014-R37",
    "FI-DSN-STD-014-R38",
  ];
  readonly authorizedConstitutionalScope: ApprovalAuthorityConstitutionalScope;
}

/**
 * Sole constitutional trust boundary for established Approval authority classes.
 *
 * Runtime `authorityClassId` strings are machine encodings of the Production
 * Program / Production Obligation scope kinds named in Section 20.16.2.
 * They are not literal frozen Standard document identifiers; establishment
 * and constitutional meaning trace to PD-STD-014-002 / R36–R38.
 */
export const FROZEN_ESTABLISHED_APPROVAL_AUTHORITY_CLASSES: readonly EstablishedApprovalAuthorityClass[] =
  Object.freeze([
    Object.freeze({
      authorityClassId: "approval_authority_production_obligation_scope",
      governingSourceId: "PD-STD-014-002",
      requirementIds: Object.freeze([
        "FI-DSN-STD-014-R36",
        "FI-DSN-STD-014-R37",
        "FI-DSN-STD-014-R38",
      ] as const),
      authorizedConstitutionalScope: "production_obligation",
    }),
    Object.freeze({
      authorityClassId: "approval_authority_production_program_scope",
      governingSourceId: "PD-STD-014-002",
      requirementIds: Object.freeze([
        "FI-DSN-STD-014-R36",
        "FI-DSN-STD-014-R37",
        "FI-DSN-STD-014-R38",
      ] as const),
      authorizedConstitutionalScope: "production_program",
    }),
  ]);

const BY_ID = new Map(
  FROZEN_ESTABLISHED_APPROVAL_AUTHORITY_CLASSES.map((entry) => [
    entry.authorityClassId,
    entry,
  ]),
);

export function isCanonicalEstablishedApprovalAuthorityClassId(
  value: unknown,
): value is ApprovalAuthorityClassId {
  return typeof value === "string" && BY_ID.has(value as ApprovalAuthorityClassId);
}

export function resolveEstablishedApprovalAuthorityClass(
  authorityClassId: ApprovalAuthorityClassId,
): EstablishedApprovalAuthorityClass {
  const resolved = BY_ID.get(authorityClassId);
  if (!resolved) {
    throw new OrchestraConstitutionalError(
      "Approval authority class is not established by frozen MAGAC governance",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
    );
  }
  return resolved;
}

/**
 * R36–R38: only catalog classes are lawful. Callers cannot establish classes by assertion.
 */
export function assertEstablishedApprovalAuthorityClass(
  authorityClassId: unknown,
): asserts authorityClassId is ApprovalAuthorityClassId {
  if (!isCanonicalEstablishedApprovalAuthorityClassId(authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Approval requires a constitutionally established MAGAC authority class; customary practice, reviewer participation, Brain, workflow, or tool permission cannot establish Approval authority",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37", "FI-DSN-STD-014-R38"],
    );
  }
}
