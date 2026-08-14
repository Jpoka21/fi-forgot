/**
 * Domain 3 persistence validation — FI-DSN-STD-014 G2–G11 + STD-015 HOF-G1/G7/G10/G2.
 */

import {
  isCanonicalEstablishedApprovalAuthorityClassId,
  resolveEstablishedApprovalAuthorityClass,
} from "../approval-authority.js";
import { isMandatoryApprovalWithholdingGroundFamily } from "../approval-withholding-grounds.js";
import {
  DOMAIN3_REEVALUATION_REQUEST_ALLOWED_STAGES,
  DOMAIN3_REEVALUATION_REQUEST_ROUTE,
  isDomain3BrainAuthorityRouteKind,
  isDomain3BrainReevaluationRequestType,
} from "../brain-domain3-advisory.js";
import {
  assertOutputClassAllowedForStage,
  isDomain3BrainOutputClass,
  isDomain3DecisionStage,
} from "../brain-domain3-decision-stage.js";
import { isMandatoryGovernedDeficiencyFamily } from "../deficiency-families.js";
import { DOMAIN3_GOVERNING_STANDARD } from "../domain3-authority.js";
import { isValidDomain3GovernedCreationMarker } from "../domain3-entry.js";
import { isCanonicalEstablishedDownstreamDispositionAuthorityClassId } from "../downstream-disposition-authority.js";
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
  GovernedHandoffWithdrawalActRecord,
  GovernedHandoffRecallActRecord,
  GovernedHandoffReentryActRecord,
  GovernedHandoffResumptionActRecord,
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
import type { RealizationPath, RealizedVisualArtifactId } from "../domain2-types.js";
import { OrchestraConstitutionalError } from "../errors.js";
import {
  HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS,
  HOF_P_DISTINCTIONS_PRESERVED,
  isHandoffDeferredPrincipalSubject,
  isHandoffHofPDistinctionId,
} from "../handoff-entry.js";
import {
  DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES,
  HANDOFF_EVIDENCE_MODELS,
  isDeferredHoemOperativeRecordClass,
  isHandoffEvidenceModelId,
} from "../handoff-evidence-consumption.js";
import {
  DEFERRED_OPERATIVE_AUDIT_CLASSES,
  isDeferredOperativeAuditClass,
} from "../handoff-preservation-audit.js";
import { isHccmConsumerClassId, resolveHccmConsumerClass } from "../hccm-consumer-classes.js";
import { GOVERNED_HANDOFF_AUTHORIZATION_TRACEABILITY } from "../handoff-authorization.js";
import { GOVERNED_HANDOFF_CONSUMER_BINDING_TRACEABILITY } from "../handoff-consumer-binding.js";
import {
  GOVERNED_HANDOFF_POSTURE_DECLARATION_TRACEABILITY,
  isFrozenHandoffPostureClass,
} from "../handoff-posture-declaration.js";
import { GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY } from "../handoff-act-lifecycle.js";
import {
  GOVERNED_HANDOFF_SUSPENSION_TRACEABILITY,
  isSuspensionConstitutionalBasisKind,
} from "../handoff-suspension.js";
import {
  GOVERNED_HANDOFF_WITHDRAWAL_TRACEABILITY,
  isWithdrawalConstitutionalBasisKind,
} from "../handoff-withdrawal.js";
import {
  GOVERNED_HANDOFF_RECALL_TRACEABILITY,
} from "../handoff-recall.js";
import { isHrtcmRecallTriggerId } from "../handoff-hrtcm.js";
import {
  GOVERNED_HANDOFF_HERCM_TRACEABILITY,
  isHercmReentryCategoryId,
  isHercmResumptionCategoryId,
  isReentryConstitutionalBasisKind,
  isResumptionConstitutionalBasisKind,
  resolveHercmCategory,
} from "../handoff-hercm.js";
import { GOVERNED_HANDOFF_DOWNSTREAM_EXIT_BOUNDARY_TRACEABILITY } from "../handoff-downstream-exit-boundary.js";
import {
  assertHgaActTypeStringFailClosed,
  assertHgaMatrixActMayBePerformed,
} from "../handoff-authority-catalog.js";
import {
  isCanonicalEstablishedHandoffGovernanceAuthorityClassId,
} from "../handoff-governance-authority.js";
import {
  isHandoffConsumerCategoryKey,
} from "../handoff-preparation.js";
import {
  isCanonicalEstablishedInvalidationAuthorityClassId,
  resolveEstablishedInvalidationAuthorityClass,
} from "../invalidation-authority.js";
import { isMandatoryInvalidationTriggerFamily } from "../invalidation-trigger-families.js";
import { isCanonicalFrozenBindingFiMfgStandardId } from "../manufacturing-authority.js";
import { isLegalReviewDeterminationOutcome } from "../review-determination.js";
import { isMandatoryReviewDimensionId } from "../review-dimensions.js";
import { validateLineageCoherence } from "../rva-lifecycle.js";
import { STD015_GOVERNING_STANDARD } from "../std015-authority.js";
import {
  isCanonicalEstablishedSupersessionAuthorityClassId,
  resolveEstablishedSupersessionAuthorityClass,
} from "../supersession-authority.js";
import { isMandatorySupersessionTriggerFamily } from "../supersession-trigger-families.js";

const ID_PREFIXES = {
  review: "production-readiness-review-",
  rva: "rva-",
  program: "program-",
  obligation: "obligation-",
  readiness: "review-entry-readiness-",
  evidence: "review-evidence-",
  activity: "review-dimension-activity-",
  dtfEvaluation: "design-time-feasibility-evaluation-",
  determination: "review-determination-",
  approvalAct: "approval-act-",
  withholding: "approval-withholding-",
  gpra: "gpra-",
  gpraInvalidation: "gpra-invalidation-",
  gpraSupersession: "gpra-supersession-",
  downstreamDeficiency: "downstream-deficiency-",
  reworkAuthorization: "rework-authorization-",
  reworkAuthorizationWithholding: "rework-authorization-withholding-",
  returnPosture: "return-posture-",
  resubmissionEligibility: "resubmission-eligibility-",
  brainAdvisory: "domain3-brain-advisory-",
  handoffPreparation: "governed-handoff-preparation-",
  handoffEntry: "governed-handoff-entry-",
  handoffEvidenceConsumption: "governed-handoff-evidence-consumption-",
  handoffPreservationAudit: "governed-handoff-preservation-audit-",
  handoffAuthorizationAct: "governed-handoff-authorization-act-",
  handoffConsumerBinding: "governed-handoff-consumer-binding-",
  handoffPostureDeclarationAct: "governed-handoff-posture-declaration-act-",
  handoffCompletionAct: "governed-handoff-completion-act-",
  handoffSuspensionAct: "governed-handoff-suspension-act-",
  handoffWithdrawalAct: "governed-handoff-withdrawal-act-",
  handoffRecallAct: "governed-handoff-recall-act-",
  handoffResumptionAct: "governed-handoff-resumption-act-",
  handoffReentryAct: "governed-handoff-reentry-act-",
  handoffDownstreamExitBoundaryAttribution:
    "governed-handoff-downstream-exit-boundary-attribution-",
  hoemAuthorizationOperative: "hoem-authorization-operative-",
  hoemPostureDeclarationOperative: "hoem-posture-declaration-operative-",
  hoemCompletionOperative: "hoem-completion-operative-",
  hoemSuspensionOperative: "hoem-suspension-operative-",
  hoemWithdrawalOperative: "hoem-withdrawal-operative-",
  hoemRecallOperative: "hoem-recall-operative-",
  hoemResumptionOperative: "hoem-resumption-operative-",
  hoemReentryOperative: "hoem-reentry-operative-",
  hoemExitBoundary: "hoem-exit-boundary-",
} as const;

/**
 * R132/R138/R139 — keys a persisted HERCM act may never carry. Restoration, resurrection,
 * automatic recovery, peer-act substitution, and execution are all non-operative here.
 * Legitimate HERCM linkage fields (resumedSuspensionActId, predecessorWithdrawalActId,
 * predecessorRecallActId) are deliberately absent from this list.
 */
const HERCM_FORBIDDEN_PERSISTED_KEYS = [
  "restoreHandoff",
  "restorationActId",
  "reinstateHandoff",
  "reviveHandoff",
  "reactivateHandoff",
  "resurrectAuthorization",
  "resurrectPosture",
  "autoResume",
  "autoReenter",
  "autoRestore",
  "automaticRecovery",
  "automaticRetry",
  "exportReadyAlone",
  "eligibilityAlone",
  "suspendHandoff",
  "withdrawHandoff",
  "recallHandoff",
  "expireHandoff",
  "completeHandoff",
  "suspensionActId",
  "withdrawalActId",
  "recallActId",
  "expiryActId",
  "completionActId",
  "newAuthorizationActId",
  "mintAuthorization",
  "authorizeHandoff",
  "declarePosture",
  "newPostureDeclarationActId",
  "executesHandoff",
  "handoffExecuted",
  "performHandoff",
  "manufacturingExecutionId",
  "fulfillmentExecutionId",
  "productionExecutionId",
  "executionQueueId",
  "constitutionalQueueId",
  "brainResumeHandoff",
  "brainReenterHandoff",
  "brainHandoffResumption",
  "brainHandoffReentry",
  "brainAuthorizesHandoff",
  "rejectHandoff",
  "performHgaAct",
  "performG6LifecycleAct",
  "applyLifecycleState",
  "hslmState",
  "hgaMatrixActType",
  "matrixActType",
  "constitutionalBasisNotes",
] as const;

/** Cross-kind leakage: a resumption may not carry re-entry identity, and vice versa. */
const HERCM_FORBIDDEN_RESUMPTION_KEYS = [
  "reentryActId",
  "hoemReentryRecord",
  "reenterHandoff",
  "predecessorWithdrawalActId",
  "predecessorRecallActId",
] as const;

const HERCM_FORBIDDEN_REENTRY_KEYS = [
  "resumptionActId",
  "hoemResumptionRecord",
  "resumeHandoff",
  "resumedSuspensionActId",
] as const;

const LEGAL_CONDITIONAL_FAIL_ROUTES = ["conditional_route", "fail_route"] as const;
const LEGAL_DOWNSTREAM_ROUTES = [
  "conditional_route",
  "fail_route",
  "withholding_return_only",
] as const;
const LEGAL_RETURN_KINDS = [
  "correction_return_to_realization",
  "rework_return_to_realization",
  "return_authorized_after_approval_withholding",
] as const;

const LEGAL_REALIZATION_PATHS: readonly RealizationPath[] = [
  "created",
  "generated",
  "commissioned",
  "licensed_or_acquired",
];

const LEGAL_SOURCE_KINDS = [
  "compliance_boundary",
  "domain2_entry_evidence",
  "realization_traceability_package",
  "observation",
] as const;

function assertBrandedId(value: unknown, prefix: string, label: string): void {
  if (typeof value !== "string" || !value.startsWith(prefix)) {
    throw new OrchestraConstitutionalError(
      `Invalid Domain 3 ${label} identity`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }
}

function assertDomain3Traceability(traceability: unknown, label: string): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== DOMAIN3_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires Domain 3 FI-DSN-STD-014 traceability`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
}

function assertStd015Traceability(traceability: unknown, label: string): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G1 traceability`,
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R07"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of [
    "FI-DSN-STD-015-R01",
    "FI-DSN-STD-015-R02",
    "FI-DSN-STD-015-R03",
    "FI-DSN-STD-015-R04",
    "FI-DSN-STD-015-R05",
    "FI-DSN-STD-015-R06",
    "FI-DSN-STD-015-R07",
  ]) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R07"],
      );
    }
  }
}

function assertStd015HofG7Traceability(traceability: unknown, label: string): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G7 traceability`,
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R08", "FI-DSN-STD-015-R15"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of [
    "FI-DSN-STD-015-R08",
    "FI-DSN-STD-015-R09",
    "FI-DSN-STD-015-R10",
    "FI-DSN-STD-015-R11",
    "FI-DSN-STD-015-R12",
    "FI-DSN-STD-015-R13",
    "FI-DSN-STD-015-R14",
    "FI-DSN-STD-015-R15",
  ]) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R08", "FI-DSN-STD-015-R15"],
      );
    }
  }
}

function assertStd015HofG10Traceability(traceability: unknown, label: string): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G10 traceability`,
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R21"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of [
    "FI-DSN-STD-015-R16",
    "FI-DSN-STD-015-R17",
    "FI-DSN-STD-015-R18",
    "FI-DSN-STD-015-R19",
    "FI-DSN-STD-015-R20",
    "FI-DSN-STD-015-R21",
  ]) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R21"],
      );
    }
  }
}

function assertStd015HofG2Traceability(traceability: unknown, label: string): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G2 traceability`,
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25", "FI-DSN-STD-015-R32"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of GOVERNED_HANDOFF_AUTHORIZATION_TRACEABILITY.requirementIds) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R25", "FI-DSN-STD-015-R32"],
      );
    }
  }
}

function assertStd015HofG3Traceability(traceability: unknown, label: string): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G3 traceability`,
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33", "FI-DSN-STD-015-R39"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of GOVERNED_HANDOFF_CONSUMER_BINDING_TRACEABILITY.requirementIds) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R33", "FI-DSN-STD-015-R39"],
      );
    }
  }
}

function assertStd015HofG4Traceability(traceability: unknown, label: string): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G4 traceability`,
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40", "FI-DSN-STD-015-R47"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of GOVERNED_HANDOFF_POSTURE_DECLARATION_TRACEABILITY.requirementIds) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R40", "FI-DSN-STD-015-R47"],
      );
    }
  }
}

function assertStd015HofG5Traceability(
  traceability: unknown,
  label: string,
  errorCode: "invalid_handoff_completion" = "invalid_handoff_completion",
): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G5 traceability`,
      errorCode,
      ["FI-DSN-STD-015-R48", "FI-DSN-STD-015-R57"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of GOVERNED_HANDOFF_ACT_LAYER_LIFECYCLE_TRACEABILITY.requirementIds) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        errorCode,
        ["FI-DSN-STD-015-R48", "FI-DSN-STD-015-R57"],
      );
    }
  }
}

function assertStd015HofG6U2Traceability(
  traceability: unknown,
  label: string,
  errorCode: "invalid_handoff_suspension" = "invalid_handoff_suspension",
): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G6-U2 traceability`,
      errorCode,
      ["FI-DSN-STD-015-R84", "FI-DSN-STD-015-R97"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of GOVERNED_HANDOFF_SUSPENSION_TRACEABILITY.requirementIds) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        errorCode,
        ["FI-DSN-STD-015-R84", "FI-DSN-STD-015-R97"],
      );
    }
  }
}

function assertStd015HofG6U3Traceability(
  traceability: unknown,
  label: string,
  errorCode: "invalid_handoff_withdrawal" = "invalid_handoff_withdrawal",
): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G6-U3 traceability`,
      errorCode,
      ["FI-DSN-STD-015-R98", "FI-DSN-STD-015-R111"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of GOVERNED_HANDOFF_WITHDRAWAL_TRACEABILITY.requirementIds) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        errorCode,
        ["FI-DSN-STD-015-R98", "FI-DSN-STD-015-R111"],
      );
    }
  }
}

function assertStd015HofG6U4Traceability(
  traceability: unknown,
  label: string,
  errorCode: "invalid_handoff_recall" = "invalid_handoff_recall",
): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G6-U4 traceability`,
      errorCode,
      ["FI-DSN-STD-015-R112", "FI-DSN-STD-015-R125"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of GOVERNED_HANDOFF_RECALL_TRACEABILITY.requirementIds) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        errorCode,
        ["FI-DSN-STD-015-R112", "FI-DSN-STD-015-R125"],
      );
    }
  }
}

function assertStd015HercmTraceability(
  traceability: unknown,
  label: string,
  errorCode: "invalid_handoff_resumption" | "invalid_handoff_reentry",
): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HERCM traceability`,
      errorCode,
      ["FI-DSN-STD-015-R126", "FI-DSN-STD-015-R139"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of GOVERNED_HANDOFF_HERCM_TRACEABILITY.requirementIds) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        errorCode,
        ["FI-DSN-STD-015-R126", "FI-DSN-STD-015-R139"],
      );
    }
  }
}

