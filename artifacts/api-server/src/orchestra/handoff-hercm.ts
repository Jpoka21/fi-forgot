/**
 * HERCM — Handoff Re-entry & Resumption Category Model (FI-DSN-STD-015 R126–R139).
 *
 * Closed REC-01 through REC-05 (R127). Catalog membership does not mint a HERCM act,
 * and G11 export_ready authorizes consideration only, never the act itself (R128).
 *
 * Re-entry and resumption are HGA-performed HERCM acts. R140–R141 integrate them
 * into the eight-type HGA matrix without changing REC-01 through REC-05 semantics.
 * Catalog membership does not mint HERCM acts; minting remains resumeGovernedHandoff
 * / reenterGovernedHandoff. Nothing here may add a ninth matrix type.
 *
 * This module also supplies the HERCM-local mirror of the R75 shared precondition
 * categories and the R130 subject-scope check, so the HERCM assessors never have to
 * pass a fabricated matrix actType into the HOF-G6-U1 foundation helpers.
 */

import type {
  G6SharedPreconditionAssessment,
  HercmActKind,
  HercmCatalogIntegrityAssessment,
  HercmCategoryCatalogEntry,
  HercmCategoryId,
  HercmQualifyingPriorState,
  HercmReentryCategoryId,
  HercmResumptionCategoryId,
  ReentryConstitutionalBasisKind,
  ResumptionConstitutionalBasisKind,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import { FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES } from "./handoff-act-lifecycle.js";
import {
  assertNotProhibitedHandoffActPerformer,
  HGA_MATRIX_ACT_TYPES,
  isHgaMatrixActType,
} from "./handoff-authority-catalog.js";
import { HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID } from "./handoff-authority-boundaries.js";
import {
  assertEstablishedHandoffGovernanceAuthorityClass,
  FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES,
} from "./handoff-governance-authority.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HERCM_REQUIREMENTS = [
  "FI-DSN-STD-015-R126",
  "FI-DSN-STD-015-R127",
  "FI-DSN-STD-015-R128",
  "FI-DSN-STD-015-R129",
  "FI-DSN-STD-015-R130",
  "FI-DSN-STD-015-R131",
  "FI-DSN-STD-015-R132",
  "FI-DSN-STD-015-R133",
  "FI-DSN-STD-015-R134",
  "FI-DSN-STD-015-R135",
  "FI-DSN-STD-015-R136",
  "FI-DSN-STD-015-R137",
  "FI-DSN-STD-015-R138",
  "FI-DSN-STD-015-R139",
] as const satisfies readonly Std015RequirementId[];

export const GOVERNED_HANDOFF_HERCM_TRACEABILITY =
  createStd015GovernanceTraceability([...HERCM_REQUIREMENTS]);

export const HERCM_CATEGORY_IDS = Object.freeze([
  "REC-01",
  "REC-02",
  "REC-03",
  "REC-04",
  "REC-05",
] as const satisfies readonly HercmCategoryId[]);

export const HERCM_RESUMPTION_CATEGORY_IDS = Object.freeze([
  "REC-02",
] as const satisfies readonly HercmResumptionCategoryId[]);

export const HERCM_REENTRY_CATEGORY_IDS = Object.freeze([
  "REC-01",
  "REC-03",
  "REC-04",
  "REC-05",
] as const satisfies readonly HercmReentryCategoryId[]);

/** Invented labels that MUST NEVER join the HGA matrix (R137; R140–R141 eight-type close). */
export const HERCM_FORBIDDEN_MATRIX_ACT_LABELS = Object.freeze([
  "re_entry",
  "re-entry",
  "resume",
  "restoration",
  "restore",
  "reinstatement",
  "revival",
] as const);

/** Lawful R140–R141 matrix ids for HERCM acts. */
export const HERCM_MATRIX_ACT_TYPES = Object.freeze([
  "reentry",
  "resumption",
] as const);

/**
 * R127 / R131 — the closed HERCM category catalog.
 *
 * REC-02 is the sole resumption category: the suspension pause is lifted and forward
 * reliance resumes on the EXISTING authorization + posture chain (R132), so it requires
 * no export_ready anew and mints no authorization.
 *
 * REC-01/03/04/05 are re-entry categories: they return the binding toward
 * Eligible-for-consideration only and require a NEW G2 authorization afterward (R132).
 * REC-04 additionally requires a new posture path after the new authorization.
 */
