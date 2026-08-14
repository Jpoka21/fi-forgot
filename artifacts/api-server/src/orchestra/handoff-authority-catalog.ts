/**
 * Governed Handoff Authority Catalog Integration — FI-DSN-STD-015 HOF-G9 (R66–R69).
 *
 * Read-only catalogs + assessment/resolve/assert helpers only.
 * Catalog presence ≠ constitutional authority / act activation / operative performance.
 *
 * R66 — HGA sole STD-015 authority class; mandatory six-type act matrix (§20.5.3.14).
 * R67 — Distinct HGA attribution + separate HOEM expectation per matrix act type.
 * R68 — Each operative act binds exactly one HCCM context; posture-relevant → HPPM chain.
 * R69 — Prohibited performer classes; suspension/withdrawal/recall mechanics remain HOF-G6.
 *
 * HOF-G6-U1 (R70–R83) shared foundation is established separately in
 * handoff-lifecycle-g6-foundation.ts; HOF-G6-U2 (R84–R97) makes suspension operative;
 * HOF-G6-U3 (R98–R111) makes withdrawal operative.
 * recall minting remains cataloged_deferred until HOF-G6-U4 (R112+).
 * Does NOT implement exit-completeness, rejection acts, or exit matrix acts.
 * Does NOT mint recall/reject APIs or a generic performHgaAct factory.
 */

import type {
  HandoffActLayerLifecycleState,
  HandoffAuthorityCatalogIntegrationAssessment,
  HandoffGovernanceAuthorityClassId,
  HandoffPostureClass,
  HccmConsumerClassId,
  HgaActCatalogBindingScopeAssessment,
  HgaMatrixActOperativeStatus,
  HgaMatrixActType,
  HgaMatrixActTypeCatalogEntry,
  HoemExpectationCatalogEntry,
  HslmCatalogStateEntry,
  ProhibitedHandoffActPerformerClass,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  HAAM_PROHIBITED_HANDOFF_AUTHORIZATION_ASSIGNEES,
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
} from "./handoff-authority-boundaries.js";
import { FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES } from "./handoff-act-lifecycle.js";
import { HOEM_EXIT_BOUNDARY_ACT_TYPE } from "./handoff-downstream-exit-boundary.js";
import {
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES,
} from "./handoff-governance-authority.js";
import {
  FROZEN_HANDOFF_POSTURE_CLASSES,
} from "./handoff-posture-declaration.js";
import {
  HCCM_CONSUMER_CLASS_CATALOG,
  isHccmConsumerClassId,
  resolveHccmConsumerClass,
} from "./hccm-consumer-classes.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G9_CATALOG_REQUIREMENTS = [
  "FI-DSN-STD-015-R66",
  "FI-DSN-STD-015-R67",
  "FI-DSN-STD-015-R68",
  "FI-DSN-STD-015-R69",
] as const satisfies readonly Std015RequirementId[];

export const HANDOFF_AUTHORITY_CATALOG_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G9_CATALOG_REQUIREMENTS]);

// ---------------------------------------------------------------------------
// R66 — Sole authority class catalog
// ---------------------------------------------------------------------------

export const STD015_SOLE_HANDOFF_AUTHORITY_CLASS_CATALOG = Object.freeze([
  HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
] as const satisfies readonly HandoffGovernanceAuthorityClassId[]);

export function isStd015SoleHandoffAuthorityClass(
  value: unknown,
): value is HandoffGovernanceAuthorityClassId {
  return (
    typeof value === "string" &&
    (STD015_SOLE_HANDOFF_AUTHORITY_CLASS_CATALOG as readonly string[]).includes(value)
  );
}

export function assertStd015SoleHandoffAuthorityClass(
  value: unknown,
): asserts value is HandoffGovernanceAuthorityClassId {
  if (!isStd015SoleHandoffAuthorityClass(value)) {
    throw new OrchestraConstitutionalError(
      "STD-015 admits only handoff_governance_authority as the Handoff authority class; additional authority classes are prohibited (R66)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R66"],
    );
  }
}

