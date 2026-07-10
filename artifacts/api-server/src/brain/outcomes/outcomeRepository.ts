/**
 * Append-only Brain outcome repository contracts and in-memory implementation.
 */

import { randomUUID } from "node:crypto";

import type { RecordBrainOutcomeInput } from "./brainOutcomeRecorder";
import { assertValidRecordBrainOutcomeInput } from "./outcomeValidation";
import {
  normalizeOutcomeOccurredAtIso,
  resolveOutcomeOccurredAt,
} from "./outcomeTimestamps";
import type { BrainOutcomeEvent } from "./outcomeTypes";

export interface ListBrainOutcomeEventsForUserOptions {
  since?: string;
}

export interface BrainOutcomeRepository {
  append(input: RecordBrainOutcomeInput): Promise<BrainOutcomeEvent>;
  appendOnceForSourceAction(
    input: AppendOnceBrainOutcomeInput,
  ): Promise<AppendOnceBrainOutcomeResult>;
  listOutcomeEventsForUser(
    userId: string,
    options?: ListBrainOutcomeEventsForUserOptions,
  ): Promise<BrainOutcomeEvent[]>;
}

export type AppendOnceBrainOutcomeInput = RecordBrainOutcomeInput & {
  sourceActionId: string;
};

export type AppendOnceBrainOutcomeResult =
  | {
      status: "appended";
      event: BrainOutcomeEvent;
    }
  | {
      status: "already_exists";
      event: BrainOutcomeEvent;
    };

type StoredBrainOutcomeEvent = BrainOutcomeEvent & { userId: string };

export function createInMemoryBrainOutcomeRepository(): BrainOutcomeRepository {
  const events: StoredBrainOutcomeEvent[] = [];
  const eventsBySourceActionId = new Map<string, StoredBrainOutcomeEvent>();

  return {
    async append(input: RecordBrainOutcomeInput): Promise<BrainOutcomeEvent> {
      assertValidRecordBrainOutcomeInput(input);

      const occurredAt = resolveOutcomeOccurredAt(input.occurredAt);
      const event: BrainOutcomeEvent = {
        id: randomUUID(),
        userId: input.userId,
        recipientId: input.recipientId,
        opportunityKey: input.opportunityKey,
        outcomeType: input.outcomeType,
        occurredAt: normalizeOutcomeOccurredAtIso(occurredAt),
        metadata: input.metadata ? structuredClone(input.metadata) : undefined,
      };

      events.push(event);
      return event;
    },

    async appendOnceForSourceAction(
      input: AppendOnceBrainOutcomeInput,
    ): Promise<AppendOnceBrainOutcomeResult> {
      assertValidRecordBrainOutcomeInput(input);

      if (!input.sourceActionId.trim()) {
        throw new Error("appendOnceForSourceAction requires a non-empty sourceActionId");
      }

      const existing = eventsBySourceActionId.get(input.sourceActionId);
      if (existing) {
        return {
          status: "already_exists",
          event: {
            id: existing.id,
            userId: existing.userId,
            recipientId: existing.recipientId,
            opportunityKey: existing.opportunityKey,
            outcomeType: existing.outcomeType,
            occurredAt: existing.occurredAt,
            metadata: existing.metadata ? structuredClone(existing.metadata) : undefined,
          },
        };
      }

      const occurredAt = resolveOutcomeOccurredAt(input.occurredAt);
      const event: StoredBrainOutcomeEvent = {
        id: randomUUID(),
        userId: input.userId,
        recipientId: input.recipientId,
        opportunityKey: input.opportunityKey,
        outcomeType: input.outcomeType,
        occurredAt: normalizeOutcomeOccurredAtIso(occurredAt),
        metadata: input.metadata ? structuredClone(input.metadata) : undefined,
      };

      events.push(event);
      eventsBySourceActionId.set(input.sourceActionId, event);
      return { status: "appended", event };
    },

    async listOutcomeEventsForUser(
      userId: string,
      options: ListBrainOutcomeEventsForUserOptions = {},
    ): Promise<BrainOutcomeEvent[]> {
      return events
        .filter((event) => event.userId === userId)
        .filter((event) => !options.since || event.occurredAt >= options.since)
        .map((event) => ({
          id: event.id,
          userId: event.userId,
          recipientId: event.recipientId,
          opportunityKey: event.opportunityKey,
          outcomeType: event.outcomeType,
          occurredAt: event.occurredAt,
          metadata: event.metadata ? structuredClone(event.metadata) : undefined,
        }));
    },
  };
}
