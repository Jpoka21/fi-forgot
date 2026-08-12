/**
 * In-memory Domain 3 storage adapter — G2–G7.
 */

import type {
  ApprovalActRecord,
  ApprovalWithholdingRecord,
  DesignTimeFeasibilityEvaluationRecord,
  DownstreamDeficiencyRecord,
  GpraGrantRecord,
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
  const gpraByRvaObligation = new Map<string, string>();
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
      if (gpraByRvaObligation.has(key)) {
        throw new Error(`Duplicate GPRA for RVA under Production Obligation: ${key}`);
      }
      gprasById.set(gpra.gpraId, structuredClone(gpra));
      gpraByReview.set(gpra.reviewId, gpra.gpraId);
      gpraByRvaObligation.set(key, gpra.gpraId);
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

    async getGpraGrantByRvaObligation(rvaId, obligationId) {
      const gpraId = gpraByRvaObligation.get(rvaObligationKey(rvaId, obligationId));
      if (!gpraId) return null;
      return this.getGpraGrant(gpraId as GpraGrantRecord["gpraId"]);
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
  };
}