export const FORBIDDEN_ADDITIONAL_HANDOFF_AUTHORITY_CLASSES = Object.freeze([
  "handoff_lifecycle_authority",
  "handoff_exit_authority",
  "handoff_rejection_authority",
  "magac_approval_authority",
  "gpra_grant_authority",
  "brain_handoff_authority",
  "implementation_handoff_authority",
  "ad_hoc_handoff_authority",
] as const);

// ---------------------------------------------------------------------------
// R66 — HGA act-type matrix (exactly six)
// ---------------------------------------------------------------------------

export const HGA_MATRIX_ACT_TYPES = [
  "authorization",
  "posture_declaration",
  "completion",
  "suspension",
  "withdrawal",
  "recall",
] as const satisfies readonly HgaMatrixActType[];

export const HGA_MATRIX_ACT_TYPE_CATALOG: readonly HgaMatrixActTypeCatalogEntry[] =
  Object.freeze([
    Object.freeze({
      actType: "authorization" as const,
      operativeStatus: "operative" as const,
      hoemExpectation: "authorization" as const,
      hccmBoundRequired: true as const,
      hppmmPostureChainRequired: false,
      requirementIds: Object.freeze([
        "FI-DSN-STD-015-R66",
        "FI-DSN-STD-015-R67",
        "FI-DSN-STD-015-R68",
        "FI-DSN-STD-015-R25",
      ] as const),
      catalogedDeferredHofG6: false,
      sharedFoundationEstablishedHofG6U1: false,
    }),
    Object.freeze({
      actType: "posture_declaration" as const,
      operativeStatus: "operative" as const,
      hoemExpectation: "posture_declaration" as const,
      hccmBoundRequired: true as const,
      hppmmPostureChainRequired: true,
      requirementIds: Object.freeze([
        "FI-DSN-STD-015-R66",
        "FI-DSN-STD-015-R67",
        "FI-DSN-STD-015-R68",
        "FI-DSN-STD-015-R40",
      ] as const),
      catalogedDeferredHofG6: false,
      sharedFoundationEstablishedHofG6U1: false,
    }),
    Object.freeze({
      actType: "completion" as const,
      operativeStatus: "operative" as const,
      hoemExpectation: "completion" as const,
      hccmBoundRequired: true as const,
      hppmmPostureChainRequired: true,
      requirementIds: Object.freeze([
        "FI-DSN-STD-015-R66",
        "FI-DSN-STD-015-R67",
        "FI-DSN-STD-015-R68",
        "FI-DSN-STD-015-R51",
        "FI-DSN-STD-015-R56",
      ] as const),
      catalogedDeferredHofG6: false,
      sharedFoundationEstablishedHofG6U1: false,
    }),
    Object.freeze({
      actType: "suspension" as const,
      operativeStatus: "operative" as const,
      hoemExpectation: "suspension" as const,
      hccmBoundRequired: true as const,
      hppmmPostureChainRequired: true,
      requirementIds: Object.freeze([
        "FI-DSN-STD-015-R66",
        "FI-DSN-STD-015-R67",
        "FI-DSN-STD-015-R68",
        "FI-DSN-STD-015-R69",
        "FI-DSN-STD-015-R70",
        "FI-DSN-STD-015-R71",
        "FI-DSN-STD-015-R75",
        "FI-DSN-STD-015-R84",
        "FI-DSN-STD-015-R85",
        "FI-DSN-STD-015-R86",
        "FI-DSN-STD-015-R87",
        "FI-DSN-STD-015-R88",
        "FI-DSN-STD-015-R89",
        "FI-DSN-STD-015-R90",
        "FI-DSN-STD-015-R91",
        "FI-DSN-STD-015-R92",
        "FI-DSN-STD-015-R93",
        "FI-DSN-STD-015-R94",
        "FI-DSN-STD-015-R95",
        "FI-DSN-STD-015-R96",
        "FI-DSN-STD-015-R97",
      ] as const),
      catalogedDeferredHofG6: false,
      sharedFoundationEstablishedHofG6U1: true,
    }),
    Object.freeze({
      actType: "withdrawal" as const,
      operativeStatus: "operative" as const,
      hoemExpectation: "withdrawal" as const,
      hccmBoundRequired: true as const,
      hppmmPostureChainRequired: true,
      requirementIds: Object.freeze([
        "FI-DSN-STD-015-R66",
        "FI-DSN-STD-015-R67",
        "FI-DSN-STD-015-R68",
        "FI-DSN-STD-015-R69",
        "FI-DSN-STD-015-R70",
        "FI-DSN-STD-015-R71",
        "FI-DSN-STD-015-R75",
        "FI-DSN-STD-015-R98",
        "FI-DSN-STD-015-R99",
        "FI-DSN-STD-015-R100",
        "FI-DSN-STD-015-R101",
        "FI-DSN-STD-015-R102",
        "FI-DSN-STD-015-R103",
        "FI-DSN-STD-015-R104",
        "FI-DSN-STD-015-R105",
        "FI-DSN-STD-015-R106",
        "FI-DSN-STD-015-R107",
        "FI-DSN-STD-015-R108",
        "FI-DSN-STD-015-R109",
        "FI-DSN-STD-015-R110",
        "FI-DSN-STD-015-R111",
      ] as const),
      catalogedDeferredHofG6: false,
      sharedFoundationEstablishedHofG6U1: true,
    }),
    Object.freeze({
      actType: "recall" as const,
      operativeStatus: "cataloged_deferred" as const,
      hoemExpectation: "recall" as const,
      hccmBoundRequired: true as const,
      hppmmPostureChainRequired: false,
      requirementIds: Object.freeze([
        "FI-DSN-STD-015-R66",
        "FI-DSN-STD-015-R67",
        "FI-DSN-STD-015-R69",
        "FI-DSN-STD-015-R70",
        "FI-DSN-STD-015-R71",
        "FI-DSN-STD-015-R75",
      ] as const),
      catalogedDeferredHofG6: true,
      sharedFoundationEstablishedHofG6U1: true,
    }),
  ]);

