/**
 * In-memory Domain 2 storage adapter.
 */

import type {
  ExplorationPostureRecord,
  ExplorationPostureRecordId,
  RealizationCommitment,
  RealizationCommitmentId,
  RealizedVisualArtifact,
  RealizedVisualArtifactId,
  ReviewEntryReadiness,
  ReviewEntryReadinessId,
} from "../domain2-types.js";
import type { ProductionObligationId, ProductionProgramId } from "../types.js";
import type { Domain2StoragePort } from "./domain2-storage-port.js";

export function createInMemoryDomain2Storage(): Domain2StoragePort {
  const explorationPostures = new Map<string, ExplorationPostureRecord>();
  const explorationByScope = new Map<string, ExplorationPostureRecordId>();
  const commitments = new Map<string, RealizationCommitment>();
  const rvas = new Map<string, RealizedVisualArtifact>();
  const reviewReadiness = new Map<string, ReviewEntryReadiness>();
  const reviewByRva = new Map<string, ReviewEntryReadinessId>();

  function scopeKey(programId: ProductionProgramId, obligationId: ProductionObligationId): string {
    return `${programId}::${obligationId}`;
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

    async putRva(rva, options) {
      const exists = rvas.has(rva.id);
      if (exists && !options?.allowUpdate) {
        throw new Error(`RVA identity already exists: ${rva.id}`);
      }
      rvas.set(rva.id, structuredClone(rva));
    },

    async getRva(rvaId) {
      const rva = rvas.get(rvaId);
      return rva ? structuredClone(rva) : null;
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
  };
}
