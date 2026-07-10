/**
 * PostgreSQL append-only Brain outcome repository.
 *
 * Database modules are loaded lazily so tests and no-op paths do not require
 * DATABASE_URL until a write or read is attempted.
 */

import { randomUUID } from "node:crypto";

import type { RecordBrainOutcomeInput } from "./brainOutcomeRecorder";
import type {
  AppendOnceBrainOutcomeInput,
  AppendOnceBrainOutcomeResult,
  BrainOutcomeRepository,
  ListBrainOutcomeEventsForUserOptions,
} from "./outcomeRepository";
import {
  normalizeOutcomeOccurredAtIso,
  resolveOutcomeOccurredAt,
} from "./outcomeTimestamps";
import { assertValidRecordBrainOutcomeInput } from "./outcomeValidation";
import type { BrainOutcomeEvent, BrainOutcomeMetadata } from "./outcomeTypes";

async function loadDb() {
  const [{ db }, { brainOutcomeEventsTable }] = await Promise.all([
    import("@workspace/db"),
    import("@workspace/db/schema"),
  ]);
  return { db, brainOutcomeEventsTable };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}

async function findBrainOutcomeEventBySourceActionId(
  sourceActionId: string,
): Promise<BrainOutcomeEvent | null> {
  const { eq } = await import("drizzle-orm");
  const { db, brainOutcomeEventsTable } = await loadDb();

  const [row] = await db
    .select({
      id: brainOutcomeEventsTable.id,
      userId: brainOutcomeEventsTable.userId,
      recipientId: brainOutcomeEventsTable.recipientId,
      opportunityKey: brainOutcomeEventsTable.opportunityKey,
      outcomeType: brainOutcomeEventsTable.outcomeType,
      occurredAt: brainOutcomeEventsTable.occurredAt,
      metadata: brainOutcomeEventsTable.metadata,
    })
    .from(brainOutcomeEventsTable)
    .where(eq(brainOutcomeEventsTable.sourceActionId, sourceActionId))
    .limit(1);

  return row ? rowToBrainOutcomeEvent(row) : null;
}

function rowToBrainOutcomeEvent(row: {
  id: string;
  userId: string;
  recipientId: string;
  opportunityKey: string;
  outcomeType: BrainOutcomeEvent["outcomeType"];
  occurredAt: Date;
  metadata: BrainOutcomeMetadata | null;
}): BrainOutcomeEvent {
  return {
    id: row.id,
    userId: row.userId,
    recipientId: row.recipientId,
    opportunityKey: row.opportunityKey,
    outcomeType: row.outcomeType,
    occurredAt: normalizeOutcomeOccurredAtIso(row.occurredAt),
    metadata: row.metadata ?? undefined,
  };
}

export async function appendBrainOutcomeEvent(
  input: RecordBrainOutcomeInput,
): Promise<BrainOutcomeEvent> {
  assertValidRecordBrainOutcomeInput(input);

  const { db, brainOutcomeEventsTable } = await loadDb();
  const occurredAt = resolveOutcomeOccurredAt(input.occurredAt);
  const id = randomUUID();

  await db.insert(brainOutcomeEventsTable).values({
    id,
    userId: input.userId,
    recipientId: input.recipientId,
    opportunityKey: input.opportunityKey,
    outcomeType: input.outcomeType,
    occurredAt,
    metadata: input.metadata ?? null,
  });

  return {
    id,
    userId: input.userId,
    recipientId: input.recipientId,
    opportunityKey: input.opportunityKey,
    outcomeType: input.outcomeType,
    occurredAt: normalizeOutcomeOccurredAtIso(occurredAt),
    metadata: input.metadata ? structuredClone(input.metadata) : undefined,
  };
}

export async function appendOnceBrainOutcomeEventForSourceAction(
  input: AppendOnceBrainOutcomeInput,
): Promise<AppendOnceBrainOutcomeResult> {
  assertValidRecordBrainOutcomeInput(input);

  if (!input.sourceActionId.trim()) {
    throw new Error("appendOnceForSourceAction requires a non-empty sourceActionId");
  }

  const existing = await findBrainOutcomeEventBySourceActionId(input.sourceActionId);
  if (existing) {
    return { status: "already_exists", event: existing };
  }

  const { db, brainOutcomeEventsTable } = await loadDb();
  const occurredAt = resolveOutcomeOccurredAt(input.occurredAt);
  const id = randomUUID();

  try {
    await db.insert(brainOutcomeEventsTable).values({
      id,
      userId: input.userId,
      recipientId: input.recipientId,
      opportunityKey: input.opportunityKey,
      outcomeType: input.outcomeType,
      occurredAt,
      metadata: input.metadata ?? null,
      sourceActionId: input.sourceActionId,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const duplicate = await findBrainOutcomeEventBySourceActionId(input.sourceActionId);
      if (duplicate) {
        return { status: "already_exists", event: duplicate };
      }
    }
    throw error;
  }

  return {
    status: "appended",
    event: {
      id,
      userId: input.userId,
      recipientId: input.recipientId,
      opportunityKey: input.opportunityKey,
      outcomeType: input.outcomeType,
      occurredAt: normalizeOutcomeOccurredAtIso(occurredAt),
      metadata: input.metadata ? structuredClone(input.metadata) : undefined,
    },
  };
}

export async function listBrainOutcomeEventsForUser(
  userId: string,
  options: ListBrainOutcomeEventsForUserOptions = {},
): Promise<BrainOutcomeEvent[]> {
  const { and, eq, gte } = await import("drizzle-orm");
  const { db, brainOutcomeEventsTable } = await loadDb();

  const predicates = [eq(brainOutcomeEventsTable.userId, userId)];

  if (options.since) {
    predicates.push(gte(brainOutcomeEventsTable.occurredAt, new Date(options.since)));
  }

  const rows = await db
    .select({
      id: brainOutcomeEventsTable.id,
      userId: brainOutcomeEventsTable.userId,
      recipientId: brainOutcomeEventsTable.recipientId,
      opportunityKey: brainOutcomeEventsTable.opportunityKey,
      outcomeType: brainOutcomeEventsTable.outcomeType,
      occurredAt: brainOutcomeEventsTable.occurredAt,
      metadata: brainOutcomeEventsTable.metadata,
    })
    .from(brainOutcomeEventsTable)
    .where(and(...predicates));

  return rows.map(rowToBrainOutcomeEvent);
}

export function createPgBrainOutcomeRepository(): BrainOutcomeRepository {
  return {
    append: appendBrainOutcomeEvent,
    appendOnceForSourceAction: appendOnceBrainOutcomeEventForSourceAction,
    listOutcomeEventsForUser: listBrainOutcomeEventsForUser,
  };
}
