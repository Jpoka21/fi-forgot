/**
 * Append-only exposure event repository contracts and in-memory implementation.
 */

import { randomUUID } from "node:crypto";

import type { ExposureEvent, ExposureEventType } from "./exposureTypes";

export interface InsertExposureEventInput {
  userId: string;
  opportunityKey: string;
  recipientId: string;
  sourceRuleId: string;
  eventType: ExposureEventType;
  occurredAt: string;
}

export interface ListExposureEventsForUserOptions {
  since?: string;
}

export interface ExposureEventRepository {
  insertExposureEvent(input: InsertExposureEventInput): Promise<void>;
  listExposureEventsForUser(
    userId: string,
    options?: ListExposureEventsForUserOptions,
  ): Promise<ExposureEvent[]>;
}

export function createInMemoryExposureEventRepository(): ExposureEventRepository {
  const events: Array<InsertExposureEventInput & { id: string }> = [];

  return {
    async insertExposureEvent(input: InsertExposureEventInput): Promise<void> {
      events.push({ ...input, id: randomUUID() });
    },

    async listExposureEventsForUser(
      userId: string,
      options: ListExposureEventsForUserOptions = {},
    ): Promise<ExposureEvent[]> {
      return events
        .filter((event) => event.userId === userId)
        .filter((event) => !options.since || event.occurredAt >= options.since)
        .map((event) => ({
          id: event.id,
          opportunityKey: event.opportunityKey,
          recipientId: event.recipientId,
          sourceRuleId: event.sourceRuleId,
          eventType: event.eventType,
          occurredAt: event.occurredAt,
        }));
    },
  };
}
