/**
 * In-memory Domain 2 storage adapter.
 */

import type {
  ComplianceBoundaryChangeEvent,
  ExplorationPostureRecord,
  ExplorationPostureRecordId,
  ExternalReworkTriggerRecord,
  LicensedAcquiredRightsPosture,
  RealizationCommitment,
  RealizationCommitmentId,
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
  ReviewEntryReadiness,
  ReviewEntryReadinessId,
  SharedSourceLinkageRecord,
} from "../domain2-types.js";
import type { ProductionObligationId, ProductionProgramId } from "../types.js";
import type {
  Domain2StoragePort,
  InMemoryDomain2StorageOptions,
} from "./domain2-storage-port.js";

export function createInMemoryDomain2Storage(
  options: InMemoryDomain2StorageOptions = {},
): Domain2StoragePort {
  const explorationPostures = new Map<string, ExplorationPostureRecord>();
  const explorationByScope = new Map<string, ExplorationPostureRecordId>();
  const commitments = new Map<string, RealizationCommitment>();
  const rvas = new Map<string, RealizedVisualArtifact>();
  const reviewReadiness = new Map<string, ReviewEntryReadiness>();
  const reviewByRva = new Map<string, ReviewEntryReadinessId>();
  const sharedSourceLinkages = new Map<string, SharedSourceLinkageRecord>();
  const linkagesByRva = new Map<string, Set<string>>();
  const cbChangeEvents = new Map<string, ComplianceBoundaryChangeEvent>();
  const cbEventsByRva = new Map<string, Set<string>>();
  const licensedIntakeByRva = new Map<string, LicensedAcquiredRightsPosture>();
  const reworkTriggers = new Map<string, ExternalReworkTriggerRecord>();
  const reworkByRva = new Map<string, string>();

  function scopeKey(programId: ProductionProgramId, obligationId: ProductionObligationId): string {
    return `${programId}::${obligationId}`;
  }

  function indexRvaLink(linkage: SharedSourceLinkageRecord): void {
    for (const rvaId of [linkage.sourceRvaId, linkage.consumerRvaId]) {
      const set = linkagesByRva.get(rvaId) ?? new Set();
      set.add(linkage.linkageId);
      linkagesByRva.set(rvaId, set);
    }
  }

  function indexCbEvent(event: ComplianceBoundaryChangeEvent): void {
    const set = cbEventsByRva.get(event.rvaId) ?? new Set();
    set.add(event.eventId);
    cbEventsByRva.set(event.rvaId, set);
  }

  return {
    async putExplorationPosture(record) {
      explorationPostures.set(record.recordId, structuredClone(record));
      explorationByScope.set(scopeKey(record.programId, record.obligationId), record.recordId);
    },

    async getExplorationPosture(recordId) {
      const record = explorationPostures.get(recordId);
      return record ? structuredClone(record) : null;
    },

    async getExplorationPostureByScope(programId, obligationId) {
      const recordId = explorationByScope.get(scopeKey(programId, obligationId));
      if (!recordId) return null;
      return this.getExplorationPosture(recordId);
    },

    async putRealizationCommitment(commitment) {
      commitments.set(commitment.commitmentId, structuredClone(commitment));
    },

    async getRealizationCommitment(commitmentId) {
      const commitment = commitments.get(commitmentId);
      return commitment ? structuredClone(commitment) : null;
    },

    async putRva(rva, putOptions) {
      if (
        options.failPutRvaForId === rva.id &&
        putOptions?.allowUpdate === true
      ) {
        throw new Error(`Injected putRva failure for ${rva.id}`);
      }
      const exists = rvas.has(rva.id);
      if (exists && !putOptions?.allowUpdate) {
        throw new Error(`RVA identity already exists: ${rva.id}`);
      }
      rvas.set(rva.id, structuredClone(rva));
    },

    async getRva(rvaId) {
      const rva = rvas.get(rvaId);
      return rva ? structuredClone(rva) : null;
    },

    async deleteRva(rvaId) {
      rvas.delete(rvaId);
    },

    async putReviewEntryReadiness(readiness) {
      reviewReadiness.set(readiness.readinessId, structuredClone(readiness));
      reviewByRva.set(readiness.rvaId, readiness.readinessId);
    },

    async getReviewEntryReadiness(readinessId) {
      const record = reviewReadiness.get(readinessId);
      return record ? structuredClone(record) : null;
    },

    async getReviewEntryReadinessByRva(rvaId) {
      const readinessId = reviewByRva.get(rvaId);
      if (!readinessId) return null;
      return this.getReviewEntryReadiness(readinessId);
    },

    async putSharedSourceLinkage(record) {
      sharedSourceLinkages.set(record.linkageId, structuredClone(record));
      indexRvaLink(record);
    },

    async getSharedSourceLinkage(linkageId) {
      const record = sharedSourceLinkages.get(linkageId);
      return record ? structuredClone(record) : null;
    },

    async listSharedSourceLinkagesByRva(rvaId) {
      const ids = linkagesByRva.get(rvaId);
      if (!ids) return Object.freeze([]);
      const records = [...ids]
        .map((id) => sharedSourceLinkages.get(id))
        .filter((r): r is SharedSourceLinkageRecord => !!r)
        .map((r) => structuredClone(r));
      return Object.freeze(records);
    },

    async putComplianceBoundaryChangeEvent(event) {
      cbChangeEvents.set(event.eventId, structuredClone(event));
      indexCbEvent(event);
    },

    async getComplianceBoundaryChangeEvent(eventId) {
      const event = cbChangeEvents.get(eventId);
      return event ? structuredClone(event) : null;
    },

    async listComplianceBoundaryChangeEventsByRva(rvaId) {
      const ids = cbEventsByRva.get(rvaId);
      if (!ids) return Object.freeze([]);
      const records = [...ids]
        .map((id) => cbChangeEvents.get(id))
        .filter((e): e is ComplianceBoundaryChangeEvent => !!e)
        .map((e) => structuredClone(e));
      return Object.freeze(records);
    },

    async putLicensedAcquiredIntake(record) {
      licensedIntakeByRva.set(record.rvaId, structuredClone(record));
    },

    async getLicensedAcquiredIntakeByRva(rvaId) {
      const record = licensedIntakeByRva.get(rvaId);
      return record ? structuredClone(record) : null;
    },

    async putExternalReworkTrigger(record) {
      reworkTriggers.set(record.triggerId, structuredClone(record));
      reworkByRva.set(record.rvaId, record.triggerId);
    },

    async getExternalReworkTrigger(triggerId) {
      const record = reworkTriggers.get(triggerId);
      return record ? structuredClone(record) : null;
    },

    async getExternalReworkTriggerByRva(rvaId) {
      const triggerId = reworkByRva.get(rvaId);
      if (!triggerId) return null;
      return this.getExternalReworkTrigger(triggerId as import("../domain2-types.js").ExternalReworkTriggerId);
    },
  };
}
