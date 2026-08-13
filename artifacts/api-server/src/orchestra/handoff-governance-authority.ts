/**
 * Handoff Governance Authority (HGA) — FI-DSN-STD-015-R25 / PD-STD-015-001.
 *
 * Sole constitutionally authorized owner of operative STD-015 Handoff authorization acts.
 * Actor strings alone cannot mint HGA. MAGAC/DDAC/DSRA/IVAC/SSAC/Brain cannot substitute.
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type { HandoffGovernanceAuthorityClassId } from "./domain3-types.js";

export interface EstablishedHandoffGovernanceAuthorityClass {
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly governingSourceId: "PD-STD-015-001";
  readonly requirementIds: readonly [
    "FI-DSN-STD-015-R25",
    "FI-DSN-STD-015-R32",
  ];
  readonly authorizedConstitutionalScope: "handoff_authorization_act";
}

/**
 * Sole constitutional trust boundary for established HGA.
 * Encoding traces to PD-STD-015-001 / Section 20.5.3 — not inventable at runtime.
 */
export const FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES: readonly EstablishedHandoffGovernanceAuthorityClass[] =
  Object.freeze([
    Object.freeze({
      authorityClassId: "handoff_governance_authority" as const,
      governingSourceId: "PD-STD-015-001" as const,
      requirementIds: Object.freeze([
        "FI-DSN-STD-015-R25",
        "FI-DSN-STD-015-R32",
      ] as const),
      authorizedConstitutionalScope: "handoff_authorization_act" as const,
    }),
  ]);

const BY_ID = new Map(
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES.map((entry) => [
    entry.authorityClassId,
    entry,
  ]),
);

export function isCanonicalEstablishedHandoffGovernanceAuthorityClassId(
  value: unknown,
): value is HandoffGovernanceAuthorityClassId {
  return typeof value === "string" && BY_ID.has(value as HandoffGovernanceAuthorityClassId);
}

export function resolveEstablishedHandoffGovernanceAuthorityClass(
  authorityClassId: HandoffGovernanceAuthorityClassId,
): EstablishedHandoffGovernanceAuthorityClass {
  const resolved = BY_ID.get(authorityClassId);
  if (!resolved) {
    throw new OrchestraConstitutionalError(
      "Handoff Governance Authority class is not established by frozen PD-STD-015-001",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25", "FI-DSN-STD-015-R32"],
    );
  }
  return resolved;
}

/**
 * R25 / R32 — only the frozen HGA class may authorize Handoff.
 */
export function assertEstablishedHandoffGovernanceAuthorityClass(
  authorityClassId: unknown,
): asserts authorityClassId is HandoffGovernanceAuthorityClassId {
  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization requires constitutionally established HGA; Brain, MAGAC, DDAC, DSRA, IVAC, SSAC, GPRA, workflow, actor string, or fabricated ID cannot mint Handoff authorization authority (R25/R32)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25", "FI-DSN-STD-015-R32"],
    );
  }
}
