/**
 * Governed Handoff HOF-G6-U1 Shared Operative Foundation — FI-DSN-STD-015 R70–R83.
 *
 * Shared machinery consumed by HOF-G6-U2 (suspension), U3 (withdrawal), U4 (recall).
 * Does NOT mint suspension / withdrawal / recall acts.
 * Does NOT implement act-specific triggers or effect mechanics (R84+ / U2–U4).
 * Does NOT implement HERCM re-entry, resumption, restoration, or expiry acts.
 * Does NOT create a generic performHgaAct / mintHgaAct factory.
 * Does NOT invent rejection or exit HGA matrix acts.
 *
 * Catalog membership and shared-precondition satisfaction ≠ constitutional mint authority.
 */

import type {
  G6LifecycleActSubjectScopeAssessment,
  G6LifecycleMatrixActType,
  G6SharedEffectFramingKind,
  G6SharedPreconditionAssessment,
  HofG6U1SharedLifecycleFoundationAssessment,
} from "./domain3-types.js";
import { OrchestraConstitutionalError } from "./errors.js";
import {
  assertFrozenHandoffActLayerLifecycleState,
  FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES,
} from "./handoff-act-lifecycle.js";
import {
  assertHgaMatrixActMayBePerformed,
  assertNotProhibitedHandoffActPerformer,
  HGA_MATRIX_ACT_TYPES,
  isHgaMatrixActType,
  resolveHgaMatrixActType,
} from "./handoff-authority-catalog.js";
import { HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID } from "./handoff-authority-boundaries.js";
import { assertEstablishedHandoffGovernanceAuthorityClass } from "./handoff-governance-authority.js";
import {
  createStd015GovernanceTraceability,
  type Std015RequirementId,
} from "./std015-authority.js";

const HOF_G6_U1_REQUIREMENTS = [
  "FI-DSN-STD-015-R70",
  "FI-DSN-STD-015-R71",
  "FI-DSN-STD-015-R72",
  "FI-DSN-STD-015-R73",
  "FI-DSN-STD-015-R74",
  "FI-DSN-STD-015-R75",
  "FI-DSN-STD-015-R76",
  "FI-DSN-STD-015-R77",
  "FI-DSN-STD-015-R78",
  "FI-DSN-STD-015-R79",
  "FI-DSN-STD-015-R80",
  "FI-DSN-STD-015-R81",
  "FI-DSN-STD-015-R82",
  "FI-DSN-STD-015-R83",
] as const satisfies readonly Std015RequirementId[];

export const HANDOFF_LIFECYCLE_G6_U1_FOUNDATION_TRACEABILITY =
  createStd015GovernanceTraceability([...HOF_G6_U1_REQUIREMENTS]);

export const G6_LIFECYCLE_MATRIX_ACT_TYPES = [
  "suspension",
  "withdrawal",
  "recall",
] as const satisfies readonly G6LifecycleMatrixActType[];

const G6_ACT_SET = new Set<string>(G6_LIFECYCLE_MATRIX_ACT_TYPES);

/** R76 peer-distinct shared effect framings — framing only; effects deferred to U2–U4. */
export const G6_SHARED_EFFECT_FRAMING_BY_ACT = Object.freeze({
  suspension: "temporary_forward_reliance_pause",
  withdrawal: "hga_initiated_retraction",
  recall: "responsive_forward_reliance_termination",
} as const satisfies Record<G6LifecycleMatrixActType, G6SharedEffectFramingKind>);

/** HSLM denotations corresponding to G6 acts — not automatic promotions (R74). */
export const G6_ACT_TO_HSLM_DENOTATION = Object.freeze({
  suspension: "suspended",
  withdrawal: "withdrawn",
  recall: "recalled",
} as const);

/** Reserved HOEM expectation ids per act type (R78) — minting deferred to U2–U4. */
export const G6_HOEM_EXPECTATION_BY_ACT = Object.freeze({
  suspension: "suspension",
  withdrawal: "withdrawal",
  recall: "recall",
} as const satisfies Record<G6LifecycleMatrixActType, G6LifecycleMatrixActType>);

export const G6_FORBIDDEN_GENERIC_FACTORY_NAMES = Object.freeze([
  "performHgaAct",
  "mintHgaAct",
  "createLifecycleAct",
  "performG6LifecycleAct",
  "mintG6LifecycleAct",
] as const);