export const HERCM_CATEGORY_CATALOG: readonly HercmCategoryCatalogEntry[] = Object.freeze([
  Object.freeze({
    categoryId: "REC-01" as const,
    actKind: "reentry" as const,
    qualifyingPriorState: "rejected" as const,
    basisKind: "rejection_grounds_constitutionally_addressable" as const,
    requiresExportReadyAnew: true,
    requiresNewAuthorizationViaG2: true,
    requiresNewPostureAfterNewAuthorization: false,
    isHgaMatrixActType: true as const,
    hgaConstitutionalScope: "handoff_reentry_act" as const,
    requirementIds: Object.freeze([
      "FI-DSN-STD-015-R127",
      "FI-DSN-STD-015-R128",
      "FI-DSN-STD-015-R131",
      "FI-DSN-STD-015-R132",
      "FI-DSN-STD-015-R133",
    ] as const),
  }),
  Object.freeze({
    categoryId: "REC-02" as const,
    actKind: "resumption" as const,
    qualifyingPriorState: "suspended" as const,
    basisKind: "suspension_grounds_constitutionally_cleared" as const,
    requiresExportReadyAnew: false,
    requiresNewAuthorizationViaG2: false,
    requiresNewPostureAfterNewAuthorization: false,
    isHgaMatrixActType: true as const,
    hgaConstitutionalScope: "handoff_resumption_act" as const,
    requirementIds: Object.freeze([
      "FI-DSN-STD-015-R127",
      "FI-DSN-STD-015-R131",
      "FI-DSN-STD-015-R132",
      "FI-DSN-STD-015-R133",
    ] as const),
  }),
  Object.freeze({
    categoryId: "REC-03" as const,
    actKind: "reentry" as const,
    qualifyingPriorState: "withdrawn" as const,
    basisKind: "g11_export_ready_and_entry_inputs_satisfied_anew" as const,
    requiresExportReadyAnew: true,
    requiresNewAuthorizationViaG2: true,
    requiresNewPostureAfterNewAuthorization: false,
    isHgaMatrixActType: true as const,
    hgaConstitutionalScope: "handoff_reentry_act" as const,
    requirementIds: Object.freeze([
      "FI-DSN-STD-015-R127",
      "FI-DSN-STD-015-R128",
      "FI-DSN-STD-015-R131",
      "FI-DSN-STD-015-R132",
      "FI-DSN-STD-015-R133",
    ] as const),
  }),
  Object.freeze({
    categoryId: "REC-04" as const,
    actKind: "reentry" as const,
    qualifyingPriorState: "recalled" as const,
    basisKind: "g11_export_ready_and_entry_inputs_satisfied_anew" as const,
    requiresExportReadyAnew: true,
    requiresNewAuthorizationViaG2: true,
    requiresNewPostureAfterNewAuthorization: true,
    isHgaMatrixActType: true as const,
    hgaConstitutionalScope: "handoff_reentry_act" as const,
    requirementIds: Object.freeze([
      "FI-DSN-STD-015-R127",
      "FI-DSN-STD-015-R128",
      "FI-DSN-STD-015-R131",
      "FI-DSN-STD-015-R132",
      "FI-DSN-STD-015-R133",
    ] as const),
  }),
  Object.freeze({
    categoryId: "REC-05" as const,
    actKind: "reentry" as const,
    qualifyingPriorState: "expired" as const,
    basisKind: "validity_or_time_boundary_addressed_upstream" as const,
    requiresExportReadyAnew: true,
    requiresNewAuthorizationViaG2: true,
    requiresNewPostureAfterNewAuthorization: false,
    isHgaMatrixActType: true as const,
    hgaConstitutionalScope: "handoff_reentry_act" as const,
    requirementIds: Object.freeze([
      "FI-DSN-STD-015-R127",
      "FI-DSN-STD-015-R128",
      "FI-DSN-STD-015-R131",
      "FI-DSN-STD-015-R132",
      "FI-DSN-STD-015-R133",
    ] as const),
  }),
]);

const CATEGORY_BY_ID = new Map(
  HERCM_CATEGORY_CATALOG.map((entry) => [entry.categoryId, entry]),
);

const RESUMPTION_BASIS_KINDS = new Set<string>([
  "suspension_grounds_constitutionally_cleared",
]);

