/**
 * PostgreSQL append-only exposure event repository.
 *
 * Database modules are loaded lazily so tests and no-op fatigue paths do not
 * require DATABASE_URL until a write or read is attempted.
 */

import { randomUUID } from "node:crypto";

import type { ExposureEvent, ExposureEventType } from "./exposureTypes";
import type {
  AppendExposureEventResult,
  InsertExposureEventInput,
  ListExposureEventsForUserOptions,
} from "./exposureRepository";
import { assertValidExposureOpportunityIdentity } from "./exposureTypes";

async function loadDb() {
  const [{ db }, { brainOpportunityExposureEventsTable }] = await Promise.all([
    import("@workspace/db"),
    import("@workspace/db/schema"),
  ]);
  return { db, brainOpportunityExposureEventsTable };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}

function rowToExposureEvent(row: {
  id: string;
  opportunityKey: string;
  recipientId: string;
  sourceRuleId: string;
  eventType: ExposureEventType;
  occurredAt: Date;
  sourceOutcomeEventId: string | null;
}): ExposureEvent {
  return {
    id: row.id,
    opportunityKey: row.opportunityKey,
    recipientId: row.recipientId,
    sourceRuleId: row.sourceRuleId,
    eventType: row.eventType,
    occurredAt: row.occurredAt.toISOString(),
    sourceOutcomeEventId: row.sourceOutcomeEventId ?? undefined,
  };
}

async function findExposureEventBySourceOutcomeEventId(
  sourceOutcomeEventId: string,
): Promise<ExposureEvent | null> {
  const { eq } = await import("drizzle-orm");
  const { db, brainOpportunityExposureEventsTable } = await loadDb();

  const [row] = await db
    .select({
      id: brainOpportunityExposureEventsTable.id,
      opportunityKey: brainOpportunityExposureEventsTable.opportunityKey,
      recipientId: brainOpportunityExposureEventsTable.recipientId,
      sourceRuleId: brainOpportunityExposureEventsTable.sourceRuleId,
      eventType: brainOpportunityExposureEventsTable.eventType,
      occurredAt: brainOpportunityExposureEventsTable.occurredAt,
      sourceOutcomeEventId: brainOpportunityExposureEventsTable.sourceOutcomeEventId,
    })
    .from(brainOpportunityExposureEventsTable)
    .where(eq(brainOpportunityExposureEventsTable.sourceOutcomeEventId, sourceOutcomeEventId))
    .limit(1);

  return row ? rowToExposureEvent(row) : null;
}

export async function appendExposureEvent(
  input: InsertExposureEventInput,
): Promise<AppendExposureEventResult> {
  assertValidExposureOpportunityIdentity(input);

  if (input.sourceOutcomeEventId) {
    const existing = await findExposureEventBySourceOutcomeEventId(input.sourceOutcomeEventId);
    if (existing) {
      return { status: "already_exists", event: existing };
    }
  }

  const { db, brainOpportunityExposureEventsTable } = await loadDb();
  const id = randomUUID();

  try {
    await db.insert(brainOpportunityExposureEventsTable).values({
      id,
      userId: input.userId,
      opportunityKey: input.opportunityKey,
      recipientId: input.recipientId,
      sourceRuleId: input.sourceRuleId,
      eventType: input.eventType,
      occurredAt: new Date(input.occurredAt),
      sourceOutcomeEventId: input.sourceOutcomeEventId ?? null,
    });
  } catch (error) {
    if (input.sourceOutcomeEventId && isUniqueViolation(error)) {
      const existing = await findExposureEventBySourceOutcomeEventId(input.sourceOutcomeEventId);
      if (existing) {
        return { status: "already_exists", event: existing };
      }
    }
    throw error;
  }

  return {
    status: "appended",
    event: {
      id,
      opportunityKey: input.opportunityKey,
      recipientId: input.recipientId,
      sourceRuleId: input.sourceRuleId,
      eventType: input.eventType,
      occurredAt: input.occurredAt,
      sourceOutcomeEventId: input.sourceOutcomeEventId,
    },
  };
}

export async function insertExposureEvent(input: InsertExposureEventInput): Promise<void> {
  await appendExposureEvent(input);
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
      sourceOutcomeEventId: brainOpportunityExposureEventsTable.sourceOutcomeEventId,
    })
    .from(brainOpportunityExposureEventsTable)
    .where(and(...predicates));

  return rows.map(rowToExposureEvent);
}

export function createPgExposureEventRepository(): import("./exposureRepository.js").ExposureEventRepository {
  return {
    appendExposureEvent,
    insertExposureEvent,
    listExposureEventsForUser,
  };
}
