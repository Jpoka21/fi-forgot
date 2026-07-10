/**
 * PostgreSQL append-only exposure event repository.
 *
 * Loaded lazily so tests and no-op fatigue paths do not require DATABASE_URL.
 */

import { randomUUID } from "node:crypto";

import { and, eq, gte } from "drizzle-orm";
import { db } from "@workspace/db";
import { brainOpportunityExposureEventsTable } from "@workspace/db/schema";

import type { ExposureEvent, ExposureEventType } from "./exposureTypes";
import type {
  InsertExposureEventInput,
  ListExposureEventsForUserOptions,
} from "./exposureRepository";

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