export const G6_FORBIDDEN_MINT_API_NAMES = Object.freeze([
  "suspendHandoff",
  "withdrawHandoff",
  "recallHandoff",
  "suspendGovernedHandoff",
  "withdrawGovernedHandoff",
  "recallGovernedHandoff",
  "suspendHandoffAct",
  "withdrawHandoffAct",
  "recallHandoffAct",
] as const);

export const G6_DEFERRED_RESTORATION_API_NAMES = Object.freeze([
  "restoreHandoff",
  "resumeHandoff",
  "reenterHandoff",
  "reinstateHandoff",
  "reviveHandoff",
  "expireHandoff",
] as const);

const FORBIDDEN_REWRITE_KEYS = Object.freeze([
  "overwriteAuthorization",
  "erasePosture",
  "rewriteCompletion",
  "mergeLifecycleHistory",
  "replacePriorHoem",
  "historicalRewrite",
  "retroactiveErasure",
] as const);

const FORBIDDEN_RETRY_RECOVERY_KEYS = Object.freeze([
  "automaticRetry",
  "defaultSystemRecovery",
  "implementationRemediation",
  "configurationLifecycleReversal",
  "downstreamAcceptanceReversal",
  "operationalIntakeReversal",
  "eligibilityExportRestoration",
  "autoExpireSuspension",
  "autoRestore",
] as const);

const FORBIDDEN_AUTHORITY_ABSORPTION_KEYS = Object.freeze([
  "establishHga",
  "createHccmBinding",
  "alterHccmBinding",
  "establishHppmPosture",
  "performHercmReentry",
  "performResumption",
  "establishGpraInvalidated",
  "establishGpraSuperseded",
  "redefineHoemOwnership",
  "rewriteHrwmFacts",
] as const);

// ---------------------------------------------------------------------------
// Type guards / resolve
// ---------------------------------------------------------------------------

export function isG6LifecycleMatrixActType(
  value: unknown,
): value is G6LifecycleMatrixActType {
  return typeof value === "string" && G6_ACT_SET.has(value);
}

export function assertG6LifecycleMatrixActType(
  value: unknown,
): asserts value is G6LifecycleMatrixActType {
  if (!isG6LifecycleMatrixActType(value)) {
    throw new OrchestraConstitutionalError(
      "Value is not a peer-distinct HOF-G6 lifecycle matrix act type (suspension|withdrawal|recall) (R70/R71)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R71"],
    );
  }
}

export function resolveG6SharedEffectFraming(
  actType: unknown,
): G6SharedEffectFramingKind {
  assertG6LifecycleMatrixActType(actType);
  return G6_SHARED_EFFECT_FRAMING_BY_ACT[actType];
}

// ---------------------------------------------------------------------------
// R70 — HGA sole performer
// ---------------------------------------------------------------------------

export function assertHgaSolePerformerForG6LifecycleAct(input: {
  readonly authorityClassId?: unknown;
  readonly performerClass?: unknown;
  readonly actType?: unknown;
}): void {
  if (input.actType !== undefined) {
    assertG6LifecycleMatrixActType(input.actType);
  }

  if (input.authorityClassId !== undefined) {
    assertEstablishedHandoffGovernanceAuthorityClass(input.authorityClassId);
    if (input.authorityClassId !== HANDOFF_GOVERNANCE_AUTHORITY_CLASS_ID) {
      throw new OrchestraConstitutionalError(
        "Only Handoff Governance Authority (HGA) may perform suspension, withdrawal, or recall operative acts (R70)",
        "invalid_handoff_g6_lifecycle_foundation",
        ["FI-DSN-STD-015-R70"],
      );
    }
  }

  if (input.performerClass !== undefined) {
    assertNotProhibitedHandoffActPerformer(input.performerClass);
  }

  if (
    input.authorityClassId === undefined &&
    input.performerClass === undefined
  ) {
    throw new OrchestraConstitutionalError(
      "HGA sole performer attribution is required for G6 lifecycle acts (R70)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R70"],
    );
  }
}

export function assertBrainCannotPerformG6LifecycleAct(): never {
  throw new OrchestraConstitutionalError(
    "Brain remains advisory only and MUST NOT suspend, withdraw, recall, restore, resume, or reenter Handoff (R70/R69/R81)",
    "invalid_handoff_g6_lifecycle_foundation",
    ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R69", "FI-DSN-STD-015-R81"],
  );
}