const REENTRY_BASIS_KINDS = new Set<string>([
  "rejection_grounds_constitutionally_addressable",
  "g11_export_ready_and_entry_inputs_satisfied_anew",
  "validity_or_time_boundary_addressed_upstream",
]);

// ---------------------------------------------------------------------------
// R127 — closed category vocabulary
// ---------------------------------------------------------------------------

export function isHercmCategoryId(value: unknown): value is HercmCategoryId {
  return typeof value === "string" && CATEGORY_BY_ID.has(value as HercmCategoryId);
}

export function isHercmResumptionCategoryId(
  value: unknown,
): value is HercmResumptionCategoryId {
  return isHercmCategoryId(value) && CATEGORY_BY_ID.get(value)!.actKind === "resumption";
}

export function isHercmReentryCategoryId(
  value: unknown,
): value is HercmReentryCategoryId {
  return isHercmCategoryId(value) && CATEGORY_BY_ID.get(value)!.actKind === "reentry";
}

export function resolveHercmCategory(value: unknown): HercmCategoryCatalogEntry {
  if (!isHercmCategoryId(value)) {
    throw new OrchestraConstitutionalError(
      "HERCM category must be one of the closed REC-01 through REC-05 ids (R127)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R127"],
    );
  }
  return CATEGORY_BY_ID.get(value)!;
}

export function assertHercmCategoryId(
  value: unknown,
): asserts value is HercmCategoryId {
  resolveHercmCategory(value);
}

export function assertHercmResumptionCategoryId(
  value: unknown,
): asserts value is HercmResumptionCategoryId {
  if (!isHercmResumptionCategoryId(value)) {
    throw new OrchestraConstitutionalError(
      "Handoff resumption admits REC-02 only; REC-01/03/04/05 are re-entry categories (R127/R131)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R127", "FI-DSN-STD-015-R131"],
    );
  }
}

export function assertHercmReentryCategoryId(
  value: unknown,
): asserts value is HercmReentryCategoryId {
  if (!isHercmReentryCategoryId(value)) {
    throw new OrchestraConstitutionalError(
      "Handoff re-entry admits REC-01, REC-03, REC-04, or REC-05 only; REC-02 is resumption (R127/R131)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R127", "FI-DSN-STD-015-R131"],
    );
  }
}

/** Returns the closed category id, or null when the value is not in REC-01..REC-05. */
export function normalizeHercmCategoryId(value: unknown): HercmCategoryId | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return isHercmCategoryId(trimmed) ? trimmed : null;
}

export function resolveHercmQualifyingPriorState(
  categoryId: unknown,
): HercmQualifyingPriorState {
  return resolveHercmCategory(categoryId).qualifyingPriorState;
}

export function resolveHercmActKind(categoryId: unknown): HercmActKind {
  return resolveHercmCategory(categoryId).actKind;
}

// ---------------------------------------------------------------------------
// R131 — category basis kinds
// ---------------------------------------------------------------------------

export function isResumptionConstitutionalBasisKind(
  value: unknown,
): value is ResumptionConstitutionalBasisKind {
  return typeof value === "string" && RESUMPTION_BASIS_KINDS.has(value);
}

export function isReentryConstitutionalBasisKind(
  value: unknown,
): value is ReentryConstitutionalBasisKind {
  return typeof value === "string" && REENTRY_BASIS_KINDS.has(value);
}

export function assertResumptionConstitutionalBasisKind(
  value: unknown,
): asserts value is ResumptionConstitutionalBasisKind {
  if (!isResumptionConstitutionalBasisKind(value)) {
    throw new OrchestraConstitutionalError(
      "Handoff resumption requires the closed REC-02 basisKind suspension_grounds_constitutionally_cleared; free-text notes cannot be the sole basis (R131/R136)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R131", "FI-DSN-STD-015-R136"],
    );
  }
}

export function assertReentryConstitutionalBasisKind(
  value: unknown,
): asserts value is ReentryConstitutionalBasisKind {
  if (!isReentryConstitutionalBasisKind(value)) {
    throw new OrchestraConstitutionalError(
      "Handoff re-entry requires a closed HERCM basisKind; free-text notes cannot be the sole basis (R131/R136)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R131", "FI-DSN-STD-015-R136"],
    );
  }
}

export function resolveHercmBasisKindForCategory(
  categoryId: unknown,
): ResumptionConstitutionalBasisKind | ReentryConstitutionalBasisKind {
  return resolveHercmCategory(categoryId).basisKind;
}

