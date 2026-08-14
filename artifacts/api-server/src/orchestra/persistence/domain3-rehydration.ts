/**
 * Safe rehydration for Domain 3 persisted state — validate, clone, deep-freeze.
 *
 * G6 Approval / withholding / GPRA require joint persisted constitutional
 * coherence (ORCH-IMP-010.2). Structural field shape alone is insufficient.
 * G7 downstream disposition likewise requires joint Review/Determination coherence.
 * G8 GPRA invalidation requires GPRA + Approval + Review joint coherence.
 * G9 GPRA supersession requires predecessor + successor GPRA / Approval / Review joint coherence.
 * G10 Brain advisories require BRPAM markers and Review/RVA/Program linkage coherence.
 * G11 Handoff preparations require HEPM/HVEM markers and GPRA lineage coherence.
 * HOF-G1 Handoff entries require preparation + GPRA lineage coherence (R01–R07).
 * HOF-G7 evidence consumption requires entry + preparation + GPRA lineage coherence (R08–R15).
 * HOF-G10 preservation audit requires entry + consumption + lineage coherence (R16–R21).
 * HOF-G2 authorization act requires entry + consumption + lineage coherence (R25–R32).
 * HOF-G3 consumer binding requires entry + lineage coherence (R33–R39).
 * HOF-G4 posture declaration requires entry + binding + lineage coherence (R40–R47).
 * HOF-G5 completion requires entry + binding + lineage coherence (R48–R57).
 * HOF-G8 downstream exit boundary requires entry + binding + posture + completion + lineage coherence (R58–R65).
 */

import type {
  ApprovalActRecord,
  ApprovalWithholdingRecord,
  DesignTimeFeasibilityEvaluationRecord,
  Domain3BrainAdvisoryRecord,
  DownstreamDeficiencyRecord,
  GovernedHandoffEntryRecord,
  GovernedHandoffEvidenceConsumptionRecord,
  GovernedHandoffPreparationRecord,
  GovernedHandoffAuthorizationActRecord,
  GovernedHandoffCompletionActRecord,
  GovernedHandoffSuspensionActRecord,
  GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  GovernedHandoffConsumerBindingRecord,
  GovernedHandoffPostureDeclarationActRecord,
  GovernedHandoffPreservationAuditRecord,
  GpraGrantRecord,
  GpraInvalidationActRecord,
  GpraSupersessionActRecord,
  ProductionReadinessReview,
  ResubmissionEligibilityRecord,
  ReturnPostureRecord,
  ReviewDeterminationRecord,
  ReviewDimensionActivityRecord,
  ReviewEvidenceRecord,
  ReworkAuthorizationRecord,
  ReworkAuthorizationWithholdingRecord,
} from "../domain3-types.js";
import type { RealizedVisualArtifact } from "../domain2-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
import {
  assertPersistedApprovalAuthorityCoherence,
  assertPersistedApprovalWithholdingCoherence,
  assertPersistedGpraGrantCoherence,
} from "./g6-rehydration-coherence.js";
import {
  assertPersistedDownstreamDeficiencyCoherence,
  assertPersistedResubmissionEligibilityCoherence,
  assertPersistedReturnPostureCoherence,
  assertPersistedReworkAuthorizationCoherence,
  assertPersistedReworkAuthorizationWithholdingCoherence,
} from "./g7-rehydration-coherence.js";
import { assertPersistedGpraInvalidationCoherence } from "./g8-rehydration-coherence.js";
import { assertPersistedGpraSupersessionCoherence } from "./g9-rehydration-coherence.js";
import { assertPersistedDomain3BrainAdvisoryCoherence } from "./g10-rehydration-coherence.js";
import { assertPersistedGovernedHandoffPreparationCoherence } from "./g11-rehydration-coherence.js";
import { assertPersistedGovernedHandoffEntryCoherence } from "./hof-g1-rehydration-coherence.js";
import { assertPersistedGovernedHandoffEvidenceConsumptionCoherence } from "./hof-g7-rehydration-coherence.js";
import { assertPersistedGovernedHandoffPreservationAuditCoherence } from "./hof-g10-rehydration-coherence.js";
import { assertPersistedGovernedHandoffAuthorizationCoherence } from "./hof-g2-rehydration-coherence.js";
import { assertPersistedGovernedHandoffConsumerBindingCoherence } from "./hof-g3-rehydration-coherence.js";
import { assertPersistedGovernedHandoffPostureDeclarationCoherence } from "./hof-g4-rehydration-coherence.js";
import {
  assertPersistedGovernedHandoffCompletionCoherence,
} from "./hof-g5-rehydration-coherence.js";
import {
  assertPersistedGovernedHandoffSuspensionCoherence,
} from "./hof-g6-u2-rehydration-coherence.js";
import {
  assertPersistedGovernedHandoffDownstreamExitBoundaryCoherence,
} from "./hof-g8-rehydration-coherence.js";
import {
  validatePersistedApprovalAct,
  validatePersistedApprovalWithholding,
  validatePersistedDesignTimeFeasibilityEvaluation,
  validatePersistedDomain3BrainAdvisory,
  validatePersistedDownstreamDeficiencyRecord,
  validatePersistedGovernedHandoffEntry,
  validatePersistedGovernedHandoffEvidenceConsumption,
  validatePersistedGovernedHandoffPreparation,
  validatePersistedGovernedHandoffAuthorization,
  validatePersistedGovernedHandoffCompletion,
  validatePersistedGovernedHandoffSuspension,
  validatePersistedGovernedHandoffDownstreamExitBoundary,
  validatePersistedGovernedHandoffConsumerBinding,
  validatePersistedGovernedHandoffPostureDeclaration,
  validatePersistedGovernedHandoffPreservationAudit,
  validatePersistedGpraGrant,
  validatePersistedGpraInvalidationAct,
  validatePersistedGpraSupersessionAct,
  validatePersistedProductionReadinessReview,
  validatePersistedResubmissionEligibility,
  validatePersistedReturnPosture,
  validatePersistedReviewDetermination,
  validatePersistedReviewDimensionActivity,
  validatePersistedReviewEvidence,
  validatePersistedReworkAuthorization,
  validatePersistedReworkAuthorizationWithholding,
} from "./domain3-validation.js";


