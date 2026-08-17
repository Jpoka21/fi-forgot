/**
 * In-memory Domain 3 storage adapter — G2–G11 + STD-015 HOF-G1 entry + HOF-G7 consumption + HOF-G10 preservation audit + HOF-G2 authorization + HOF-G3 consumer binding + HOF-G4 posture declaration + HOF-G5 act-layer lifecycle + HOF-G8 downstream exit boundary.
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
  GovernedHandoffWithdrawalActRecord,
  GovernedHandoffRecallActRecord,
  GovernedHandoffReentryActRecord,
  GovernedHandoffResumptionActRecord,
  GovernedHandoffDownstreamExitBoundaryAttributionRecord,
  GovernedHandoffDownstreamExitCompletenessSatisfactionRecord,
  GovernedHandoffDownstreamExitCompletenessAttemptRecord,
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
import type { Domain3StoragePort } from "./domain3-storage-port.js";

export function createInMemoryDomain3Storage(): Domain3StoragePort {
  const reviews = new Map<string, ProductionReadinessReview>();
  const activeByRva = new Map<string, string>();
  const reviewsByRva = new Map<string, string[]>();
  const reviewByResubmissionEligibility = new Map<string, string>();
  const evidenceById = new Map<string, ReviewEvidenceRecord>();
  const evidenceByReview = new Map<string, string[]>();
  const activitiesById = new Map<string, ReviewDimensionActivityRecord>();
  const activitiesByReview = new Map<string, string[]>();
  const dtfById = new Map<string, DesignTimeFeasibilityEvaluationRecord>();
  const dtfByReview = new Map<string, string[]>();
  const determinationsById = new Map<string, ReviewDeterminationRecord>();
  const determinationByReview = new Map<string, string>();
  const approvalsById = new Map<string, ApprovalActRecord>();
  const approvalByReview = new Map<string, string>();
  const withholdingsById = new Map<string, ApprovalWithholdingRecord>();
  const withholdingByReview = new Map<string, string>();
  const gprasById = new Map<string, GpraGrantRecord>();
  const gpraByReview = new Map<string, string>();
  /** Multiple GPRA ids per rva+obligation (R62 replacement after Invalidated). */
  const gpraIdsByRvaObligation = new Map<string, string[]>();
  /** Multiple GPRA ids per obligation across RVAs (G9 ST-1 succession). */
  const gpraIdsByObligation = new Map<string, string[]>();
  const invalidationsById = new Map<string, GpraInvalidationActRecord>();
  const invalidationByGpra = new Map<string, string>();
  const supersessionsById = new Map<string, GpraSupersessionActRecord>();
  const supersessionByPredecessor = new Map<string, string>();
  const deficienciesById = new Map<string, DownstreamDeficiencyRecord>();
  const deficiencyByReview = new Map<string, string>();
  const reworkAuthById = new Map<string, ReworkAuthorizationRecord>();
  const reworkAuthByReview = new Map<string, string>();
  const reworkWithholdingById = new Map<string, ReworkAuthorizationWithholdingRecord>();
  const reworkWithholdingByReview = new Map<string, string>();
  const returnPostureById = new Map<string, ReturnPostureRecord>();
  const returnPostureByReview = new Map<string, string>();
  const resubmissionById = new Map<string, ResubmissionEligibilityRecord>();
  const resubmissionByPriorReview = new Map<string, string>();
  const brainAdvisoriesById = new Map<string, Domain3BrainAdvisoryRecord>();
  const brainAdvisoriesByReview = new Map<string, string[]>();
  const handoffPreparationsById = new Map<string, GovernedHandoffPreparationRecord>();
  const handoffPreparationsByGpra = new Map<string, string[]>();
  const handoffEntriesById = new Map<string, GovernedHandoffEntryRecord>();
  const handoffEntriesByPreparation = new Map<string, string[]>();
  const handoffEntriesByGpra = new Map<string, string[]>();
  const handoffEvidenceConsumptionsById = new Map<
    string,
    GovernedHandoffEvidenceConsumptionRecord
  >();
  const handoffEvidenceConsumptionsByEntry = new Map<string, string[]>();
  const handoffEvidenceConsumptionsByGpra = new Map<string, string[]>();
  const handoffPreservationAuditsById = new Map<
    string,
    GovernedHandoffPreservationAuditRecord
  >();
  const handoffPreservationAuditsByEntry = new Map<string, string[]>();
  const handoffPreservationAuditsByGpra = new Map<string, string[]>();
  const handoffAuthorizationActsById = new Map<
    string,
    GovernedHandoffAuthorizationActRecord
  >();
  const handoffAuthorizationActsByEntry = new Map<string, string[]>();
  const handoffAuthorizationActsByGpra = new Map<string, string[]>();
  const handoffConsumerBindingsById = new Map<string, GovernedHandoffConsumerBindingRecord>();
  const handoffConsumerBindingsByEntry = new Map<string, string[]>();
  const handoffConsumerBindingsByGpra = new Map<string, string[]>();
  const handoffPostureDeclarationsById = new Map<
    string,
    GovernedHandoffPostureDeclarationActRecord
  >();
  const handoffPostureDeclarationsByBinding = new Map<string, string[]>();
  const handoffPostureDeclarationsByEntry = new Map<string, string[]>();
  const handoffPostureDeclarationsByGpra = new Map<string, string[]>();
  const handoffCompletionActsById = new Map<string, GovernedHandoffCompletionActRecord>();
  const handoffCompletionActsByBinding = new Map<string, string[]>();
  const handoffCompletionActsByEntry = new Map<string, string[]>();
  const handoffCompletionActsByGpra = new Map<string, string[]>();
  const handoffSuspensionActsById = new Map<string, GovernedHandoffSuspensionActRecord>();
  const handoffSuspensionActsByBinding = new Map<string, string[]>();
  const handoffSuspensionActsByEntry = new Map<string, string[]>();
  const handoffSuspensionActsByGpra = new Map<string, string[]>();
  const handoffWithdrawalActsById = new Map<string, GovernedHandoffWithdrawalActRecord>();
  const handoffWithdrawalActsByBinding = new Map<string, string[]>();
  const handoffWithdrawalActsByEntry = new Map<string, string[]>();
  const handoffWithdrawalActsByGpra = new Map<string, string[]>();
  const handoffRecallActsById = new Map<string, GovernedHandoffRecallActRecord>();
  const handoffRecallActsByBinding = new Map<string, string[]>();
  const handoffRecallActsByEntry = new Map<string, string[]>();
  const handoffRecallActsByGpra = new Map<string, string[]>();
  const handoffResumptionActsById = new Map<string, GovernedHandoffResumptionActRecord>();
  const handoffResumptionActsByBinding = new Map<string, string[]>();
  const handoffResumptionActsByEntry = new Map<string, string[]>();
  const handoffResumptionActsByGpra = new Map<string, string[]>();
  const handoffReentryActsById = new Map<string, GovernedHandoffReentryActRecord>();
  const handoffReentryActsByBinding = new Map<string, string[]>();
  const handoffReentryActsByEntry = new Map<string, string[]>();
  const handoffReentryActsByGpra = new Map<string, string[]>();
  const handoffDownstreamExitBoundaryById = new Map<
    string,
    GovernedHandoffDownstreamExitBoundaryAttributionRecord
  >();
  const handoffDownstreamExitBoundaryByBinding = new Map<string, string[]>();
  const handoffDownstreamExitBoundaryByEntry = new Map<string, string[]>();
  const handoffDownstreamExitBoundaryByGpra = new Map<string, string[]>();
  const handoffDownstreamExitCompletenessById = new Map<
    string,
    GovernedHandoffDownstreamExitCompletenessSatisfactionRecord
  >();
  const handoffDownstreamExitCompletenessByBinding = new Map<string, string[]>();
  const handoffDownstreamExitCompletenessByEntry = new Map<string, string[]>();
  const handoffDownstreamExitCompletenessByGpra = new Map<string, string[]>();
  const handoffDownstreamExitCompletenessAttemptById = new Map<
    string,
    GovernedHandoffDownstreamExitCompletenessAttemptRecord
  >();
  const handoffDownstreamExitCompletenessAttemptByBinding = new Map<string, string[]>();

  function rvaObligationKey(rvaId: string, obligationId: string): string {
    return `${rvaId}::${obligationId}`;
  }

  return {
    async putProductionReadinessReview(review) {
      const existing = reviews.get(review.reviewId);
      reviews.set(review.reviewId, structuredClone(review));

      if (!existing) {
        const list = reviewsByRva.get(review.rvaId) ?? [];
        list.push(review.reviewId);
        reviewsByRva.set(review.rvaId, list);
      }

      if (review.resubmissionEligibilityId) {
        const current = reviewByResubmissionEligibility.get(review.resubmissionEligibilityId);
        if (current && current !== review.reviewId) {
          throw new Error(
            `Duplicate subsequent Review for resubmission eligibility: ${review.resubmissionEligibilityId}`,
          );
        }
        reviewByResubmissionEligibility.set(review.resubmissionEligibilityId, review.reviewId);
      }

      if (review.posture === "under_review") {
        activeByRva.set(review.rvaId, review.reviewId);
      } else {
        const current = activeByRva.get(review.rvaId);
        if (current === review.reviewId) {
          activeByRva.delete(review.rvaId);
        }
      }
    },

    async getProductionReadinessReview(reviewId) {
      const review = reviews.get(reviewId);
      return review ? structuredClone(review) : null;
    },

    async getActiveProductionReadinessReviewByRva(rvaId) {
      const reviewId = activeByRva.get(rvaId);
      if (!reviewId) return null;
      return this.getProductionReadinessReview(reviewId as ProductionReadinessReview["reviewId"]);
    },

    async listProductionReadinessReviewsByRva(rvaId) {
      const ids = reviewsByRva.get(rvaId) ?? [];
      return Object.freeze(
        ids
          .map((id) => reviews.get(id))
          .filter((item): item is ProductionReadinessReview => !!item)
          .map((item) => structuredClone(item)),
      );
    },

    async getReviewByResubmissionEligibilityId(eligibilityId) {
      const reviewId = reviewByResubmissionEligibility.get(eligibilityId);
      if (!reviewId) return null;
      return this.getProductionReadinessReview(reviewId as ProductionReadinessReview["reviewId"]);
    },

    async putReviewEvidence(evidence) {
      if (evidenceById.has(evidence.evidenceId)) {
        throw new Error(`Duplicate Review evidence identity: ${evidence.evidenceId}`);
      }
      evidenceById.set(evidence.evidenceId, structuredClone(evidence));
      const list = evidenceByReview.get(evidence.reviewId) ?? [];
      list.push(evidence.evidenceId);
      evidenceByReview.set(evidence.reviewId, list);
    },

    async getReviewEvidence(evidenceId) {
      const evidence = evidenceById.get(evidenceId);
      return evidence ? structuredClone(evidence) : null;
    },

    async listReviewEvidenceByReview(reviewId) {
      const ids = evidenceByReview.get(reviewId) ?? [];
      return Object.freeze(
        ids
          .map((id) => evidenceById.get(id))
          .filter((item): item is ReviewEvidenceRecord => !!item)
          .map((item) => structuredClone(item)),
      );
    },

    async putReviewDimensionActivity(activity) {
      if (activitiesById.has(activity.activityId)) {
        throw new Error(`Duplicate Review dimension activity identity: ${activity.activityId}`);
      }
      activitiesById.set(activity.activityId, structuredClone(activity));
      const list = activitiesByReview.get(activity.reviewId) ?? [];
      list.push(activity.activityId);
      activitiesByReview.set(activity.reviewId, list);
    },

    async getReviewDimensionActivity(activityId) {
      const activity = activitiesById.get(activityId);
      return activity ? structuredClone(activity) : null;
    },

    async listReviewDimensionActivitiesByReview(reviewId) {
      const ids = activitiesByReview.get(reviewId) ?? [];
      return Object.freeze(
        ids
          .map((id) => activitiesById.get(id))
          .filter((item): item is ReviewDimensionActivityRecord => !!item)
          .map((item) => structuredClone(item)),
      );
    },

    async putDesignTimeFeasibilityEvaluation(evaluation) {
      if (dtfById.has(evaluation.evaluationId)) {
        throw new Error(
          `Duplicate Design-Time Feasibility evaluation identity: ${evaluation.evaluationId}`,
        );
      }
      dtfById.set(evaluation.evaluationId, structuredClone(evaluation));
      const list = dtfByReview.get(evaluation.reviewId) ?? [];
      list.push(evaluation.evaluationId);
      dtfByReview.set(evaluation.reviewId, list);
    },

    async getDesignTimeFeasibilityEvaluation(evaluationId) {
      const evaluation = dtfById.get(evaluationId);
      return evaluation ? structuredClone(evaluation) : null;
    },

    async listDesignTimeFeasibilityEvaluationsByReview(reviewId) {
      const ids = dtfByReview.get(reviewId) ?? [];
      return Object.freeze(
        ids
          .map((id) => dtfById.get(id))
          .filter((item): item is DesignTimeFeasibilityEvaluationRecord => !!item)
          .map((item) => structuredClone(item)),
      );
    },

    async putReviewDetermination(determination) {
      if (determinationsById.has(determination.determinationId)) {
        throw new Error(`Duplicate Review Determination identity: ${determination.determinationId}`);
      }
      if (determinationByReview.has(determination.reviewId)) {
        throw new Error(`Duplicate Review Determination for Review: ${determination.reviewId}`);
      }
      determinationsById.set(determination.determinationId, structuredClone(determination));
      determinationByReview.set(determination.reviewId, determination.determinationId);
    },

    async getReviewDetermination(determinationId) {
      const determination = determinationsById.get(determinationId);
      return determination ? structuredClone(determination) : null;
    },

    async getReviewDeterminationByReview(reviewId) {
      const determinationId = determinationByReview.get(reviewId);
      if (!determinationId) return null;
      return this.getReviewDetermination(
        determinationId as ReviewDeterminationRecord["determinationId"],
      );
    },

    async putApprovalAct(approval) {
      if (approvalsById.has(approval.approvalActId)) {
        throw new Error(`Duplicate Approval act identity: ${approval.approvalActId}`);
      }
      if (approvalByReview.has(approval.reviewId)) {
        throw new Error(`Duplicate Approval act for Review: ${approval.reviewId}`);
      }
      approvalsById.set(approval.approvalActId, structuredClone(approval));
      approvalByReview.set(approval.reviewId, approval.approvalActId);
    },

    async getApprovalAct(approvalActId) {
      const approval = approvalsById.get(approvalActId);
      return approval ? structuredClone(approval) : null;
    },

    async getApprovalActByReview(reviewId) {
      const approvalActId = approvalByReview.get(reviewId);
      if (!approvalActId) return null;
      return this.getApprovalAct(approvalActId as ApprovalActRecord["approvalActId"]);
    },

    async putApprovalWithholding(withholding) {
      if (withholdingsById.has(withholding.withholdingId)) {
        throw new Error(`Duplicate Approval withholding identity: ${withholding.withholdingId}`);
      }
      if (withholdingByReview.has(withholding.reviewId)) {
        throw new Error(`Duplicate Approval withholding for Review: ${withholding.reviewId}`);
      }
      withholdingsById.set(withholding.withholdingId, structuredClone(withholding));
      withholdingByReview.set(withholding.reviewId, withholding.withholdingId);
    },

    async getApprovalWithholding(withholdingId) {
      const withholding = withholdingsById.get(withholdingId);
      return withholding ? structuredClone(withholding) : null;
    },

    async getApprovalWithholdingByReview(reviewId) {
      const withholdingId = withholdingByReview.get(reviewId);
      if (!withholdingId) return null;
      return this.getApprovalWithholding(
        withholdingId as ApprovalWithholdingRecord["withholdingId"],
      );
    },

    async putGpraGrant(gpra) {
      if (gprasById.has(gpra.gpraId)) {
        throw new Error(`Duplicate GPRA identity: ${gpra.gpraId}`);
      }
      if (gpraByReview.has(gpra.reviewId)) {
        throw new Error(`Duplicate GPRA for Review: ${gpra.reviewId}`);
      }
      const key = rvaObligationKey(gpra.rvaId, gpra.obligationId);
      const scopeList = gpraIdsByRvaObligation.get(key) ?? [];
      scopeList.push(gpra.gpraId);
      gpraIdsByRvaObligation.set(key, scopeList);
      const obligationList = gpraIdsByObligation.get(gpra.obligationId) ?? [];
      obligationList.push(gpra.gpraId);
      gpraIdsByObligation.set(gpra.obligationId, obligationList);
      gprasById.set(gpra.gpraId, structuredClone(gpra));
      gpraByReview.set(gpra.reviewId, gpra.gpraId);
    },

    async getGpraGrant(gpraId) {
      const gpra = gprasById.get(gpraId);
      return gpra ? structuredClone(gpra) : null;
    },

    async getGpraGrantByReview(reviewId) {
      const gpraId = gpraByReview.get(reviewId);
      if (!gpraId) return null;
      return this.getGpraGrant(gpraId as GpraGrantRecord["gpraId"]);
    },

    async listGpraGrantsByRvaObligation(rvaId, obligationId) {
      const ids = gpraIdsByRvaObligation.get(rvaObligationKey(rvaId, obligationId)) ?? [];
      return ids
        .map((id) => gprasById.get(id))
        .filter((item): item is GpraGrantRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async getGpraGrantByRvaObligation(rvaId, obligationId) {
      const listed = await this.listGpraGrantsByRvaObligation(rvaId, obligationId);
      if (listed.length === 0) return null;
      const sorted = [...listed].sort((a, b) => a.grantedAt.localeCompare(b.grantedAt));
      return sorted[sorted.length - 1] ?? null;
    },

    async putGpraInvalidationAct(act) {
      if (invalidationsById.has(act.invalidationActId)) {
        throw new Error(`Duplicate GPRA invalidation act identity: ${act.invalidationActId}`);
      }
      if (invalidationByGpra.has(act.gpraId)) {
        throw new Error(`Duplicate GPRA invalidation act for GPRA: ${act.gpraId}`);
      }
      invalidationsById.set(act.invalidationActId, structuredClone(act));
      invalidationByGpra.set(act.gpraId, act.invalidationActId);
    },

    async getGpraInvalidationAct(invalidationActId) {
      const act = invalidationsById.get(invalidationActId);
      return act ? structuredClone(act) : null;
    },

    async getGpraInvalidationActByGpra(gpraId) {
      const id = invalidationByGpra.get(gpraId);
      if (!id) return null;
      return this.getGpraInvalidationAct(id as GpraInvalidationActRecord["invalidationActId"]);
    },

    async listGpraGrantsByObligation(obligationId) {
      const ids = gpraIdsByObligation.get(obligationId) ?? [];
      return ids
        .map((id) => gprasById.get(id))
        .filter((item): item is GpraGrantRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGpraSupersessionAct(act) {
      if (supersessionsById.has(act.supersessionActId)) {
        throw new Error(`Duplicate GPRA supersession act identity: ${act.supersessionActId}`);
      }
      if (supersessionByPredecessor.has(act.predecessorGpraId)) {
        throw new Error(
          `Duplicate GPRA supersession act for predecessor GPRA: ${act.predecessorGpraId}`,
        );
      }
      supersessionsById.set(act.supersessionActId, structuredClone(act));
      supersessionByPredecessor.set(act.predecessorGpraId, act.supersessionActId);
    },

    async getGpraSupersessionAct(supersessionActId) {
      const act = supersessionsById.get(supersessionActId);
      return act ? structuredClone(act) : null;
    },

    async getGpraSupersessionActByPredecessor(predecessorGpraId) {
      const id = supersessionByPredecessor.get(predecessorGpraId);
      if (!id) return null;
      return this.getGpraSupersessionAct(id as GpraSupersessionActRecord["supersessionActId"]);
    },

    async putDownstreamDeficiencyRecord(record) {
      if (deficienciesById.has(record.deficiencyRecordId)) {
        throw new Error(`Duplicate Downstream deficiency identity: ${record.deficiencyRecordId}`);
      }
      if (deficiencyByReview.has(record.reviewId)) {
        throw new Error(`Duplicate Downstream deficiency for Review: ${record.reviewId}`);
      }
      deficienciesById.set(record.deficiencyRecordId, structuredClone(record));
      deficiencyByReview.set(record.reviewId, record.deficiencyRecordId);
    },

    async getDownstreamDeficiencyRecord(deficiencyRecordId) {
      const record = deficienciesById.get(deficiencyRecordId);
      return record ? structuredClone(record) : null;
    },

    async getDownstreamDeficiencyRecordByReview(reviewId) {
      const id = deficiencyByReview.get(reviewId);
      if (!id) return null;
      return this.getDownstreamDeficiencyRecord(
        id as DownstreamDeficiencyRecord["deficiencyRecordId"],
      );
    },

    async putReworkAuthorization(authorization) {
      if (reworkAuthById.has(authorization.reworkAuthorizationId)) {
        throw new Error(
          `Duplicate Rework authorization identity: ${authorization.reworkAuthorizationId}`,
        );
      }
      if (reworkAuthByReview.has(authorization.reviewId)) {
        throw new Error(`Duplicate Rework authorization for Review: ${authorization.reviewId}`);
      }
      reworkAuthById.set(authorization.reworkAuthorizationId, structuredClone(authorization));
      reworkAuthByReview.set(authorization.reviewId, authorization.reworkAuthorizationId);
    },

    async getReworkAuthorization(reworkAuthorizationId) {
      const authorization = reworkAuthById.get(reworkAuthorizationId);
      return authorization ? structuredClone(authorization) : null;
    },

    async getReworkAuthorizationByReview(reviewId) {
      const id = reworkAuthByReview.get(reviewId);
      if (!id) return null;
      return this.getReworkAuthorization(id as ReworkAuthorizationRecord["reworkAuthorizationId"]);
    },

    async putReworkAuthorizationWithholding(withholding) {
      if (reworkWithholdingById.has(withholding.withholdingId)) {
        throw new Error(
          `Duplicate Rework authorization withholding identity: ${withholding.withholdingId}`,
        );
      }
      if (reworkWithholdingByReview.has(withholding.reviewId)) {
        throw new Error(
          `Duplicate Rework authorization withholding for Review: ${withholding.reviewId}`,
        );
      }
      reworkWithholdingById.set(withholding.withholdingId, structuredClone(withholding));
      reworkWithholdingByReview.set(withholding.reviewId, withholding.withholdingId);
    },

    async getReworkAuthorizationWithholding(withholdingId) {
      const withholding = reworkWithholdingById.get(withholdingId);
      return withholding ? structuredClone(withholding) : null;
    },

    async getReworkAuthorizationWithholdingByReview(reviewId) {
      const id = reworkWithholdingByReview.get(reviewId);
      if (!id) return null;
      return this.getReworkAuthorizationWithholding(
        id as ReworkAuthorizationWithholdingRecord["withholdingId"],
      );
    },

    async putReturnPosture(returnPosture) {
      if (returnPostureById.has(returnPosture.returnPostureId)) {
        throw new Error(`Duplicate Return posture identity: ${returnPosture.returnPostureId}`);
      }
      if (returnPostureByReview.has(returnPosture.reviewId)) {
        throw new Error(`Duplicate Return posture for Review: ${returnPosture.reviewId}`);
      }
      returnPostureById.set(returnPosture.returnPostureId, structuredClone(returnPosture));
      returnPostureByReview.set(returnPosture.reviewId, returnPosture.returnPostureId);
    },

    async getReturnPosture(returnPostureId) {
      const returnPosture = returnPostureById.get(returnPostureId);
      return returnPosture ? structuredClone(returnPosture) : null;
    },

    async getReturnPostureByReview(reviewId) {
      const id = returnPostureByReview.get(reviewId);
      if (!id) return null;
      return this.getReturnPosture(id as ReturnPostureRecord["returnPostureId"]);
    },

    async putResubmissionEligibility(eligibility) {
      if (resubmissionById.has(eligibility.eligibilityId)) {
        throw new Error(`Duplicate Resubmission eligibility identity: ${eligibility.eligibilityId}`);
      }
      if (resubmissionByPriorReview.has(eligibility.priorReviewId)) {
        throw new Error(
          `Duplicate Resubmission eligibility for prior Review: ${eligibility.priorReviewId}`,
        );
      }
      resubmissionById.set(eligibility.eligibilityId, structuredClone(eligibility));
      resubmissionByPriorReview.set(eligibility.priorReviewId, eligibility.eligibilityId);
    },

    async getResubmissionEligibility(eligibilityId) {
      const eligibility = resubmissionById.get(eligibilityId);
      return eligibility ? structuredClone(eligibility) : null;
    },

    async getResubmissionEligibilityByPriorReview(priorReviewId) {
      const id = resubmissionByPriorReview.get(priorReviewId);
      if (!id) return null;
      return this.getResubmissionEligibility(id as ResubmissionEligibilityRecord["eligibilityId"]);
    },

    async putDomain3BrainAdvisory(advisory) {
      if (brainAdvisoriesById.has(advisory.advisoryId)) {
        throw new Error(`Duplicate Domain 3 Brain advisory identity: ${advisory.advisoryId}`);
      }
      brainAdvisoriesById.set(advisory.advisoryId, structuredClone(advisory));
      if (advisory.reviewId) {
        const list = brainAdvisoriesByReview.get(advisory.reviewId) ?? [];
        list.push(advisory.advisoryId);
        brainAdvisoriesByReview.set(advisory.reviewId, list);
      }
    },

    async getDomain3BrainAdvisory(advisoryId) {
      const advisory = brainAdvisoriesById.get(advisoryId);
      return advisory ? structuredClone(advisory) : null;
    },

    async listDomain3BrainAdvisoriesByReview(reviewId) {
      const ids = brainAdvisoriesByReview.get(reviewId) ?? [];
      return ids
        .map((id) => brainAdvisoriesById.get(id))
        .filter((item): item is Domain3BrainAdvisoryRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffPreparation(record) {
      if (handoffPreparationsById.has(record.preparationId)) {
        throw new Error(
          `Duplicate Governed Handoff preparation identity: ${record.preparationId}`,
        );
      }
      handoffPreparationsById.set(record.preparationId, structuredClone(record));
      const list = handoffPreparationsByGpra.get(record.gpraId) ?? [];
      list.push(record.preparationId);
      handoffPreparationsByGpra.set(record.gpraId, list);
    },

    async getGovernedHandoffPreparation(preparationId) {
      const record = handoffPreparationsById.get(preparationId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffPreparationsByGpra(gpraId) {
      const ids = handoffPreparationsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffPreparationsById.get(id))
        .filter((item): item is GovernedHandoffPreparationRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffEntry(record) {
      if (handoffEntriesById.has(record.entryId)) {
        throw new Error(`Duplicate Governed Handoff entry identity: ${record.entryId}`);
      }
      handoffEntriesById.set(record.entryId, structuredClone(record));
      const byPrep = handoffEntriesByPreparation.get(record.preparationId) ?? [];
      byPrep.push(record.entryId);
      handoffEntriesByPreparation.set(record.preparationId, byPrep);
      const byGpra = handoffEntriesByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.entryId);
      handoffEntriesByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffEntry(entryId) {
      const record = handoffEntriesById.get(entryId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffEntriesByPreparation(preparationId) {
      const ids = handoffEntriesByPreparation.get(preparationId) ?? [];
      return ids
        .map((id) => handoffEntriesById.get(id))
        .filter((item): item is GovernedHandoffEntryRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffEntriesByGpra(gpraId) {
      const ids = handoffEntriesByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffEntriesById.get(id))
        .filter((item): item is GovernedHandoffEntryRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffEvidenceConsumption(record) {
      if (handoffEvidenceConsumptionsById.has(record.consumptionId)) {
        throw new Error(
          `Duplicate Governed Handoff evidence consumption identity: ${record.consumptionId}`,
        );
      }
      handoffEvidenceConsumptionsById.set(record.consumptionId, structuredClone(record));
      const byEntry = handoffEvidenceConsumptionsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.consumptionId);
      handoffEvidenceConsumptionsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffEvidenceConsumptionsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.consumptionId);
      handoffEvidenceConsumptionsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffEvidenceConsumption(consumptionId) {
      const record = handoffEvidenceConsumptionsById.get(consumptionId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffEvidenceConsumptionsByEntry(entryId) {
      const ids = handoffEvidenceConsumptionsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffEvidenceConsumptionsById.get(id))
        .filter((item): item is GovernedHandoffEvidenceConsumptionRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffEvidenceConsumptionsByGpra(gpraId) {
      const ids = handoffEvidenceConsumptionsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffEvidenceConsumptionsById.get(id))
        .filter((item): item is GovernedHandoffEvidenceConsumptionRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffPreservationAudit(record) {
      if (handoffPreservationAuditsById.has(record.preservationAuditId)) {
        throw new Error(
          `Duplicate Governed Handoff preservation audit identity: ${record.preservationAuditId}`,
        );
      }
      handoffPreservationAuditsById.set(record.preservationAuditId, structuredClone(record));
      const byEntry = handoffPreservationAuditsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.preservationAuditId);
      handoffPreservationAuditsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffPreservationAuditsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.preservationAuditId);
      handoffPreservationAuditsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffPreservationAudit(preservationAuditId) {
      const record = handoffPreservationAuditsById.get(preservationAuditId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffPreservationAuditsByEntry(entryId) {
      const ids = handoffPreservationAuditsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffPreservationAuditsById.get(id))
        .filter((item): item is GovernedHandoffPreservationAuditRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffPreservationAuditsByGpra(gpraId) {
      const ids = handoffPreservationAuditsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffPreservationAuditsById.get(id))
        .filter((item): item is GovernedHandoffPreservationAuditRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffAuthorizationAct(record) {
      if (handoffAuthorizationActsById.has(record.authorizationActId)) {
        throw new Error(
          `Duplicate Governed Handoff authorization act identity: ${record.authorizationActId}`,
        );
      }
      handoffAuthorizationActsById.set(record.authorizationActId, structuredClone(record));
      const byEntry = handoffAuthorizationActsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.authorizationActId);
      handoffAuthorizationActsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffAuthorizationActsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.authorizationActId);
      handoffAuthorizationActsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffAuthorizationAct(authorizationActId) {
      const record = handoffAuthorizationActsById.get(authorizationActId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffAuthorizationActsByEntry(entryId) {
      const ids = handoffAuthorizationActsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffAuthorizationActsById.get(id))
        .filter((item): item is GovernedHandoffAuthorizationActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffAuthorizationActsByGpra(gpraId) {
      const ids = handoffAuthorizationActsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffAuthorizationActsById.get(id))
        .filter((item): item is GovernedHandoffAuthorizationActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffConsumerBinding(record) {
      if (handoffConsumerBindingsById.has(record.bindingId)) {
        throw new Error(
          `Duplicate Governed Handoff consumer binding identity: ${record.bindingId}`,
        );
      }
      handoffConsumerBindingsById.set(record.bindingId, structuredClone(record));
      const byEntry = handoffConsumerBindingsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.bindingId);
      handoffConsumerBindingsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffConsumerBindingsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.bindingId);
      handoffConsumerBindingsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffConsumerBinding(bindingId) {
      const record = handoffConsumerBindingsById.get(bindingId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffConsumerBindingsByEntry(entryId) {
      const ids = handoffConsumerBindingsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffConsumerBindingsById.get(id))
        .filter((item): item is GovernedHandoffConsumerBindingRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffConsumerBindingsByGpra(gpraId) {
      const ids = handoffConsumerBindingsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffConsumerBindingsById.get(id))
        .filter((item): item is GovernedHandoffConsumerBindingRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffPostureDeclarationAct(record) {
      if (handoffPostureDeclarationsById.has(record.postureDeclarationActId)) {
        throw new Error(
          `Duplicate Governed Handoff posture declaration act identity: ${record.postureDeclarationActId}`,
        );
      }
      handoffPostureDeclarationsById.set(
        record.postureDeclarationActId,
        structuredClone(record),
      );
      const byBinding = handoffPostureDeclarationsByBinding.get(record.bindingId) ?? [];
      byBinding.push(record.postureDeclarationActId);
      handoffPostureDeclarationsByBinding.set(record.bindingId, byBinding);
      const byEntry = handoffPostureDeclarationsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.postureDeclarationActId);
      handoffPostureDeclarationsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffPostureDeclarationsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.postureDeclarationActId);
      handoffPostureDeclarationsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffPostureDeclarationAct(postureDeclarationActId) {
      const record = handoffPostureDeclarationsById.get(postureDeclarationActId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffPostureDeclarationActsByBinding(bindingId) {
      const ids = handoffPostureDeclarationsByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffPostureDeclarationsById.get(id))
        .filter((item): item is GovernedHandoffPostureDeclarationActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffPostureDeclarationActsByEntry(entryId) {
      const ids = handoffPostureDeclarationsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffPostureDeclarationsById.get(id))
        .filter((item): item is GovernedHandoffPostureDeclarationActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffPostureDeclarationActsByGpra(gpraId) {
      const ids = handoffPostureDeclarationsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffPostureDeclarationsById.get(id))
        .filter((item): item is GovernedHandoffPostureDeclarationActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffCompletionAct(record) {
      if (handoffCompletionActsById.has(record.completionActId)) {
        throw new Error(
          `Duplicate Governed Handoff completion act identity: ${record.completionActId}`,
        );
      }
      handoffCompletionActsById.set(record.completionActId, structuredClone(record));
      const byBinding = handoffCompletionActsByBinding.get(record.bindingId) ?? [];
      byBinding.push(record.completionActId);
      handoffCompletionActsByBinding.set(record.bindingId, byBinding);
      const byEntry = handoffCompletionActsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.completionActId);
      handoffCompletionActsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffCompletionActsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.completionActId);
      handoffCompletionActsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffCompletionAct(completionActId) {
      const record = handoffCompletionActsById.get(completionActId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffCompletionActsByBinding(bindingId) {
      const ids = handoffCompletionActsByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffCompletionActsById.get(id))
        .filter((item): item is GovernedHandoffCompletionActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffCompletionActsByEntry(entryId) {
      const ids = handoffCompletionActsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffCompletionActsById.get(id))
        .filter((item): item is GovernedHandoffCompletionActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffCompletionActsByGpra(gpraId) {
      const ids = handoffCompletionActsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffCompletionActsById.get(id))
        .filter((item): item is GovernedHandoffCompletionActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffSuspensionAct(record) {
      if (handoffSuspensionActsById.has(record.suspensionActId)) {
        throw new Error(
          `Duplicate Governed Handoff suspension act identity: ${record.suspensionActId}`,
        );
      }
      handoffSuspensionActsById.set(record.suspensionActId, structuredClone(record));
      const byBinding = handoffSuspensionActsByBinding.get(record.bindingId) ?? [];
      byBinding.push(record.suspensionActId);
      handoffSuspensionActsByBinding.set(record.bindingId, byBinding);
      const byEntry = handoffSuspensionActsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.suspensionActId);
      handoffSuspensionActsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffSuspensionActsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.suspensionActId);
      handoffSuspensionActsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffSuspensionAct(suspensionActId) {
      const record = handoffSuspensionActsById.get(suspensionActId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffSuspensionActsByBinding(bindingId) {
      const ids = handoffSuspensionActsByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffSuspensionActsById.get(id))
        .filter((item): item is GovernedHandoffSuspensionActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffSuspensionActsByEntry(entryId) {
      const ids = handoffSuspensionActsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffSuspensionActsById.get(id))
        .filter((item): item is GovernedHandoffSuspensionActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffSuspensionActsByGpra(gpraId) {
      const ids = handoffSuspensionActsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffSuspensionActsById.get(id))
        .filter((item): item is GovernedHandoffSuspensionActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffWithdrawalAct(record) {
      if (handoffWithdrawalActsById.has(record.withdrawalActId)) {
        throw new Error(
          `Duplicate Governed Handoff withdrawal act identity: ${record.withdrawalActId}`,
        );
      }
      handoffWithdrawalActsById.set(record.withdrawalActId, structuredClone(record));
      const byBinding = handoffWithdrawalActsByBinding.get(record.bindingId) ?? [];
      byBinding.push(record.withdrawalActId);
      handoffWithdrawalActsByBinding.set(record.bindingId, byBinding);
      const byEntry = handoffWithdrawalActsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.withdrawalActId);
      handoffWithdrawalActsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffWithdrawalActsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.withdrawalActId);
      handoffWithdrawalActsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffWithdrawalAct(withdrawalActId) {
      const record = handoffWithdrawalActsById.get(withdrawalActId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffWithdrawalActsByBinding(bindingId) {
      const ids = handoffWithdrawalActsByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffWithdrawalActsById.get(id))
        .filter((item): item is GovernedHandoffWithdrawalActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffWithdrawalActsByEntry(entryId) {
      const ids = handoffWithdrawalActsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffWithdrawalActsById.get(id))
        .filter((item): item is GovernedHandoffWithdrawalActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffWithdrawalActsByGpra(gpraId) {
      const ids = handoffWithdrawalActsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffWithdrawalActsById.get(id))
        .filter((item): item is GovernedHandoffWithdrawalActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffRecallAct(record) {
      if (handoffRecallActsById.has(record.recallActId)) {
        throw new Error(
          `Duplicate Governed Handoff recall act identity: ${record.recallActId}`,
        );
      }
      handoffRecallActsById.set(record.recallActId, structuredClone(record));
      const byBinding = handoffRecallActsByBinding.get(record.bindingId) ?? [];
      byBinding.push(record.recallActId);
      handoffRecallActsByBinding.set(record.bindingId, byBinding);
      const byEntry = handoffRecallActsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.recallActId);
      handoffRecallActsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffRecallActsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.recallActId);
      handoffRecallActsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffRecallAct(recallActId) {
      const record = handoffRecallActsById.get(recallActId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffRecallActsByBinding(bindingId) {
      const ids = handoffRecallActsByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffRecallActsById.get(id))
        .filter((item): item is GovernedHandoffRecallActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffRecallActsByEntry(entryId) {
      const ids = handoffRecallActsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffRecallActsById.get(id))
        .filter((item): item is GovernedHandoffRecallActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffRecallActsByGpra(gpraId) {
      const ids = handoffRecallActsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffRecallActsById.get(id))
        .filter((item): item is GovernedHandoffRecallActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffResumptionAct(record) {
      if (handoffResumptionActsById.has(record.resumptionActId)) {
        throw new Error(
          `Duplicate Governed Handoff resumption act identity: ${record.resumptionActId}`,
        );
      }
      handoffResumptionActsById.set(record.resumptionActId, structuredClone(record));
      const byBinding = handoffResumptionActsByBinding.get(record.bindingId) ?? [];
      byBinding.push(record.resumptionActId);
      handoffResumptionActsByBinding.set(record.bindingId, byBinding);
      const byEntry = handoffResumptionActsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.resumptionActId);
      handoffResumptionActsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffResumptionActsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.resumptionActId);
      handoffResumptionActsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffResumptionAct(resumptionActId) {
      const record = handoffResumptionActsById.get(resumptionActId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffResumptionActsByBinding(bindingId) {
      const ids = handoffResumptionActsByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffResumptionActsById.get(id))
        .filter((item): item is GovernedHandoffResumptionActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffResumptionActsByEntry(entryId) {
      const ids = handoffResumptionActsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffResumptionActsById.get(id))
        .filter((item): item is GovernedHandoffResumptionActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffResumptionActsByGpra(gpraId) {
      const ids = handoffResumptionActsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffResumptionActsById.get(id))
        .filter((item): item is GovernedHandoffResumptionActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffReentryAct(record) {
      if (handoffReentryActsById.has(record.reentryActId)) {
        throw new Error(
          `Duplicate Governed Handoff re-entry act identity: ${record.reentryActId}`,
        );
      }
      handoffReentryActsById.set(record.reentryActId, structuredClone(record));
      const byBinding = handoffReentryActsByBinding.get(record.bindingId) ?? [];
      byBinding.push(record.reentryActId);
      handoffReentryActsByBinding.set(record.bindingId, byBinding);
      const byEntry = handoffReentryActsByEntry.get(record.entryId) ?? [];
      byEntry.push(record.reentryActId);
      handoffReentryActsByEntry.set(record.entryId, byEntry);
      const byGpra = handoffReentryActsByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.reentryActId);
      handoffReentryActsByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffReentryAct(reentryActId) {
      const record = handoffReentryActsById.get(reentryActId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffReentryActsByBinding(bindingId) {
      const ids = handoffReentryActsByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffReentryActsById.get(id))
        .filter((item): item is GovernedHandoffReentryActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffReentryActsByEntry(entryId) {
      const ids = handoffReentryActsByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffReentryActsById.get(id))
        .filter((item): item is GovernedHandoffReentryActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffReentryActsByGpra(gpraId) {
      const ids = handoffReentryActsByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffReentryActsById.get(id))
        .filter((item): item is GovernedHandoffReentryActRecord => !!item)
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffDownstreamExitBoundaryAttribution(record) {
      if (handoffDownstreamExitBoundaryById.has(record.exitBoundaryAttributionId)) {
        throw new Error(
          `Duplicate Governed Handoff downstream exit boundary identity: ${record.exitBoundaryAttributionId}`,
        );
      }
      handoffDownstreamExitBoundaryById.set(
        record.exitBoundaryAttributionId,
        structuredClone(record),
      );
      const byBinding = handoffDownstreamExitBoundaryByBinding.get(record.bindingId) ?? [];
      byBinding.push(record.exitBoundaryAttributionId);
      handoffDownstreamExitBoundaryByBinding.set(record.bindingId, byBinding);
      const byEntry = handoffDownstreamExitBoundaryByEntry.get(record.entryId) ?? [];
      byEntry.push(record.exitBoundaryAttributionId);
      handoffDownstreamExitBoundaryByEntry.set(record.entryId, byEntry);
      const byGpra = handoffDownstreamExitBoundaryByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.exitBoundaryAttributionId);
      handoffDownstreamExitBoundaryByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffDownstreamExitBoundaryAttribution(exitBoundaryAttributionId) {
      const record = handoffDownstreamExitBoundaryById.get(exitBoundaryAttributionId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffDownstreamExitBoundaryAttributionsByBinding(bindingId) {
      const ids = handoffDownstreamExitBoundaryByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffDownstreamExitBoundaryById.get(id))
        .filter(
          (item): item is GovernedHandoffDownstreamExitBoundaryAttributionRecord => !!item,
        )
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffDownstreamExitBoundaryAttributionsByEntry(entryId) {
      const ids = handoffDownstreamExitBoundaryByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffDownstreamExitBoundaryById.get(id))
        .filter(
          (item): item is GovernedHandoffDownstreamExitBoundaryAttributionRecord => !!item,
        )
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffDownstreamExitBoundaryAttributionsByGpra(gpraId) {
      const ids = handoffDownstreamExitBoundaryByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffDownstreamExitBoundaryById.get(id))
        .filter(
          (item): item is GovernedHandoffDownstreamExitBoundaryAttributionRecord => !!item,
        )
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffDownstreamExitCompletenessSatisfaction(record) {
      if (handoffDownstreamExitCompletenessById.has(record.exitCompletenessSatisfactionId)) {
        throw new Error(
          `Duplicate Governed Handoff downstream exit completeness identity: ${record.exitCompletenessSatisfactionId}`,
        );
      }
      handoffDownstreamExitCompletenessById.set(
        record.exitCompletenessSatisfactionId,
        structuredClone(record),
      );
      const byBinding = handoffDownstreamExitCompletenessByBinding.get(record.bindingId) ?? [];
      byBinding.push(record.exitCompletenessSatisfactionId);
      handoffDownstreamExitCompletenessByBinding.set(record.bindingId, byBinding);
      const byEntry = handoffDownstreamExitCompletenessByEntry.get(record.entryId) ?? [];
      byEntry.push(record.exitCompletenessSatisfactionId);
      handoffDownstreamExitCompletenessByEntry.set(record.entryId, byEntry);
      const byGpra = handoffDownstreamExitCompletenessByGpra.get(record.gpraId) ?? [];
      byGpra.push(record.exitCompletenessSatisfactionId);
      handoffDownstreamExitCompletenessByGpra.set(record.gpraId, byGpra);
    },

    async getGovernedHandoffDownstreamExitCompletenessSatisfaction(
      exitCompletenessSatisfactionId,
    ) {
      const record = handoffDownstreamExitCompletenessById.get(
        exitCompletenessSatisfactionId,
      );
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffDownstreamExitCompletenessSatisfactionsByBinding(bindingId) {
      const ids = handoffDownstreamExitCompletenessByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffDownstreamExitCompletenessById.get(id))
        .filter(
          (item): item is GovernedHandoffDownstreamExitCompletenessSatisfactionRecord =>
            !!item,
        )
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffDownstreamExitCompletenessSatisfactionsByEntry(entryId) {
      const ids = handoffDownstreamExitCompletenessByEntry.get(entryId) ?? [];
      return ids
        .map((id) => handoffDownstreamExitCompletenessById.get(id))
        .filter(
          (item): item is GovernedHandoffDownstreamExitCompletenessSatisfactionRecord =>
            !!item,
        )
        .map((item) => structuredClone(item));
    },

    async listGovernedHandoffDownstreamExitCompletenessSatisfactionsByGpra(gpraId) {
      const ids = handoffDownstreamExitCompletenessByGpra.get(gpraId) ?? [];
      return ids
        .map((id) => handoffDownstreamExitCompletenessById.get(id))
        .filter(
          (item): item is GovernedHandoffDownstreamExitCompletenessSatisfactionRecord =>
            !!item,
        )
        .map((item) => structuredClone(item));
    },

    async putGovernedHandoffDownstreamExitCompletenessAttempt(record) {
      if (handoffDownstreamExitCompletenessAttemptById.has(record.attemptId)) {
        throw new Error(
          `Duplicate Governed Handoff downstream exit completeness attempt identity: ${record.attemptId}`,
        );
      }
      handoffDownstreamExitCompletenessAttemptById.set(
        record.attemptId,
        structuredClone(record),
      );
      if (record.bindingId) {
        const byBinding =
          handoffDownstreamExitCompletenessAttemptByBinding.get(record.bindingId) ?? [];
        byBinding.push(record.attemptId);
        handoffDownstreamExitCompletenessAttemptByBinding.set(record.bindingId, byBinding);
      }
    },

    async getGovernedHandoffDownstreamExitCompletenessAttempt(attemptId) {
      const record = handoffDownstreamExitCompletenessAttemptById.get(attemptId);
      return record ? structuredClone(record) : null;
    },

    async listGovernedHandoffDownstreamExitCompletenessAttemptsByBinding(bindingId) {
      const ids = handoffDownstreamExitCompletenessAttemptByBinding.get(bindingId) ?? [];
      return ids
        .map((id) => handoffDownstreamExitCompletenessAttemptById.get(id))
        .filter(
          (item): item is GovernedHandoffDownstreamExitCompletenessAttemptRecord => !!item,
        )
        .map((item) => structuredClone(item));
    },
  };
}