const MATRIX_BY_TYPE = new Map(
  HGA_MATRIX_ACT_TYPE_CATALOG.map((entry) => [entry.actType, entry]),
);

/** Invented HGA scopes / act labels that MUST NEVER enter the matrix or constitutional scopes. */
export const FORBIDDEN_INVENTED_HGA_ACT_SCOPES = Object.freeze([
  "handoff_lifecycle_rejection_act",
  "handoff_exit_act",
  "handoff_downstream_exit_act",
  "handoff_exit_boundary_act",
  "rejection",
  "exit",
  "exit_boundary",
  "accepted",
  "exited",
] as const);

export const FORBIDDEN_HSLM_INVENTED_STATES = Object.freeze([
  "exited",
  "accepted",
  "rejected_as_hga_act",
  "exit_complete",
] as const);

// ---------------------------------------------------------------------------
// R67 — HOEM expectation catalog (matrix + peer non-matrix)
// ---------------------------------------------------------------------------

export const HOEM_MATRIX_EXPECTATION_CATALOG: readonly HoemExpectationCatalogEntry[] =
  Object.freeze(
    HGA_MATRIX_ACT_TYPES.map((actType) => {
      const matrix = MATRIX_BY_TYPE.get(actType)!;
      return Object.freeze({
        hoemExpectation: actType,
        matrixMembership: "matrix" as const,
        operativeStatus: matrix.operativeStatus,
        isSeventhMatrixType: false as const,
        forbiddenAsMatrix: false as const,
        requirementIds: Object.freeze([
          "FI-DSN-STD-015-R66",
          "FI-DSN-STD-015-R67",
        ] as const),
      });
    }),
  );

