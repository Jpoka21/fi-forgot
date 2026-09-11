import { createHash } from "node:crypto";
import type { OpportunityFeedbackEvent, OpportunityFeedbackTarget } from "./opportunityFeedbackTypes";

export class OpportunityFeedbackConflictError extends Error {}

export interface OpportunityFeedbackRepository {
  list(input: { ownerId: string; recipientIds: string[] }): Promise<OpportunityFeedbackEvent[]>;
  findReceipt?(input: { ownerId: string; idempotencyKey: string; requestFingerprint: string }): Promise<OpportunityFeedbackEvent | null>;
  append(input: { event: OpportunityFeedbackEvent; expectedVersion: number; requestFingerprint: string }): Promise<OpportunityFeedbackEvent>;
}

async function loadDb() {
  const [{ db }, { opportunityFeedbackTable, opportunityFeedbackReceiptTable }] = await Promise.all([import("@workspace/db"), import("@workspace/db/schema")]);
  return { db, opportunityFeedbackTable, opportunityFeedbackReceiptTable };
}

const fromRow = (row: any): OpportunityFeedbackEvent => ({
  id: row.id, lineageId: row.lineageId, version: row.version, action: row.action, type: row.feedbackType,
  scope: row.scope, ownerId: row.ownerId, recipientId: row.recipientId, opportunityId: row.opportunityId,
  occurrenceCycleId: row.occurrenceCycleId, relationshipId: row.relationshipId, family: row.family,
  notBefore: row.notBefore, timingProvenance: row.timingProvenance, provenance: "explicit_owner_feedback",
  receivedAt: row.receivedAt.toISOString(), supersedesId: row.supersedesId, withdrawnEventId: row.withdrawnEventId,
  idempotencyKey: row.idempotencyKey, active: row.active,
});

export function feedbackLineageId(target: OpportunityFeedbackTarget, scope: "occurrence" | "recipient_family") {
  const scopeKey = scope === "recipient_family" ? [target.family] : [target.opportunityId, target.occurrenceCycleId];
  return createHash("sha256").update(JSON.stringify([target.ownerId, target.recipientId, scope, scopeKey])).digest("hex");
}

export function createPgOpportunityFeedbackRepository(database: typeof loadDb = loadDb): OpportunityFeedbackRepository {
  return {
    async findReceipt({ownerId, idempotencyKey, requestFingerprint}) {
      const {and, eq} = await import("drizzle-orm");
      const {db, opportunityFeedbackReceiptTable} = await database();
      const [receipt] = await db.select().from(opportunityFeedbackReceiptTable).where(and(eq(opportunityFeedbackReceiptTable.ownerId, ownerId), eq(opportunityFeedbackReceiptTable.idempotencyKey, idempotencyKey))).limit(1);
      if (!receipt) return null;
      if (receipt.requestFingerprint !== requestFingerprint) throw new OpportunityFeedbackConflictError("Idempotency key was already used for a different request");
      return receipt.response as OpportunityFeedbackEvent;
    },
    async list({ ownerId, recipientIds }) {
      if (!recipientIds.length) return [];
      const { and, asc, eq, inArray } = await import("drizzle-orm");
      const { db, opportunityFeedbackTable } = await database();
      return (await db.select().from(opportunityFeedbackTable).where(and(eq(opportunityFeedbackTable.ownerId, ownerId), inArray(opportunityFeedbackTable.recipientId, recipientIds))).orderBy(asc(opportunityFeedbackTable.receivedAt), asc(opportunityFeedbackTable.version))).map(fromRow);
    },
    async append({ event, expectedVersion, requestFingerprint }) {
      const { and, desc, eq } = await import("drizzle-orm");
      const { db, opportunityFeedbackTable, opportunityFeedbackReceiptTable } = await database();
      return db.transaction(async (tx: any) => {
        const retry = await tx.select().from(opportunityFeedbackReceiptTable).where(and(eq(opportunityFeedbackReceiptTable.ownerId, event.ownerId), eq(opportunityFeedbackReceiptTable.idempotencyKey, event.idempotencyKey))).limit(1);
        if (retry[0]) {
          if (retry[0].requestFingerprint !== requestFingerprint) throw new OpportunityFeedbackConflictError("Idempotency key was already used for a different request");
          return retry[0].response as OpportunityFeedbackEvent;
        }
        const latest = await tx.select().from(opportunityFeedbackTable).where(and(eq(opportunityFeedbackTable.ownerId, event.ownerId), eq(opportunityFeedbackTable.lineageId, event.lineageId))).orderBy(desc(opportunityFeedbackTable.version)).limit(1);
        const version = latest[0]?.version ?? 0;
        const prior = latest[0] ? fromRow(latest[0]) : null;
        const semanticallyEqual = prior && prior.action === event.action && prior.type === event.type && prior.scope === event.scope && prior.notBefore === event.notBefore && prior.active === event.active;
        if (!semanticallyEqual && version !== expectedVersion) throw new OpportunityFeedbackConflictError(`Expected version ${expectedVersion}; current version is ${version}`);
        const result = semanticallyEqual ? prior : event;
        try {
          if (!semanticallyEqual) await tx.insert(opportunityFeedbackTable).values({ ...event, feedbackType: event.type, receivedAt: new Date(event.receivedAt) });
          await tx.insert(opportunityFeedbackReceiptTable).values({ id: createHash("sha256").update(JSON.stringify([event.ownerId, event.idempotencyKey])).digest("hex"), ownerId: event.ownerId, idempotencyKey: event.idempotencyKey, requestFingerprint, response: result });
        } catch (error) {
          // Drizzle wraps driver errors; preserve PostgreSQL's unique-conflict meaning.
          let cause: unknown = error;
          const seen = new Set<unknown>();
          while (cause && typeof cause === "object" && !seen.has(cause)) {
            seen.add(cause);
            if ((cause as { code?: string }).code === "23505") throw new OpportunityFeedbackConflictError("Concurrent feedback mutation conflicted");
            cause = (cause as { cause?: unknown }).cause;
          }
          throw error;
        }
        return result;
      });
    },
  };
}

export function activeFeedback(events: OpportunityFeedbackEvent[]) {
  const latest = new Map<string, OpportunityFeedbackEvent>();
  for (const event of events) if (!latest.has(event.lineageId) || latest.get(event.lineageId)!.version < event.version) latest.set(event.lineageId, event);
  return [...latest.values()].filter(event => event.active && event.action === "set");
}