// ---------------------------------------------------------------------------
// R71 — peer-distinct; no generic collapse
// ---------------------------------------------------------------------------

export function assertG6LifecycleActsRemainPeerDistinct(input: {
  readonly actType?: unknown;
  readonly collapsedActTypes?: unknown;
  readonly genericLifecycleAction?: unknown;
  readonly combinedOperativeRecordClass?: unknown;
}): void {
  if (input.collapsedActTypes === true || input.genericLifecycleAction === true) {
    throw new OrchestraConstitutionalError(
      "Suspension, withdrawal, and recall MUST remain peer-distinct; generic lifecycle collapse is prohibited (R71)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R71"],
    );
  }
  if (input.combinedOperativeRecordClass === true) {
    throw new OrchestraConstitutionalError(
      "Combined undifferentiated operative record class for suspension/withdrawal/recall is prohibited (R71/R78)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R71", "FI-DSN-STD-015-R78"],
    );
  }
  if (input.actType !== undefined) {
    assertG6LifecycleMatrixActType(input.actType);
  }
}

export function refuseGenericHgaLifecycleFactory(factoryName?: unknown): never {
  const name =
    typeof factoryName === "string" && factoryName.trim()
      ? factoryName.trim()
      : "performHgaAct";
  throw new OrchestraConstitutionalError(
    `Generic HGA lifecycle factory ${name} is prohibited; HOF-G6-U1 does not authorize undifferentiated act minting (R71)`,
    "invalid_handoff_g6_lifecycle_foundation",
    ["FI-DSN-STD-015-R71"],
  );
}

// ---------------------------------------------------------------------------
// R72 / R73 — one binding; no silent cross-context propagation
// ---------------------------------------------------------------------------

export function assessG6LifecycleActSubjectScope(input: {
  readonly actType: unknown;
  readonly bindingId?: unknown;
  readonly spansMultipleBindings?: unknown;
  readonly mergesPostureChains?: unknown;
  readonly silentCrossContextPropagation?: unknown;
  readonly foreignBinding?: unknown;
  readonly unattributedGpraPropagation?: unknown;
}): G6LifecycleActSubjectScopeAssessment {
  const denialReasons: string[] = [];
  let actType: G6LifecycleMatrixActType | null = null;

  try {
    assertG6LifecycleMatrixActType(input.actType);
    actType = input.actType;
  } catch {
    denialReasons.push("act_type_not_g6_lifecycle_matrix");
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
    scopeOk: denialReasons.length === 0 && actType !== null && bindingId !== null,
    denialReasons: Object.freeze([...denialReasons]),
    actType,
    bindingId,
    singleHccmBoundContext: true as const,
    atMostOneAuthoritativePostureChain: true as const,
    noMultiContextSpan: true as const,
    noSilentCrossContextPropagation: true as const,
    r72R73ScopeRules: true as const,
    traceability: HANDOFF_LIFECYCLE_G6_U1_FOUNDATION_TRACEABILITY,
  });
}

export function assertG6LifecycleActSubjectScope(input: {
  readonly actType: unknown;
  readonly bindingId?: unknown;
  readonly spansMultipleBindings?: unknown;
  readonly mergesPostureChains?: unknown;
  readonly silentCrossContextPropagation?: unknown;
  readonly foreignBinding?: unknown;
  readonly unattributedGpraPropagation?: unknown;
}): void {
  const assessment = assessG6LifecycleActSubjectScope(input);
  if (!assessment.scopeOk) {
    throw new OrchestraConstitutionalError(
      `G6 lifecycle act subject scope denied: ${assessment.denialReasons.join(", ")} (R72/R73)`,
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R72", "FI-DSN-STD-015-R73"],
    );
  }
}

// ---------------------------------------------------------------------------
// R74 — act performance ≠ HSLM state attribution
// ---------------------------------------------------------------------------

