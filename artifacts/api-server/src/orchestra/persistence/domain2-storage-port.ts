/**
 * Low-level storage port for Domain 2 constitutional aggregates.
 */

import type {
  ComplianceBoundaryChangeEvent,
  ComplianceBoundaryChangeEventId,
  ExplorationPostureRecord,
  ExplorationPostureRecordId,
  ExternalReworkTriggerRecord,
  ExternalReworkTriggerId,
  LicensedAcquiredRightsPosture,
  LicensedAcquiredIntakeId,
  RealizationCommitment,
  RealizationCommitmentId,
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
  ReviewEntryReadiness,
  ReviewEntryReadinessId,
  SharedSourceLinkageRecord,
  SharedSourceLinkageId,
} from "../domain2-types.js";
import type { ProductionObligationId, ProductionProgramId } from "../types.js";

export interface Domain2StoragePort {
  putExplorationPosture(record: ExplorationPostureRecord): Promise<void>;
  getExplorationPosture(
    recordId: ExplorationPostureRecordId,
  ): Promise<ExplorationPostureRecord | null>;
  getExplorationPostureByScope(
    programId: ProductionProgramId,
    obligationId: ProductionObligationId,
  ): Promise<ExplorationPostureRecord | null>;

  putRealizationCommitment(commitment: RealizationCommitment): Promise<void>;
  getRealizationCommitment(
    commitmentId: RealizationCommitmentId,
  ): Promise<RealizationCommitment | null>;

  putRva(rva: RealizedVisualArtifact, options?: { allowUpdate?: boolean }): Promise<void>;
  getRva(rvaId: RealizedVisualArtifactId): Promise<RealizedVisualArtifact | null>;
  deleteRva(rvaId: RealizedVisualArtifactId): Promise<void>;

  putReviewEntryReadiness(readiness: ReviewEntryReadiness): Promise<void>;
  getReviewEntryReadiness(
    readinessId: ReviewEntryReadinessId,
  ): Promise<ReviewEntryReadiness | null>;
  getReviewEntryReadinessByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<ReviewEntryReadiness | null>;

  putSharedSourceLinkage(record: SharedSourceLinkageRecord): Promise<void>;
  getSharedSourceLinkage(linkageId: SharedSourceLinkageId): Promise<SharedSourceLinkageRecord | null>;
  listSharedSourceLinkagesByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<readonly SharedSourceLinkageRecord[]>;

  putComplianceBoundaryChangeEvent(event: ComplianceBoundaryChangeEvent): Promise<void>;
  getComplianceBoundaryChangeEvent(
    eventId: ComplianceBoundaryChangeEventId,
  ): Promise<ComplianceBoundaryChangeEvent | null>;
  listComplianceBoundaryChangeEventsByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<readonly ComplianceBoundaryChangeEvent[]>;

  putLicensedAcquiredIntake(record: LicensedAcquiredRightsPosture): Promise<void>;
  getLicensedAcquiredIntakeByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<LicensedAcquiredRightsPosture | null>;

  putExternalReworkTrigger(record: ExternalReworkTriggerRecord): Promise<void>;
  getExternalReworkTrigger(
    triggerId: ExternalReworkTriggerId,
  ): Promise<ExternalReworkTriggerRecord | null>;
  getExternalReworkTriggerByRva(
    rvaId: RealizedVisualArtifactId,
  ): Promise<ExternalReworkTriggerRecord | null>;
}

export interface InMemoryDomain2StorageOptions {
  /** When set, putRva throws for this RVA id (test fault injection). */
  failPutRvaForId?: RealizedVisualArtifactId;
}
