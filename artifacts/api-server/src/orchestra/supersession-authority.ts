/**
 * SSAC — Supersession Authority Classes (R68 / PD-STD-014-014).
 *
 * Runtime class IDs are machine encodings of constitutional scope kinds under
 * PD-STD-014-014 / R68. They are not literal frozen Standard document IDs.
 * MAGAC Approval classes, DDAC disposition classes, IVAC invalidation classes,
 * Brain, workflow, queue, or tool permission cannot establish supersession authority.
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type {
  SupersessionAuthorityClassId,
  SupersessionAuthorityConstitutionalScope,
} from "./domain3-types.js";

export interface EstablishedSupersessionAuthorityClass {
  readonly authorityClassId: SupersessionAuthorityClassId;
  readonly governingSourceId: "PD-STD-014-014";
  readonly requirementIds: readonly ["FI-DSN-STD-014-R68"];
  readonly authorizedConstitutionalScope: SupersessionAuthorityConstitutionalScope;
}

export const FROZEN_ESTABLISHED_SUPERSESSION_AUTHORITY_CLASSES: readonly EstablishedSupersessionAuthorityClass[] =
  Object.freeze([
    Object.freeze({
      authorityClassId: "supersession_authority_production_obligation_scope",
      governingSourceId: "PD-STD-014-014" as const,
      requirementIds: Object.freeze(["FI-DSN-STD-014-R68"] as const),
      authorizedConstitutionalScope: "production_obligation" as const,
    }),
    Object.freeze({
      authorityClassId: "supersession_authority_production_program_scope",
      governingSourceId: "PD-STD-014-014" as const,
      requirementIds: Object.freeze(["FI-DSN-STD-014-R68"] as const),
      authorizedConstitutionalScope: "production_program" as const,
    }),
  ]);

const BY_ID = new Map(
  FROZEN_ESTABLISHED_SUPERSESSION_AUTHORITY_CLASSES.map((entry) => [
    entry.authorityClassId,
    entry,
  ]),
);

export function isCanonicalEstablishedSupersessionAuthorityClassId(
  value: unknown,
): value is SupersessionAuthorityClassId {
  return typeof value === "string" && BY_ID.has(value as SupersessionAuthorityClassId);
}

export function resolveEstablishedSupersessionAuthorityClass(
  authorityClassId: SupersessionAuthorityClassId,
): EstablishedSupersessionAuthorityClass {
  const resolved = BY_ID.get(authorityClassId);
  if (!resolved) {
    throw new OrchestraConstitutionalError(
      "Supersession authority class is not established by frozen SSAC governance",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68"],
    );
  }
  return resolved;
}

export function assertEstablishedSupersessionAuthorityClass(
  authorityClassId: unknown,
): asserts authorityClassId is SupersessionAuthorityClassId {
  if (!isCanonicalEstablishedSupersessionAuthorityClassId(authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires a constitutionally established supersession authority class; MAGAC Approval classes, DDAC disposition classes, IVAC invalidation classes, Review participation, Brain, workflow, queue, or tool permission cannot establish supersession authority; actor string alone cannot",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68"],
    );
  }
}