/** Peer NON-MATRIX HOEM expectation — G8 exit_boundary (not a seventh matrix type). */
export const HOEM_PEER_NON_MATRIX_EXIT_BOUNDARY_EXPECTATION = Object.freeze({
  hoemExpectation: HOEM_EXIT_BOUNDARY_ACT_TYPE,
  matrixMembership: "peer_non_matrix" as const,
  operativeStatus: "operative" as const,
  isSeventhMatrixType: false as const,
  forbiddenAsMatrix: false as const,
  peerDistinctFromMatrix: true as const,
  g8DownstreamExitBoundary: true as const,
  requirementIds: Object.freeze([
    "FI-DSN-STD-015-R64",
    "FI-DSN-STD-015-R66",
    "FI-DSN-STD-015-R67",
  ] as const),
});

/** Rejection is FORBIDDEN as a matrix HOEM expectation (not an HGA act type). */
export const HOEM_FORBIDDEN_MATRIX_EXPECTATIONS = Object.freeze([
  "rejection",
  "handoff_lifecycle_rejection",
  "lifecycle_rejection",
] as const);

// ---------------------------------------------------------------------------
// Supporting catalogs (read-only wrap / re-export existing)
// ---------------------------------------------------------------------------

export const HSLM_EIGHT_STATE_CATALOG: readonly HslmCatalogStateEntry[] = Object.freeze([
  Object.freeze({
    stateId: "eligible_for_consideration" as const,
    statusKind: "denotation" as const,
  }),
  Object.freeze({
    stateId: "authorized" as const,
    statusKind: "denotation" as const,
  }),
  Object.freeze({
    stateId: "completed" as const,
    statusKind: "operative_transition" as const,
  }),
  Object.freeze({
    stateId: "rejected" as const,
    statusKind: "denotation_only" as const,
  }),
  Object.freeze({
    stateId: "suspended" as const,
    statusKind: "operative_transition" as const,
  }),
  Object.freeze({
    stateId: "withdrawn" as const,
    statusKind: "vocabulary_deferred" as const,
  }),
  Object.freeze({
    stateId: "recalled" as const,
    statusKind: "vocabulary_deferred" as const,
  }),
  Object.freeze({
    stateId: "expired" as const,
    statusKind: "vocabulary_deferred" as const,
  }),
]);

/** HPPM affinity encodings — `none` is affinity metadata, NOT a third Volume 06 posture class. */
export const HPPM_POSTURE_AFFINITY_CATALOG = Object.freeze([
  "library_intake_posture",
  "production_catalog_posture",
  "none",
] as const satisfies readonly HandoffPostureClass[]);

export const VOLUME_06_HANDOFF_POSTURE_CLASSES = Object.freeze([
  "library_intake_posture",
  "production_catalog_posture",
] as const);

/**
 * R69 — classes that MUST NOT be assigned operative Handoff act performance.
 * Extends HAAM / boundary prohibitions with GPRA grant, Approval, and ad-hoc/implementation.
 */
export const PROHIBITED_HANDOFF_ACT_PERFORMER_CLASSES = Object.freeze([
  "gpra_grant",
  "magac_approval_authority",
  "approval",
  "ddac_downstream_disposition",
  "dsra_rework_authorization",
  "ivac_invalidation_authority",
  "ssac_supersession_authority",
  "brain_domain3",
  "g11_export_contract",
  "downstream_consumer_domain",
  "implementation_ad_hoc_class",
] as const satisfies readonly ProhibitedHandoffActPerformerClass[]);

const PROHIBITED_PERFORMER_SET = new Set<string>(PROHIBITED_HANDOFF_ACT_PERFORMER_CLASSES);

const PROHIBITED_PERFORMER_TOKENS = [
  "gpra",
  "magac",
  "approval_authority",
  "approval",
  "ddac",
  "dsra",
  "ivac",
  "ssac",
  "brain",
  "g11_export",
  "export_contract",
  "downstream_consumer",
  "consumer_domain",
  "implementation",
  "ad_hoc",
  "adhoc",
] as const;