/**
 * R131 — the basis kind is fixed per category; a category may not borrow another
 * category's basis (e.g. REC-03 may not claim cleared suspension grounds).
 */
export function assertHercmBasisKindMatchesCategory(
  categoryId: unknown,
  basisKind: unknown,
): void {
  const entry = resolveHercmCategory(categoryId);
  if (basisKind !== entry.basisKind) {
    throw new OrchestraConstitutionalError(
      `HERCM ${entry.categoryId} requires basisKind ${entry.basisKind}; borrowed or invented category bases are prohibited (R131)`,
      entry.actKind === "resumption"
        ? "invalid_handoff_resumption"
        : "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R131"],
    );
  }
}

// ---------------------------------------------------------------------------
// R140 — HERCM acts ARE matrix members; invented aliases remain forbidden
// ---------------------------------------------------------------------------

/**
 * Asserts that a lawful HERCM matrix id (`reentry` | `resumption`) is cataloged.
 * Catalog membership does not mint the act.
 */
export function assertHercmActIsHgaMatrixActType(value: unknown): void {
  if (typeof value !== "string" || !value.trim()) return;
  const lower = value.trim().toLowerCase();
  if ((HERCM_MATRIX_ACT_TYPES as readonly string[]).includes(lower) && !isHgaMatrixActType(lower)) {
    throw new OrchestraConstitutionalError(
      "HERCM reentry and resumption SHALL appear in the eight-type HGA matrix (R140/R141)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R140", "FI-DSN-STD-015-R141"],
    );
  }
}

/**
 * Fails closed when an invented restoration/alias label is treated as a matrix act type.
 * Lawful `reentry` and `resumption` ids are matrix members after R140 and are not rejected here.
 */
export function assertHercmActIsNotHgaMatrixActType(value: unknown): void {
  if (typeof value !== "string" || !value.trim()) return;
  const lower = value.trim().toLowerCase();
  if (
    (HERCM_FORBIDDEN_MATRIX_ACT_LABELS as readonly string[]).includes(lower) &&
    isHgaMatrixActType(lower)
  ) {
    throw new OrchestraConstitutionalError(
      "Invented restoration/reinstatement/revival labels MUST NOT appear in the HGA act-type matrix (R66/R140)",
      "invalid_handoff_authority_catalog",
      ["FI-DSN-STD-015-R66", "FI-DSN-STD-015-R140"],
    );
  }
}

/**
 * R126 / R70 — HERCM acts are performed by the established HGA class only.
 * Dedicated to HERCM so that no fabricated matrix actType is required.
 */
