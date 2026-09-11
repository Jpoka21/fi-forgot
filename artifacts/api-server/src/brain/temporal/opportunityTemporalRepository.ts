import type { OpportunityTimingChange } from "./opportunityTemporalTypes";
import type { RelationshipOpportunity } from "../product/relationshipOpportunityTypes";
import { createHash } from "node:crypto";

export interface RetainedOpportunityRecord {
  opportunity: RelationshipOpportunity;
  history: OpportunityTimingChange[];
}

/**
 * Deployment-neutral persistence seam. Implementations must insert immutable rows;
 * update/delete semantics are deliberately absent.
 */
export interface OpportunityTemporalHistoryRepository {
  loadHistory(input: { userId: string; opportunityId: string }): Promise<OpportunityTimingChange[]>;
  listRetained(input: { userId: string; recipientIds: string[] }): Promise<RetainedOpportunityRecord[]>;
  appendChange(input: {
    userId: string;
    opportunityId: string;
    change: OpportunityTimingChange;
    evidence: unknown;
    opportunity: RelationshipOpportunity;
  }): Promise<void>;
}

async function loadDb() {
  const [{ db }, { opportunityTemporalHistoryTable }] = await Promise.all([
    import("@workspace/db"),
    import("@workspace/db/schema"),
  ]);
  return { db, opportunityTemporalHistoryTable };
}

export function createPgOpportunityTemporalHistoryRepository(database: typeof loadDb = loadDb): OpportunityTemporalHistoryRepository {
  return {
    async listRetained({ userId, recipientIds }) {
      if (recipientIds.length === 0) return [];
      const { and, asc, eq, inArray } = await import("drizzle-orm");
      const { db, opportunityTemporalHistoryTable } = await database();
      const rows = await db.select().from(opportunityTemporalHistoryTable).where(and(
        eq(opportunityTemporalHistoryTable.userId, userId),
        inArray(opportunityTemporalHistoryTable.recipientId, recipientIds),
      )).orderBy(asc(opportunityTemporalHistoryTable.evaluatedAt), asc(opportunityTemporalHistoryTable.createdAt));
      const grouped = new Map<string, RetainedOpportunityRecord>();
      for (const row of rows) {
        const stored = row.evidence as { family?: OpportunityTimingChange["family"]; snapshot?: OpportunityTimingChange["evidence"]; opportunity?: RelationshipOpportunity };
        if (!stored.opportunity) continue;
        const change: OpportunityTimingChange = { changeId: row.changeKey, evaluatedAt: row.evaluatedAt.toISOString(), state: row.state as OpportunityTimingChange["state"], occurrenceCycleId: row.occurrenceCycleId, effectiveDate: row.effectiveDate, reason: row.reason, family: stored.family ?? "unsupported", evidence: stored.snapshot! };
        const current = grouped.get(row.opportunityId) ?? { opportunity: stored.opportunity, history: [] };
        current.opportunity = stored.opportunity;
        current.history.push(change);
        grouped.set(row.opportunityId, current);
      }
      return [...grouped.values()];
    },
    async loadHistory({ userId, opportunityId }) {
      const { and, asc, eq } = await import("drizzle-orm");
      const { db, opportunityTemporalHistoryTable } = await database();
      const rows = await db
        .select({
          changeId: opportunityTemporalHistoryTable.changeKey,
          evaluatedAt: opportunityTemporalHistoryTable.evaluatedAt,
          state: opportunityTemporalHistoryTable.state,
          occurrenceCycleId: opportunityTemporalHistoryTable.occurrenceCycleId,
          effectiveDate: opportunityTemporalHistoryTable.effectiveDate,
          reason: opportunityTemporalHistoryTable.reason,
          evidence: opportunityTemporalHistoryTable.evidence,
        })
        .from(opportunityTemporalHistoryTable)
        .where(and(
          eq(opportunityTemporalHistoryTable.userId, userId),
          eq(opportunityTemporalHistoryTable.opportunityId, opportunityId),
        ))
        .orderBy(asc(opportunityTemporalHistoryTable.evaluatedAt), asc(opportunityTemporalHistoryTable.createdAt));
      return rows.map((row) => ({
        ...row,
        evaluatedAt: row.evaluatedAt.toISOString(),
        state: row.state as OpportunityTimingChange["state"],
        family: (row.evidence as { family?: OpportunityTimingChange["family"] }).family ?? "unsupported",
        evidence: ((row.evidence as { snapshot?: OpportunityTimingChange["evidence"] }).snapshot ?? row.evidence) as OpportunityTimingChange["evidence"],
      }));
    },
    async appendChange({ userId, opportunityId, change, evidence, opportunity }) {
      const { db, opportunityTemporalHistoryTable } = await database();
      const temporalEvidence = evidence as {
        source: string;
        sourceId: string | null;
        sourceVersion: string | null;
      };
      await db.insert(opportunityTemporalHistoryTable).values({
        id: createHash("sha256").update(JSON.stringify([userId, opportunityId, change.changeId])).digest("hex"),
        changeKey: change.changeId,
        userId,
        opportunityId,
        recipientId: opportunity.recipient.id,
        source: temporalEvidence.source,
        sourceId: temporalEvidence.sourceId,
        sourceVersion: temporalEvidence.sourceVersion,
        occurrenceCycleId: change.occurrenceCycleId,
        state: change.state,
        effectiveDate: change.effectiveDate,
        reason: change.reason,
        evidence: { family: change.family, snapshot: evidence, opportunity: { ...opportunity, timing: { ...opportunity.timing, temporal: opportunity.timing.temporal ? { ...opportunity.timing.temporal, history: [] } : undefined } } },
        evaluatedAt: new Date(change.evaluatedAt),
      }).onConflictDoNothing({ target: opportunityTemporalHistoryTable.id });
    },
  };
}