function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item);
    }
    return Object.freeze(value);
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    deepFreeze(record[key]);
  }
  return Object.freeze(value);
}

export interface G6AuthorityRehydrationContext {
  readonly review: unknown;
  readonly determination: unknown;
  readonly evidenceRecords: readonly unknown[];
  readonly activityRecords: readonly unknown[];
}

export interface G6GpraRehydrationContext extends G6AuthorityRehydrationContext {
  readonly approval: unknown;
}

export interface G8InvalidationRehydrationContext extends G6GpraRehydrationContext {
  readonly gpra: unknown;
}

export interface G9SupersessionRehydrationContext {
  readonly predecessorGpra: unknown;
  readonly successorGpra: unknown;
  readonly predecessorApproval: unknown;
  readonly successorApproval: unknown;
  readonly predecessorReview: unknown;
  readonly successorReview: unknown;
  readonly predecessorDetermination: unknown;
  readonly successorDetermination: unknown;
  readonly predecessorEvidenceRecords: readonly unknown[];
  readonly predecessorActivityRecords: readonly unknown[];
  readonly successorEvidenceRecords: readonly unknown[];
  readonly successorActivityRecords: readonly unknown[];
  readonly predecessorInvalidated: boolean;
  readonly predecessorAlreadySupersededInContext: boolean;
  readonly predecessorRva?: RealizedVisualArtifact | null;
  readonly successorRva?: RealizedVisualArtifact | null;
}

export interface G7DispositionRehydrationContext {
  readonly review: unknown;
  readonly determination: unknown;
}

export interface G7ReturnPostureRehydrationContext extends G7DispositionRehydrationContext {
  /** Required when persisted return route is withholding_return_only. */
  readonly approvalWithholding?: unknown | null;
}

function validateEvidenceAndActivityContext(context: G6AuthorityRehydrationContext): {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
  evidenceRecords: ReviewEvidenceRecord[];
  activityRecords: ReviewDimensionActivityRecord[];
} {
  validatePersistedProductionReadinessReview(context.review);
  validatePersistedReviewDetermination(context.determination);
  const evidenceRecords = context.evidenceRecords.map((item) => {
    validatePersistedReviewEvidence(item);
    return item as ReviewEvidenceRecord;
  });
  const activityRecords = context.activityRecords.map((item) => {
    validatePersistedReviewDimensionActivity(item);
    return item as ReviewDimensionActivityRecord;
  });
  return {
    review: context.review as ProductionReadinessReview,
    determination: context.determination as ReviewDeterminationRecord,
    evidenceRecords,
    activityRecords,
  };
}