export function assertHgaSolePerformerForHercmAct(input: {
  readonly authorityClassId?: unknown;
  readonly performerClass?: unknown;
  readonly actKind: HercmActKind;
}): void {
  const code =
    input.actKind === "resumption"
      ? ("invalid_handoff_resumption" as const)
      : ("invalid_handoff_reentry" as const);

  if (input.authorityClassId === undefined) {
    throw new OrchestraConstitutionalError(
      "HERCM sole performer attribution requires established handoff_governance_authority class id (R70/R126)",
      code,
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R126"],
    );
  }
  try {
    assertEstablishedHandoffGovernanceAuthorityClass(input.authorityClassId);
  } catch (err) {
    if (err instanceof OrchestraConstitutionalError) {
      throw new OrchestraConstitutionalError(err.message, code, [
        "FI-DSN-STD-015-R70",
        "FI-DSN-STD-015-R126",
      ]);
    }
    throw err;
  }
  if (input.authorityClassId !== HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID) {
    throw new OrchestraConstitutionalError(
      "Only the established Handoff Governance Authority may perform HERCM resumption or re-entry acts (R70/R126)",
      code,
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R126"],
    );
  }
  if (input.performerClass !== undefined) {
    try {
      assertNotProhibitedHandoffActPerformer(input.performerClass);
    } catch (err) {
      if (err instanceof OrchestraConstitutionalError) {
        throw new OrchestraConstitutionalError(err.message, code, [
          "FI-DSN-STD-015-R69",
          "FI-DSN-STD-015-R126",
        ]);
      }
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------
// R130 — one HCCM binding; at most one authoritative posture chain
// ---------------------------------------------------------------------------

export interface HercmActSubjectScopeAssessment {
  readonly scopeOk: boolean;
  readonly denialReasons: readonly string[];
  readonly categoryId: HercmCategoryId | null;
  readonly bindingId: string | null;
  readonly singleHccmBoundContext: true;
  readonly atMostOneAuthoritativePostureChain: true;
  readonly r130SingleBindingPostureChain: true;
}

export function assessHercmActSubjectScope(input: {
  readonly hercmCategory: unknown;
  readonly bindingId?: unknown;
  readonly spansMultipleBindings?: unknown;
  readonly mergesPostureChains?: unknown;
  readonly silentCrossContextPropagation?: unknown;
  readonly foreignBinding?: unknown;
  readonly unattributedGpraPropagation?: unknown;
}): HercmActSubjectScopeAssessment {
  const denialReasons: string[] = [];
  const categoryId = normalizeHercmCategoryId(input.hercmCategory);
  if (!categoryId) {
    denialReasons.push("hercm_category_not_in_closed_catalog");
  }

  const bindingId =
    typeof input.bindingId === "string" && input.bindingId.trim()
      ? input.bindingId.trim()
      : null;
  if (!bindingId) {
    denialReasons.push("hccm_bound_context_required");
  }
  if (input.spansMultipleBindings === true) {
    denialReasons.push("multi_binding_span_denied");
  }
  if (input.mergesPostureChains === true) {
    denialReasons.push("merged_posture_chain_denied");
  }
  if (input.silentCrossContextPropagation === true) {
    denialReasons.push("silent_cross_context_propagation_denied");
  }
  if (input.foreignBinding === true) {
    denialReasons.push("foreign_binding_denied");
  }
  if (input.unattributedGpraPropagation === true) {
    denialReasons.push("unattributed_gpra_propagation_denied");
  }

  return Object.freeze({
    scopeOk: denialReasons.length === 0,
    denialReasons: Object.freeze([...denialReasons]),
    categoryId,
    bindingId,
    singleHccmBoundContext: true as const,
    atMostOneAuthoritativePostureChain: true as const,
    r130SingleBindingPostureChain: true as const,
  });
}

export function assertHercmActSubjectScope(input: {
  readonly hercmCategory: unknown;
  readonly bindingId?: unknown;
  readonly spansMultipleBindings?: unknown;
  readonly mergesPostureChains?: unknown;
  readonly silentCrossContextPropagation?: unknown;
  readonly foreignBinding?: unknown;
  readonly unattributedGpraPropagation?: unknown;
}): void {
  const assessment = assessHercmActSubjectScope(input);
  if (!assessment.scopeOk) {
    const actKind = assessment.categoryId
      ? resolveHercmCategory(assessment.categoryId).actKind
      : "reentry";
    throw new OrchestraConstitutionalError(
      `HERCM act subject scope denied: ${assessment.denialReasons.join(", ")} (R130)`,
      actKind === "resumption"
        ? "invalid_handoff_resumption"
        : "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R130"],
    );
  }
}

// ---------------------------------------------------------------------------
// R75 shared precondition categories, mirrored for peer NON-MATRIX HERCM acts
// ---------------------------------------------------------------------------

export type HercmSharedPreconditionAssessment = Omit<
  G6SharedPreconditionAssessment,
  | "actType"
  | "actSpecificTriggersDeferredToU2U3U4"
  | "traceability"
  | "r75SharedPreconditionCategories"
> & {
  readonly hercmCategory: HercmCategoryId | null;
  readonly actKind: HercmActKind | null;
  readonly r75SharedPreconditionCategories: true;
  readonly hercmActsAreHgaMatrixActTypes: true;
  readonly catalogMembershipDoesNotAuthorizeHercm: true;
};

/**
 * Mirrors the R75(a)–(e) categories for HERCM without treating catalog membership
 * as authorization. R140 catalog status is matrix; minting still does not route
 * through assertHgaMatrixActMayBePerformed.
 */
export function assessHercmSharedPreconditions(input: {
  readonly hercmCategory: unknown;
  readonly bindingId?: unknown;
  readonly hasPriorAuthorization?: unknown;
  readonly hasPriorPosture?: unknown;
  readonly hasLifecycleOperativeHistory?: unknown;
  readonly hccmBoundContextEstablished?: unknown;
  readonly authorityClassId?: unknown;
  readonly performerClass?: unknown;
  readonly traceableConstitutionalBasis?: unknown;
  readonly advisoryEvidenceAlone?: unknown;
  readonly implementationInferenceAlone?: unknown;
  readonly downstreamOperationalEventAlone?: unknown;
  readonly priorRecordsPreservedReconstructable?: unknown;
}): HercmSharedPreconditionAssessment {
  const denialReasons: string[] = [];
  const categoryId = normalizeHercmCategoryId(input.hercmCategory);
  if (!categoryId) {
    denialReasons.push("hercm_category_not_in_closed_catalog");
  }
  const actKind = categoryId ? resolveHercmCategory(categoryId).actKind : null;

  const bindingId =
    typeof input.bindingId === "string" && input.bindingId.trim()
      ? input.bindingId.trim()
      : null;

  const a =
    input.hasPriorAuthorization === true &&
    input.hasPriorPosture === true &&
    input.hasLifecycleOperativeHistory === true;
  if (!a) {
    denialReasons.push("valid_governed_handoff_target_incomplete");
  }

  const b =
    input.hccmBoundContextEstablished === true ||
    (bindingId !== null && input.hccmBoundContextEstablished !== false);
  if (!b || !bindingId) {
    denialReasons.push("hccm_bound_context_not_established");
  }

  let c = false;
  try {
    assertHgaSolePerformerForHercmAct({
      authorityClassId: input.authorityClassId,
      performerClass: input.performerClass,
      actKind: actKind ?? "reentry",
    });
    c = true;
  } catch {
    denialReasons.push("authorized_hga_performer_not_attributable");
  }

  const basisSubstituted =
    input.advisoryEvidenceAlone === true ||
    input.implementationInferenceAlone === true ||
    input.downstreamOperationalEventAlone === true;
  const d = input.traceableConstitutionalBasis === true && !basisSubstituted;
  if (!d) {
    denialReasons.push("traceable_constitutional_basis_missing_or_substituted");
  }

  const e = input.priorRecordsPreservedReconstructable !== false;
  if (!e) {
    denialReasons.push("prior_records_not_preserved_reconstructable");
  }

  return Object.freeze({
    sharedCategoriesSatisfied:
      denialReasons.length === 0 && categoryId !== null && bindingId !== null,
    denialReasons: Object.freeze([...denialReasons]),
    hercmCategory: categoryId,
    actKind,
    bindingId,
    categories: Object.freeze({
      a_validGovernedHandoffTarget: a,
      b_hccmBoundContextEstablished: Boolean(b && bindingId),
      c_authorizedHgaPerformerAttributable: c,
      d_traceableConstitutionalBasis: d,
      e_priorRecordsPreservedReconstructable: e,
    }),
    doesNotAuthorizeActMint: true as const,
    doesNotApplyActSpecificEffects: true as const,
    catalogMembershipDoesNotCreateAuthority: true as const,
    r75SharedPreconditionCategories: true as const,
    hercmActsAreHgaMatrixActTypes: true as const,
    catalogMembershipDoesNotAuthorizeHercm: true as const,
  });
}

// ---------------------------------------------------------------------------
// R128 / R129 — consideration-only eligibility; no automatic recovery
// ---------------------------------------------------------------------------

/**
 * R128 — G11 export_ready and eligibility authorize consideration of a HERCM act;
 * they never mint one. Callers pass their own claim flags.
 */
export function assertExportReadyDoesNotMintHercmAct(input: {
  readonly actKind: HercmActKind;
  readonly exportReadyAlone?: unknown;
  readonly eligibilityAlone?: unknown;
  readonly g11ExportReadyMintsReentry?: unknown;
  readonly g11ExportReadyMintsResumption?: unknown;
}): void {
  if (
    input.exportReadyAlone === true ||
    input.eligibilityAlone === true ||
    input.g11ExportReadyMintsReentry === true ||
    input.g11ExportReadyMintsResumption === true
  ) {
    throw new OrchestraConstitutionalError(
      "G11 export_ready and eligibility authorize HERCM consideration only; they do not mint a re-entry or resumption act (R128)",
      input.actKind === "resumption"
        ? "invalid_handoff_resumption"
        : "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R128"],
    );
  }
}

/**
 * R129 — HERCM is never automatic. Retry/recovery/inheritance claims fail closed.
 */
export function assertNoAutomaticHercmRecovery(
  actKind: HercmActKind,
  input?: Record<string, unknown>,
): void {
  if (!input) return;
  const forbidden = [
    "automaticRecovery",
    "automaticRetry",
    "autoResume",
    "autoReenter",
    "autoRestore",
    "defaultSystemRecovery",
    "implementationRemediation",
    "configurationLifecycleReversal",
    "downstreamAcceptanceReversal",
    "operationalIntakeReversal",
    "eligibilityExportRestoration",
    "automaticInheritanceReentry",
    "automaticInheritanceResumption",
    "inferredEligibilityReentry",
    "inferredEligibilityResumption",
  ] as const;
  for (const key of forbidden) {
    if (input[key] === true) {
      throw new OrchestraConstitutionalError(
        `HERCM acts MUST NOT be treated as automatic recovery via ${key} (R129)`,
        actKind === "resumption"
          ? "invalid_handoff_resumption"
          : "invalid_handoff_reentry",
        ["FI-DSN-STD-015-R129"],
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Frozen catalog integrity (read-only; no minting)
// ---------------------------------------------------------------------------

export function assessHercmCatalogIntegrity(): HercmCatalogIntegrityAssessment {
  const categoryIds = HERCM_CATEGORY_CATALOG.map((e) => e.categoryId);
  const resumptionIds = HERCM_CATEGORY_CATALOG.filter(
    (e) => e.actKind === "resumption",
  ).map((e) => e.categoryId as HercmResumptionCategoryId);
  const reentryIds = HERCM_CATEGORY_CATALOG.filter((e) => e.actKind === "reentry").map(
    (e) => e.categoryId as HercmReentryCategoryId,
  );

  const hgaScopes =
    FROZEN_ESTABLISHED_HANDOFF_GOVERNANCE_AUTHORITY_CLASSES[0]!
      .authorizedConstitutionalScopes;
  const hslmStateIds = FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES as readonly string[];

  const integrityOk =
    categoryIds.length === 5 &&
    resumptionIds.length === 1 &&
    resumptionIds[0] === "REC-02" &&
    reentryIds.length === 4 &&
    HERCM_CATEGORY_CATALOG.every((e) => e.isHgaMatrixActType === true) &&
    HERCM_CATEGORY_CATALOG.every(
      (e) => !(HGA_MATRIX_ACT_TYPES as readonly string[]).includes(e.categoryId),
    ) &&
    HGA_MATRIX_ACT_TYPES.length === 8 &&
    (HGA_MATRIX_ACT_TYPES as readonly string[]).includes("resumption") &&
    (HGA_MATRIX_ACT_TYPES as readonly string[]).includes("reentry") &&
    hgaScopes.includes("handoff_resumption_act") &&
    hgaScopes.includes("handoff_reentry_act") &&
    hslmStateIds.length === 8 &&
    !hslmStateIds.includes("reentered") &&
    !hslmStateIds.includes("resumed") &&
    // R132 — REC-02 keeps its authorization; every re-entry category needs a new one.
    HERCM_CATEGORY_CATALOG.every((e) =>
      e.actKind === "resumption"
        ? e.requiresNewAuthorizationViaG2 === false && e.requiresExportReadyAnew === false
        : e.requiresNewAuthorizationViaG2 === true && e.requiresExportReadyAnew === true,
    ) &&
    HERCM_CATEGORY_CATALOG.filter(
      (e) => e.requiresNewPostureAfterNewAuthorization,
    ).every((e) => e.categoryId === "REC-04");

  return Object.freeze({
    integrityOk,
    categoryIds: Object.freeze([...categoryIds]) as readonly HercmCategoryId[],
    categoryCount: 5 as const,
    resumptionCategoryIds: Object.freeze([
      ...resumptionIds,
    ]) as readonly HercmResumptionCategoryId[],
    reentryCategoryIds: Object.freeze([
      ...reentryIds,
    ]) as readonly HercmReentryCategoryId[],
    hgaMatrixActTypeCount: 8 as const,
    hercmActsAreMatrixActTypes: true as const,
    hercmConstitutionalScopesPresent: true as const,
    hslmStateCount: 8 as const,
    noReenteredHslmState: true as const,
    noResumedHslmState: true as const,
    catalogMembershipDoesNotCreateAuthority: true as const,
    catalogMembershipDoesNotReenter: true as const,
    catalogMembershipDoesNotResume: true as const,
    exportReadyAloneDoesNotReenterOrResume: true as const,
    noAutomaticRecovery: true as const,
    r126ThroughR139: true as const,
    r140R141Complete: true as const,
    r142PlusDeferred: true as const,
    traceability: GOVERNED_HANDOFF_HERCM_TRACEABILITY,
  });
}
