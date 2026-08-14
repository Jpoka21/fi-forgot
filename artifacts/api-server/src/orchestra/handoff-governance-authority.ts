/**
 * Handoff Governance Authority (HGA) — FI-DSN-STD-015-R25 / R40 / R48 / R51 / R56 / R57 / PD-STD-015-001.
 *
 * Sole constitutionally authorized owner of operative STD-015 Handoff authorization acts,
 * Handoff posture declaration acts, and Handoff completion acts
 * (distinct act-type scopes; §20.5.3.14). Rejected is an HSLM vocabulary meaning (R51),
 * not a ninth HGA act-type scope — it denotes withheld authorization or posture declaration.
 * Downstream exit BOUNDARY attribution (HOF-G8 R58–R65) is performed under the established
 * HGA class but is NOT an HGA matrix act type and must not be added to constitutional scopes.
 * Actor strings alone cannot mint HGA. MAGAC/DDAC/DSRA/IVAC/SSAC/Brain cannot substitute.
 *
 * R66 catalog integration: the mandatory HGA act-type matrix catalogs six types
 * (authorization, posture_declaration, completion, suspension, withdrawal, recall), but
 * authorizedConstitutionalScopes remains exactly the three operative scopes below.
 * Catalog presence of suspension/withdrawal/recall ≠ constitutional scope activation.
 * HOF-G6-U1 (R70–R83) establishes shared foundation only; act minting remains
 * HOF-G6-U2/U3/U4. authorizedConstitutionalScopes remains exactly the three
 * operative scopes below until those units activate scopes.
 * See handoff-authority-catalog.ts and handoff-lifecycle-g6-foundation.ts.
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type { HandoffGovernanceAuthorityClassId } from "./domain3-types.js";

export type HandoffGovernanceAuthorityConstitutionalScope =
  | "handoff_authorization_act"
  | "handoff_posture_declaration_act"
  | "handoff_completion_act";

export interface EstablishedHandoffGovernanceAuthorityClass {
  readonly authorityClassId: HandoffGovernanceAuthorityClassId;
  readonly governingSourceId: "PD-STD-015-001";
  readonly requirementIds: readonly [
    "FI-DSN-STD-015-R25",
    "FI-DSN-STD-015-R32",
    "FI-DSN-STD-015-R40",
    "FI-DSN-STD-015-R47",
    "FI-DSN-STD-015-R48",
    "FI-DSN-STD-015-R51",
    "FI-DSN-STD-015-R56",
    "FI-DSN-STD-015-R57",
  ];
  /**
   * Legacy single-scope field retained for HOF-G2 authorization act records.
   * Prefer authorizedConstitutionalScopes for multi-act-type checks.
   */
  readonly authorizedConstitutionalScope: "handoff_authorization_act";
  readonly authorizedConstitutionalScopes: readonly HandoffGovernanceAuthorityConstitutionalScope[];
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
        "FI-DSN-STD-015-R40",
        "FI-DSN-STD-015-R47",
        "FI-DSN-STD-015-R48",
        "FI-DSN-STD-015-R51",
        "FI-DSN-STD-015-R56",
        "FI-DSN-STD-015-R57",
      ] as const),
      authorizedConstitutionalScope: "handoff_authorization_act" as const,
      authorizedConstitutionalScopes: Object.freeze([
        "handoff_authorization_act",
        "handoff_posture_declaration_act",
        "handoff_completion_act",
      ] as const),
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
 * R25 / R32 / R40 / R47 — only the frozen HGA class may authorize Handoff or declare posture.
 */
export function assertEstablishedHandoffGovernanceAuthorityClass(
  authorityClassId: unknown,
): asserts authorityClassId is HandoffGovernanceAuthorityClassId {
  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Handoff authorization or posture declaration requires constitutionally established HGA; Brain, MAGAC, DDAC, DSRA, IVAC, SSAC, GPRA, workflow, actor string, or fabricated ID cannot mint Handoff authority (R25/R32/R40/R47)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25", "FI-DSN-STD-015-R32", "FI-DSN-STD-015-R40", "FI-DSN-STD-015-R47"],
    );
  }
}

export function assertEstablishedHandoffGovernanceAuthorityForPostureDeclaration(
  authorityClassId: unknown,
): asserts authorityClassId is HandoffGovernanceAuthorityClassId {
  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Handoff posture declaration requires constitutionally established HGA; Brain, MAGAC, DDAC, DSRA, IVAC, SSAC, GPRA, workflow, actor string, or fabricated ID cannot mint Handoff posture authority (R40/R47)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40", "FI-DSN-STD-015-R47"],
    );
  }
  const resolved = resolveEstablishedHandoffGovernanceAuthorityClass(
    authorityClassId as HandoffGovernanceAuthorityClassId,
  );
  if (
    !resolved.authorizedConstitutionalScopes.includes("handoff_posture_declaration_act")
  ) {
    throw new OrchestraConstitutionalError(
      "Established HGA does not authorize handoff_posture_declaration_act scope (R40)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40"],
    );
  }
}

export function assertEstablishedHandoffGovernanceAuthorityForCompletion(
  authorityClassId: unknown,
): asserts authorityClassId is HandoffGovernanceAuthorityClassId {
  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Handoff completion requires constitutionally established HGA; Brain, MAGAC, DDAC, DSRA, IVAC, SSAC, GPRA, workflow, actor string, or fabricated ID cannot mint Handoff completion authority (R51/R56/R57)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R56", "FI-DSN-STD-015-R57"],
    );
  }
  const resolved = resolveEstablishedHandoffGovernanceAuthorityClass(
    authorityClassId as HandoffGovernanceAuthorityClassId,
  );
  if (!resolved.authorizedConstitutionalScopes.includes("handoff_completion_act")) {
    throw new OrchestraConstitutionalError(
      "Established HGA does not authorize handoff_completion_act scope (R51/R56)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R56"],
    );
  }
}
