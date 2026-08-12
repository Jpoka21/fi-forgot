/**
 * IVAC — Invalidation Authority Classes (R57 / PD-STD-014-007).
 *
 * Runtime class IDs are machine encodings of constitutional scope kinds under
 * PD-STD-014-007 / R57. They are not literal frozen Standard document IDs.
 * MAGAC Approval classes and DDAC disposition classes cannot establish
 * invalidation authority.
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type {
  InvalidationAuthorityClassId,
  InvalidationAuthorityConstitutionalScope,
} from "./domain3-types.js";

export interface EstablishedInvalidationAuthorityClass {
  readonly authorityClassId: InvalidationAuthorityClassId;
  readonly governingSourceId: "PD-STD-014-007";
  readonly requirementIds: readonly ["FI-DSN-STD-014-R57"];
  readonly authorizedConstitutionalScope: InvalidationAuthorityConstitutionalScope;
}

export const FROZEN_ESTABLISHED_INVALIDATION_AUTHORITY_CLASSES: readonly EstablishedInvalidationAuthorityClass[] =
  Object.freeze([
    Object.freeze({
      authorityClassId: "invalidation_authority_production_obligation_scope",
      governingSourceId: "PD-STD-014-007" as const,
      requirementIds: Object.freeze(["FI-DSN-STD-014-R57"] as const),
      authorizedConstitutionalScope: "production_obligation" as const,
    }),
    Object.freeze({
      authorityClassId: "invalidation_authority_production_program_scope",
      governingSourceId: "PD-STD-014-007" as const,
      requirementIds: Object.freeze(["FI-DSN-STD-014-R57"] as const),
      authorizedConstitutionalScope: "production_program" as const,
    }),
  ]);

const BY_ID = new Map(
  FROZEN_ESTABLISHED_INVALIDATION_AUTHORITY_CLASSES.map((entry) => [
    entry.authorityClassId,
    entry,
  ]),
);

export function isCanonicalEstablishedInvalidationAuthorityClassId(
  value: unknown,
): value is InvalidationAuthorityClassId {
  return typeof value === "string" && BY_ID.has(value as InvalidationAuthorityClassId);
}

export function resolveEstablishedInvalidationAuthorityClass(
  authorityClassId: InvalidationAuthorityClassId,
): EstablishedInvalidationAuthorityClass {
  const resolved = BY_ID.get(authorityClassId);
  if (!resolved) {
    throw new OrchestraConstitutionalError(
      "Invalidation authority class is not established by frozen IVAC governance",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57"],
    );
  }
  return resolved;
}

export function assertEstablishedInvalidationAuthorityClass(
  authorityClassId: unknown,
): asserts authorityClassId is InvalidationAuthorityClassId {
  if (!isCanonicalEstablishedInvalidationAuthorityClassId(authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires a constitutionally established invalidation authority class; MAGAC Approval classes, DDAC disposition classes, Review participation, Brain, workflow, queue, or tool permission cannot establish invalidation authority",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57"],
    );
  }
}