function assertStd015HofG8Traceability(
  traceability: unknown,
  label: string,
  errorCode: "invalid_handoff_downstream_exit_boundary" = "invalid_handoff_downstream_exit_boundary",
): void {
  if (
    !traceability ||
    typeof traceability !== "object" ||
    (traceability as Record<string, unknown>).governingStandardId !== STD015_GOVERNING_STANDARD ||
    !Array.isArray((traceability as Record<string, unknown>).requirementIds) ||
    ((traceability as Record<string, unknown>).requirementIds as unknown[]).length === 0
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires FI-DSN-STD-015 HOF-G8 exit-boundary traceability`,
      errorCode,
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
    );
  }
  const ids = (traceability as Record<string, unknown>).requirementIds as unknown[];
  for (const required of GOVERNED_HANDOFF_DOWNSTREAM_EXIT_BOUNDARY_TRACEABILITY.requirementIds) {
    if (!ids.includes(required)) {
      throw new OrchestraConstitutionalError(
        `${label} traceability must include ${required}`,
        errorCode,
        ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
      );
    }
  }
}

function assertAuditMetadata(audit: unknown, label: string): void {
  if (!audit || typeof audit !== "object") {
    throw new OrchestraConstitutionalError(
      `${label} requires audit metadata`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
  const record = audit as Record<string, unknown>;
  if (typeof record.createdAt !== "string" || typeof record.createdBy !== "string") {
    throw new OrchestraConstitutionalError(
      `${label} requires audit createdAt and createdBy`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
  const auditTraceability = record.traceability as Record<string, unknown> | null;
  if (
    !auditTraceability ||
    typeof auditTraceability !== "object" ||
    !Array.isArray(auditTraceability.requirementIds)
  ) {
    throw new OrchestraConstitutionalError(
      `${label} requires audit traceability`,
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
}

export function validatePersistedProductionReadinessReview(
  raw: unknown,
): asserts raw is ProductionReadinessReview {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Production-readiness Review",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (record.posture !== "under_review" && record.posture !== "review_determined") {
    throw new OrchestraConstitutionalError(
      "Invalid Production-readiness Review posture",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R27"],
    );
  }

  if (record.posture === "under_review") {
    if (record.determinationId !== null) {
      throw new OrchestraConstitutionalError(
        "Under Review posture must not carry a Review Determination identity",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R27"],
      );
    }
  } else if (
    typeof record.determinationId !== "string" ||
    !record.determinationId.startsWith(ID_PREFIXES.determination)
  ) {
    throw new OrchestraConstitutionalError(
      "Review Determined posture requires a valid Review Determination identity",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R27"],
    );
  }

  if (record.eligibilityStatus !== "review_entry_eligible") {
    throw new OrchestraConstitutionalError(
      "Invalid Review entry eligibility status",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R13"],
    );
  }

  const priorNull = record.priorReviewId === null || record.priorReviewId === undefined;
  const eligibilityNull =
    record.resubmissionEligibilityId === null || record.resubmissionEligibilityId === undefined;
  // Backward-compatible: missing fields treated as null (pre-G7 persisted reviews).
  if (record.priorReviewId === undefined && record.resubmissionEligibilityId === undefined) {
    // allow legacy — normalized at rehydration sites that construct reviews via admit
  } else if (priorNull !== eligibilityNull) {
    throw new OrchestraConstitutionalError(
      "Review priorReviewId and resubmissionEligibilityId must both be null or both set",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R51"],
    );
  } else if (!priorNull) {
    assertBrandedId(record.priorReviewId, ID_PREFIXES.review, "prior Production-readiness Review");
    if (
      typeof record.resubmissionEligibilityId !== "string" ||
      !record.resubmissionEligibilityId.startsWith("resubmission-eligibility-")
    ) {
      throw new OrchestraConstitutionalError(
        "Invalid resubmission eligibility identity on Review",
        "invalid_downstream_disposition",
        ["FI-DSN-STD-014-R51"],
      );
    }
  }

  const evidence = record.domain2EntryEvidence as Record<string, unknown> | null;
  if (!evidence || typeof evidence !== "object") {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires Domain 2 entry evidence",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R10"],
    );
  }

  assertBrandedId(evidence.rvaId, ID_PREFIXES.rva, "entry evidence RVA");
  assertBrandedId(
    evidence.reviewEntryReadinessId,
    ID_PREFIXES.readiness,
    "entry evidence Review-Entry Readiness",
  );
  assertBrandedId(evidence.programId, ID_PREFIXES.program, "entry evidence Production Program");
  assertBrandedId(
    evidence.obligationId,
    ID_PREFIXES.obligation,
    "entry evidence Production Obligation",
  );

  if (evidence.rvaId !== record.rvaId) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence RVA does not match review subject",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08"],
    );
  }

  if (evidence.programId !== record.programId) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence program does not match review subject",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R11"],
    );
  }

  if (evidence.obligationId !== record.obligationId) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence obligation does not match review subject",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R11"],
    );
  }

  if (evidence.rvaPostureAtEntry !== "rva_exists") {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence requires legal Review-entry RVA posture",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R08", "FI-DSN-STD-014-R12"],
    );
  }

  if (typeof evidence.traceabilityPackageId !== "string" || !evidence.traceabilityPackageId) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence requires Traceability Package reference",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R10"],
    );
  }

  if (
    typeof evidence.realizationPath !== "string" ||
    !(LEGAL_REALIZATION_PATHS as readonly string[]).includes(evidence.realizationPath)
  ) {
    throw new OrchestraConstitutionalError(
      "Domain 2 entry evidence requires legal realization path",
      "invalid_review_entry_eligibility",
      ["FI-DSN-STD-014-R10"],
    );
  }

  try {
    validateLineageCoherence(
      evidence.lineage as Parameters<typeof validateLineageCoherence>[0],
      evidence.rvaId as RealizedVisualArtifactId,
    );
  } catch (error) {
    if (error instanceof OrchestraConstitutionalError) {
      throw new OrchestraConstitutionalError(
        "Domain 2 entry evidence lineage is malformed",
        "invalid_domain3_persistence_state",
        ["FI-DSN-STD-014-R10"],
      );
    }
    throw error;
  }

  assertAuditMetadata(record.audit, "Production-readiness Review");
  assertDomain3Traceability(record.traceability, "Production-readiness Review");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Production-readiness Review requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R08"],
    );
  }
}

export function validatePersistedReviewEvidence(
  raw: unknown,
): asserts raw is ReviewEvidenceRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Review evidence",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R20"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.evidenceId, ID_PREFIXES.evidence, "Review evidence");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");

  if (!isMandatoryReviewDimensionId(record.dimensionId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Review evidence requires a mandatory Review dimension",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R15", "FI-DSN-STD-014-R19"],
    );
  }

  if (record.evidenceCategoryId !== record.dimensionId) {
    throw new OrchestraConstitutionalError(
      "Review evidence category must match its Review dimension organization",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  if (!(LEGAL_SOURCE_KINDS as readonly string[]).includes(record.sourceKind as string)) {
    throw new OrchestraConstitutionalError(
      "Persisted Review evidence requires legal source kind",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  if (typeof record.sourceRecordId !== "string" || !record.sourceRecordId) {
    throw new OrchestraConstitutionalError(
      "Persisted Review evidence requires source record identity",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  if (typeof record.sourceSnapshot !== "string" || !record.sourceSnapshot) {
    throw new OrchestraConstitutionalError(
      "Persisted Review evidence requires immutable source snapshot",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R20"],
    );
  }

  assertAuditMetadata(record.audit, "Review evidence");
  assertDomain3Traceability(record.traceability, "Review evidence");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Review evidence requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R20"],
    );
  }
}

export function validatePersistedReviewDimensionActivity(
  raw: unknown,
): asserts raw is ReviewDimensionActivityRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Review dimension activity",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.activityId, ID_PREFIXES.activity, "Review dimension activity");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");

  if (!isMandatoryReviewDimensionId(record.dimensionId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Review dimension activity requires a mandatory Review dimension",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R15", "FI-DSN-STD-014-R19"],
    );
  }

  if (!Array.isArray(record.evidenceIds) || record.evidenceIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Review dimension activity requires at least one evidence identity",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R16", "FI-DSN-STD-014-R20"],
    );
  }

  for (const evidenceId of record.evidenceIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }

  if (typeof record.observation !== "string" || !record.observation.trim()) {
    throw new OrchestraConstitutionalError(
      "Review dimension activity requires observation",
      "invalid_review_activity",
      ["FI-DSN-STD-014-R14"],
    );
  }

  assertAuditMetadata(record.audit, "Review dimension activity");
  assertDomain3Traceability(record.traceability, "Review dimension activity");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Review dimension activity requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R14"],
    );
  }
}

const LEGAL_DTF_OBSERVATION_KINDS = [
  "compatibility_observation",
  "feasibility_concern",
  "boundary_conflict",
  "applicability_gap",
] as const;

export function validatePersistedDesignTimeFeasibilityEvaluation(
  raw: unknown,
): asserts raw is DesignTimeFeasibilityEvaluationRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Design-Time Feasibility evaluation",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R21"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.evaluationId, ID_PREFIXES.dtfEvaluation, "Design-Time Feasibility evaluation");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");

  if (record.dimensionId !== "design_time_feasibility") {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation dimension must be design_time_feasibility",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R15", "FI-DSN-STD-014-R21"],
    );
  }

  if (!Array.isArray(record.applicableManufacturingBoundaries)) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation requires applicable manufacturing boundary list",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R21"],
    );
  }

  for (const boundary of record.applicableManufacturingBoundaries) {
    if (!boundary || typeof boundary !== "object") {
      throw new OrchestraConstitutionalError(
        "Invalid applicable manufacturing boundary reference",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R21"],
      );
    }
    const item = boundary as Record<string, unknown>;
    if (
      typeof item.sourceStandardId !== "string" ||
      !isCanonicalFrozenBindingFiMfgStandardId(item.sourceStandardId) ||
      item.bindingPosture !== "frozen_binding"
    ) {
      throw new OrchestraConstitutionalError(
        "Applicable manufacturing boundary must be a canonical frozen binding FI-MFG-* reference",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R21"],
      );
    }
  }

  if (!Array.isArray(record.observations) || record.observations.length === 0) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation requires observations",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R25"],
    );
  }

  for (const observation of record.observations) {
    if (!observation || typeof observation !== "object") {
      throw new OrchestraConstitutionalError(
        "Invalid Design-Time Feasibility observation",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R25"],
      );
    }
    const item = observation as Record<string, unknown>;
    if (
      !(LEGAL_DTF_OBSERVATION_KINDS as readonly string[]).includes(item.kind as string) ||
      typeof item.text !== "string" ||
      !item.text.trim()
    ) {
      throw new OrchestraConstitutionalError(
        "Design-Time Feasibility observation kind/text is invalid",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R25"],
      );
    }
    if (
      item.relatedSourceStandardId !== undefined &&
      !isCanonicalFrozenBindingFiMfgStandardId(item.relatedSourceStandardId)
    ) {
      throw new OrchestraConstitutionalError(
        "Design-Time Feasibility observation related manufacturing authority must be canonical frozen binding",
        "invalid_design_time_feasibility",
        ["FI-DSN-STD-014-R21"],
      );
    }
  }

  if (
    record.manufacturingValidationNotPerformed !== true ||
    record.fulfillmentExecutionNotPerformed !== true ||
    record.decisionStageAffirmed !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility must affirm decision-stage evaluation without Manufacturing Validation or Fulfillment Execution",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R23", "FI-DSN-STD-014-R26"],
    );
  }

  if (typeof record.evaluationMethodDescription !== "string" || !record.evaluationMethodDescription.trim()) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility requires method-neutral provenance",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R24"],
    );
  }

  if (!Array.isArray(record.evidenceIds) || record.evidenceIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation requires linked Review evidence identities",
      "invalid_design_time_feasibility",
      ["FI-DSN-STD-014-R25"],
    );
  }

  for (const evidenceId of record.evidenceIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }

  if (
    record.activityId !== null &&
    (typeof record.activityId !== "string" ||
      !record.activityId.startsWith(ID_PREFIXES.activity))
  ) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation activity identity is malformed",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R25"],
    );
  }

  assertAuditMetadata(record.audit, "Design-Time Feasibility evaluation");
  assertDomain3Traceability(record.traceability, "Design-Time Feasibility evaluation");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Design-Time Feasibility evaluation requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R21"],
    );
  }
}

export function validatePersistedReviewDetermination(
  raw: unknown,
): asserts raw is ReviewDeterminationRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Review Determination",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R27"],
    );
  }

  const record = raw as Record<string, unknown>;
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isLegalReviewDeterminationOutcome(record.outcome)) {
    throw new OrchestraConstitutionalError(
      "Persisted Review Determination requires legal outcome Pass, Conditional, or Fail",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R28"],
    );
  }

  if (!Array.isArray(record.evidenceBasisIds) || record.evidenceBasisIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires non-empty evidence basis",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R30"],
    );
  }

  for (const evidenceId of record.evidenceBasisIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }

  if (!Array.isArray(record.activityBasisIds) || record.activityBasisIds.length === 0) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires non-empty activity basis",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R30"],
    );
  }

  for (const activityId of record.activityBasisIds) {
    assertBrandedId(activityId, ID_PREFIXES.activity, "Review dimension activity");
  }

  if (!Array.isArray(record.conditions)) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires conditions array",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R29"],
    );
  }

  const conditions = record.conditions as unknown[];
  for (const condition of conditions) {
    if (typeof condition !== "string" || !condition.trim()) {
      throw new OrchestraConstitutionalError(
        "Review Determination conditions must be non-empty strings",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R29"],
      );
    }
  }

  if (typeof record.grounds !== "string" || !record.grounds.trim()) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires documented grounds",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R29"],
    );
  }

  if (record.outcome === "conditional") {
    if (conditions.length === 0) {
      throw new OrchestraConstitutionalError(
        "Conditional Review Determination requires bounded documented conditions",
        "invalid_review_determination",
        ["FI-DSN-STD-014-R29", "FI-DSN-STD-014-R31"],
      );
    }
  } else if (conditions.length > 0) {
    throw new OrchestraConstitutionalError(
      "Pass and Fail Review Determinations must not carry Conditional conditions",
      "invalid_review_determination",
      ["FI-DSN-STD-014-R28", "FI-DSN-STD-014-R29"],
    );
  }

  if (typeof record.determinedAt !== "string" || typeof record.determinedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Review Determination requires determinedAt and determinedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R27"],
    );
  }

  assertAuditMetadata(record.audit, "Review Determination");
  assertDomain3Traceability(record.traceability, "Review Determination");

  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Review Determination requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R27"],
    );
  }
}

export function validatePersistedApprovalAct(raw: unknown): asserts raw is ApprovalActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Approval act",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R41"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isCanonicalEstablishedApprovalAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Approval act requires established MAGAC authority class",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R38"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-014-002") {
    throw new OrchestraConstitutionalError(
      "Persisted Approval act requires PD-STD-014-002 governing source",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36"],
    );
  }
  if (
    record.authorityConstitutionalScope !== "production_obligation" &&
    record.authorityConstitutionalScope !== "production_program"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Approval act requires lawful MAGAC constitutional scope",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
    );
  }

  const established = resolveEstablishedApprovalAuthorityClass(
    record.authorityClassId as ApprovalActRecord["authorityClassId"],
  );
  if (record.authorityConstitutionalScope !== established.authorizedConstitutionalScope) {
    throw new OrchestraConstitutionalError(
      "Persisted Approval MAGAC scope does not match established authority class",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
    );
  }

  const activation = record.activationScope;
  if (!activation || typeof activation !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Approval act requires MAGAC activation scope",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R38"],
    );
  }
  const activationRecord = activation as Record<string, unknown>;
  if (established.authorizedConstitutionalScope === "production_program") {
    if (activationRecord.kind !== "production_program") {
      throw new OrchestraConstitutionalError(
        "Program-scoped MAGAC class cannot activate under Production Obligation scope",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
      );
    }
    assertBrandedId(activationRecord.programId, ID_PREFIXES.program, "MAGAC Program activation");
    if (activationRecord.programId !== record.programId) {
      throw new OrchestraConstitutionalError(
        "MAGAC Program activation scope identity does not match Approval Program",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R38"],
      );
    }
  } else {
    if (activationRecord.kind !== "production_obligation") {
      throw new OrchestraConstitutionalError(
        "Obligation-scoped MAGAC class cannot activate under Production Program scope",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R37"],
      );
    }
    assertBrandedId(
      activationRecord.obligationId,
      ID_PREFIXES.obligation,
      "MAGAC Obligation activation",
    );
    if (activationRecord.obligationId !== record.obligationId) {
      throw new OrchestraConstitutionalError(
        "MAGAC Obligation activation scope identity does not match Approval Obligation",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R37", "FI-DSN-STD-014-R38"],
      );
    }
  }

  if (record.gpraNotCreatedByThisAct !== true) {
    throw new OrchestraConstitutionalError(
      "Approval act must affirm GPRA is not created by Approval alone",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R41", "FI-DSN-STD-014-R42"],
    );
  }
  if (
    record.manufacturingValidationNotPerformed !== true ||
    record.fulfillmentExecutionNotPerformed !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Approval must not claim Manufacturing Validation or Fulfillment Execution",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R41"],
    );
  }
  if (typeof record.approvedAt !== "string" || typeof record.approvedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Approval act requires approvedAt and approvedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R38"],
    );
  }
  assertAuditMetadata(record.audit, "Approval act");
  assertDomain3Traceability(record.traceability, "Approval act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Approval act requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R41"],
    );
  }
}

export function validatePersistedApprovalWithholding(
  raw: unknown,
): asserts raw is ApprovalWithholdingRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Approval withholding",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R39"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.withholdingId, ID_PREFIXES.withholding, "Approval withholding");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isMandatoryApprovalWithholdingGroundFamily(record.groundFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted Approval withholding requires mandatory EGWG ground family",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R39", "FI-DSN-STD-014-R40"],
    );
  }
  if (typeof record.grounds !== "string" || !record.grounds.trim()) {
    throw new OrchestraConstitutionalError(
      "Approval withholding requires documented grounds",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R39"],
    );
  }
  if (record.passDeterminationPreserved !== true) {
    throw new OrchestraConstitutionalError(
      "Approval withholding must preserve Pass Determination",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R35", "FI-DSN-STD-014-R39"],
    );
  }
  assertAuditMetadata(record.audit, "Approval withholding");
  assertDomain3Traceability(record.traceability, "Approval withholding");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Approval withholding requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R39"],
    );
  }
}

export function validatePersistedGpraGrant(raw: unknown): asserts raw is GpraGrantRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted GPRA grant",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R42"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isCanonicalEstablishedApprovalAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA requires established MAGAC authority class",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R36", "FI-DSN-STD-014-R42"],
    );
  }
  if (
    record.collectionMembershipNotConferred !== true ||
    record.governedHandoffNotAuthorized !== true
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA must exclude collection membership and Governed Handoff authorization",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R43"],
    );
  }
  if (
    record.manufacturingValidationNotPerformed !== true ||
    record.fulfillmentExecutionNotPerformed !== true
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA must not claim Manufacturing Validation or Fulfillment Execution",
      "invalid_gpra_grant",
      ["FI-DSN-STD-014-R42"],
    );
  }
  if (typeof record.grantedAt !== "string" || typeof record.grantedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "GPRA grant requires grantedAt and grantedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R42"],
    );
  }
  assertAuditMetadata(record.audit, "GPRA grant");
  assertDomain3Traceability(record.traceability, "GPRA grant");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "GPRA grant requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R42"],
    );
  }
}

function assertReworkAuthorizationId(value: unknown): void {
  if (
    typeof value !== "string" ||
    !value.startsWith(ID_PREFIXES.reworkAuthorization) ||
    value.startsWith(ID_PREFIXES.reworkAuthorizationWithholding)
  ) {
    throw new OrchestraConstitutionalError(
      "Invalid Domain 3 Rework authorization identity",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R47"],
    );
  }
}

export function validatePersistedDownstreamDeficiencyRecord(
  raw: unknown,
): asserts raw is DownstreamDeficiencyRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Downstream deficiency record",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R46"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.deficiencyRecordId,
    ID_PREFIXES.downstreamDeficiency,
    "Downstream deficiency record",
  );
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_CONDITIONAL_FAIL_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires Conditional or Fail disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46", "FI-DSN-STD-014-R49"],
    );
  }
  if (!isMandatoryGovernedDeficiencyFamily(record.deficiencyFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted Downstream deficiency requires mandatory EGDF family",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46"],
    );
  }
  if (typeof record.grounds !== "string" || !record.grounds.trim()) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires documented grounds",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46"],
    );
  }
  if (!Array.isArray(record.evidenceBasisIds)) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires evidenceBasisIds array",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R46"],
    );
  }
  for (const evidenceId of record.evidenceBasisIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Downstream deficiency requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-014-012") {
    throw new OrchestraConstitutionalError(
      "Persisted Downstream deficiency requires PD-STD-014-012 governing source",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }
  if (typeof record.recordedAt !== "string" || typeof record.recordedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires recordedAt and recordedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R46"],
    );
  }
  if (record.determinationNotRevised !== true) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency must affirm determinationNotRevised",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R44", "FI-DSN-STD-014-R46"],
    );
  }
  assertAuditMetadata(record.audit, "Downstream deficiency record");
  assertDomain3Traceability(record.traceability, "Downstream deficiency record");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Downstream deficiency requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R46"],
    );
  }
}

export function validatePersistedReworkAuthorization(
  raw: unknown,
): asserts raw is ReworkAuthorizationRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Rework authorization",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R47"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertReworkAuthorizationId(record.reworkAuthorizationId);
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_CONDITIONAL_FAIL_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Rework authorization requires Conditional or Fail disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R47", "FI-DSN-STD-014-R49"],
    );
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Rework authorization requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R47"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-014-012") {
    throw new OrchestraConstitutionalError(
      "Persisted Rework authorization requires PD-STD-014-012 governing source",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45"],
    );
  }
  if (typeof record.authorizedAt !== "string" || typeof record.authorizedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Rework authorization requires authorizedAt and authorizedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R47"],
    );
  }
  if (
    record.determinationNotRevised !== true ||
    record.notApproval !== true ||
    record.notGpra !== true ||
    record.manufacturingValidationNotPerformed !== true ||
    record.fulfillmentExecutionNotPerformed !== true ||
    record.std013IterationNotPerformed !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Rework authorization must affirm determination preservation and exclusion markers",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R47"],
    );
  }
  assertAuditMetadata(record.audit, "Rework authorization");
  assertDomain3Traceability(record.traceability, "Rework authorization");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Rework authorization requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R47"],
    );
  }
}

export function validatePersistedReworkAuthorizationWithholding(
  raw: unknown,
): asserts raw is ReworkAuthorizationWithholdingRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Rework authorization withholding",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R48"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.withholdingId,
    ID_PREFIXES.reworkAuthorizationWithholding,
    "Rework authorization withholding",
  );
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_CONDITIONAL_FAIL_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires Conditional or Fail disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R48", "FI-DSN-STD-014-R49"],
    );
  }
  if (typeof record.grounds !== "string" || !record.grounds.trim()) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires documented grounds",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R48"],
    );
  }
  if (record.governingSourceId !== "PD-STD-014-009") {
    throw new OrchestraConstitutionalError(
      "Persisted Rework authorization withholding requires PD-STD-014-009 governing source",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R48"],
    );
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Rework authorization withholding requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R48"],
    );
  }
  if (typeof record.withheldAt !== "string" || typeof record.withheldBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires withheldAt and withheldBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R48"],
    );
  }
  if (record.determinationNotRevised !== true) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding must affirm determinationNotRevised",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R44", "FI-DSN-STD-014-R48"],
    );
  }
  assertAuditMetadata(record.audit, "Rework authorization withholding");
  assertDomain3Traceability(record.traceability, "Rework authorization withholding");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Rework authorization withholding requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R48"],
    );
  }
}

export function validatePersistedReturnPosture(
  raw: unknown,
): asserts raw is ReturnPostureRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Return posture",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R49"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.returnPostureId, ID_PREFIXES.returnPosture, "Return posture");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_DOWNSTREAM_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Return posture requires a legal Downstream disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (!(LEGAL_RETURN_KINDS as readonly string[]).includes(record.returnKind as string)) {
    throw new OrchestraConstitutionalError(
      "Return posture requires a legal return kind",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (
    record.targetObligationScope !== null &&
    record.targetObligationScope !== "same_obligation" &&
    record.targetObligationScope !== "successor_obligation"
  ) {
    throw new OrchestraConstitutionalError(
      "Return posture targetObligationScope is invalid",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (
    record.approvalWithholdingId !== null &&
    (typeof record.approvalWithholdingId !== "string" ||
      !record.approvalWithholdingId.startsWith(ID_PREFIXES.withholding))
  ) {
    throw new OrchestraConstitutionalError(
      "Return posture Approval withholding identity is malformed",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (record.route === "withholding_return_only") {
    throw new OrchestraConstitutionalError(
      "Persisted Route C Return Posture is not authorized: frozen TRPM baseline after Pass plus Approval withholding is block-without-return and no exceptional return-authorizing source is currently established",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (record.returnKind === "return_authorized_after_approval_withholding") {
    throw new OrchestraConstitutionalError(
      "Persisted Route C Return Posture kind is not authorized under the current frozen Route C authority catalog",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (record.approvalWithholdingId !== null) {
    throw new OrchestraConstitutionalError(
      "Conditional/Fail return posture must not carry Approval withholding identity",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (typeof record.returnGoverningSourceId !== "string" || !record.returnGoverningSourceId.trim()) {
    throw new OrchestraConstitutionalError(
      "Return posture requires returnGoverningSourceId",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Return posture requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R49"],
    );
  }
  if (typeof record.establishedAt !== "string" || typeof record.establishedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Return posture requires establishedAt and establishedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R49"],
    );
  }
  if (record.determinationNotRevised !== true || record.terminationNotAuthorized !== true) {
    throw new OrchestraConstitutionalError(
      "Return posture must affirm determinationNotRevised and terminationNotAuthorized",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R49", "FI-DSN-STD-014-R50"],
    );
  }
  assertAuditMetadata(record.audit, "Return posture");
  assertDomain3Traceability(record.traceability, "Return posture");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Return posture requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R49"],
    );
  }
}

export function validatePersistedResubmissionEligibility(
  raw: unknown,
): asserts raw is ResubmissionEligibilityRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Resubmission eligibility",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R51"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.eligibilityId,
    ID_PREFIXES.resubmissionEligibility,
    "Resubmission eligibility",
  );
  assertBrandedId(record.priorReviewId, ID_PREFIXES.review, "prior Production-readiness Review");
  assertBrandedId(
    record.priorDeterminationId,
    ID_PREFIXES.determination,
    "prior Review Determination",
  );
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!(LEGAL_CONDITIONAL_FAIL_ROUTES as readonly string[]).includes(record.route as string)) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility requires Conditional or Fail disposition route",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R51"],
    );
  }
  if (!isCanonicalEstablishedDownstreamDispositionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Resubmission eligibility requires established DDAC authority class",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R45", "FI-DSN-STD-014-R51"],
    );
  }
  if (typeof record.authorizedAt !== "string" || typeof record.authorizedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility requires authorizedAt and authorizedBy",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R51"],
    );
  }
  if (
    record.priorDeterminationPreserved !== true ||
    record.satisfiedConditionalNotRecognized !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility must affirm priorDeterminationPreserved and satisfiedConditionalNotRecognized",
      "invalid_downstream_disposition",
      ["FI-DSN-STD-014-R51"],
    );
  }
  assertAuditMetadata(record.audit, "Resubmission eligibility");
  assertDomain3Traceability(record.traceability, "Resubmission eligibility");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Resubmission eligibility requires valid governed creation marker",
      "invalid_domain3_persistence_state",
      ["FI-DSN-STD-014-R51"],
    );
  }
}

export function validatePersistedGpraInvalidationAct(
  raw: unknown,
): asserts raw is GpraInvalidationActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted GPRA invalidation act",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.invalidationActId, ID_PREFIXES.gpraInvalidation, "GPRA invalidation act");
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (!isMandatoryInvalidationTriggerFamily(record.itFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation requires mandatory PVTA IT family",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R56"],
    );
  }
  if (!isCanonicalEstablishedInvalidationAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation requires established IVAC authority class",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57"],
    );
  }
  resolveEstablishedInvalidationAuthorityClass(
    record.authorityClassId as GpraInvalidationActRecord["authorityClassId"],
  );
  if (record.authorityGoverningSourceId !== "PD-STD-014-007") {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation requires PD-STD-014-007 governing source",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57"],
    );
  }

  if (record.itFamily === "material_compliance_boundary_change") {
    if (record.materialNonComplianceEstablished !== true) {
      throw new OrchestraConstitutionalError(
        "Persisted IT-2 invalidation requires materialNonComplianceEstablished",
        "invalid_gpra_invalidation",
        ["FI-DSN-STD-014-R58"],
      );
    }
  } else if (record.materialNonComplianceEstablished !== null) {
    throw new OrchestraConstitutionalError(
      "Persisted non-IT-2 invalidation must not carry material non-compliance attribution",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R56", "FI-DSN-STD-014-R58"],
    );
  }

  if (
    typeof record.triggeringGoverningSourceId !== "string" ||
    !record.triggeringGoverningSourceId.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires triggeringGoverningSourceId",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
    );
  }
  if (typeof record.constitutionalEvidence !== "string" || !record.constitutionalEvidence.trim()) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires constitutionalEvidence",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R59"],
    );
  }
  if (typeof record.invalidatedAt !== "string" || typeof record.invalidatedBy !== "string") {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation requires invalidatedAt and invalidatedBy",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R57", "FI-DSN-STD-014-R59"],
    );
  }

  if (
    record.historicalGrantPreserved !== true ||
    record.determinationNotRevised !== true ||
    record.notLifecycleTermination !== true ||
    record.forwardHandoffEligibilityTerminated !== true ||
    record.newIntakeAuthorityTerminated !== true ||
    record.cannotSilentlyReactivate !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA invalidation must preserve historical grant and Determination, terminate forward force, and forbid silent reactivation",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R55", "FI-DSN-STD-014-R60", "FI-DSN-STD-014-R62"],
    );
  }

  assertAuditMetadata(record.audit, "GPRA invalidation act");
  assertDomain3Traceability(record.traceability, "GPRA invalidation act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "GPRA invalidation act requires valid governed creation marker",
      "invalid_gpra_invalidation",
      ["FI-DSN-STD-014-R54", "FI-DSN-STD-014-R59"],
    );
  }
}

export function validatePersistedGpraSupersessionAct(
  raw: unknown,
): asserts raw is GpraSupersessionActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted GPRA supersession act",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.supersessionActId, ID_PREFIXES.gpraSupersession, "GPRA supersession act");
  assertBrandedId(record.predecessorGpraId, ID_PREFIXES.gpra, "predecessor GPRA");
  assertBrandedId(record.successorGpraId, ID_PREFIXES.gpra, "successor GPRA");
  assertBrandedId(record.predecessorApprovalActId, ID_PREFIXES.approvalAct, "predecessor Approval act");
  assertBrandedId(record.successorApprovalActId, ID_PREFIXES.approvalAct, "successor Approval act");
  assertBrandedId(
    record.predecessorReviewId,
    ID_PREFIXES.review,
    "predecessor Production-readiness Review",
  );
  assertBrandedId(
    record.successorReviewId,
    ID_PREFIXES.review,
    "successor Production-readiness Review",
  );
  assertBrandedId(
    record.predecessorDeterminationId,
    ID_PREFIXES.determination,
    "predecessor Review Determination",
  );
  assertBrandedId(
    record.successorDeterminationId,
    ID_PREFIXES.determination,
    "successor Review Determination",
  );
  assertBrandedId(record.predecessorRvaId, ID_PREFIXES.rva, "predecessor Realized Visual Artifact");
  assertBrandedId(record.successorRvaId, ID_PREFIXES.rva, "successor Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (record.predecessorGpraId === record.successorGpraId) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession requires distinct predecessor and successor GPRA identities",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }

  if (!isMandatorySupersessionTriggerFamily(record.stFamily)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession requires mandatory ST family",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R66"],
    );
  }
  if (!isCanonicalEstablishedSupersessionAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession requires established SSAC authority class",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68"],
    );
  }
  resolveEstablishedSupersessionAuthorityClass(
    record.authorityClassId as GpraSupersessionActRecord["authorityClassId"],
  );
  if (record.authorityGoverningSourceId !== "PD-STD-014-014") {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession requires PD-STD-014-014 governing source",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68"],
    );
  }

  if (
    typeof record.handoffConsumerContextId !== "string" ||
    !record.handoffConsumerContextId.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires non-empty handoffConsumerContextId",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }
  if (
    typeof record.triggeringGoverningSourceId !== "string" ||
    !record.triggeringGoverningSourceId.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires triggeringGoverningSourceId",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
  if (typeof record.constitutionalEvidence !== "string" || !record.constitutionalEvidence.trim()) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires constitutionalEvidence",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R69"],
    );
  }
  if (typeof record.supersededAt !== "string" || typeof record.supersededBy !== "string") {
    throw new OrchestraConstitutionalError(
      "GPRA supersession requires supersededAt and supersededBy",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R68", "FI-DSN-STD-014-R69"],
    );
  }

  if (
    record.historicalPredecessorPreserved !== true ||
    record.determinationNotRevised !== true ||
    record.notLifecycleTermination !== true ||
    record.notInvalidation !== true ||
    record.predecessorForwardAuthorityTerminatedInContext !== true ||
    record.successorAuthoritativeInContext !== true ||
    record.cannotOverwritePredecessor !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted GPRA supersession must preserve historical predecessor, terminate forward authority in context, and forbid overwrite without invalidation or lifecycle termination",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R70", "FI-DSN-STD-014-R71"],
    );
  }

  assertAuditMetadata(record.audit, "GPRA supersession act");
  assertDomain3Traceability(record.traceability, "GPRA supersession act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "GPRA supersession act requires valid governed creation marker",
      "invalid_gpra_supersession",
      ["FI-DSN-STD-014-R65", "FI-DSN-STD-014-R69"],
    );
  }
}

export function validatePersistedDomain3BrainAdvisory(
  raw: unknown,
): asserts raw is Domain3BrainAdvisoryRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Domain 3 Brain advisory",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.advisoryId, ID_PREFIXES.brainAdvisory, "Domain 3 Brain advisory");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");

  if (
    record.sourceAttribution !== "brain_runtime" &&
    record.sourceAttribution !== "writing_engine"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory sourceAttribution must be brain_runtime or writing_engine",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  if (typeof record.eventTime !== "string" || !record.eventTime.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory requires eventTime",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  if (typeof record.brainRuntimeVersion !== "string" || !record.brainRuntimeVersion.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory requires brainRuntimeVersion",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  if (!isDomain3DecisionStage(record.decisionStage)) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory has unknown decisionStage",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R77"],
    );
  }
  if (!isDomain3BrainOutputClass(record.outputClass)) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory has unknown outputClass",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R75"],
    );
  }
  assertOutputClassAllowedForStage(record.decisionStage, record.outputClass);

  if (record.reviewId === null) {
    if (record.decisionStage !== "pre_review") {
      throw new OrchestraConstitutionalError(
        "Persisted Brain advisory without reviewId is only valid at pre_review",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R77", "FI-DSN-STD-014-R78"],
      );
    }
  } else {
    assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  }

  if (record.determinationId != null) {
    assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  }
  if (record.gpraId != null) {
    assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  }
  if (
    record.postureState !== null &&
    record.postureState !== "retention" &&
    record.postureState !== "invalidated" &&
    record.postureState !== "superseded"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory postureState must be retention, invalidated, superseded, or null",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  if (!Array.isArray(record.evidenceIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory requires evidenceIds array",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
  for (const evidenceId of record.evidenceIds) {
    assertBrandedId(evidenceId, ID_PREFIXES.evidence, "Review evidence");
  }
  if (typeof record.advisoryContent !== "string" || !record.advisoryContent.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory requires non-empty advisoryContent",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }

  if (record.outputClass === "nonbinding_reevaluation_request") {
    if (!isDomain3BrainReevaluationRequestType(record.reevaluationRequestType)) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory requires valid reevaluationRequestType",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    if (!isDomain3BrainAuthorityRouteKind(record.routesToAuthorityKind)) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory requires valid routesToAuthorityKind",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    if (
      DOMAIN3_REEVALUATION_REQUEST_ROUTE[record.reevaluationRequestType] !==
      record.routesToAuthorityKind
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory route does not match BRRM pairing",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R80"],
      );
    }
    const stages = DOMAIN3_REEVALUATION_REQUEST_ALLOWED_STAGES[record.reevaluationRequestType];
    if (!(stages as readonly string[]).includes(record.decisionStage)) {
      throw new OrchestraConstitutionalError(
        "Persisted reevaluation advisory stage does not match request type",
        "invalid_domain3_brain_advisory",
        ["FI-DSN-STD-014-R77", "FI-DSN-STD-014-R80"],
      );
    }
  } else if (record.reevaluationRequestType != null || record.routesToAuthorityKind != null) {
    throw new OrchestraConstitutionalError(
      "Persisted non-reevaluation advisory must not carry reevaluation routing fields",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R80"],
    );
  }

  if (
    record.nonbinding !== true ||
    record.notConstitutionalAuthority !== true ||
    record.distinguishableFromConstitutionalActs !== true ||
    record.doesNotCompelConstitutionalAction !== true ||
    record.doesNotAuthorize !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Brain advisory must carry nonbinding non-authority BRPAM markers",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R76", "FI-DSN-STD-014-R78", "FI-DSN-STD-014-R79"],
    );
  }

  assertAuditMetadata(record.audit, "Domain 3 Brain advisory");
  assertDomain3Traceability(record.traceability, "Domain 3 Brain advisory");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Domain 3 Brain advisory requires valid governed creation marker",
      "invalid_domain3_brain_advisory",
      ["FI-DSN-STD-014-R78"],
    );
  }
}

export function validatePersistedGovernedHandoffPreparation(
  raw: unknown,
): asserts raw is GovernedHandoffPreparationRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff preparation",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R94"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires non-empty handoffConsumerContextId",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R89"],
    );
  }
  if (!Array.isArray(record.consumerCategoryKeys) || record.consumerCategoryKeys.length === 0) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires nonempty consumerCategoryKeys",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R89"],
    );
  }
  for (const key of record.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preparation has unknown consumerCategoryKey",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R89"],
      );
    }
  }
  if (record.eligibilityLayerCondition !== "export_ready") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation eligibilityLayerCondition must be export_ready",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R90", "FI-DSN-STD-014-R94"],
    );
  }
  if (
    record.forwardHandoffEligibility !== true ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffExecution !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.std015ConsumptionBoundaryOnly !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation must carry non-authorization / non-execution boundary markers",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R93", "FI-DSN-STD-014-R95"],
    );
  }
  if (typeof record.preparedAt !== "string" || !record.preparedAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires preparedAt",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R94"],
    );
  }
  if (typeof record.preparedBy !== "string" || !record.preparedBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires preparedBy",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R83", "FI-DSN-STD-014-R94"],
    );
  }
  if (!Array.isArray(record.brainAdvisoryIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires brainAdvisoryIds array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87", "FI-DSN-STD-014-R92"],
    );
  }
  for (const advisoryId of record.brainAdvisoryIds) {
    assertBrandedId(advisoryId, ID_PREFIXES.brainAdvisory, "Domain 3 Brain advisory");
  }

  if (!record.validityExport || typeof record.validityExport !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires validityExport snapshot",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }
  const validityExport = record.validityExport as Record<string, unknown>;
  if (!validityExport.evaluationPoint || typeof validityExport.evaluationPoint !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation validityExport requires evaluationPoint",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }
  const evaluationPoint = validityExport.evaluationPoint as Record<string, unknown>;
  assertBrandedId(evaluationPoint.gpraId, ID_PREFIXES.gpra, "validityExport evaluationPoint GPRA");
  assertBrandedId(
    evaluationPoint.obligationId,
    ID_PREFIXES.obligation,
    "validityExport evaluationPoint obligation",
  );
  if (
    typeof evaluationPoint.handoffConsumerContextId !== "string" ||
    !evaluationPoint.handoffConsumerContextId.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted validityExport evaluationPoint requires handoffConsumerContextId",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }
  if (
    evaluationPoint.posture !== "retention" &&
    evaluationPoint.posture !== "invalidated" &&
    evaluationPoint.posture !== "superseded"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted validityExport evaluationPoint posture must be retention, invalidated, or superseded",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }
  assertBrandedId(validityExport.authoritativeGpraId, ID_PREFIXES.gpra, "authoritative GPRA");
  assertBrandedId(validityExport.approvalActId, ID_PREFIXES.approvalAct, "validityExport approval");
  assertBrandedId(validityExport.gpraGrantRef, ID_PREFIXES.gpra, "validityExport gpraGrantRef");
  if (validityExport.successorGpraId != null) {
    assertBrandedId(validityExport.successorGpraId, ID_PREFIXES.gpra, "successor GPRA");
  }
  if (validityExport.invalidationActId != null) {
    assertBrandedId(
      validityExport.invalidationActId,
      ID_PREFIXES.gpraInvalidation,
      "invalidation act",
    );
  }
  if (validityExport.supersessionActId != null) {
    assertBrandedId(
      validityExport.supersessionActId,
      ID_PREFIXES.gpraSupersession,
      "supersession act",
    );
  }
  if (typeof validityExport.forwardHandoffEligibility !== "boolean") {
    throw new OrchestraConstitutionalError(
      "Persisted validityExport requires forwardHandoffEligibility boolean",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R88"],
    );
  }

  if (!record.evidencePackage || typeof record.evidencePackage !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preparation requires evidencePackage",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87"],
    );
  }
  const evidence = record.evidencePackage as Record<string, unknown>;
  assertBrandedId(evidence.rvaId, ID_PREFIXES.rva, "evidencePackage RVA");
  assertBrandedId(evidence.determinationId, ID_PREFIXES.determination, "evidencePackage Determination");
  assertBrandedId(evidence.approvalActId, ID_PREFIXES.approvalAct, "evidencePackage Approval");
  assertBrandedId(evidence.gpraId, ID_PREFIXES.gpra, "evidencePackage GPRA");
  assertBrandedId(evidence.obligationId, ID_PREFIXES.obligation, "evidencePackage obligation");
  if (!Array.isArray(evidence.dispositionRecordIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted evidencePackage requires dispositionRecordIds array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87"],
    );
  }
  if (!Array.isArray(evidence.unresolvedBlockers)) {
    throw new OrchestraConstitutionalError(
      "Persisted evidencePackage requires unresolvedBlockers array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87"],
    );
  }
  if (!Array.isArray(evidence.brainAdvisoryIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted evidencePackage requires brainAdvisoryIds array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87"],
    );
  }
  if (!Array.isArray(evidence.consumerCategoryKeys)) {
    throw new OrchestraConstitutionalError(
      "Persisted evidencePackage requires consumerCategoryKeys array",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R87", "FI-DSN-STD-014-R89"],
    );
  }
  for (const key of evidence.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted evidencePackage has unknown consumerCategoryKey",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R89"],
      );
    }
  }
  if (evidence.supersessionActId != null) {
    assertBrandedId(
      evidence.supersessionActId,
      ID_PREFIXES.gpraSupersession,
      "evidencePackage supersession",
    );
  }

  // Reject execution-shaped fields if present on the raw record.
  const forbidden = [
    "handoffActId",
    "handoffAuthorized",
    "executesHandoff",
    "handoffAuthorization",
    "performHandoff",
    "handoffExecuted",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim())) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preparation must not carry Handoff execution fields",
        "invalid_handoff_preparation",
        ["FI-DSN-STD-014-R93", "FI-DSN-STD-014-R95"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff preparation");
  assertDomain3Traceability(record.traceability, "Governed Handoff preparation");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff preparation requires valid governed creation marker",
      "invalid_handoff_preparation",
      ["FI-DSN-STD-014-R94"],
    );
  }
}

export function validatePersistedGovernedHandoffEntry(
  raw: unknown,
): asserts raw is GovernedHandoffEntryRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff entry",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires non-empty handoffConsumerContextId",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  if (!Array.isArray(record.consumerCategoryKeys) || record.consumerCategoryKeys.length === 0) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires nonempty consumerCategoryKeys",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  for (const key of record.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry has unknown consumerCategoryKey",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R07"],
      );
    }
  }

  if (record.preparationCurrencyAtEntry !== "current") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry preparationCurrencyAtEntry must be current",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  if (record.eligibilityLayerConditionConsumed !== "export_ready") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry eligibilityLayerConditionConsumed must be export_ready",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }

  if (
    record.considerationMayCommence !== true ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffExecution !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.doesNotPerformG11Preparation !== true ||
    record.doesNotGrantGpraOrApproval !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotBindConsumerClassCatalog !== true ||
    record.hofG1Only !== true ||
    record.std015HofG1EntryBoundaryOnly !== true ||
    record.r01InheritanceLock !== true ||
    record.r02DoesNotWeakenStd012Or013 !== true ||
    record.r03MfgComplianceBoundaryContextOnly !== true ||
    record.r04DecisionStagePolicyOnly !== true ||
    record.r05PrincipalSubjectsDeferred !== true ||
    record.r06DoesNotPerformReviewApprovalGpraOrG11Prep !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry must carry HOF-G1 consideration-only / non-authorization markers",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01", "FI-DSN-STD-015-R05", "FI-DSN-STD-015-R07"],
    );
  }

  if (
    !Array.isArray(record.deferredPrincipalSubjects) ||
    record.deferredPrincipalSubjects.length !== HANDOFF_DEFERRED_PRINCIPAL_SUBJECTS.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires complete deferredPrincipalSubjects catalog (R05)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R05"],
    );
  }
  for (const subject of record.deferredPrincipalSubjects) {
    if (!isHandoffDeferredPrincipalSubject(subject)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry has forged deferredPrincipalSubject",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R05"],
      );
    }
  }

  if (
    !Array.isArray(record.hofPDistinctionsPreserved) ||
    record.hofPDistinctionsPreserved.length !== HOF_P_DISTINCTIONS_PRESERVED.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires complete hofPDistinctionsPreserved catalog (R01)",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R01"],
    );
  }
  for (const id of record.hofPDistinctionsPreserved) {
    if (!isHandoffHofPDistinctionId(id)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry has forged HOF-P distinction id",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R01"],
      );
    }
  }

  if (typeof record.enteredAt !== "string" || !record.enteredAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires enteredAt",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
  if (typeof record.enteredBy !== "string" || !record.enteredBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff entry requires enteredBy",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }

  const forbidden = [
    "handoffActId",
    "handoffAuthorized",
    "executesHandoff",
    "handoffAuthorization",
    "performHandoff",
    "handoffExecuted",
    "handoffPosture",
    "handoffAuthorizationActId",
    "postureDeclarationActId",
    "hoemEvidenceId",
    "hoemOperativeEvidenceId",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim())) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff entry must not carry R08+ HOEM / authorization / execution fields",
        "invalid_handoff_entry",
        ["FI-DSN-STD-015-R04", "FI-DSN-STD-015-R05", "FI-DSN-STD-015-R07"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff entry");
  assertStd015Traceability(record.traceability, "Governed Handoff entry");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff entry requires valid governed creation marker",
      "invalid_handoff_entry",
      ["FI-DSN-STD-015-R07"],
    );
  }
}

export function validatePersistedGovernedHandoffEvidenceConsumption(
  raw: unknown,
): asserts raw is GovernedHandoffEvidenceConsumptionRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff evidence consumption",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R15"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.consumptionId,
    ID_PREFIXES.handoffEvidenceConsumption,
    "Governed Handoff evidence consumption",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires non-empty handoffConsumerContextId",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R14"],
    );
  }
  if (!Array.isArray(record.consumerCategoryKeys) || record.consumerCategoryKeys.length === 0) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires nonempty consumerCategoryKeys",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R13"],
    );
  }
  for (const key of record.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff evidence consumption has unknown consumerCategoryKey",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R13"],
      );
    }
  }

  if (record.upstreamFreshnessAtConsumption !== "current") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption upstreamFreshnessAtConsumption must be current",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R14"],
    );
  }

  if (
    record.factualInputsToConsiderationOnly !== true ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffExecution !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notEvidenceOfHandoffAuthorization !== true ||
    record.notEvidenceOfHandoffPostureDeclaration !== true ||
    record.doesNotElevateAdvisoryToConstitutionalFact !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.hoemFrameworkOnly !== true ||
    record.doesNotCreateOperativeHandoffActRecords !== true ||
    record.fourModelsPeerDistinct !== true ||
    record.hepmReferencesAvailable !== true ||
    record.hvemFactsCurrent !== true ||
    record.r08FourPeerDistinctEvidenceModels !== true ||
    record.r09HepmReadOnlyConsumption !== true ||
    record.r10HvemEvaluationPointConsumption !== true ||
    record.r11HoemFrameworkOnly !== true ||
    record.r12AdvisoryNonbinding !== true ||
    record.r13EligibilityNotAuthorization !== true ||
    record.r14UpstreamFreshnessRequired !== true ||
    record.r15NoInventedConstitutionalQueueOrSchema !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption must carry HOF-G7 consideration-only / framework-only markers",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R08", "FI-DSN-STD-015-R11", "FI-DSN-STD-015-R13", "FI-DSN-STD-015-R15"],
    );
  }

  if (
    !Array.isArray(record.evidenceModelsPreserved) ||
    record.evidenceModelsPreserved.length !== HANDOFF_EVIDENCE_MODELS.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires complete evidenceModelsPreserved catalog (R08)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R08"],
    );
  }
  for (const model of record.evidenceModelsPreserved) {
    if (!isHandoffEvidenceModelId(model)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff evidence consumption has forged evidence model id",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R08"],
      );
    }
  }

  if (
    !Array.isArray(record.deferredHoemOperativeRecordClasses) ||
    record.deferredHoemOperativeRecordClasses.length !==
      DEFERRED_HOEM_OPERATIVE_RECORD_CLASSES.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires complete deferredHoemOperativeRecordClasses catalog (R11)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R11"],
    );
  }
  for (const cls of record.deferredHoemOperativeRecordClasses) {
    if (!isDeferredHoemOperativeRecordClass(cls)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff evidence consumption has forged deferred HOEM operative record class",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R11"],
      );
    }
  }

  if (!record.hepmRefs || typeof record.hepmRefs !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires hepmRefs (R09)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R09"],
    );
  }
  if (!record.hvemSnapshot || typeof record.hvemSnapshot !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires hvemSnapshot (R10)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R10"],
    );
  }
  if (!record.hvemEvaluationPoint || typeof record.hvemEvaluationPoint !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires hvemEvaluationPoint (R10)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R10"],
    );
  }
  if (!Array.isArray(record.brainAdvisoryIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires brainAdvisoryIds array (R12; may be empty)",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R12"],
    );
  }

  if (typeof record.consumedAt !== "string" || !record.consumedAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires consumedAt",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R15"],
    );
  }
  if (typeof record.consumedBy !== "string" || !record.consumedBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff evidence consumption requires consumedBy",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R15"],
    );
  }

  const forbidden = [
    "handoffActId",
    "handoffAuthorized",
    "executesHandoff",
    "handoffAuthorization",
    "performHandoff",
    "handoffExecuted",
    "handoffPosture",
    "handoffAuthorizationActId",
    "postureDeclarationActId",
    "completionActId",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "hoemEvidenceId",
    "hoemOperativeEvidenceId",
    "hoemAuthorizationRecordId",
    "preservationActId",
    "hofG10PreservationActId",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "executionQueueId",
    "constitutionalQueueId",
    "hoemOperativeActRecords",
    "hoemActInstances",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff evidence consumption must not carry HOEM act / G10 preservation / execution / queue fields",
        "invalid_handoff_evidence_consumption",
        ["FI-DSN-STD-015-R11", "FI-DSN-STD-015-R15"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff evidence consumption");
  assertStd015HofG7Traceability(record.traceability, "Governed Handoff evidence consumption");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff evidence consumption requires valid governed creation marker",
      "invalid_handoff_evidence_consumption",
      ["FI-DSN-STD-015-R15"],
    );
  }
}

export function validatePersistedGovernedHandoffPreservationAudit(
  raw: unknown,
): asserts raw is GovernedHandoffPreservationAuditRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff preservation audit",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.preservationAuditId,
    ID_PREFIXES.handoffPreservationAudit,
    "Governed Handoff preservation audit",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.evidenceConsumptionId,
    ID_PREFIXES.handoffEvidenceConsumption,
    "Governed Handoff evidence consumption",
  );
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit requires non-empty handoffConsumerContextId",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
  if (!Array.isArray(record.consumerCategoryKeys) || record.consumerCategoryKeys.length === 0) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit requires nonempty consumerCategoryKeys",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
  for (const key of record.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preservation audit has unknown consumerCategoryKey",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R20"],
      );
    }
  }

  if (
    record.historicalPreservationOnly !== true ||
    record.doesNotRestoreConstitutionalForce !== true ||
    record.doesNotOverwriteUpstreamConstitutionalRecords !== true ||
    record.doesNotCollapsePreparationAndOperativeHistory !== true ||
    record.doesNotAuthorizeErasureOrRedaction !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffExecution !== true ||
    record.hpamExtensionFrameworkOnly !== true ||
    record.doesNotCreateOperativeHoemActRecords !== true ||
    record.evidencePackageIsNotErasureAuthorization !== true ||
    record.r16AdditiveHistoricalPreservation !== true ||
    record.r17NoOverwriteUpstreamConstitutionalRecords !== true ||
    record.r18HpamExtensionFrameworkOnly !== true ||
    record.r19HistoryRemainsLoadableAfterInvalidation !== true ||
    record.r20AuditableConsiderationEvents !== true ||
    record.r21EvidencePackageIsNotErasureAuthorization !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit must carry HOF-G10 historical-only / non-erasure / framework markers",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R18", "FI-DSN-STD-015-R21"],
    );
  }

  if (
    !Array.isArray(record.deferredOperativeAuditClasses) ||
    record.deferredOperativeAuditClasses.length !== DEFERRED_OPERATIVE_AUDIT_CLASSES.length
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit requires complete deferredOperativeAuditClasses catalog (R16/R20)",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
    );
  }
  for (const cls of record.deferredOperativeAuditClasses) {
    if (!isDeferredOperativeAuditClass(cls)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preservation audit has forged deferred operative audit class",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R20"],
      );
    }
  }

  if (!Array.isArray(record.brainAdvisoryIds)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit requires brainAdvisoryIds array (provenance; may be empty)",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }

  if (typeof record.preservedAt !== "string" || !record.preservedAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit requires preservedAt",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
  if (typeof record.preservedBy !== "string" || !record.preservedBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff preservation audit requires preservedBy",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }

  const forbidden = [
    "handoffActId",
    "handoffAuthorized",
    "executesHandoff",
    "handoffAuthorization",
    "performHandoff",
    "handoffExecuted",
    "handoffPosture",
    "handoffAuthorizationActId",
    "postureDeclarationActId",
    "completionActId",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "hoemEvidenceId",
    "hoemOperativeEvidenceId",
    "hoemAuthorizationRecordId",
    "hoemOperativeActRecords",
    "hoemActInstances",
    "eraseUpstreamHistory",
    "redactUpstreamHistory",
    "overwriteUpstreamHistory",
    "mergeUpstreamHistory",
    "substituteUpstreamHistory",
    "collapsePreparationHistory",
    "restoreConstitutionalForce",
    "restoresAuthority",
    "brainAuthorizesHandoff",
    "brainHandoffAuthorization",
    "brainAuthorizeHandoff",
    "r22BrainAuthorizeHandoff",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "executionQueueId",
    "constitutionalQueueId",
    "preservationAuthorityClassId",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff preservation audit must not carry HOEM act / erase / restore / R22 / authority-class fields",
        "invalid_handoff_preservation_audit",
        ["FI-DSN-STD-015-R16", "FI-DSN-STD-015-R17", "FI-DSN-STD-015-R21"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff preservation audit");
  assertStd015HofG10Traceability(record.traceability, "Governed Handoff preservation audit");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff preservation audit requires valid governed creation marker",
      "invalid_handoff_preservation_audit",
      ["FI-DSN-STD-015-R20"],
    );
  }
}

export function validatePersistedGovernedHandoffAuthorization(
  raw: unknown,
): asserts raw is GovernedHandoffAuthorizationActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff authorization act",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.authorizationActId,
    ID_PREFIXES.handoffAuthorizationAct,
    "Governed Handoff authorization act",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.evidenceConsumptionId,
    ID_PREFIXES.handoffEvidenceConsumption,
    "Governed Handoff evidence consumption",
  );
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (
    !isCanonicalEstablishedHandoffGovernanceAuthorityClassId(record.authorityClassId)
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization must carry established HGA authority class (R25)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25", "FI-DSN-STD-015-R32"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization must cite PD-STD-015-001 as HGA governing source",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25"],
    );
  }
  if (record.authorityConstitutionalScope !== "handoff_authorization_act") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization must carry handoff_authorization_act constitutional scope",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25"],
    );
  }

  if (typeof record.authorizedBy !== "string" || !record.authorizedBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization requires authorizedBy",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25"],
    );
  }
  if (typeof record.authorizedAt !== "string" || !record.authorizedAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization requires authorizedAt",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25"],
    );
  }

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization requires non-empty handoffConsumerContextId",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R28"],
    );
  }

  if (!isHccmConsumerClassId(record.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization requires closed HCCM consumer class CC-01 through CC-06 (R28)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R28"],
    );
  }

  if (
    !Array.isArray(record.consumedHcbmBoundaryKeys) ||
    record.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization requires nonempty consumedHcbmBoundaryKeys (R28)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R28"],
    );
  }
  for (const key of record.consumedHcbmBoundaryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff authorization has unknown consumedHcbmBoundaryKey",
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R28"],
      );
    }
  }

  if (!Array.isArray(record.consumerCategoryKeys) || record.consumerCategoryKeys.length === 0) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization requires nonempty consumerCategoryKeys",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R28"],
    );
  }
  for (const key of record.consumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff authorization has unknown consumerCategoryKey",
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R28"],
      );
    }
  }

  if (
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffExecution !== true ||
    record.notHandoffCompletion !== true ||
    record.notHandoffSuspension !== true ||
    record.notHandoffRecall !== true ||
    record.notHandoffWithdrawal !== true ||
    record.notDownstreamAcceptance !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotCollapsePeerDecisionClasses !== true ||
    record.doesNotSubstituteGpraOrEligibilityOrAdvisory !== true ||
    record.r25HgaSoleAuthorizationOwner !== true ||
    record.r26PeerDistinctAuthorizationClass !== true ||
    record.r27NoSubstituteInputs !== true ||
    record.r28BoundHccmConsumerContext !== true ||
    record.r29HoemAuthorizationOperativeRecord !== true ||
    record.r30NoImplicitAuthorization !== true ||
    record.r31PrerequisiteGated !== true ||
    record.r32HaamProhibitedPerformersExcluded !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization must carry HOF-G2 peer-distinct / non-execution markers (R25–R32)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R26", "FI-DSN-STD-015-R29"],
    );
  }

  const hoem = record.hoemAuthorizationRecord;
  if (!hoem || typeof hoem !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff authorization requires HOEM authorization operative record (R29)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R29"],
    );
  }
  const hoemRecord = hoem as Record<string, unknown>;
  assertBrandedId(
    hoemRecord.hoemAuthorizationRecordId,
    ID_PREFIXES.hoemAuthorizationOperative,
    "HOEM authorization operative record",
  );
  assertBrandedId(hoemRecord.authorizationActId, ID_PREFIXES.handoffAuthorizationAct, "Governed Handoff authorization act");
  if (hoemRecord.authorizationActId !== record.authorizationActId) {
    throw new OrchestraConstitutionalError(
      "HOEM authorization operative record authorizationActId must match parent act",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R29"],
    );
  }
  if (hoemRecord.actType !== "authorization") {
    throw new OrchestraConstitutionalError(
      "HOEM authorization operative record must have actType authorization (R29)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R29"],
    );
  }
  assertHgaMatrixActMayBePerformed(hoemRecord.actType);
  assertHgaActTypeStringFailClosed(hoemRecord.actType, {
    requireOperativePerformance: true,
  });
  assertBrandedId(hoemRecord.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(hoemRecord.obligationId, ID_PREFIXES.obligation, "Production Obligation");
  if (
    typeof hoemRecord.handoffConsumerContextId !== "string" ||
    !hoemRecord.handoffConsumerContextId.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM authorization operative record requires handoffConsumerContextId",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R29"],
    );
  }
  if (!isHccmConsumerClassId(hoemRecord.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "HOEM authorization operative record requires valid HCCM consumer class",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R29"],
    );
  }
  if (hoemRecord.consumerClassId !== record.consumerClassId) {
    throw new OrchestraConstitutionalError(
      "HOEM authorization operative record consumerClassId must match parent act",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R29"],
    );
  }
  if (
    !Array.isArray(hoemRecord.consumedHcbmBoundaryKeys) ||
    hoemRecord.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM authorization operative record requires consumedHcbmBoundaryKeys",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R29"],
    );
  }
  if (
    hoemRecord.doesNotMergePostureDeclarationAttribution !== true ||
    hoemRecord.doesNotMergeCompletionAttribution !== true ||
    hoemRecord.doesNotMergeSuspensionAttribution !== true ||
    hoemRecord.doesNotMergeWithdrawalAttribution !== true ||
    hoemRecord.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM authorization operative record must carry peer-distinct attribution markers (R29)",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R29"],
    );
  }

  const forbidden = [
    "handoffPosture",
    "postureDeclarationActId",
    "completionActId",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "executesHandoff",
    "handoffExecuted",
    "performHandoff",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "productionExecutionId",
    "executionQueueId",
    "constitutionalQueueId",
    "brainAuthorizesHandoff",
    "brainAuthorizeHandoff",
    "brainHandoffAuthorization",
    "implicitAuthorization",
    "automaticInheritanceAuthorization",
    "inferredEligibilityAuthorization",
    "configurationDrivenAuthorization",
    "hoemPostureDeclarationRecordId",
    "hoemCompletionRecordId",
    "hoemSuspensionRecordId",
    "hoemRecallRecordId",
    "hoemWithdrawalRecordId",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff authorization must not carry posture/execution/implicit fields (R26/R30)",
        "invalid_handoff_authorization",
        ["FI-DSN-STD-015-R26", "FI-DSN-STD-015-R30"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff authorization act");
  assertStd015HofG2Traceability(record.traceability, "Governed Handoff authorization act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff authorization act requires valid governed creation marker",
      "invalid_handoff_authorization",
      ["FI-DSN-STD-015-R25"],
    );
  }
}

export function validatePersistedGovernedHandoffConsumerBinding(
  raw: unknown,
): asserts raw is GovernedHandoffConsumerBindingRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff consumer binding",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.bindingId,
    ID_PREFIXES.handoffConsumerBinding,
    "Governed Handoff consumer binding",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding requires non-empty handoffConsumerContextId",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R35"],
    );
  }

  if (!isHccmConsumerClassId(record.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding requires closed HCCM consumer class CC-01 through CC-06 (R33)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33"],
    );
  }
  const catalog = resolveHccmConsumerClass(record.consumerClassId);
  if (record.constitutionalConsumerClass !== catalog.constitutionalConsumerClass) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding constitutional class does not match catalog (R33)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33"],
    );
  }
  if (record.postureClassAffinity !== catalog.postureClassAffinity) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding posture-class affinity does not match catalog (R33/R37)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33", "FI-DSN-STD-015-R37"],
    );
  }
  if (record.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding downstream consideration domain does not match catalog (R33)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33"],
    );
  }

  if (
    !Array.isArray(record.consumedHcbmBoundaryKeys) ||
    record.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding requires nonempty consumedHcbmBoundaryKeys (R34/R35)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R34", "FI-DSN-STD-015-R35"],
    );
  }
  for (const key of record.consumedHcbmBoundaryKeys) {
    if (
      !isHandoffConsumerCategoryKey(key) ||
      !(catalog.hcbmBoundaryKeys as readonly string[]).includes(key)
    ) {
      throw new OrchestraConstitutionalError(
        "Persisted HCCM consumer binding has unknown or mismatched consumedHcbmBoundaryKey",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R34"],
      );
    }
  }

  if (
    !Array.isArray(record.entryConsumerCategoryKeys) ||
    record.entryConsumerCategoryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding requires nonempty entryConsumerCategoryKeys",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R34", "FI-DSN-STD-015-R39"],
    );
  }
  for (const key of record.entryConsumerCategoryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted HCCM consumer binding has unknown entryConsumerCategoryKey",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R34"],
      );
    }
  }

  if (typeof record.boundBy !== "string" || !record.boundBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding requires boundBy",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R39"],
    );
  }
  if (typeof record.boundAt !== "string" || !record.boundAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding requires boundAt",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R39"],
    );
  }

  if (
    record.notHandoffAuthorization !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffCompletion !== true ||
    record.notDownstreamAcceptance !== true ||
    record.notPermanentCollectionMembership !== true ||
    record.notOperationalIntake !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotInferCc01VsCc02FromHcbmAlone !== true ||
    record.r33ClosedHccmCatalog !== true ||
    record.r34HcbmMappedToSelectedCc !== true ||
    record.r35BoundConsumerContextTuple !== true ||
    record.r36SingleCcPerBinding !== true ||
    record.r37Cc01Cc02CatalogDisambiguation !== true ||
    record.r38NotAuthorizationOrPostureOrIntake !== true ||
    record.r39EligibilityGatedClosedCatalog !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted HCCM consumer binding must carry HOF-G3 peer-distinct / non-execution markers (R33–R39)",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R38"],
    );
  }

  const forbidden = [
    "handoffPosture",
    "postureDeclarationActId",
    "completionActId",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "executesHandoff",
    "handoffExecuted",
    "performHandoff",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "productionExecutionId",
    "executionQueueId",
    "constitutionalQueueId",
    "brainAuthorizesHandoff",
    "brainAuthorizeHandoff",
    "brainBindsConsumerClass",
    "implicitAuthorization",
    "implicitBinding",
    "automaticInheritanceBinding",
    "configurationDrivenBinding",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "handoffAuthorizationActId",
    "authorizationActId",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted HCCM consumer binding must not carry authorization/posture/execution fields (R38)",
        "invalid_handoff_consumer_binding",
        ["FI-DSN-STD-015-R38"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff consumer binding");
  assertStd015HofG3Traceability(record.traceability, "Governed Handoff consumer binding");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff consumer binding requires valid governed creation marker",
      "invalid_handoff_consumer_binding",
      ["FI-DSN-STD-015-R33"],
    );
  }
}

export function validatePersistedGovernedHandoffPostureDeclaration(
  raw: unknown,
): asserts raw is GovernedHandoffPostureDeclarationActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff posture declaration",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.postureDeclarationActId,
    ID_PREFIXES.handoffPostureDeclarationAct,
    "Governed Handoff posture declaration act",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.bindingId,
    ID_PREFIXES.handoffConsumerBinding,
    "Governed Handoff consumer binding",
  );
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires non-empty handoffConsumerContextId",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }
  if (typeof record.declaredBy !== "string" || !record.declaredBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires declaredBy",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40"],
    );
  }
  if (typeof record.declaredAt !== "string" || !record.declaredAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires declaredAt",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R45"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires established HGA (R40)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40", "FI-DSN-STD-015-R47"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration authorityGoverningSourceId must be PD-STD-015-001",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40"],
    );
  }
  if (record.authorityConstitutionalScope !== "handoff_posture_declaration_act") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration scope must be handoff_posture_declaration_act (R40/R45)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40", "FI-DSN-STD-015-R45"],
    );
  }

  if (!isHccmConsumerClassId(record.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires closed HCCM consumer class (R43)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }
  if (!isFrozenHandoffPostureClass(record.declaredPostureClass)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires frozen posture class (R46/R47)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R46", "FI-DSN-STD-015-R47"],
    );
  }
  if (!isFrozenHandoffPostureClass(record.postureClassAffinity)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires frozen postureClassAffinity metadata",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43", "FI-DSN-STD-015-R46"],
    );
  }
  if (record.declaredPostureClass !== record.postureClassAffinity) {
    throw new OrchestraConstitutionalError(
      "Persisted declaredPostureClass must equal postureClassAffinity for the bound context (R46)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R46"],
    );
  }
  const catalog = resolveHccmConsumerClass(record.consumerClassId);
  if (record.declaredPostureClass !== catalog.postureClassAffinity) {
    throw new OrchestraConstitutionalError(
      "Persisted posture class must match HCCM catalog affinity for consumer class (R46)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R46"],
    );
  }

  if (
    !Array.isArray(record.consumedHcbmBoundaryKeys) ||
    record.consumedHcbmBoundaryKeys.length === 0
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires consumedHcbmBoundaryKeys",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }
  for (const key of record.consumedHcbmBoundaryKeys) {
    if (!isHandoffConsumerCategoryKey(key)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff posture declaration has invalid HCBM key",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R43"],
      );
    }
  }
  if (!Array.isArray(record.consumerCategoryKeys)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires consumerCategoryKeys",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R43"],
    );
  }

  const hoemRecord = record.hoemPostureDeclarationRecord as Record<string, unknown> | null;
  if (!hoemRecord || typeof hoemRecord !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration requires HOEM posture declaration operative record (R45)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R45"],
    );
  }
  assertBrandedId(
    hoemRecord.hoemPostureDeclarationRecordId,
    ID_PREFIXES.hoemPostureDeclarationOperative,
    "HOEM posture declaration operative record",
  );
  if (hoemRecord.postureDeclarationActId !== record.postureDeclarationActId) {
    throw new OrchestraConstitutionalError(
      "HOEM posture declaration operative record postureDeclarationActId must match parent act",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R45"],
    );
  }
  if (hoemRecord.actType !== "posture_declaration") {
    throw new OrchestraConstitutionalError(
      "HOEM posture declaration operative record actType must be posture_declaration (R45)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R45"],
    );
  }
  assertHgaMatrixActMayBePerformed(hoemRecord.actType);
  assertHgaActTypeStringFailClosed(hoemRecord.actType, {
    requireOperativePerformance: true,
  });
  if (
    hoemRecord.gpraId !== record.gpraId ||
    hoemRecord.obligationId !== record.obligationId ||
    hoemRecord.handoffConsumerContextId !== record.handoffConsumerContextId ||
    hoemRecord.bindingId !== record.bindingId ||
    hoemRecord.consumerClassId !== record.consumerClassId ||
    hoemRecord.declaredPostureClass !== record.declaredPostureClass
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM posture declaration operative record must bind to parent act context (R45)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R45"],
    );
  }
  if (
    hoemRecord.doesNotMergeAuthorizationAttribution !== true ||
    hoemRecord.doesNotMergeCompletionAttribution !== true ||
    hoemRecord.doesNotMergeSuspensionAttribution !== true ||
    hoemRecord.doesNotMergeWithdrawalAttribution !== true ||
    hoemRecord.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM posture declaration operative record must carry peer-distinct attribution markers (R45)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R45"],
    );
  }

  if (
    record.notHandoffAuthorization !== true ||
    record.notHandoffExecution !== true ||
    record.notHandoffCompletion !== true ||
    record.notHandoffSuspension !== true ||
    record.notHandoffRecall !== true ||
    record.notHandoffWithdrawal !== true ||
    record.notDownstreamAcceptance !== true ||
    record.notPermanentCollectionMembership !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotCollapsePeerDecisionClasses !== true ||
    record.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    record.doesNotMergeAcrossConsumerClasses !== true ||
    record.r40HgaSolePostureOwner !== true ||
    record.r41PeerDistinctPostureClass !== true ||
    record.r42NoSubstituteInputs !== true ||
    record.r43BoundHccmConsumerContext !== true ||
    record.r44NotAuthorizationSubstitute !== true ||
    record.r45HoemPostureDeclarationOperativeRecord !== true ||
    record.r46HppmAuthoritativeCardinality !== true ||
    record.r47NoImplicitPostureEntryGated !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff posture declaration must carry HOF-G4 constitutional markers (R40–R47)",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R41", "FI-DSN-STD-015-R45"],
    );
  }

  const forbidden = [
    "completionActId",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "executesHandoff",
    "handoffExecuted",
    "performHandoff",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "productionExecutionId",
    "executionQueueId",
    "constitutionalQueueId",
    "brainDeclareHandoffPosture",
    "brainHandoffPosture",
    "implicitPosture",
    "automaticInheritancePosture",
    "inferredEligibilityPosture",
    "configurationDrivenPosture",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "unifiedCc01Cc02Posture",
    "mergedCrossCcPosture",
    "authorizationActId",
    "hoemAuthorizationRecordId",
    "hoemCompletionRecordId",
    "hoemSuspensionRecordId",
    "hoemRecallRecordId",
    "hoemWithdrawalRecordId",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff posture declaration must not carry completion/execution/implicit fields (R41/R47)",
        "invalid_handoff_posture_declaration",
        ["FI-DSN-STD-015-R41", "FI-DSN-STD-015-R47"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff posture declaration act");
  assertStd015HofG4Traceability(record.traceability, "Governed Handoff posture declaration act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff posture declaration act requires valid governed creation marker",
      "invalid_handoff_posture_declaration",
      ["FI-DSN-STD-015-R40"],
    );
  }
}

export function validatePersistedGovernedHandoffCompletion(
  raw: unknown,
): asserts raw is GovernedHandoffCompletionActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff completion",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.completionActId,
    ID_PREFIXES.handoffCompletionAct,
    "Governed Handoff completion act",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.bindingId,
    ID_PREFIXES.handoffConsumerBinding,
    "Governed Handoff consumer binding",
  );
  assertBrandedId(
    record.postureDeclarationActId,
    ID_PREFIXES.handoffPostureDeclarationAct,
    "Governed Handoff posture declaration act",
  );
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion requires non-empty handoffConsumerContextId",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50"],
    );
  }
  if (typeof record.completedBy !== "string" || !record.completedBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion requires completedBy",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (typeof record.completedAt !== "string" || !record.completedAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion requires completedAt",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R56"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion requires established HGA (R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R57"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion authorityGoverningSourceId must be PD-STD-015-001",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }
  if (record.authorityConstitutionalScope !== "handoff_completion_act") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion scope must be handoff_completion_act (R51/R56)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R56"],
    );
  }

  if (!isHccmConsumerClassId(record.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion requires closed HCCM consumer class (R50)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R50"],
    );
  }
  if (!isFrozenHandoffPostureClass(record.declaredPostureClass)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion requires frozen posture class (R51)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }

  const hoemRecord = record.hoemCompletionRecord as Record<string, unknown> | null;
  if (!hoemRecord || typeof hoemRecord !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion requires HOEM completion operative record (R56)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R56"],
    );
  }
  assertBrandedId(
    hoemRecord.hoemCompletionRecordId,
    ID_PREFIXES.hoemCompletionOperative,
    "HOEM completion operative record",
  );
  if (hoemRecord.completionActId !== record.completionActId) {
    throw new OrchestraConstitutionalError(
      "HOEM completion operative record completionActId must match parent act",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R56"],
    );
  }
  if (hoemRecord.actType !== "completion") {
    throw new OrchestraConstitutionalError(
      "HOEM completion operative record actType must be completion (R56)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R56"],
    );
  }
  assertHgaMatrixActMayBePerformed(hoemRecord.actType);
  assertHgaActTypeStringFailClosed(hoemRecord.actType, {
    requireOperativePerformance: true,
  });
  if (
    hoemRecord.gpraId !== record.gpraId ||
    hoemRecord.obligationId !== record.obligationId ||
    hoemRecord.handoffConsumerContextId !== record.handoffConsumerContextId ||
    hoemRecord.bindingId !== record.bindingId ||
    hoemRecord.consumerClassId !== record.consumerClassId ||
    hoemRecord.postureDeclarationActId !== record.postureDeclarationActId ||
    hoemRecord.declaredPostureClass !== record.declaredPostureClass
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM completion operative record must bind to parent act context (R56)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R56"],
    );
  }
  if (
    hoemRecord.doesNotMergeAuthorizationAttribution !== true ||
    hoemRecord.doesNotMergePostureDeclarationAttribution !== true ||
    hoemRecord.doesNotMergeLifecycleAttribution !== true ||
    hoemRecord.doesNotMergeSuspensionAttribution !== true ||
    hoemRecord.doesNotMergeWithdrawalAttribution !== true ||
    hoemRecord.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM completion operative record must carry peer-distinct attribution markers (R56)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R56"],
    );
  }

  if (
    record.notHandoffAuthorization !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffExecution !== true ||
    record.notHandoffSuspension !== true ||
    record.notHandoffRecall !== true ||
    record.notHandoffWithdrawal !== true ||
    record.notDownstreamAcceptance !== true ||
    record.notPermanentCollectionMembership !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotCollapsePeerDecisionClasses !== true ||
    record.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    record.doesNotMergeAcrossConsumerClasses !== true ||
    record.r48ClosedHslmVocabulary !== true ||
    record.r49PeerDistinctLifecycle !== true ||
    record.r50SingleBindingPostureChain !== true ||
    record.r51CompletedMeaning !== true ||
    record.r56HoemCompletionOperativeRecord !== true ||
    record.r57NoImplicitLifecyclePromotion !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff completion must carry HOF-G5 constitutional markers (R48–R57)",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R49", "FI-DSN-STD-015-R56"],
    );
  }

  const forbidden = [
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "expiryActId",
    "executesHandoff",
    "handoffExecuted",
    "performHandoff",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "productionExecutionId",
    "executionQueueId",
    "constitutionalQueueId",
    "brainCompleteHandoff",
    "brainHandoffCompletion",
    "implicitCompletion",
    "automaticInheritanceCompletion",
    "inferredEligibilityCompletion",
    "configurationDrivenCompletion",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "authorizationActId",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff completion must not carry deferred-lifecycle/execution/implicit fields (R51/R57)",
        "invalid_handoff_completion",
        ["FI-DSN-STD-015-R51", "FI-DSN-STD-015-R57"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff completion act");
  assertStd015HofG5Traceability(record.traceability, "Governed Handoff completion act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff completion act requires valid governed creation marker",
      "invalid_handoff_completion",
      ["FI-DSN-STD-015-R51"],
    );
  }
}

export function validatePersistedGovernedHandoffSuspension(
  raw: unknown,
): asserts raw is GovernedHandoffSuspensionActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff suspension",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.suspensionActId,
    ID_PREFIXES.handoffSuspensionAct,
    "Governed Handoff suspension act",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.bindingId,
    ID_PREFIXES.handoffConsumerBinding,
    "Governed Handoff consumer binding",
  );
  assertBrandedId(
    record.authorizationActId,
    ID_PREFIXES.handoffAuthorizationAct,
    "Governed Handoff authorization act",
  );
  if (record.postureDeclarationActId != null) {
    assertBrandedId(
      record.postureDeclarationActId,
      ID_PREFIXES.handoffPostureDeclarationAct,
      "Governed Handoff posture declaration act",
    );
  }
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires non-empty handoffConsumerContextId",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (typeof record.suspendedBy !== "string" || !record.suspendedBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires suspendedBy",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84"],
    );
  }
  if (typeof record.suspendedAt !== "string" || !record.suspendedAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires suspendedAt",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R90"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires established HGA (R84)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R84"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension authorityGoverningSourceId must be PD-STD-015-001",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84"],
    );
  }
  if (record.authorityConstitutionalScope !== "handoff_suspension_act") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension scope must be handoff_suspension_act (R84)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84"],
    );
  }

  if (!isHccmConsumerClassId(record.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires closed HCCM consumer class (R88)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R88"],
    );
  }
  if (
    record.declaredPostureClass != null &&
    !isFrozenHandoffPostureClass(record.declaredPostureClass)
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires frozen posture class when present (R85a)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R85"],
    );
  }
  if (!isSuspensionConstitutionalBasisKind(record.constitutionalBasisKind)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires closed constitutional basisKind (R89)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R89"],
    );
  }

  const provenance = record.constitutionalBasisProvenance as Record<string, unknown> | null;
  if (
    !provenance ||
    typeof provenance !== "object" ||
    provenance.basisKind !== record.constitutionalBasisKind ||
    provenance.notesCannotBeSoleBasis !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires coherent constitutional basis provenance (R89)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R89"],
    );
  }

  const hoemRecord = record.hoemSuspensionRecord as Record<string, unknown> | null;
  if (!hoemRecord || typeof hoemRecord !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension requires HOEM suspension operative record (R93)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R93"],
    );
  }
  assertBrandedId(
    hoemRecord.hoemSuspensionRecordId,
    ID_PREFIXES.hoemSuspensionOperative,
    "HOEM suspension operative record",
  );
  if (hoemRecord.suspensionActId !== record.suspensionActId) {
    throw new OrchestraConstitutionalError(
      "HOEM suspension operative record suspensionActId must match parent act",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R93"],
    );
  }
  if (hoemRecord.actType !== "suspension") {
    throw new OrchestraConstitutionalError(
      "HOEM suspension operative record actType must be suspension (R93)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R93"],
    );
  }
  assertHgaMatrixActMayBePerformed(hoemRecord.actType);
  assertHgaActTypeStringFailClosed(hoemRecord.actType, {
    requireOperativePerformance: true,
  });
  if (
    hoemRecord.gpraId !== record.gpraId ||
    hoemRecord.obligationId !== record.obligationId ||
    hoemRecord.handoffConsumerContextId !== record.handoffConsumerContextId ||
    hoemRecord.bindingId !== record.bindingId ||
    hoemRecord.consumerClassId !== record.consumerClassId ||
    hoemRecord.authorizationActId !== record.authorizationActId ||
    hoemRecord.postureDeclarationActId !== record.postureDeclarationActId ||
    hoemRecord.constitutionalBasisKind !== record.constitutionalBasisKind ||
    hoemRecord.effectiveAt !== record.suspendedAt
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM suspension operative record must bind to parent act context (R93)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R93"],
    );
  }
  if (
    hoemRecord.doesNotMergeAuthorizationAttribution !== true ||
    hoemRecord.doesNotMergePostureDeclarationAttribution !== true ||
    hoemRecord.doesNotMergeCompletionAttribution !== true ||
    hoemRecord.doesNotMergeLifecycleAttribution !== true ||
    hoemRecord.doesNotMergeWithdrawalAttribution !== true ||
    hoemRecord.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM suspension operative record must carry peer-distinct attribution markers (R93)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R93"],
    );
  }

  if (
    record.forwardReliancePaused !== true ||
    record.doesNotTerminatePosture !== true ||
    record.doesNotEraseAuthorization !== true ||
    record.notHandoffWithdrawal !== true ||
    record.notHandoffRecall !== true ||
    record.notHandoffCompletion !== true ||
    record.notHercmReentry !== true ||
    record.notResumption !== true ||
    record.notRestoration !== true ||
    record.effectFraming !== "temporary_forward_reliance_pause" ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffExecution !== true ||
    record.notDownstreamAcceptance !== true ||
    record.notPermanentCollectionMembership !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotCollapsePeerDecisionClasses !== true ||
    record.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    record.doesNotMergeAcrossConsumerClasses !== true ||
    record.notAutomaticHslmPromotion !== true ||
    record.hslmProjectionFromActFacts !== true ||
    record.r84DistinctHgaSuspensionAct !== true ||
    record.r85SharedPreconditionsPlusTriggers !== true ||
    record.r86NoSuspendAfterRelianceCeased !== true ||
    record.r87NoSoleRtcGpraG11HrwmBasis !== true ||
    record.r88SingleBindingPostureChain !== true ||
    record.r89ConstitutionalBasisAndProvenance !== true ||
    record.r90EffectFromSuspendedAtForward !== true ||
    record.r91TemporaryForwardReliancePause !== true ||
    record.r92AttributedBindingOnly !== true ||
    record.r93HoemSuspensionOperativeRecord !== true ||
    record.r94NotAutomaticHslmPromotion !== true ||
    record.r95RepeatedSuspensionsAdditive !== true ||
    record.r96InvalidAttemptsNonOperative !== true ||
    record.r97NotWithdrawalRecallOrReentry !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff suspension must carry HOF-G6-U2 constitutional markers (R84–R97)",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84", "FI-DSN-STD-015-R93"],
    );
  }

  const forbidden = [
    "withdrawalActId",
    "recallActId",
    "expiryActId",
    "resumeHandoff",
    "restoreHandoff",
    "reenterHandoff",
    "withdrawHandoff",
    "recallHandoff",
    "expireHandoff",
    "executesHandoff",
    "handoffExecuted",
    "performHandoff",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "productionExecutionId",
    "executionQueueId",
    "constitutionalQueueId",
    "brainSuspendHandoff",
    "brainHandoffSuspension",
    "implicitSuspension",
    "hercmReentryId",
    "resumptionActId",
    "restorationActId",
    "rejectHandoff",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff suspension must not carry withdrawal/recall/reentry/execution fields (R96/R97)",
        "invalid_handoff_suspension",
        ["FI-DSN-STD-015-R96", "FI-DSN-STD-015-R97"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff suspension act");
  assertStd015HofG6U2Traceability(record.traceability, "Governed Handoff suspension act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff suspension act requires valid governed creation marker",
      "invalid_handoff_suspension",
      ["FI-DSN-STD-015-R84"],
    );
  }
}

export function validatePersistedGovernedHandoffWithdrawal(
  raw: unknown,
): asserts raw is GovernedHandoffWithdrawalActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff withdrawal",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R98"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.withdrawalActId,
    ID_PREFIXES.handoffWithdrawalAct,
    "Governed Handoff withdrawal act",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(record.bindingId, ID_PREFIXES.handoffConsumerBinding, "Governed Handoff consumer binding");
  assertBrandedId(record.authorizationActId, ID_PREFIXES.handoffAuthorizationAct, "Governed Handoff authorization act");
  if (record.postureDeclarationActId != null) {
    assertBrandedId(record.postureDeclarationActId, ID_PREFIXES.handoffPostureDeclarationAct, "Governed Handoff posture declaration act");
  }
  assertBrandedId(record.preparationId, ID_PREFIXES.handoffPreparation, "Governed Handoff preparation");
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (
    typeof record.handoffConsumerContextId !== "string" ||
    !record.handoffConsumerContextId.trim() ||
    typeof record.withdrawnBy !== "string" ||
    !record.withdrawnBy.trim() ||
    typeof record.withdrawnAt !== "string" ||
    !record.withdrawnAt.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff withdrawal requires context, withdrawnBy, and withdrawnAt",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R98", "FI-DSN-STD-015-R104"],
    );
  }
  if (
    !isCanonicalEstablishedHandoffGovernanceAuthorityClassId(record.authorityClassId) ||
    record.authorityGoverningSourceId !== "PD-STD-015-001" ||
    record.authorityConstitutionalScope !== "handoff_withdrawal_act"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff withdrawal requires established HGA withdrawal scope (R98)",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R98"],
    );
  }
  if (
    !isHccmConsumerClassId(record.consumerClassId) ||
    (record.declaredPostureClass != null &&
      !isFrozenHandoffPostureClass(record.declaredPostureClass))
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff withdrawal requires closed consumer and posture classes (R99/R102)",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R99", "FI-DSN-STD-015-R102"],
    );
  }
  if (!isWithdrawalConstitutionalBasisKind(record.constitutionalBasisKind)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff withdrawal requires closed constitutional basisKind (R103)",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R103"],
    );
  }
  const provenance = record.constitutionalBasisProvenance as Record<string, unknown> | null;
  if (
    !provenance ||
    provenance.basisKind !== record.constitutionalBasisKind ||
    provenance.notesCannotBeSoleBasis !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff withdrawal requires coherent constitutional basis provenance (R103)",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R103"],
    );
  }
  const retractionTargets = record.retractionTargets;
  if (
    !Array.isArray(retractionTargets) ||
    retractionTargets.length !== 2 ||
    !retractionTargets.includes("authorization") ||
    !retractionTargets.includes("posture")
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff withdrawal requires authorization and posture retraction targets (R105/R107)",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R105", "FI-DSN-STD-015-R107"],
    );
  }

  const hoemRecord = record.hoemWithdrawalRecord as Record<string, unknown> | null;
  if (!hoemRecord || typeof hoemRecord !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff withdrawal requires HOEM withdrawal operative record (R107)",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R107"],
    );
  }
  assertBrandedId(hoemRecord.hoemWithdrawalRecordId, ID_PREFIXES.hoemWithdrawalOperative, "HOEM withdrawal operative record");
  if (hoemRecord.withdrawalActId !== record.withdrawalActId || hoemRecord.actType !== "withdrawal") {
    throw new OrchestraConstitutionalError(
      "HOEM withdrawal operative record must match parent withdrawal act (R107)",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R107"],
    );
  }
  assertHgaMatrixActMayBePerformed(hoemRecord.actType);
  assertHgaActTypeStringFailClosed(hoemRecord.actType, { requireOperativePerformance: true });
  const hoemTargets = hoemRecord.retractionTargets;
  if (
    hoemRecord.gpraId !== record.gpraId ||
    hoemRecord.obligationId !== record.obligationId ||
    hoemRecord.handoffConsumerContextId !== record.handoffConsumerContextId ||
    hoemRecord.bindingId !== record.bindingId ||
    hoemRecord.consumerClassId !== record.consumerClassId ||
    hoemRecord.authorizationActId !== record.authorizationActId ||
    hoemRecord.postureDeclarationActId !== record.postureDeclarationActId ||
    hoemRecord.constitutionalBasisKind !== record.constitutionalBasisKind ||
    hoemRecord.effectiveAt !== record.withdrawnAt ||
    !Array.isArray(hoemTargets) ||
    hoemTargets.length !== 2 ||
    !hoemTargets.includes("authorization") ||
    !hoemTargets.includes("posture") ||
    hoemRecord.doesNotMergeAuthorizationAttribution !== true ||
    hoemRecord.doesNotMergePostureDeclarationAttribution !== true ||
    hoemRecord.doesNotMergeCompletionAttribution !== true ||
    hoemRecord.doesNotMergeSuspensionAttribution !== true ||
    hoemRecord.doesNotMergeLifecycleAttribution !== true ||
    hoemRecord.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM withdrawal operative record is incoherent or merges peer act types (R107)",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R107"],
    );
  }

  if (
    record.forwardRelianceCeased !== true ||
    record.doesNotEraseAuthorization !== true ||
    record.doesNotErasePosture !== true ||
    record.doesNotEraseSuspensionHistory !== true ||
    record.notHandoffSuspension !== true ||
    record.notHandoffRecall !== true ||
    record.notHandoffCompletion !== true ||
    record.notHercmReentry !== true ||
    record.notResumption !== true ||
    record.notRestoration !== true ||
    record.effectFraming !== "hga_initiated_retraction" ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffExecution !== true ||
    record.notDownstreamAcceptance !== true ||
    record.notPermanentCollectionMembership !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotCollapsePeerDecisionClasses !== true ||
    record.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    record.doesNotMergeAcrossConsumerClasses !== true ||
    record.notAutomaticHslmPromotion !== true ||
    record.hslmProjectionFromActFacts !== true ||
    record.r98DistinctHgaWithdrawalAct !== true ||
    record.r99SharedPreconditionsPlusTriggers !== true ||
    record.r100NoWithdrawAfterRelianceCeased !== true ||
    record.r101NoSoleRtcGpraG11HrwmBasis !== true ||
    record.r102SingleBindingPostureChain !== true ||
    record.r103ConstitutionalBasisAndProvenance !== true ||
    record.r104EffectFromWithdrawnAtForward !== true ||
    record.r105HgaInitiatedRetractionCessation !== true ||
    record.r106AttributedBindingOnly !== true ||
    record.r107HoemWithdrawalOperativeRecord !== true ||
    record.r108NotAutomaticHslmPromotion !== true ||
    record.r109NoAdditionalCessationAfterCeased !== true ||
    record.r110InvalidAttemptsNonOperative !== true ||
    record.r111NotSuspensionRecallOrReentry !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff withdrawal must carry HOF-G6-U3 constitutional markers (R98–R111)",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R98", "FI-DSN-STD-015-R111"],
    );
  }

  const forbidden = [
    "recallActId", "expiryActId", "resumeHandoff", "restoreHandoff", "reenterHandoff",
    "recallHandoff", "expireHandoff", "executesHandoff", "handoffExecuted", "performHandoff",
    "manufacturingExecutionId", "fulfillmentExecutionId", "productionExecutionId",
    "executionQueueId", "constitutionalQueueId", "brainWithdrawHandoff",
    "brainHandoffWithdrawal", "implicitWithdrawal", "hoemRecallRecordId", "hercmReentryId",
    "resumptionActId", "restorationActId", "rejectHandoff", "performHgaAct",
    "performG6LifecycleAct", "applyLifecycleState",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff withdrawal must not carry recall/reentry/execution fields (R110/R111)",
        "invalid_handoff_withdrawal",
        ["FI-DSN-STD-015-R110", "FI-DSN-STD-015-R111"],
      );
    }
  }
  assertAuditMetadata(record.audit, "Governed Handoff withdrawal act");
  assertStd015HofG6U3Traceability(record.traceability, "Governed Handoff withdrawal act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff withdrawal act requires valid governed creation marker",
      "invalid_handoff_withdrawal",
      ["FI-DSN-STD-015-R98"],
    );
  }
}

export function validatePersistedGovernedHandoffRecall(
  raw: unknown,
): asserts raw is GovernedHandoffRecallActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff recall",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R112"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.recallActId,
    ID_PREFIXES.handoffRecallAct,
    "Governed Handoff recall act",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(record.bindingId, ID_PREFIXES.handoffConsumerBinding, "Governed Handoff consumer binding");
  assertBrandedId(record.authorizationActId, ID_PREFIXES.handoffAuthorizationAct, "Governed Handoff authorization act");
  if (record.postureDeclarationActId != null) {
    assertBrandedId(record.postureDeclarationActId, ID_PREFIXES.handoffPostureDeclarationAct, "Governed Handoff posture declaration act");
  }
  assertBrandedId(record.preparationId, ID_PREFIXES.handoffPreparation, "Governed Handoff preparation");
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (
    typeof record.handoffConsumerContextId !== "string" ||
    !record.handoffConsumerContextId.trim() ||
    typeof record.recalledBy !== "string" ||
    !record.recalledBy.trim() ||
    typeof record.recalledAt !== "string" ||
    !record.recalledAt.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff recall requires context, recalledBy, and recalledAt",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R112", "FI-DSN-STD-015-R118"],
    );
  }
  if (
    !isCanonicalEstablishedHandoffGovernanceAuthorityClassId(record.authorityClassId) ||
    record.authorityGoverningSourceId !== "PD-STD-015-001" ||
    record.authorityConstitutionalScope !== "handoff_recall_act"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff recall requires established HGA recall scope (R112)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R112"],
    );
  }
  if (
    !isHccmConsumerClassId(record.consumerClassId) ||
    (record.declaredPostureClass != null &&
      !isFrozenHandoffPostureClass(record.declaredPostureClass))
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff recall requires closed consumer and posture classes (R113/R116)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R113", "FI-DSN-STD-015-R116"],
    );
  }
  const triggers = record.satisfiedHrtcmTriggers;
  if (
    !Array.isArray(triggers) ||
    triggers.length === 0 ||
    !triggers.every((t) => isHrtcmRecallTriggerId(t))
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff recall requires at least one closed HRTCM trigger (R115/R117)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R115", "FI-DSN-STD-015-R117"],
    );
  }

  const hoemRecord = record.hoemRecallRecord as Record<string, unknown> | null;
  if (!hoemRecord || typeof hoemRecord !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff recall requires HOEM recall operative record (R121)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R121"],
    );
  }
  assertBrandedId(hoemRecord.hoemRecallRecordId, ID_PREFIXES.hoemRecallOperative, "HOEM recall operative record");
  if (hoemRecord.recallActId !== record.recallActId || hoemRecord.actType !== "recall") {
    throw new OrchestraConstitutionalError(
      "HOEM recall operative record must match parent recall act (R121)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R121"],
    );
  }
  assertHgaMatrixActMayBePerformed(hoemRecord.actType);
  assertHgaActTypeStringFailClosed(hoemRecord.actType, { requireOperativePerformance: true });
  const hoemTriggers = hoemRecord.satisfiedHrtcmTriggers;
  if (
    hoemRecord.gpraId !== record.gpraId ||
    hoemRecord.obligationId !== record.obligationId ||
    hoemRecord.handoffConsumerContextId !== record.handoffConsumerContextId ||
    hoemRecord.bindingId !== record.bindingId ||
    hoemRecord.consumerClassId !== record.consumerClassId ||
    hoemRecord.authorizationActId !== record.authorizationActId ||
    hoemRecord.postureDeclarationActId !== record.postureDeclarationActId ||
    hoemRecord.effectiveAt !== record.recalledAt ||
    !Array.isArray(hoemTriggers) ||
    hoemTriggers.length !== (triggers as unknown[]).length ||
    !hoemTriggers.every((t) => (triggers as unknown[]).includes(t)) ||
    hoemRecord.doesNotMergeAuthorizationAttribution !== true ||
    hoemRecord.doesNotMergePostureDeclarationAttribution !== true ||
    hoemRecord.doesNotMergeCompletionAttribution !== true ||
    hoemRecord.doesNotMergeSuspensionAttribution !== true ||
    hoemRecord.doesNotMergeLifecycleAttribution !== true ||
    hoemRecord.doesNotMergeWithdrawalAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM recall operative record is incoherent or merges peer act types (R121)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R121"],
    );
  }

  if (
    record.forwardRelianceCeased !== true ||
    record.doesNotEraseAuthorization !== true ||
    record.doesNotErasePosture !== true ||
    record.doesNotEraseSuspensionHistory !== true ||
    record.doesNotEraseWithdrawalHistory !== true ||
    record.notHandoffSuspension !== true ||
    record.notHandoffWithdrawal !== true ||
    record.notHandoffCompletion !== true ||
    record.notHercmReentry !== true ||
    record.notResumption !== true ||
    record.notRestoration !== true ||
    record.effectFraming !== "responsive_forward_reliance_termination" ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffExecution !== true ||
    record.notDownstreamAcceptance !== true ||
    record.notPermanentCollectionMembership !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotCollapsePeerDecisionClasses !== true ||
    record.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    record.doesNotMergeAcrossConsumerClasses !== true ||
    record.notAutomaticHslmPromotion !== true ||
    record.hslmProjectionFromActFacts !== true ||
    record.r112DistinctHgaRecallAct !== true ||
    record.r113SharedPreconditionsPlusTriggers !== true ||
    record.r114NoRecallAfterRelianceCeased !== true ||
    record.r115NoSoleRtcGpraG11HrwmBasis !== true ||
    record.r116SingleBindingPostureChain !== true ||
    record.r117HrtcmTriggerEvidenceRecording !== true ||
    record.r118EffectFromRecalledAtForward !== true ||
    record.r119ResponsiveForwardRelianceCessation !== true ||
    record.r120AttributedBindingOnly !== true ||
    record.r121HoemRecallOperativeRecord !== true ||
    record.r122NotAutomaticHslmPromotion !== true ||
    record.r123RepeatedRecallsAdditive !== true ||
    record.r124InvalidAttemptsNonOperative !== true ||
    record.r125NotSuspensionWithdrawalOrReentry !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff recall must carry HOF-G6-U4 constitutional markers (R112–R125)",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R112", "FI-DSN-STD-015-R125"],
    );
  }

  const forbidden = [
    "withdrawalActId", "expiryActId", "resumeHandoff", "restoreHandoff", "reenterHandoff",
    "withdrawHandoff", "expireHandoff", "executesHandoff", "handoffExecuted", "performHandoff",
    "manufacturingExecutionId", "fulfillmentExecutionId", "productionExecutionId",
    "executionQueueId", "constitutionalQueueId", "brainRecallHandoff",
    "brainHandoffRecall", "implicitRecall", "hoemWithdrawalRecordId", "hercmReentryId",
    "resumptionActId", "restorationActId", "rejectHandoff", "performHgaAct",
    "performG6LifecycleAct", "applyLifecycleState", "constitutionalBasisKind",
    "constitutionalBasisNotes",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff recall must not carry withdrawal/reentry/execution fields (R124/R125)",
        "invalid_handoff_recall",
        ["FI-DSN-STD-015-R124", "FI-DSN-STD-015-R125"],
      );
    }
  }
  assertAuditMetadata(record.audit, "Governed Handoff recall act");
  assertStd015HofG6U4Traceability(record.traceability, "Governed Handoff recall act");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff recall act requires valid governed creation marker",
      "invalid_handoff_recall",
      ["FI-DSN-STD-015-R112"],
    );
  }
}

/**
 * HERCM REC-02 resumption (R126–R139).
 *
 * Deliberately does NOT call assertHgaMatrixActMayBePerformed: resumption is a peer
 * NON-MATRIX HGA act and routing it through the six-type matrix would fail closed (R126).
 */
export function validatePersistedGovernedHandoffResumption(
  raw: unknown,
): asserts raw is GovernedHandoffResumptionActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff resumption",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R126"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.resumptionActId,
    ID_PREFIXES.handoffResumptionAct,
    "Governed Handoff resumption act",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(record.bindingId, ID_PREFIXES.handoffConsumerBinding, "Governed Handoff consumer binding");
  assertBrandedId(record.authorizationActId, ID_PREFIXES.handoffAuthorizationAct, "Governed Handoff authorization act");
  assertBrandedId(record.resumedSuspensionActId, ID_PREFIXES.handoffSuspensionAct, "Governed Handoff suspension act");
  if (record.postureDeclarationActId != null) {
    assertBrandedId(record.postureDeclarationActId, ID_PREFIXES.handoffPostureDeclarationAct, "Governed Handoff posture declaration act");
  }
  assertBrandedId(record.preparationId, ID_PREFIXES.handoffPreparation, "Governed Handoff preparation");
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (
    typeof record.handoffConsumerContextId !== "string" ||
    !record.handoffConsumerContextId.trim() ||
    typeof record.resumedBy !== "string" ||
    !record.resumedBy.trim() ||
    typeof record.resumedAt !== "string" ||
    !record.resumedAt.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff resumption requires context, resumedBy, and resumedAt",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R126", "FI-DSN-STD-015-R134"],
    );
  }
  if (
    !isCanonicalEstablishedHandoffGovernanceAuthorityClassId(record.authorityClassId) ||
    record.authorityGoverningSourceId !== "PD-STD-015-001" ||
    record.authorityConstitutionalScope !== "handoff_resumption_act"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff resumption requires established HGA resumption scope (R126)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R126"],
    );
  }
  if (!isHercmResumptionCategoryId(record.hercmCategory)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff resumption requires closed HERCM resumption category REC-02 (R127/R131)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R127", "FI-DSN-STD-015-R131"],
    );
  }
  if (
    record.hercmQualifyingPriorState !==
    resolveHercmCategory(record.hercmCategory).qualifyingPriorState
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff resumption qualifying prior state must be suspended (R131/R133)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R131", "FI-DSN-STD-015-R133"],
    );
  }
  if (!isResumptionConstitutionalBasisKind(record.constitutionalBasisKind)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff resumption requires the closed REC-02 constitutional basis kind (R131)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R131"],
    );
  }
  const resumptionProvenance = record.constitutionalBasisProvenance as
    | Record<string, unknown>
    | null;
  if (
    !resumptionProvenance ||
    typeof resumptionProvenance !== "object" ||
    resumptionProvenance.basisKind !== record.constitutionalBasisKind ||
    resumptionProvenance.notesCannotBeSoleBasis !== true ||
    (resumptionProvenance.notes !== null && typeof resumptionProvenance.notes !== "string")
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff resumption basis provenance is incoherent; notes cannot be the sole basis (R131)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R131"],
    );
  }
  if (
    !isHccmConsumerClassId(record.consumerClassId) ||
    (record.declaredPostureClass != null &&
      !isFrozenHandoffPostureClass(record.declaredPostureClass))
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff resumption requires closed consumer and posture classes (R130/R133)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R130", "FI-DSN-STD-015-R133"],
    );
  }

  const hoemResumption = record.hoemResumptionRecord as Record<string, unknown> | null;
  if (!hoemResumption || typeof hoemResumption !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff resumption requires HOEM resumption operative record (R136)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R136"],
    );
  }
  assertBrandedId(
    hoemResumption.hoemResumptionRecordId,
    ID_PREFIXES.hoemResumptionOperative,
    "HOEM resumption operative record",
  );
  if (
    hoemResumption.resumptionActId !== record.resumptionActId ||
    hoemResumption.actType !== "resumption" ||
    hoemResumption.hercmCategory !== record.hercmCategory ||
    hoemResumption.qualifyingPriorState !== record.hercmQualifyingPriorState ||
    hoemResumption.gpraId !== record.gpraId ||
    hoemResumption.obligationId !== record.obligationId ||
    hoemResumption.handoffConsumerContextId !== record.handoffConsumerContextId ||
    hoemResumption.bindingId !== record.bindingId ||
    hoemResumption.consumerClassId !== record.consumerClassId ||
    hoemResumption.authorizationActId !== record.authorizationActId ||
    hoemResumption.postureDeclarationActId !== record.postureDeclarationActId ||
    hoemResumption.resumedSuspensionActId !== record.resumedSuspensionActId ||
    hoemResumption.constitutionalBasisKind !== record.constitutionalBasisKind ||
    hoemResumption.effectiveAt !== record.resumedAt ||
    hoemResumption.doesNotMergeAuthorizationAttribution !== true ||
    hoemResumption.doesNotMergePostureDeclarationAttribution !== true ||
    hoemResumption.doesNotMergeCompletionAttribution !== true ||
    hoemResumption.doesNotMergeSuspensionAttribution !== true ||
    hoemResumption.doesNotMergeWithdrawalAttribution !== true ||
    hoemResumption.doesNotMergeRecallAttribution !== true ||
    hoemResumption.doesNotMergeReentryAttribution !== true ||
    hoemResumption.doesNotMergeLifecycleAttribution !== true ||
    hoemResumption.notHgaMatrixActType !== true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM resumption operative record is incoherent or merges peer act types (R136)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R136"],
    );
  }

  if (
    record.forwardRelianceRestoredOnExistingAuthorization !== true ||
    record.samePostureChainRetained !== true ||
    record.doesNotMintNewAuthorization !== true ||
    record.doesNotMintNewPostureDeclaration !== true ||
    record.doesNotEraseSuspensionHistory !== true ||
    record.doesNotEraseWithdrawalHistory !== true ||
    record.doesNotEraseRecallHistory !== true ||
    record.notHandoffSuspension !== true ||
    record.notHandoffWithdrawal !== true ||
    record.notHandoffRecall !== true ||
    record.notHandoffCompletion !== true ||
    record.notHercmReentry !== true ||
    record.notRestoration !== true ||
    record.notAutomaticRecovery !== true ||
    record.effectFraming !== "forward_reliance_resumption_on_existing_authorization" ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffExecution !== true ||
    record.notDownstreamAcceptance !== true ||
    record.notPermanentCollectionMembership !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotCollapsePeerDecisionClasses !== true ||
    record.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    record.doesNotMergeAcrossConsumerClasses !== true ||
    record.notAutomaticHslmPromotion !== true ||
    record.hslmProjectionFromActFacts !== true ||
    record.hslmRemainsEightStates !== true ||
    record.notHgaMatrixActType !== true ||
    record.r126DistinctHercmResumptionAct !== true ||
    record.r127ClosedHercmCategorySet !== true ||
    record.r128ExportReadyAuthorizesConsiderationOnly !== true ||
    record.r129NoAutomaticRecoveryAndInvalidatedBlocks !== true ||
    record.r130SingleBindingPostureChain !== true ||
    record.r131CategoryConditionsSatisfied !== true ||
    record.r132ForwardRelianceOnExistingAuthorization !== true ||
    record.r133SamePostureChainAndQualifyingPriorState !== true ||
    record.r134ProspectiveFromResumedAtNoRewrite !== true ||
    record.r135AdditivePreservationOfPriorHistory !== true ||
    record.r136HoemResumptionOperativeRecord !== true ||
    record.r137NotAutomaticHslmPromotionHslmStaysEight !== true ||
    record.r138InvalidAttemptsNonOperative !== true ||
    record.r139RepeatedHercmActsAdditiveNotSubstitute !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff resumption must carry HERCM constitutional markers (R126–R139)",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R126", "FI-DSN-STD-015-R139"],
    );
  }

  for (const key of [
    ...HERCM_FORBIDDEN_PERSISTED_KEYS,
    ...HERCM_FORBIDDEN_RESUMPTION_KEYS,
  ]) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff resumption must not carry re-entry/restoration/authorization/execution fields (R132/R138/R139)",
        "invalid_handoff_resumption",
        ["FI-DSN-STD-015-R132", "FI-DSN-STD-015-R139"],
      );
    }
  }
  assertAuditMetadata(record.audit, "Governed Handoff resumption act");
  assertStd015HercmTraceability(
    record.traceability,
    "Governed Handoff resumption act",
    "invalid_handoff_resumption",
  );
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff resumption act requires valid governed creation marker",
      "invalid_handoff_resumption",
      ["FI-DSN-STD-015-R126"],
    );
  }
}

/**
 * HERCM REC-01/03/04/05 re-entry (R126–R139).
 *
 * Deliberately does NOT call assertHgaMatrixActMayBePerformed: re-entry is a peer
 * NON-MATRIX HGA act and routing it through the six-type matrix would fail closed (R126).
 */
export function validatePersistedGovernedHandoffReentry(
  raw: unknown,
): asserts raw is GovernedHandoffReentryActRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff re-entry",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R126"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.reentryActId,
    ID_PREFIXES.handoffReentryAct,
    "Governed Handoff re-entry act",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(record.bindingId, ID_PREFIXES.handoffConsumerBinding, "Governed Handoff consumer binding");
  assertBrandedId(record.predecessorAuthorizationActId, ID_PREFIXES.handoffAuthorizationAct, "Governed Handoff authorization act");
  if (record.predecessorPostureDeclarationActId != null) {
    assertBrandedId(record.predecessorPostureDeclarationActId, ID_PREFIXES.handoffPostureDeclarationAct, "Governed Handoff posture declaration act");
  }
  if (record.predecessorWithdrawalActId != null) {
    assertBrandedId(record.predecessorWithdrawalActId, ID_PREFIXES.handoffWithdrawalAct, "Governed Handoff withdrawal act");
  }
  if (record.predecessorRecallActId != null) {
    assertBrandedId(record.predecessorRecallActId, ID_PREFIXES.handoffRecallAct, "Governed Handoff recall act");
  }
  assertBrandedId(record.preparationId, ID_PREFIXES.handoffPreparation, "Governed Handoff preparation");
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (
    typeof record.handoffConsumerContextId !== "string" ||
    !record.handoffConsumerContextId.trim() ||
    typeof record.reenteredBy !== "string" ||
    !record.reenteredBy.trim() ||
    typeof record.reenteredAt !== "string" ||
    !record.reenteredAt.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry requires context, reenteredBy, and reenteredAt",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R126", "FI-DSN-STD-015-R134"],
    );
  }
  if (
    !isCanonicalEstablishedHandoffGovernanceAuthorityClassId(record.authorityClassId) ||
    record.authorityGoverningSourceId !== "PD-STD-015-001" ||
    record.authorityConstitutionalScope !== "handoff_reentry_act"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry requires established HGA re-entry scope (R126)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R70", "FI-DSN-STD-015-R126"],
    );
  }
  if (!isHercmReentryCategoryId(record.hercmCategory)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry requires closed HERCM re-entry category REC-01/03/04/05 (R127/R131)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R127", "FI-DSN-STD-015-R131"],
    );
  }
  const reentryCategory = resolveHercmCategory(record.hercmCategory);
  if (
    record.hercmQualifyingPriorState !== reentryCategory.qualifyingPriorState ||
    record.constitutionalBasisKind !== reentryCategory.basisKind ||
    record.requiresNewPostureAfterNewAuthorization !==
      reentryCategory.requiresNewPostureAfterNewAuthorization
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry does not match its HERCM category conditions (R131/R132/R133)",
      "invalid_handoff_reentry",
      [
        "FI-DSN-STD-015-R131",
        "FI-DSN-STD-015-R132",
        "FI-DSN-STD-015-R133",
      ],
    );
  }
  if (!isReentryConstitutionalBasisKind(record.constitutionalBasisKind)) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry requires a closed HERCM constitutional basis kind (R131)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R131"],
    );
  }
  const reentryProvenance = record.constitutionalBasisProvenance as
    | Record<string, unknown>
    | null;
  if (
    !reentryProvenance ||
    typeof reentryProvenance !== "object" ||
    reentryProvenance.basisKind !== record.constitutionalBasisKind ||
    reentryProvenance.notesCannotBeSoleBasis !== true ||
    (reentryProvenance.notes !== null && typeof reentryProvenance.notes !== "string")
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry basis provenance is incoherent; notes cannot be the sole basis (R131)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R131"],
    );
  }
  // Rejected is denotation-only (R48/R51) and expiry acts remain deferred to R140+.
  if (
    record.predecessorRejectionAttributionId !== null ||
    record.predecessorExpiryActId !== null
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry must not forge a rejection or expiry act predecessor (R133/R137)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R133", "FI-DSN-STD-015-R137"],
    );
  }
  if (
    !isHccmConsumerClassId(record.consumerClassId) ||
    (record.declaredPostureClass != null &&
      !isFrozenHandoffPostureClass(record.declaredPostureClass))
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry requires closed consumer and posture classes (R130)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R130"],
    );
  }

  const hoemReentry = record.hoemReentryRecord as Record<string, unknown> | null;
  if (!hoemReentry || typeof hoemReentry !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry requires HOEM re-entry operative record (R136)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R136"],
    );
  }
  assertBrandedId(
    hoemReentry.hoemReentryRecordId,
    ID_PREFIXES.hoemReentryOperative,
    "HOEM re-entry operative record",
  );
  if (
    hoemReentry.reentryActId !== record.reentryActId ||
    hoemReentry.actType !== "reentry" ||
    hoemReentry.hercmCategory !== record.hercmCategory ||
    hoemReentry.qualifyingPriorState !== record.hercmQualifyingPriorState ||
    hoemReentry.gpraId !== record.gpraId ||
    hoemReentry.obligationId !== record.obligationId ||
    hoemReentry.handoffConsumerContextId !== record.handoffConsumerContextId ||
    hoemReentry.bindingId !== record.bindingId ||
    hoemReentry.consumerClassId !== record.consumerClassId ||
    hoemReentry.predecessorAuthorizationActId !== record.predecessorAuthorizationActId ||
    hoemReentry.predecessorPostureDeclarationActId !==
      record.predecessorPostureDeclarationActId ||
    hoemReentry.predecessorWithdrawalActId !== record.predecessorWithdrawalActId ||
    hoemReentry.predecessorRecallActId !== record.predecessorRecallActId ||
    hoemReentry.predecessorRejectionAttributionId !== null ||
    hoemReentry.predecessorExpiryActId !== null ||
    hoemReentry.constitutionalBasisKind !== record.constitutionalBasisKind ||
    hoemReentry.effectiveAt !== record.reenteredAt ||
    hoemReentry.doesNotMergeAuthorizationAttribution !== true ||
    hoemReentry.doesNotMergePostureDeclarationAttribution !== true ||
    hoemReentry.doesNotMergeCompletionAttribution !== true ||
    hoemReentry.doesNotMergeSuspensionAttribution !== true ||
    hoemReentry.doesNotMergeWithdrawalAttribution !== true ||
    hoemReentry.doesNotMergeRecallAttribution !== true ||
    hoemReentry.doesNotMergeResumptionAttribution !== true ||
    hoemReentry.doesNotMergeLifecycleAttribution !== true ||
    hoemReentry.notHgaMatrixActType !== true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM re-entry operative record is incoherent or merges peer act types (R136)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R136"],
    );
  }

  if (
    record.returnsTowardEligibleForConsiderationOnly !== true ||
    record.requiresNewAuthorizationViaG2 !== true ||
    typeof record.requiresNewPostureAfterNewAuthorization !== "boolean" ||
    record.doesNotResurrectAuthorization !== true ||
    record.doesNotResurrectPosture !== true ||
    record.doesNotMintNewAuthorization !== true ||
    record.doesNotMintNewPostureDeclaration !== true ||
    record.doesNotEraseSuspensionHistory !== true ||
    record.doesNotEraseWithdrawalHistory !== true ||
    record.doesNotEraseRecallHistory !== true ||
    record.notHandoffSuspension !== true ||
    record.notHandoffWithdrawal !== true ||
    record.notHandoffRecall !== true ||
    record.notHandoffCompletion !== true ||
    record.notHercmResumption !== true ||
    record.notRestoration !== true ||
    record.notAutomaticRecovery !== true ||
    record.effectFraming !== "return_toward_eligible_for_consideration" ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffExecution !== true ||
    record.notDownstreamAcceptance !== true ||
    record.notPermanentCollectionMembership !== true ||
    record.doesNotAuthorizeManufacturingOrFulfillment !== true ||
    record.doesNotCollapsePeerDecisionClasses !== true ||
    record.doesNotSubstituteGpraOrEligibilityOrAuthorizationOrAdvisory !== true ||
    record.doesNotMergeAcrossConsumerClasses !== true ||
    record.notAutomaticHslmPromotion !== true ||
    record.hslmProjectionFromActFacts !== true ||
    record.hslmRemainsEightStates !== true ||
    record.notHgaMatrixActType !== true ||
    record.r126DistinctHercmReentryAct !== true ||
    record.r127ClosedHercmCategorySet !== true ||
    record.r128ExportReadyAuthorizesConsiderationOnly !== true ||
    record.r129NoAutomaticRecoveryAndInvalidatedBlocks !== true ||
    record.r130SingleBindingPostureChain !== true ||
    record.r131CategoryConditionsSatisfied !== true ||
    record.r132ReturnTowardEligibleRequiresNewAuthorization !== true ||
    record.r133QualifyingPriorStateRequired !== true ||
    record.r134ProspectiveFromReenteredAtNoRewrite !== true ||
    record.r135AdditivePreservationOfPriorHistory !== true ||
    record.r136HoemReentryOperativeRecord !== true ||
    record.r137NotAutomaticHslmPromotionHslmStaysEight !== true ||
    record.r138InvalidAttemptsNonOperative !== true ||
    record.r139RepeatedHercmActsAdditiveNotSubstitute !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted Handoff re-entry must carry HERCM constitutional markers (R126–R139)",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R126", "FI-DSN-STD-015-R139"],
    );
  }

  for (const key of [
    ...HERCM_FORBIDDEN_PERSISTED_KEYS,
    ...HERCM_FORBIDDEN_REENTRY_KEYS,
  ]) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted Handoff re-entry must not carry resumption/restoration/authorization/execution fields (R132/R138/R139)",
        "invalid_handoff_reentry",
        ["FI-DSN-STD-015-R132", "FI-DSN-STD-015-R139"],
      );
    }
  }
  assertAuditMetadata(record.audit, "Governed Handoff re-entry act");
  assertStd015HercmTraceability(
    record.traceability,
    "Governed Handoff re-entry act",
    "invalid_handoff_reentry",
  );
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff re-entry act requires valid governed creation marker",
      "invalid_handoff_reentry",
      ["FI-DSN-STD-015-R126"],
    );
  }
}

export function validatePersistedGovernedHandoffDownstreamExitBoundary(
  raw: unknown,
): asserts raw is GovernedHandoffDownstreamExitBoundaryAttributionRecord {
  if (!raw || typeof raw !== "object") {
    throw new OrchestraConstitutionalError(
      "Invalid persisted Governed Handoff downstream exit boundary",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58"],
    );
  }
  const record = raw as Record<string, unknown>;
  assertBrandedId(
    record.exitBoundaryAttributionId,
    ID_PREFIXES.handoffDownstreamExitBoundaryAttribution,
    "Governed Handoff downstream exit boundary attribution",
  );
  assertBrandedId(record.entryId, ID_PREFIXES.handoffEntry, "Governed Handoff entry");
  assertBrandedId(
    record.bindingId,
    ID_PREFIXES.handoffConsumerBinding,
    "Governed Handoff consumer binding",
  );
  assertBrandedId(
    record.postureDeclarationActId,
    ID_PREFIXES.handoffPostureDeclarationAct,
    "Governed Handoff posture declaration act",
  );
  assertBrandedId(
    record.completionActId,
    ID_PREFIXES.handoffCompletionAct,
    "Governed Handoff completion act",
  );
  assertBrandedId(
    record.preparationId,
    ID_PREFIXES.handoffPreparation,
    "Governed Handoff preparation",
  );
  assertBrandedId(record.gpraId, ID_PREFIXES.gpra, "GPRA");
  assertBrandedId(record.approvalActId, ID_PREFIXES.approvalAct, "Approval act");
  assertBrandedId(record.reviewId, ID_PREFIXES.review, "Production-readiness Review");
  assertBrandedId(record.determinationId, ID_PREFIXES.determination, "Review Determination");
  assertBrandedId(record.rvaId, ID_PREFIXES.rva, "Realized Visual Artifact");
  assertBrandedId(record.programId, ID_PREFIXES.program, "Production Program");
  assertBrandedId(record.obligationId, ID_PREFIXES.obligation, "Production Obligation");

  if (typeof record.handoffConsumerContextId !== "string" || !record.handoffConsumerContextId.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary requires non-empty handoffConsumerContextId",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R62"],
    );
  }
  if (typeof record.attributedBy !== "string" || !record.attributedBy.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary requires attributedBy",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R65"],
    );
  }
  if (typeof record.attributedAt !== "string" || !record.attributedAt.trim()) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary requires attributedAt",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R64"],
    );
  }
  if (
    typeof record.downstreamConsiderationDomain !== "string" ||
    !record.downstreamConsiderationDomain.trim()
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary requires downstreamConsiderationDomain",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61"],
    );
  }

  if (!isCanonicalEstablishedHandoffGovernanceAuthorityClassId(record.authorityClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary requires established HGA class (R58)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
    );
  }
  if (record.authorityGoverningSourceId !== "PD-STD-015-001") {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary authorityGoverningSourceId must be PD-STD-015-001",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58"],
    );
  }
  if (
    record.attributionKind !== "downstream_exit_boundary_attribution" ||
    record.constitutionalArtifactKind !== "downstream_exit_boundary_attribution"
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary must use downstream_exit_boundary_attribution kind (not HGA matrix act)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R63"],
    );
  }
  if ("authorityConstitutionalScope" in record && record.authorityConstitutionalScope != null) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary must not claim HGA matrix authorityConstitutionalScope (R58/R63)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R63"],
    );
  }

  if (!isHccmConsumerClassId(record.consumerClassId)) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary requires closed HCCM consumer class (R61)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61"],
    );
  }
  const catalog = resolveHccmConsumerClass(record.consumerClassId as never);
  if (record.downstreamConsiderationDomain !== catalog.downstreamConsiderationDomain) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary domain must equal HCCM catalog domain (R61/R62)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R61", "FI-DSN-STD-015-R62"],
    );
  }

  if (
    record.authorizationActId != null &&
    (typeof record.authorizationActId !== "string" ||
      !record.authorizationActId.startsWith(ID_PREFIXES.handoffAuthorizationAct))
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary authorizationActId must be null or a valid authorization act id",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R59"],
    );
  }

  const hoemRecord = record.hoemExitBoundaryRecord as Record<string, unknown> | null;
  if (!hoemRecord || typeof hoemRecord !== "object") {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary requires HOEM exit-boundary record (R64)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R64"],
    );
  }
  assertBrandedId(
    hoemRecord.hoemExitBoundaryRecordId,
    ID_PREFIXES.hoemExitBoundary,
    "HOEM exit-boundary record",
  );
  if (hoemRecord.exitBoundaryAttributionId !== record.exitBoundaryAttributionId) {
    throw new OrchestraConstitutionalError(
      "HOEM exit-boundary record exitBoundaryAttributionId must match parent attribution",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R64"],
    );
  }
  if (hoemRecord.actType !== "exit_boundary") {
    throw new OrchestraConstitutionalError(
      "HOEM exit-boundary record actType must be exit_boundary (R64)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R64"],
    );
  }
  // Peer NON-MATRIX only — never treat exit_boundary as an HGA matrix act type (R66/R67).
  assertHgaActTypeStringFailClosed(hoemRecord.actType, {
    allowPeerNonMatrixExitBoundary: true,
  });
  if (
    hoemRecord.gpraId !== record.gpraId ||
    hoemRecord.obligationId !== record.obligationId ||
    hoemRecord.handoffConsumerContextId !== record.handoffConsumerContextId ||
    hoemRecord.bindingId !== record.bindingId ||
    hoemRecord.consumerClassId !== record.consumerClassId ||
    hoemRecord.postureDeclarationActId !== record.postureDeclarationActId ||
    hoemRecord.completionActId !== record.completionActId ||
    hoemRecord.downstreamConsiderationDomain !== record.downstreamConsiderationDomain
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM exit-boundary record must bind to parent attribution context (R64)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R64"],
    );
  }
  if (
    hoemRecord.doesNotPrescribeIntakeWorkflow !== true ||
    hoemRecord.doesNotPrescribeAcceptanceMechanics !== true ||
    hoemRecord.doesNotPrescribeRoutingMechanics !== true ||
    hoemRecord.doesNotPrescribeStorageMechanics !== true ||
    hoemRecord.doesNotPrescribeNotificationMechanics !== true ||
    hoemRecord.doesNotMergeAuthorizationAttribution !== true ||
    hoemRecord.doesNotMergePostureDeclarationAttribution !== true ||
    hoemRecord.doesNotMergeCompletionAttribution !== true ||
    hoemRecord.doesNotMergeLifecycleAttribution !== true ||
    hoemRecord.doesNotMergeSuspensionAttribution !== true ||
    hoemRecord.doesNotMergeWithdrawalAttribution !== true ||
    hoemRecord.doesNotMergeRecallAttribution !== true
  ) {
    throw new OrchestraConstitutionalError(
      "HOEM exit-boundary record must carry non-prescription / peer-distinct markers (R64)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R64"],
    );
  }

  if (
    record.notHgaMatrixActType !== true ||
    record.notHandoffCompletionAct !== true ||
    record.notDownstreamAcceptance !== true ||
    record.notMembershipAdmission !== true ||
    record.notManufacturingOrFulfillmentOrExecution !== true ||
    record.notExitCompletenessSatisfaction !== true ||
    record.exitCompletenessDeferred !== true ||
    record.notHandoffAuthorization !== true ||
    record.notHandoffPostureDeclaration !== true ||
    record.notHandoffSuspension !== true ||
    record.notHandoffRecall !== true ||
    record.notHandoffWithdrawal !== true ||
    record.doesNotCollapsePeerDecisionClasses !== true ||
    record.doesNotMergeAcrossConsumerClasses !== true ||
    record.r58Volume06Terminus !== true ||
    record.r59BoundedExportDenotation !== true ||
    record.r60CompletedEnablesConsiderationOnly !== true ||
    record.r61SingleBindingRouting !== true ||
    record.r62TupleConsistency !== true ||
    record.r63PeerDistinctExitBoundary !== true ||
    record.r64HoemExitBoundaryLinkage !== true ||
    record.r65NoImplicitExit !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary must carry HOF-G8 constitutional markers (R58–R65)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R65"],
    );
  }

  const terminus = record.volume06Terminus as Record<string, unknown> | null;
  if (
    !terminus ||
    terminus.volumeId !== "volume_06" ||
    terminus.principalAuthorityLimit !== "FI-DSN-STD-015" ||
    terminus.terminusKind !== "handoff_governance_authority_terminus" ||
    terminus.doesNotAbsorbDownstreamAcceptance !== true ||
    terminus.doesNotAbsorbDownstreamAdmission !== true ||
    terminus.doesNotAbsorbDownstreamValidation !== true ||
    terminus.doesNotAbsorbDownstreamExecution !== true ||
    terminus.doesNotAbsorbDownstreamIntake !== true ||
    terminus.exitCompletenessDeferred !== true ||
    terminus.r58Volume06Terminus !== true
  ) {
    throw new OrchestraConstitutionalError(
      "Persisted downstream exit boundary requires Volume 06 terminus markers (R58)",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58"],
    );
  }

  const forbidden = [
    "authorityConstitutionalScope",
    "handoff_downstream_exit_act",
    "handoff_lifecycle_rejection_act",
    "suspensionActId",
    "recallActId",
    "withdrawalActId",
    "executesHandoff",
    "handoffExecuted",
    "performHandoff",
    "manufacturingExecutionId",
    "fulfillmentExecutionId",
    "productionExecutionId",
    "executionQueueId",
    "constitutionalQueueId",
    "downstreamAcceptanceId",
    "permanentCollectionMembershipId",
    "exitCompletenessSatisfactionId",
    "brainExit",
    "implicitExit",
    "rejectHandoffActLayer",
  ];
  for (const key of forbidden) {
    const value = record[key];
    if (value === true || (typeof value === "string" && value.trim()) || Array.isArray(value)) {
      throw new OrchestraConstitutionalError(
        "Persisted downstream exit boundary must not carry acceptance/mfg/rejection/matrix-exit fields (R58/R63/R65)",
        "invalid_handoff_downstream_exit_boundary",
        ["FI-DSN-STD-015-R58", "FI-DSN-STD-015-R63", "FI-DSN-STD-015-R65"],
      );
    }
  }

  assertAuditMetadata(record.audit, "Governed Handoff downstream exit boundary");
  assertStd015HofG8Traceability(record.traceability, "Governed Handoff downstream exit boundary");
  if (!isValidDomain3GovernedCreationMarker(record.governedCreationMarker)) {
    throw new OrchestraConstitutionalError(
      "Governed Handoff downstream exit boundary requires valid governed creation marker",
      "invalid_handoff_downstream_exit_boundary",
      ["FI-DSN-STD-015-R58"],
    );
  }
}