function validateG7DispositionContext(context: G7DispositionRehydrationContext): {
  review: ProductionReadinessReview;
  determination: ReviewDeterminationRecord;
} {
  validatePersistedProductionReadinessReview(context.review);
  validatePersistedReviewDetermination(context.determination);
  return {
    review: context.review as ProductionReadinessReview,
    determination: context.determination as ReviewDeterminationRecord,
  };
}

export function rehydrateProductionReadinessReview(raw: unknown): ProductionReadinessReview {
  validatePersistedProductionReadinessReview(raw);
  const clone = structuredClone(raw) as ProductionReadinessReview & {
    priorReviewId?: ProductionReadinessReview["priorReviewId"];
    resubmissionEligibilityId?: ProductionReadinessReview["resubmissionEligibilityId"];
  };
  if (clone.priorReviewId === undefined) {
    (clone as { priorReviewId: null }).priorReviewId = null;
  }
  if (clone.resubmissionEligibilityId === undefined) {
    (clone as { resubmissionEligibilityId: null }).resubmissionEligibilityId = null;
  }
  return deepFreeze(clone);
}

export function rehydrateReviewEvidence(raw: unknown): ReviewEvidenceRecord {
  validatePersistedReviewEvidence(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateReviewDimensionActivity(raw: unknown): ReviewDimensionActivityRecord {
  validatePersistedReviewDimensionActivity(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateDesignTimeFeasibilityEvaluation(
  raw: unknown,
): DesignTimeFeasibilityEvaluationRecord {
  validatePersistedDesignTimeFeasibilityEvaluation(raw);
  return deepFreeze(structuredClone(raw));
}

export function rehydrateReviewDetermination(raw: unknown): ReviewDeterminationRecord {
  validatePersistedReviewDetermination(raw);
  return deepFreeze(structuredClone(raw));
}

/**
 * Trusted G6 Approval rehydration — structural + joint Review/Determination/evidence coherence.
 */
export function rehydrateApprovalAct(
  raw: unknown,
  context: G6AuthorityRehydrationContext,
): ApprovalActRecord {
  validatePersistedApprovalAct(raw);
  const linked = validateEvidenceAndActivityContext(context);
  assertPersistedApprovalAuthorityCoherence({
    approval: raw as ApprovalActRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

/**
 * Trusted G6 withholding rehydration — structural + joint Pass Review coherence.
 */
export function rehydrateApprovalWithholding(
  raw: unknown,
  context: G6AuthorityRehydrationContext,
): ApprovalWithholdingRecord {
  validatePersistedApprovalWithholding(raw);
  const linked = validateEvidenceAndActivityContext(context);
  assertPersistedApprovalWithholdingCoherence({
    withholding: raw as ApprovalWithholdingRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

/**
 * Trusted G6 GPRA rehydration — requires persisted Approval and joint subject coherence.
 * Does not infer GPRA from Approval alone.
 */
export function rehydrateGpraGrant(
  raw: unknown,
  context: G6GpraRehydrationContext,
): GpraGrantRecord {
  validatePersistedGpraGrant(raw);
  validatePersistedApprovalAct(context.approval);
  const linked = validateEvidenceAndActivityContext(context);
  assertPersistedGpraGrantCoherence({
    gpra: raw as GpraGrantRecord,
    approval: context.approval as ApprovalActRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

/**
 * Trusted G8 GPRA invalidation rehydration — GPRA + Approval + Review joint coherence.
 */
export function rehydrateGpraInvalidationAct(
  raw: unknown,
  context: G8InvalidationRehydrationContext,
): GpraInvalidationActRecord {
  validatePersistedGpraInvalidationAct(raw);
  validatePersistedGpraGrant(context.gpra);
  validatePersistedApprovalAct(context.approval);
  const linked = validateEvidenceAndActivityContext(context);
  assertPersistedGpraInvalidationCoherence({
    invalidation: raw as GpraInvalidationActRecord,
    gpra: context.gpra as GpraGrantRecord,
    approval: context.approval as ApprovalActRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

/**
 * Trusted G9 GPRA supersession rehydration — joint predecessor + successor coherence.
 */
export function rehydrateGpraSupersessionAct(
  raw: unknown,
  context: G9SupersessionRehydrationContext,
): GpraSupersessionActRecord {
  validatePersistedGpraSupersessionAct(raw);
  validatePersistedGpraGrant(context.predecessorGpra);
  validatePersistedGpraGrant(context.successorGpra);
  validatePersistedApprovalAct(context.predecessorApproval);
  validatePersistedApprovalAct(context.successorApproval);
  const predecessorLinked = validateEvidenceAndActivityContext({
    review: context.predecessorReview,
    determination: context.predecessorDetermination,
    evidenceRecords: context.predecessorEvidenceRecords,
    activityRecords: context.predecessorActivityRecords,
  });
  const successorLinked = validateEvidenceAndActivityContext({
    review: context.successorReview,
    determination: context.successorDetermination,
    evidenceRecords: context.successorEvidenceRecords,
    activityRecords: context.successorActivityRecords,
  });
  assertPersistedGpraSupersessionCoherence({
    supersession: raw as GpraSupersessionActRecord,
    predecessorGpra: context.predecessorGpra as GpraGrantRecord,
    successorGpra: context.successorGpra as GpraGrantRecord,
    predecessorApproval: context.predecessorApproval as ApprovalActRecord,
    successorApproval: context.successorApproval as ApprovalActRecord,
    predecessorReview: predecessorLinked.review,
    successorReview: successorLinked.review,
    predecessorDetermination: predecessorLinked.determination,
    successorDetermination: successorLinked.determination,
    predecessorEvidenceRecords: predecessorLinked.evidenceRecords,
    predecessorActivityRecords: predecessorLinked.activityRecords,
    successorEvidenceRecords: successorLinked.evidenceRecords,
    successorActivityRecords: successorLinked.activityRecords,
    predecessorInvalidated: context.predecessorInvalidated,
    predecessorAlreadySupersededInContext: context.predecessorAlreadySupersededInContext,
    predecessorRva: context.predecessorRva,
    successorRva: context.successorRva,
  });
  return deepFreeze(structuredClone(raw));
}

export function rehydrateDownstreamDeficiencyRecord(
  raw: unknown,
  context: G7DispositionRehydrationContext,
): DownstreamDeficiencyRecord {
  validatePersistedDownstreamDeficiencyRecord(raw);
  const linked = validateG7DispositionContext(context);
  assertPersistedDownstreamDeficiencyCoherence({
    deficiency: raw as DownstreamDeficiencyRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

export function rehydrateReworkAuthorization(
  raw: unknown,
  context: G7DispositionRehydrationContext,
): ReworkAuthorizationRecord {
  validatePersistedReworkAuthorization(raw);
  const linked = validateG7DispositionContext(context);
  assertPersistedReworkAuthorizationCoherence({
    authorization: raw as ReworkAuthorizationRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

export function rehydrateReworkAuthorizationWithholding(
  raw: unknown,
  context: G7DispositionRehydrationContext,
): ReworkAuthorizationWithholdingRecord {
  validatePersistedReworkAuthorizationWithholding(raw);
  const linked = validateG7DispositionContext(context);
  assertPersistedReworkAuthorizationWithholdingCoherence({
    withholding: raw as ReworkAuthorizationWithholdingRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

export function rehydrateReturnPosture(
  raw: unknown,
  context: G7ReturnPostureRehydrationContext,
): ReturnPostureRecord {
  validatePersistedReturnPosture(raw);
  const linked = validateG7DispositionContext(context);
  const returnPosture = raw as ReturnPostureRecord;
  let approvalWithholding: ApprovalWithholdingRecord | null = null;
  if (returnPosture.route === "withholding_return_only") {
    if (!context.approvalWithholding) {
      throw new OrchestraConstitutionalError(
        "Withholding-return posture rehydration requires Approval withholding context",
        "invalid_downstream_disposition",
        ["FI-DSN-STD-014-R49"],
      );
    }
    validatePersistedApprovalWithholding(context.approvalWithholding);
    approvalWithholding = context.approvalWithholding as ApprovalWithholdingRecord;
  } else if (context.approvalWithholding) {
    validatePersistedApprovalWithholding(context.approvalWithholding);
    approvalWithholding = context.approvalWithholding as ApprovalWithholdingRecord;
  }
  assertPersistedReturnPostureCoherence({
    returnPosture,
    review: linked.review,
    determination: linked.determination,
    approvalWithholding,
  });
  return deepFreeze(structuredClone(raw));
}

export function rehydrateResubmissionEligibility(
  raw: unknown,
  context: G7DispositionRehydrationContext,
): ResubmissionEligibilityRecord {
  validatePersistedResubmissionEligibility(raw);
  const linked = validateG7DispositionContext(context);
  assertPersistedResubmissionEligibilityCoherence({
    eligibility: raw as ResubmissionEligibilityRecord,
    ...linked,
  });
  return deepFreeze(structuredClone(raw));
}

export interface G10BrainAdvisoryRehydrationContext {
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
  readonly gpra?: unknown | null;
}

/**
 * Trusted G10 Brain advisory rehydration — BRPAM markers + Review/RVA/Program coherence.
 */
export function rehydrateDomain3BrainAdvisory(
  raw: unknown,
  context: G10BrainAdvisoryRehydrationContext = {},
): Domain3BrainAdvisoryRecord {
  validatePersistedDomain3BrainAdvisory(raw);
  const advisory = raw as Domain3BrainAdvisoryRecord;

  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }
  let gpra: GpraGrantRecord | null = null;
  if (context.gpra != null) {
    validatePersistedGpraGrant(context.gpra);
    gpra = context.gpra as GpraGrantRecord;
  }

  assertPersistedDomain3BrainAdvisoryCoherence({
    advisory,
    review,
    determination,
    gpra,
  });
  return deepFreeze(structuredClone(raw));
}

export interface G11HandoffPreparationRehydrationContext {
  readonly gpra: unknown;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted G11 Handoff preparation rehydration — HEPM/HVEM markers + GPRA lineage coherence.
 */
export function rehydrateGovernedHandoffPreparation(
  raw: unknown,
  context: G11HandoffPreparationRehydrationContext,
): GovernedHandoffPreparationRecord {
  validatePersistedGovernedHandoffPreparation(raw);
  validatePersistedGpraGrant(context.gpra);
  const preparation = raw as GovernedHandoffPreparationRecord;
  const gpra = context.gpra as GpraGrantRecord;

  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffPreparationCoherence({
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}

export interface HofG1HandoffEntryRehydrationContext {
  readonly preparation: unknown;
  readonly gpra: unknown;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted HOF-G1 Handoff entry rehydration — preparation + GPRA lineage coherence.
 * Historical entries remain loadable after later invalidation (immutable history).
 */
export function rehydrateGovernedHandoffEntry(
  raw: unknown,
  context: HofG1HandoffEntryRehydrationContext,
): GovernedHandoffEntryRecord {
  validatePersistedGovernedHandoffEntry(raw);
  validatePersistedGovernedHandoffPreparation(context.preparation);
  validatePersistedGpraGrant(context.gpra);
  const entry = raw as GovernedHandoffEntryRecord;
  const preparation = context.preparation as GovernedHandoffPreparationRecord;
  const gpra = context.gpra as GpraGrantRecord;

  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffEntryCoherence({
    entry,
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}

export interface HofG7HandoffEvidenceConsumptionRehydrationContext {
  readonly entry: unknown;
  readonly preparation: unknown;
  readonly gpra: unknown;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted HOF-G7 evidence consumption rehydration — entry + preparation + GPRA coherence.
 * Historical consumptions remain loadable after later invalidation (immutable history).
 */
export function rehydrateGovernedHandoffEvidenceConsumption(
  raw: unknown,
  context: HofG7HandoffEvidenceConsumptionRehydrationContext,
): GovernedHandoffEvidenceConsumptionRecord {
  validatePersistedGovernedHandoffEvidenceConsumption(raw);
  validatePersistedGovernedHandoffEntry(context.entry);
  validatePersistedGovernedHandoffPreparation(context.preparation);
  validatePersistedGpraGrant(context.gpra);
  const consumption = raw as GovernedHandoffEvidenceConsumptionRecord;
  const entry = context.entry as GovernedHandoffEntryRecord;
  const preparation = context.preparation as GovernedHandoffPreparationRecord;
  const gpra = context.gpra as GpraGrantRecord;

  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffEvidenceConsumptionCoherence({
    consumption,
    entry,
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}

export interface HofG10HandoffPreservationAuditRehydrationContext {
  readonly entry: unknown;
  readonly consumption: unknown;
  readonly preparation?: unknown | null;
  readonly gpra?: unknown | null;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted HOF-G10 preservation audit rehydration — entry + consumption + lineage coherence.
 * Historical audits remain loadable after later invalidation (immutable history; R19).
 * Does not restore constitutional force.
 */
export function rehydrateGovernedHandoffPreservationAudit(
  raw: unknown,
  context: HofG10HandoffPreservationAuditRehydrationContext,
): GovernedHandoffPreservationAuditRecord {
  validatePersistedGovernedHandoffPreservationAudit(raw);
  validatePersistedGovernedHandoffEntry(context.entry);
  validatePersistedGovernedHandoffEvidenceConsumption(context.consumption);
  const audit = raw as GovernedHandoffPreservationAuditRecord;
  const entry = context.entry as GovernedHandoffEntryRecord;
  const consumption = context.consumption as GovernedHandoffEvidenceConsumptionRecord;

  let preparation: GovernedHandoffPreparationRecord | null = null;
  if (context.preparation != null) {
    validatePersistedGovernedHandoffPreparation(context.preparation);
    preparation = context.preparation as GovernedHandoffPreparationRecord;
  }
  let gpra: GpraGrantRecord | null = null;
  if (context.gpra != null) {
    validatePersistedGpraGrant(context.gpra);
    gpra = context.gpra as GpraGrantRecord;
  }
  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffPreservationAuditCoherence({
    audit,
    entry,
    consumption,
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}

export interface HofG2HandoffAuthorizationRehydrationContext {
  readonly entry: unknown;
  readonly consumption: unknown;
  readonly preparation?: unknown | null;
  readonly gpra?: unknown | null;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted HOF-G2 authorization act rehydration — entry + consumption + lineage coherence.
 * Does not declare posture, complete, suspend, recall, withdraw, or execute Handoff.
 */
export function rehydrateGovernedHandoffAuthorization(
  raw: unknown,
  context: HofG2HandoffAuthorizationRehydrationContext,
): GovernedHandoffAuthorizationActRecord {
  validatePersistedGovernedHandoffAuthorization(raw);
  validatePersistedGovernedHandoffEntry(context.entry);
  validatePersistedGovernedHandoffEvidenceConsumption(context.consumption);
  const act = raw as GovernedHandoffAuthorizationActRecord;
  const entry = context.entry as GovernedHandoffEntryRecord;
  const consumption = context.consumption as GovernedHandoffEvidenceConsumptionRecord;

  let preparation: GovernedHandoffPreparationRecord | null = null;
  if (context.preparation != null) {
    validatePersistedGovernedHandoffPreparation(context.preparation);
    preparation = context.preparation as GovernedHandoffPreparationRecord;
  }
  let gpra: GpraGrantRecord | null = null;
  if (context.gpra != null) {
    validatePersistedGpraGrant(context.gpra);
    gpra = context.gpra as GpraGrantRecord;
  }
  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffAuthorizationCoherence({
    act,
    entry,
    consumption,
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}

export interface HofG3HandoffConsumerBindingRehydrationContext {
  readonly entry: unknown;
  readonly preparation?: unknown | null;
  readonly gpra?: unknown | null;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted HOF-G3 consumer binding rehydration — entry + lineage coherence.
 * Does not authorize Handoff, declare posture, accept downstream, or execute.
 */
export function rehydrateGovernedHandoffConsumerBinding(
  raw: unknown,
  context: HofG3HandoffConsumerBindingRehydrationContext,
): GovernedHandoffConsumerBindingRecord {
  validatePersistedGovernedHandoffConsumerBinding(raw);
  validatePersistedGovernedHandoffEntry(context.entry);
  const binding = raw as GovernedHandoffConsumerBindingRecord;
  const entry = context.entry as GovernedHandoffEntryRecord;

  let preparation: GovernedHandoffPreparationRecord | null = null;
  if (context.preparation != null) {
    validatePersistedGovernedHandoffPreparation(context.preparation);
    preparation = context.preparation as GovernedHandoffPreparationRecord;
  }
  let gpra: GpraGrantRecord | null = null;
  if (context.gpra != null) {
    validatePersistedGpraGrant(context.gpra);
    gpra = context.gpra as GpraGrantRecord;
  }
  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffConsumerBindingCoherence({
    binding,
    entry,
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}

export interface HofG4HandoffPostureDeclarationRehydrationContext {
  readonly entry: unknown;
  readonly binding: unknown;
  readonly preparation?: unknown | null;
  readonly gpra?: unknown | null;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted HOF-G4 posture declaration rehydration — entry + binding + lineage coherence.
 * Does not authorize, complete, suspend, recall, withdraw, or execute Handoff.
 */
export function rehydrateGovernedHandoffPostureDeclaration(
  raw: unknown,
  context: HofG4HandoffPostureDeclarationRehydrationContext,
): GovernedHandoffPostureDeclarationActRecord {
  validatePersistedGovernedHandoffPostureDeclaration(raw);
  validatePersistedGovernedHandoffEntry(context.entry);
  validatePersistedGovernedHandoffConsumerBinding(context.binding);
  const declaration = raw as GovernedHandoffPostureDeclarationActRecord;
  const entry = context.entry as GovernedHandoffEntryRecord;
  const binding = context.binding as GovernedHandoffConsumerBindingRecord;

  let preparation: GovernedHandoffPreparationRecord | null = null;
  if (context.preparation != null) {
    validatePersistedGovernedHandoffPreparation(context.preparation);
    preparation = context.preparation as GovernedHandoffPreparationRecord;
  }
  let gpra: GpraGrantRecord | null = null;
  if (context.gpra != null) {
    validatePersistedGpraGrant(context.gpra);
    gpra = context.gpra as GpraGrantRecord;
  }
  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffPostureDeclarationCoherence({
    declaration,
    entry,
    binding,
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}

export interface HofG5HandoffCompletionRehydrationContext {
  readonly entry: unknown;
  readonly binding: unknown;
  readonly posture: unknown;
  readonly preparation?: unknown | null;
  readonly gpra?: unknown | null;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted HOF-G5 completion rehydration — entry + binding + posture + lineage coherence.
 * Does not authorize, suspend, recall, withdraw, accept downstream, or execute Handoff.
 */
export function rehydrateGovernedHandoffCompletion(
  raw: unknown,
  context: HofG5HandoffCompletionRehydrationContext,
): GovernedHandoffCompletionActRecord {
  validatePersistedGovernedHandoffCompletion(raw);
  validatePersistedGovernedHandoffEntry(context.entry);
  validatePersistedGovernedHandoffConsumerBinding(context.binding);
  validatePersistedGovernedHandoffPostureDeclaration(context.posture);
  const completion = raw as GovernedHandoffCompletionActRecord;
  const entry = context.entry as GovernedHandoffEntryRecord;
  const binding = context.binding as GovernedHandoffConsumerBindingRecord;
  const posture = context.posture as GovernedHandoffPostureDeclarationActRecord;

  let preparation: GovernedHandoffPreparationRecord | null = null;
  if (context.preparation != null) {
    validatePersistedGovernedHandoffPreparation(context.preparation);
    preparation = context.preparation as GovernedHandoffPreparationRecord;
  }
  let gpra: GpraGrantRecord | null = null;
  if (context.gpra != null) {
    validatePersistedGpraGrant(context.gpra);
    gpra = context.gpra as GpraGrantRecord;
  }
  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffCompletionCoherence({
    completion,
    entry,
    binding,
    posture,
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}

export interface HofG8HandoffDownstreamExitBoundaryRehydrationContext {
  readonly entry: unknown;
  readonly binding: unknown;
  readonly posture: unknown;
  readonly completion: unknown;
  readonly preparation?: unknown | null;
  readonly gpra?: unknown | null;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted HOF-G8 downstream exit-boundary rehydration.
 * Rejects forged matrix-exit scopes, wrong domains, foreign binding/posture/completion,
 * and acceptance/membership/mfg/rejection fields. Does not mutate upstream history.
 */
export function rehydrateGovernedHandoffDownstreamExitBoundary(
  raw: unknown,
  context: HofG8HandoffDownstreamExitBoundaryRehydrationContext,
): GovernedHandoffDownstreamExitBoundaryAttributionRecord {
  validatePersistedGovernedHandoffDownstreamExitBoundary(raw);
  validatePersistedGovernedHandoffEntry(context.entry);
  validatePersistedGovernedHandoffConsumerBinding(context.binding);
  validatePersistedGovernedHandoffPostureDeclaration(context.posture);
  validatePersistedGovernedHandoffCompletion(context.completion);
  const attribution = raw as GovernedHandoffDownstreamExitBoundaryAttributionRecord;
  const entry = context.entry as GovernedHandoffEntryRecord;
  const binding = context.binding as GovernedHandoffConsumerBindingRecord;
  const posture = context.posture as GovernedHandoffPostureDeclarationActRecord;
  const completion = context.completion as GovernedHandoffCompletionActRecord;

  let preparation: GovernedHandoffPreparationRecord | null = null;
  if (context.preparation != null) {
    validatePersistedGovernedHandoffPreparation(context.preparation);
    preparation = context.preparation as GovernedHandoffPreparationRecord;
  }
  let gpra: GpraGrantRecord | null = null;
  if (context.gpra != null) {
    validatePersistedGpraGrant(context.gpra);
    gpra = context.gpra as GpraGrantRecord;
  }
  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffDownstreamExitBoundaryCoherence({
    attribution,
    entry,
    binding,
    posture,
    completion,
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}

export interface HofG6U2HandoffSuspensionRehydrationContext {
  readonly entry: unknown;
  readonly binding: unknown;
  readonly authorization: unknown;
  readonly posture: unknown;
  readonly preparation?: unknown | null;
  readonly gpra?: unknown | null;
  readonly review?: unknown | null;
  readonly determination?: unknown | null;
}

/**
 * Trusted HOF-G6-U2 suspension rehydration — entry + binding + authorization + posture + lineage.
 * Does not withdraw, recall, resume, restore, or execute Handoff.
 */
export function rehydrateGovernedHandoffSuspension(
  raw: unknown,
  context: HofG6U2HandoffSuspensionRehydrationContext,
): GovernedHandoffSuspensionActRecord {
  validatePersistedGovernedHandoffSuspension(raw);
  validatePersistedGovernedHandoffEntry(context.entry);
  validatePersistedGovernedHandoffConsumerBinding(context.binding);
  validatePersistedGovernedHandoffAuthorization(context.authorization);
  validatePersistedGovernedHandoffPostureDeclaration(context.posture);
  const suspension = raw as GovernedHandoffSuspensionActRecord;
  const entry = context.entry as GovernedHandoffEntryRecord;
  const binding = context.binding as GovernedHandoffConsumerBindingRecord;
  const authorization = context.authorization as GovernedHandoffAuthorizationActRecord;
  const posture = context.posture as GovernedHandoffPostureDeclarationActRecord;

  let preparation: GovernedHandoffPreparationRecord | null = null;
  if (context.preparation != null) {
    validatePersistedGovernedHandoffPreparation(context.preparation);
    preparation = context.preparation as GovernedHandoffPreparationRecord;
  }
  let gpra: GpraGrantRecord | null = null;
  if (context.gpra != null) {
    validatePersistedGpraGrant(context.gpra);
    gpra = context.gpra as GpraGrantRecord;
  }
  let review: ProductionReadinessReview | null = null;
  if (context.review != null) {
    validatePersistedProductionReadinessReview(context.review);
    review = context.review as ProductionReadinessReview;
  }
  let determination: ReviewDeterminationRecord | null = null;
  if (context.determination != null) {
    validatePersistedReviewDetermination(context.determination);
    determination = context.determination as ReviewDeterminationRecord;
  }

  assertPersistedGovernedHandoffSuspensionCoherence({
    suspension,
    entry,
    binding,
    authorization,
    posture,
    preparation,
    gpra,
    review,
    determination,
  });
  return deepFreeze(structuredClone(raw));
}
