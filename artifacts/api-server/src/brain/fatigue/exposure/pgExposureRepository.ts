/**
 * PostgreSQL append-only exposure event repository.
 *
 * Database modules are loaded lazily so tests and no-op fatigue paths do not
 * require DATABASE_URL until a write or read is attempted.
 */

import { randomUUID } from "node:crypto";

import type { ExposureEvent, ExposureEventType } from "./exposureTypes";
import type {
  InsertExposureEventInput,
  ListExposureEventsForUserOptions,
} from "./exposureRepository";

async function loadDb() {
  const [{ db }, { brainOpportunityExposureEventsTable }] = await Promise.all([
    import("@workspace/db"),
    import("@workspace/db/schema"),
  ]);
  return { db, brainOpportunityExposureEventsTable };
}

function rowToExposureEvent(row: {
  id: string;
  opportunityKey: string;
  recipientId: string;
  sourceRuleId: string;
  eventType: ExposureEventType;
  occurredAt: Date;
}): ExposureEvent {
  return {
    id: row.id,
    opportunityKey: row.opportunityKey,
    recipientId: row.recipientId,
    sourceRuleId: row.sourceRuleId,
    eventType: row.eventType,
    occurredAt: row.occurredAt.toISOString(),
  };
}

export async function insertExposureEvent(input: InsertExposureEventInput): Promise<void> {
  const { db, brainOpportunityExposureEventsTable } = await loadDb();

  await db.insert(brainOpportunityExposureEventsTable).values({
    id: randomUUID(),
    userId: input.userId,
    opportunityKey: input.opportunityKey,
    recipientId: input.recipientId,
    sourceRuleId: input.sourceRuleId,
    eventType: input.eventType,
    occurredAt: new Date(input.occurredAt),
  });
}

export async function listExposureEventsForUser(
  userId: string,
  options: ListExposureEventsForUserOptions = {},
): Promise<ExposureEvent[]> {
  const { and, eq, gte } = await import("drizzle-orm");
  const { db, brainOpportunityExposureEventsTable } = await loadDb();

  const predicates = [eq(brainOpportunityExposureEventsTable.userId, userId)];

  if (options.since) {
    predicates.push(
      gte(
        brainOpportunityExposureEventsTable.occurredAt,
        new Date(options.since),
      ),
    );
  }

  const rows = await db
    .select({
      id: brainOpportunityExposureEventsTable.id,
      opportunityKey: brainOpportunityExposureEventsTable.opportunityKey,
      recipientId: brainOpportunityExposureEventsTable.recipientId,
      sourceRuleId: brainOpportunityExposureEventsTable.sourceRuleId,
      eventType: brainOpportunityExposureEventsTable.eventType,
      occurredAt: brainOpportunityExposureEventsTable.occurredAt,
    })
    .from(brainOpportunityExposureEventsTable)
    .where(and(...predicates));

  return rows.map(rowToExposureEvent);
}