export function assertG6ActDistinctFromHslmState(input: {
  readonly actType?: unknown;
  readonly hslmState?: unknown;
  readonly treatStateAsAct?: unknown;
  readonly automaticStatePromotionFromAct?: unknown;
}): void {
  if (input.treatStateAsAct === true) {
    throw new OrchestraConstitutionalError(
      "Baseline HSLM Suspended/Withdrawn/Recalled attribution MUST NOT substitute for G6 operative acts (R74)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R74"],
    );
  }
  if (input.automaticStatePromotionFromAct === true) {
    throw new OrchestraConstitutionalError(
      "G6 operative acts MUST NOT be treated as automatic HSLM state promotion absent attributable act performance and additive record discipline (R74)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R74"],
    );
  }
  if (input.actType !== undefined) {
    assertG6LifecycleMatrixActType(input.actType);
  }
  if (input.hslmState !== undefined) {
    assertFrozenHandoffActLayerLifecycleState(input.hslmState);
  }
}

// ---------------------------------------------------------------------------
// R75 — shared precondition categories (triggers deferred)
// ---------------------------------------------------------------------------

export function assessG6SharedPreconditions(input: {
  readonly actType: unknown;
  readonly bindingId?: unknown;
  readonly hasPriorAuthorization?: unknown;
  readonly hasPriorPosture?: unknown;
  readonly hasLifecycleOperativeHistory?: unknown;
  readonly hccmBoundContextEstablished?: unknown;
  readonly hgaPerformerAttributable?: unknown;
  readonly authorityClassId?: unknown;
  readonly performerClass?: unknown;
  readonly traceableConstitutionalBasis?: unknown;
  readonly advisoryEvidenceAlone?: unknown;
  readonly implementationInferenceAlone?: unknown;
  readonly downstreamOperationalEventAlone?: unknown;
  readonly priorRecordsPreservedReconstructable?: unknown;
}): G6SharedPreconditionAssessment {
  const denialReasons: string[] = [];
  let actType: G6LifecycleMatrixActType | null = null;

  try {
    assertG6LifecycleMatrixActType(input.actType);
    actType = input.actType;
  } catch {
    denialReasons.push("act_type_not_g6_lifecycle_matrix");
  }

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

  let c = input.hgaPerformerAttributable === true;
  try {
    if (input.authorityClassId !== undefined || input.performerClass !== undefined) {
      assertHgaSolePerformerForG6LifecycleAct({
        authorityClassId: input.authorityClassId,
        performerClass: input.performerClass,
        actType: actType ?? undefined,
      });
      c = true;
    }
  } catch {
    c = false;
    denialReasons.push("authorized_hga_performer_not_attributable");
  }
  if (!c) {
    if (!denialReasons.includes("authorized_hga_performer_not_attributable")) {
      denialReasons.push("authorized_hga_performer_not_attributable");
    }
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
  if (input.priorRecordsPreservedReconstructable === false) {
    denialReasons.push("prior_records_not_preserved_reconstructable");
  }

  return Object.freeze({
    sharedCategoriesSatisfied:
      denialReasons.length === 0 && actType !== null && bindingId !== null,
    denialReasons: Object.freeze([...denialReasons]),
    actType,
    bindingId,
    categories: Object.freeze({
      a_validGovernedHandoffTarget: a,
      b_hccmBoundContextEstablished: Boolean(b && bindingId),
      c_authorizedHgaPerformerAttributable: c,
      d_traceableConstitutionalBasis: d,
      e_priorRecordsPreservedReconstructable: e,
    }),
    actSpecificTriggersDeferredToU2U3U4: true as const,
    doesNotAuthorizeActMint: true as const,
    doesNotApplyActSpecificEffects: true as const,
    catalogMembershipDoesNotCreateAuthority: true as const,
    r75SharedPreconditionCategories: true as const,
    traceability: HANDOFF_LIFECYCLE_G6_U1_FOUNDATION_TRACEABILITY,
  });
}

// ---------------------------------------------------------------------------
// R77 / R79 / R83 — additive preservation; no rewrite
// ---------------------------------------------------------------------------

export function assertG6AdditivePreservationNoRewrite(input?: {
  readonly rewriteAttempt?: unknown;
  readonly erasePriorHistory?: unknown;
  readonly overwriteUpstream?: unknown;
  readonly mergeReplacementRecord?: unknown;
}): void {
  if (
    input?.rewriteAttempt === true ||
    input?.erasePriorHistory === true ||
    input?.overwriteUpstream === true ||
    input?.mergeReplacementRecord === true
  ) {
    throw new OrchestraConstitutionalError(
      "G6 lifecycle acts MUST record additively and MUST NOT erase, overwrite, merge, or rewrite prior Handoff constitutional history (R77/R83)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R77", "FI-DSN-STD-015-R83"],
    );
  }
  if (input && typeof input === "object") {
    for (const key of FORBIDDEN_REWRITE_KEYS) {
      if ((input as Record<string, unknown>)[key] === true) {
        throw new OrchestraConstitutionalError(
          `G6 foundation prohibits historical rewrite key ${key} (R77/R83)`,
          "invalid_handoff_g6_lifecycle_foundation",
          ["FI-DSN-STD-015-R77", "FI-DSN-STD-015-R83"],
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// R78 — HOEM per act type (model only; mint deferred)
// ---------------------------------------------------------------------------

export function assertG6HoemExpectationSeparatePerActType(input: {
  readonly actType: unknown;
  readonly mergedWithAuthorization?: unknown;
  readonly mergedWithPosture?: unknown;
  readonly mergedWithCompletion?: unknown;
  readonly mergedWithLifecycleState?: unknown;
  readonly mergedWithExitBoundary?: unknown;
  readonly mergedWithReentry?: unknown;
  readonly collapsedHoemRecord?: unknown;
}): void {
  assertG6LifecycleMatrixActType(input.actType);
  if (
    input.mergedWithAuthorization === true ||
    input.mergedWithPosture === true ||
    input.mergedWithCompletion === true ||
    input.mergedWithLifecycleState === true ||
    input.mergedWithExitBoundary === true ||
    input.mergedWithReentry === true ||
    input.collapsedHoemRecord === true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM operative records for suspension, withdrawal, and recall MUST remain separate per act type (R78)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R78"],
    );
  }
}

// ---------------------------------------------------------------------------
// R80 — no peer authority absorption
// ---------------------------------------------------------------------------

export function assertG6DoesNotAbsorbPeerAuthority(input?: Record<string, unknown>): void {
  if (!input) return;
  for (const key of FORBIDDEN_AUTHORITY_ABSORPTION_KEYS) {
    if (input[key] === true) {
      throw new OrchestraConstitutionalError(
        `HOF-G6-U1 MUST NOT absorb peer authority via ${key} (R80)`,
        "invalid_handoff_g6_lifecycle_foundation",
        ["FI-DSN-STD-015-R80"],
      );
    }
  }
}

// ---------------------------------------------------------------------------
// R81 / R82 — no re-entry / resumption / automatic retry
// ---------------------------------------------------------------------------

export function assertG6ActDoesNotAuthorizeReentryOrResumption(input?: {
  readonly authorizeReentry?: unknown;
  readonly authorizeResumption?: unknown;
  readonly restoreEligibility?: unknown;
  readonly returnToAuthorized?: unknown;
  readonly returnToEligible?: unknown;
}): void {
  if (
    input?.authorizeReentry === true ||
    input?.authorizeResumption === true ||
    input?.restoreEligibility === true ||
    input?.returnToAuthorized === true ||
    input?.returnToEligible === true
  ) {
    throw new OrchestraConstitutionalError(
      "G6 suspension/withdrawal/recall acts MUST NOT by themselves authorize HERCM re-entry, resumption, or eligibility restoration (R81)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R81"],
    );
  }
}

export function assertG6ActIsNotAutomaticRetryOrRecovery(input?: Record<string, unknown>): void {
  if (!input) return;
  for (const key of FORBIDDEN_RETRY_RECOVERY_KEYS) {
    if (input[key] === true) {
      throw new OrchestraConstitutionalError(
        `G6 acts MUST NOT be treated as automatic retry/recovery via ${key} (R82)`,
        "invalid_handoff_g6_lifecycle_foundation",
        ["FI-DSN-STD-015-R82"],
      );
    }
  }
}

export function refuseG6RestorationResumptionReentry(apiName?: unknown): never {
  const name =
    typeof apiName === "string" && apiName.trim() ? apiName.trim() : "restoreHandoff";
  throw new OrchestraConstitutionalError(
    `${name} remains deferred; HOF-G6-U1 does not authorize restoration, resumption, or re-entry (R81/R82)`,
    "invalid_handoff_g6_lifecycle_foundation",
    ["FI-DSN-STD-015-R81", "FI-DSN-STD-015-R82"],
  );
}

// ---------------------------------------------------------------------------
// Performance deferred — no public mint (U2–U4)
// ---------------------------------------------------------------------------

/**
 * Shared foundation ≠ performability. Always refuses mint attempts in U1.
 * Catalog gate remains authoritative for deferred matrix status.
 */
export function assertG6LifecycleActPerformanceDeferred(actType: unknown): never {
  assertG6LifecycleMatrixActType(actType);
  // Catalog status gate (still cataloged_deferred).
  try {
    assertHgaMatrixActMayBePerformed(actType);
  } catch (err) {
    if (err instanceof OrchestraConstitutionalError) {
      throw new OrchestraConstitutionalError(
        `HOF-G6-U1 shared foundation does not authorize ${actType} act minting; act-specific mechanics remain HOF-G6-U2/U3/U4 (R70–R83; R84+)`,
        "invalid_handoff_g6_lifecycle_foundation",
        [
          "FI-DSN-STD-015-R70",
          "FI-DSN-STD-015-R75",
          "FI-DSN-STD-015-R76",
          "FI-DSN-STD-015-R69",
        ],
      );
    }
    throw err;
  }
  // Defensive: if catalog ever flipped operative without U2 wiring, still refuse U1 mint.
  throw new OrchestraConstitutionalError(
    `HOF-G6-U1 shared foundation does not authorize ${actType} act minting; act-specific mechanics remain HOF-G6-U2/U3/U4 (R70–R83; R84+)`,
    "invalid_handoff_g6_lifecycle_foundation",
    ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R75", "FI-DSN-STD-015-R76"],
  );
}

export function refuseSuspendGovernedHandoff(): never {
  return assertG6LifecycleActPerformanceDeferred("suspension");
}

export function refuseWithdrawGovernedHandoff(): never {
  return assertG6LifecycleActPerformanceDeferred("withdrawal");
}

export function refuseRecallGovernedHandoff(): never {
  return assertG6LifecycleActPerformanceDeferred("recall");
}

/**
 * Fail-closed trusted rehydration gate for purported G6 act artifacts.
 * U1 mints none; forged / premature records MUST NOT regain forward authority.
 */
export function rejectForgedOrPrematureG6LifecycleActRehydration(input: {
  readonly purportedActType?: unknown;
  readonly purportedHoemActType?: unknown;
  readonly purportedHslmStateAsAct?: unknown;
  readonly forgedAuthorityClass?: unknown;
  readonly forgedScope?: unknown;
  readonly forgedBinding?: unknown;
  readonly forgedLineage?: unknown;
  readonly forgedTimestamp?: unknown;
  readonly forgedPredecessor?: unknown;
  readonly restorationFieldPresent?: unknown;
  readonly reentryFieldPresent?: unknown;
  readonly expiryFieldPresent?: unknown;
  readonly acceptanceFieldPresent?: unknown;
  readonly executionFieldPresent?: unknown;
}): never {
  if (
    isG6LifecycleMatrixActType(input.purportedActType) ||
    isG6LifecycleMatrixActType(input.purportedHoemActType)
  ) {
    throw new OrchestraConstitutionalError(
      "Purported suspension/withdrawal/recall act or HOEM record cannot be rehydrated as operative under HOF-G6-U1; act minting remains U2–U4 (R70–R83)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R77", "FI-DSN-STD-015-R78"],
    );
  }
  if (input.purportedHslmStateAsAct === true) {
    throw new OrchestraConstitutionalError(
      "HSLM Suspended/Withdrawn/Recalled denotation MUST NOT rehydrate as a G6 operative act (R74)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R74"],
    );
  }
  if (
    input.forgedAuthorityClass === true ||
    input.forgedScope === true ||
    input.forgedBinding === true ||
    input.forgedLineage === true ||
    input.forgedTimestamp === true ||
    input.forgedPredecessor === true ||
    input.restorationFieldPresent === true ||
    input.reentryFieldPresent === true ||
    input.expiryFieldPresent === true ||
    input.acceptanceFieldPresent === true ||
    input.executionFieldPresent === true
  ) {
    throw new OrchestraConstitutionalError(
      "Forged or premature G6 lifecycle fields fail closed under HOF-G6-U1; no normalize/repair (R77/R79/R83)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R77", "FI-DSN-STD-015-R79", "FI-DSN-STD-015-R83"],
    );
  }
  throw new OrchestraConstitutionalError(
    "No operative G6 lifecycle act artifacts exist under HOF-G6-U1; rehydration refuses closed (R70–R83)",
    "invalid_handoff_g6_lifecycle_foundation",
    ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R78"],
  );
}