// ---------------------------------------------------------------------------
// Resolve / assert matrix act types
// ---------------------------------------------------------------------------

export function isHgaMatrixActType(value: unknown): value is HgaMatrixActType {
  return typeof value === "string" && MATRIX_BY_TYPE.has(value as HgaMatrixActType);
}

export function resolveHgaMatrixActType(value: unknown): HgaMatrixActTypeCatalogEntry {
  if (!isHgaMatrixActType(value)) {
    throw new OrchestraConstitutionalError(
      "Value is not one of the six frozen HGA matrix act types (authorization|posture_declaration|completion|suspension|withdrawal|recall) (R66/R67)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R66", "FI-DSN-STD-015-R67"],
    );
  }
  return MATRIX_BY_TYPE.get(value)!;
}

export function assertHgaMatrixActType(
  value: unknown,
): asserts value is HgaMatrixActType {
  resolveHgaMatrixActType(value);
}

export function getHgaMatrixActOperativeStatus(
  actType: HgaMatrixActType,
): HgaMatrixActOperativeStatus {
  return resolveHgaMatrixActType(actType).operativeStatus;
}

/**
 * Catalog presence ≠ performability. Deferred G6 acts and unknown types throw.
 */
export function assertHgaMatrixActMayBePerformed(
  actType: unknown,
): asserts actType is
  | "authorization"
  | "posture_declaration"
  | "completion"
  | "suspension"
  | "withdrawal" {
  const entry = resolveHgaMatrixActType(actType);
  if (entry.operativeStatus !== "operative") {
    throw new OrchestraConstitutionalError(
      `HGA matrix act type ${entry.actType} is cataloged_deferred pending HOF-G6-U4 act-specific mechanics; catalog membership does not authorize performance (R66/R69/R70–R83; R112+)`,
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R66", "FI-DSN-STD-015-R69", "FI-DSN-STD-015-R70"],
    );
  }
}

/**
 * Fail closed for unknown, invented rejection/exit, or deferred-as-if-operative strings
 * appearing on persisted / rehydrated surfaces.
 */
export function assertHgaActTypeStringFailClosed(
  value: unknown,
  options?: {
    readonly allowPeerNonMatrixExitBoundary?: boolean;
    readonly requireOperativePerformance?: boolean;
  },
): void {
  if (typeof value !== "string" || !value.trim()) {
    throw new OrchestraConstitutionalError(
      "HGA/HOEM act-type string is required and must be non-empty (R66)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R66"],
    );
  }
  const lower = value.trim().toLowerCase();

  if (
    (FORBIDDEN_INVENTED_HGA_ACT_SCOPES as readonly string[]).includes(lower) ||
    (HOEM_FORBIDDEN_MATRIX_EXPECTATIONS as readonly string[]).includes(lower)
  ) {
    if (
      options?.allowPeerNonMatrixExitBoundary === true &&
      lower === HOEM_EXIT_BOUNDARY_ACT_TYPE
    ) {
      // exit_boundary is peer non-matrix only — never treated as matrix.
      return;
    }
    throw new OrchestraConstitutionalError(
      "Invented rejection/exit matrix act types and forbidden HOEM expectations are prohibited (R66/R67); exit_boundary remains non-matrix (G8)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R66", "FI-DSN-STD-015-R67"],
    );
  }

  if (lower === HOEM_EXIT_BOUNDARY_ACT_TYPE) {
    if (options?.allowPeerNonMatrixExitBoundary === true) {
      return;
    }
    throw new OrchestraConstitutionalError(
      "exit_boundary is a peer NON-MATRIX HOEM expectation (G8), not an HGA matrix act type (R66/R67)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R66", "FI-DSN-STD-015-R67"],
    );
  }

  if (!isHgaMatrixActType(lower)) {
    throw new OrchestraConstitutionalError(
      "Unknown HGA/HOEM act-type string is not in the frozen six-type matrix (R66)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R66"],
    );
  }

  if (options?.requireOperativePerformance === true) {
    assertHgaMatrixActMayBePerformed(lower);
  }
}

