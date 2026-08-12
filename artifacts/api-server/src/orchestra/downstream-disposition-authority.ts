/**
 * DDAC — Decision-stage Downstream Disposition Authority Classes (R45 / PD-STD-014-012).
 *
 * Runtime class IDs are machine encodings of constitutional scope kinds under
 * PD-STD-014-012 / Volume 06 Domain 3 rejection and rework ownership.
 * They are not literal frozen Standard document identifiers.
 * MAGAC Approval classes cannot establish DDAC authority.
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type {
  DownstreamDispositionAuthorityClassId,
  DownstreamDispositionConstitutionalScope,
} from "./domain3-types.js";

export interface EstablishedDownstreamDispositionAuthorityClass {
  readonly authorityClassId: DownstreamDispositionAuthorityClassId;
  readonly governingSourceId: "PD-STD-014-012";
  readonly requirementIds: readonly [
    "FI-DSN-STD-014-R45",
    "FI-DSN-STD-014-R47",
    "FI-DSN-STD-014-R49",
  ];
  readonly authorizedConstitutionalScope: DownstreamDispositionConstitutionalScope;
}

/**
 * Sole constitutional trust boundary for established DDAC classes.
 */
export const FROZEN_ESTABLISHED_DOWNSTREAM_DISPOSITION_AUTHORITY_CLASSES: readonly EstablishedDownstreamDispositionAuthorityClass[] =
  Object.freeze([
    Object.freeze({
      authorityClassId: "downstream_disposition_authority_production_obligation_scope",
      governingSourceId: "PD-STD-014-012" as const,
      requirementIds: Object.freeze([
        "FI-DSN-STD-014-R45",
        "FI-DSN-STD-014-R47",
        "FI-DSN-STD-014-R49",
      ] as const),
      authorizedConstitutionalScope: "production_obligation" as const,
    }),
    Object.freeze({
      authorityClassId: "downstream_disposition_authority_production_program_scope",
      governingSourceId: "PD-STD-014-012" as const,
      requirementIds: Object.freeze([
        "FI-DSN-STD-014-R45",
        "FI-DSN-STD-014-R47",
        "FI-DSN-STD-014-R49",
      ] as const),
      authorizedConstitutionalScope: "production_program" as const,
    }),
  ]);

const BY_ID = new Map(
  FROZEN_ESTABLISHED_DOWNSTREAM_DISPOSITION_AUTHORITY_CLASSES.map((entry) => [
    entry.authorityClassId,
    entry,
  ]),
);

export function isCanonicalEstablishedDownstreamDispositionAuthorityClassId(
  value: unknown,
): value is DownstreamDispositionAuthorityClassId {
  return typeof value === "string" && BY_ID.has(value as DownstreamDispositionAuthorityClassId);
}

export function resolveEstablishedDownstreamDispositionAuthorityClass(
  authorityClassId: DownstreamDispositionAuthorityClassId,
): EstablishedDownstreamDispositionAuthorityClass {
  const resolved = BY_ID.get(authorityClassId);
  if (!resolved) {
    throw new OrchestraConstitutionalError(
      "Downstream disposition authority class is not established by frozen DDAC governance",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }
  return resolved;
}

export function assertEstablishedDownstreamDispositionAuthorityClass(
  authorityClassId: unknown,
): asserts authorityClassId is DownstreamDispositionAuthorityClassId {
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Downstream disposition requires a constitutionally established DDAC authority class; reviewer participation, MAGAC Approval classes, Brain, workflow, queue, or tool permission cannot establish DDAC authority",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }
}