export function assertR84PlusUnavailable(claim?: unknown): void {
  if (claim === true || claim === "r84" || claim === "suspension_operative_mechanics") {
    throw new OrchestraConstitutionalError(
      "HOF-G6-U2 suspension operative mechanics (R84+) remain unavailable in this sprint (R70–R83 boundary)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R76", "FI-DSN-STD-015-R75"],
    );
  }
}

// ---------------------------------------------------------------------------
// Invented acts still forbidden
// ---------------------------------------------------------------------------

export function assertNoInventedRejectionOrExitG6Act(actType: unknown): void {
  if (
    typeof actType === "string" &&
    (actType === "rejection" ||
      actType === "handoff_lifecycle_rejection_act" ||
      actType === "exit" ||
      actType === "exit_boundary" ||
      actType === "handoff_exit_act")
  ) {
    throw new OrchestraConstitutionalError(
      "Invented rejection or exit HGA matrix acts remain prohibited; G6 foundation does not create them (R66/R71)",
      "invalid_handoff_g6_lifecycle_foundation",
      ["FI-DSN-STD-015-R71", "FI-DSN-STD-015-R66"],
    );
  }
}

// ---------------------------------------------------------------------------
// Integrity assessment
// ---------------------------------------------------------------------------

export function assessHofG6U1SharedLifecycleFoundation(): HofG6U1SharedLifecycleFoundationAssessment {
  const deferredStillDeferred = G6_LIFECYCLE_MATRIX_ACT_TYPES.every((t) => {
    const entry = resolveHgaMatrixActType(t);
    return entry.operativeStatus === "cataloged_deferred";
  });

  const matrixStillSix = HGA_MATRIX_ACT_TYPES.length === 6;
  const hslmEight = FROZEN_HANDOFF_ACT_LAYER_LIFECYCLE_STATES.length === 8;

  const integrityOk =
    deferredStillDeferred &&
    matrixStillSix &&
    hslmEight &&
    G6_LIFECYCLE_MATRIX_ACT_TYPES.length === 3 &&
    G6_SHARED_EFFECT_FRAMING_BY_ACT.suspension ===
      "temporary_forward_reliance_pause" &&
    G6_SHARED_EFFECT_FRAMING_BY_ACT.withdrawal === "hga_initiated_retraction" &&
    G6_SHARED_EFFECT_FRAMING_BY_ACT.recall ===
      "responsive_forward_reliance_termination";

  return Object.freeze({
    integrityOk,
    g6LifecycleActTypes: Object.freeze([...G6_LIFECYCLE_MATRIX_ACT_TYPES]),
    g6LifecycleActTypeCount: 3 as const,
    peerDistinctActsPreserved: true as const,
    noGenericLifecycleAction: true as const,
    hgaSolePerformerForG6Acts: true as const,
    actPerformanceDistinctFromHslmState: true as const,
    sharedPreconditionCategoriesDefined: true as const,
    actSpecificTriggersDeferred: true as const,
    sharedEffectFramingsDefined: true as const,
    actSpecificEffectMechanicsDeferred: true as const,
    additiveHoemModelPerActType: true as const,
    additivePreservationRequired: true as const,
    noHistoricalRewrite: true as const,
    noPeerAuthorityAbsorption: true as const,
    noImpliedReentryOrResumption: true as const,
    noAutomaticRetryOrRecovery: true as const,
    suspendWithdrawRecallMintApisAbsent: true as const,
    performHgaActFactoryAbsent: true as const,
    rejectionActAbsent: true as const,
    exitHgaMatrixActAbsent: true as const,
    hslmEightStatesPreserved: true as const,
    restorationResumptionReentryDeferred: true as const,
    r84PlusUnavailable: true as const,
    r70ThroughR83: true as const,
    traceability: HANDOFF_LIFECYCLE_G6_U1_FOUNDATION_TRACEABILITY,
  });
}

/** Narrow helper: matrix membership alone never authorizes G6 performance. */
export function catalogMembershipDoesNotAuthorizeG6Performance(
  actType: unknown,
): boolean {
  if (!isHgaMatrixActType(actType) || !isG6LifecycleMatrixActType(actType)) {
    return true;
  }
  return resolveHgaMatrixActType(actType).operativeStatus !== "operative";
}