// ---------------------------------------------------------------------------
// R68 — single HCCM binding scope
// ---------------------------------------------------------------------------

export function assessHgaActCatalogBindingScope(input: {
  readonly actType: unknown;
  readonly bindingId?: unknown;
  readonly spansMultipleBindings?: unknown;
  readonly collapsesActTypes?: unknown;
  readonly hppmmPostureChainPresent?: unknown;
}): HgaActCatalogBindingScopeAssessment {
  const denialReasons: string[] = [];
  let resolved: HgaMatrixActTypeCatalogEntry | null = null;

  try {
    resolved = resolveHgaMatrixActType(input.actType);
  } catch {
    denialReasons.push("act_type_not_in_hga_matrix");
  }

  if (input.spansMultipleBindings === true) {
    denialReasons.push("multi_binding_span_denied");
  }
  if (input.collapsesActTypes === true) {
    denialReasons.push("act_type_collapse_denied");
  }

  const bindingId =
    typeof input.bindingId === "string" && input.bindingId.trim()
      ? input.bindingId.trim()
      : null;

  if (resolved?.hccmBoundRequired && !bindingId) {
    denialReasons.push("hccm_bound_context_required");
  }

  if (
    resolved?.hppmmPostureChainRequired === true &&
    input.hppmmPostureChainPresent !== true
  ) {
    denialReasons.push("hppm_posture_chain_required_for_posture_relevant_act");
  }

  const mayBind = denialReasons.length === 0 && resolved !== null;

  return Object.freeze({
    mayBindSingleContext: mayBind,
    denialReasons: Object.freeze([...denialReasons]),
    actType: resolved?.actType ?? null,
    bindingId,
    hccmBoundRequired: resolved?.hccmBoundRequired ?? true,
    hppmmPostureChainRequired: resolved?.hppmmPostureChainRequired ?? false,
    doesNotAllowMultiContextMerge: true as const,
    doesNotAllowActTypeMerge: true as const,
    catalogMembershipDoesNotCreateAuthority: true as const,
    catalogMembershipDoesNotAuthorize: true as const,
    catalogMembershipDoesNotBind: true as const,
    catalogMembershipDoesNotDeclare: true as const,
    catalogMembershipDoesNotComplete: true as const,
    catalogMembershipDoesNotExit: true as const,
    r68SingleHccmBoundConsumerContext: true as const,
    traceability: HANDOFF_AUTHORITY_CATALOG_TRACEABILITY,
  });
}

// ---------------------------------------------------------------------------
// R69 — prohibited performers
// ---------------------------------------------------------------------------

function tokenLooksProhibitedPerformer(value: string): boolean {
  const lower = value.trim().toLowerCase();
  if (!lower) return false;
  if (PROHIBITED_PERFORMER_SET.has(lower)) return true;
  return PROHIBITED_PERFORMER_TOKENS.some(
    (t) => lower === t || lower.includes(t) || lower.includes(`${t}_`),
  );
}

export function isProhibitedHandoffActPerformerClass(
  value: unknown,
): value is ProhibitedHandoffActPerformerClass {
  if (typeof value !== "string" || !value.trim()) return false;
  const lower = value.trim().toLowerCase();
  if (PROHIBITED_PERFORMER_SET.has(lower)) return true;
  return (PROHIBITED_HANDOFF_ACT_PERFORMER_CLASSES as readonly string[]).some(
    (id) => lower === id || lower.includes(id),
  );
}

export function assertNotProhibitedHandoffActPerformer(
  value: unknown,
): void {
  if (typeof value !== "string" || !value.trim()) {
    throw new OrchestraConstitutionalError(
      "Handoff act performer class attribution is required (R69)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R69"],
    );
  }
  if (
    isProhibitedHandoffActPerformerClass(value) ||
    tokenLooksProhibitedPerformer(value)
  ) {
    throw new OrchestraConstitutionalError(
      "MUST NOT assign operative Handoff act performance to GPRA grant, MAGAC, Approval, DDAC, DSRA, IVAC, SSAC, Brain, G11 export, downstream consumer domains, or implementation/ad-hoc classes (R69)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R69"],
    );
  }
}

// ---------------------------------------------------------------------------
// Cross-catalog tuple (CC + HCBM + domain) — read-only via HCCM helpers
// ---------------------------------------------------------------------------

export function validateHccmCrossCatalogTuple(input: {
  readonly consumerClassId: unknown;
  readonly hcbmBoundaryKeys?: readonly unknown[];
  readonly downstreamConsiderationDomain?: unknown;
}): Readonly<{
  readonly valid: boolean;
  readonly denialReasons: readonly string[];
  readonly consumerClassId: HccmConsumerClassId | null;
  readonly catalogMembershipDoesNotCreateAuthority: true;
}> {
  const denialReasons: string[] = [];
  if (!isHccmConsumerClassId(input.consumerClassId)) {
    return Object.freeze({
      valid: false,
      denialReasons: Object.freeze(["consumer_class_not_in_cc01_cc06"]),
      consumerClassId: null,
      catalogMembershipDoesNotCreateAuthority: true as const,
    });
  }
  const entry = resolveHccmConsumerClass(input.consumerClassId);

  if (input.hcbmBoundaryKeys != null) {
    const keys = input.hcbmBoundaryKeys.filter(
      (k): k is string => typeof k === "string" && k.trim().length > 0,
    );
    for (const key of keys) {
      if (!(entry.hcbmBoundaryKeys as readonly string[]).includes(key)) {
        denialReasons.push(`hcbm_key_not_mapped_for_${entry.consumerClassId}:${key}`);
      }
    }
  }

  if (
    typeof input.downstreamConsiderationDomain === "string" &&
    input.downstreamConsiderationDomain.trim() &&
    input.downstreamConsiderationDomain !== entry.downstreamConsiderationDomain
  ) {
    denialReasons.push("downstream_domain_mismatch_with_hccm_catalog");
  }

  return Object.freeze({
    valid: denialReasons.length === 0,
    denialReasons: Object.freeze([...denialReasons]),
    consumerClassId: entry.consumerClassId,
    catalogMembershipDoesNotCreateAuthority: true as const,
  });
}

// ---------------------------------------------------------------------------
// R66–R69 frozen catalog integrity assessment (no minting)
// ---------------------------------------------------------------------------

export function assessHandoffAuthorityCatalogIntegration(): HandoffAuthorityCatalogIntegrationAssessment {
  const matrixTypes = HGA_MATRIX_ACT_TYPE_CATALOG.map((e) => e.actType);
  const operative = HGA_MATRIX_ACT_TYPE_CATALOG.filter(
    (e) => e.operativeStatus === "operative",
  ).map((e) => e.actType);
  const deferred = HGA_MATRIX_ACT_TYPE_CATALOG.filter(
    (e) => e.operativeStatus === "cataloged_deferred",
  ).map((e) => e.actType);

  const hslmIds = HSLM_EIGHT_STATE_CATALOG.map((e) => e.stateId);
  const hccmIds = HCCM_CONSUMER_CLASS_CATALOG.map((e) => e.consumerClassId);
  const hgaScopes =
    FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!
      .authorizedConstitutionalScopes;

  const integrityOk =
    STD015_SOLE_HANDOFF_AUTHORITY_CLASS_CATALOG.length === 1 &&
    STD015_SOLE_HANDOFF_AUTHORITY_CLASS_CATALOG[0] ===
      HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID &&
    matrixTypes.length === 6 &&
    operative.length === 5 &&
    deferred.length === 1 &&
    hslmIds.length === 8 &&
    hccmIds.length === 6 &&
    !hgaScopes.includes("handoff_lifecycle_rejection_act" as never) &&
    !(matrixTypes as readonly string[]).includes("exit_boundary") &&
    !(matrixTypes as readonly string[]).includes("rejection") &&
    HPPM_POSTURE_AFFINITY_CATALOG.includes("none") &&
    VOLUME_06_HANDOFF_POSTURE_CLASSES.length === 2 &&
    FROZEN_HANDOFF_POSTURE_CLASSES.length === 3;

  return Object.freeze({
    integrityOk,
    soleAuthorityClassId: HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID,
    soleAuthorityClassCount: 1 as const,
    matrixActTypes: Object.freeze([...matrixTypes]) as readonly HgaMatrixActType[],
    matrixActTypeCount: 6 as const,
    operativeMatrixActTypes: Object.freeze([
      ...operative,
    ]) as readonly HgaMatrixActType[],
    catalogedDeferredMatrixActTypes: Object.freeze([
      ...deferred,
    ]) as readonly HgaMatrixActType[],
    hoemMatrixExpectations: Object.freeze([...HGA_MATRIX_ACT_TYPES]),
    peerNonMatrixHoemExpectation: HOEM_EXIT_BOUNDARY_ACT_TYPE,
    exitBoundaryIsSeventhMatrixType: false as const,
    rejectionForbiddenAsMatrix: true as const,
    hslmStateIds: Object.freeze([
      ...hslmIds,
    ]) as readonly HandoffActLayerLifecycleState[],
    hslmStateCount: 8 as const,
    hslmExcludesExitedAndAccepted: true as const,
    hccmConsumerClassIds: Object.freeze([...hccmIds]) as readonly HccmConsumerClassId[],
    hccmConsumerClassCount: 6 as const,
    hppmmAffinities: Object.freeze([...HPPM_POSTURE_AFFINITY_CATALOG]),
    noneAffinityIsNotThirdVolume06PostureClass: true as const,
    volume06PostureClassCount: 2 as const,
    prohibitedPerformerClasses: Object.freeze([
      ...PROHIBITED_HANDOFF_ACT_PERFORMER_CLASSES,
    ]),
    haamProhibitedAssigneesPreserved: Object.freeze([
      ...HAAM_PROHIBITED_HANDOFF_AUTHORIZATION_ASSIGNEES,
    ]),
    frozenHgaConstitutionalScopes: Object.freeze([...hgaScopes]),
    handoffLifecycleRejectionActAbsentFromHgaScopes: true as const,
    rejectHandoffActLayerUndefined: true as const,
    withdrawRecallApisNotProvided: false as const,
    withdrawGovernedHandoffMayBeProvided: true as const,
    recallApisNotProvided: true as const,
    suspendGovernedHandoffMayBeProvided: true as const,
    performHgaActFactoryNotProvided: true as const,
    catalogMembershipDoesNotCreateAuthority: true as const,
    catalogMembershipDoesNotAuthorize: true as const,
    catalogMembershipDoesNotBind: true as const,
    catalogMembershipDoesNotDeclare: true as const,
    catalogMembershipDoesNotComplete: true as const,
    catalogMembershipDoesNotExit: true as const,
    r66SoleHgaAndSixTypeMatrix: true as const,
    r67DistinctActTypeAttributionAndHoem: true as const,
    r68SingleHccmBindingNoMerge: true as const,
    r69ProhibitedPerformers: true as const,
    hofG6U1SharedFoundationEstablished: true as const,
    hofG6ActSpecificMechanicsDeferredToU3U4: false as const,
    hofG6RecallMechanicsDeferredToU4: true as const,
    hofG9CompletionThemesTranche3: true as const,
    traceability: HANDOFF_AUTHORITY_CATALOG_TRACEABILITY,
  });
}
