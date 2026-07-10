/**
 * Append-only exposure event repository contracts and in-memory implementation.
 */

import { randomUUID } from "node:crypto";

import { assertValidExposureOpportunityIdentity } from "./exposureTypes";
import type { ExposureEvent, ExposureEventType } from "./exposureTypes";

export interface InsertExposureEventInput {
  userId: string;
  opportunityKey: string;
  recipientId: string;
  sourceRuleId: string;
  eventType: ExposureEventType;
  occurredAt: string;
  /** Set when exposure is derived from a Brain outcome projection. */
  sourceOutcomeEventId?: string;
}

export interface ListExposureEventsForUserOptions {
  since?: string;
}

export type AppendExposureEventResult =
  | {
      status: "appended";
      event: ExposureEvent;
    }
  | {
      status: "already_exists";
      event: ExposureEvent;
    };

export interface ExposureEventRepository {
  appendExposureEvent(input: InsertExposureEventInput): Promise<AppendExposureEventResult>;
  insertExposureEvent(input: InsertExposureEventInput): Promise<void>;
  listExposureEventsForUser(
    userId: string,
    options?: ListExposureEventsForUserOptions,
  ): Promise<ExposureEvent[]>;
}

type StoredExposureEvent = InsertExposureEventInput & { id: string };

function toExposureEvent(stored: StoredExposureEvent): ExposureEvent {
  return {
    id: stored.id,
    opportunityKey: stored.opportunityKey,
    recipientId: stored.recipientId,
    sourceRuleId: stored.sourceRuleId,
    eventType: stored.eventType,
    occurredAt: stored.occurredAt,
    sourceOutcomeEventId: stored.sourceOutcomeEventId,
  };
}

export function createInMemoryExposureEventRepository(): ExposureEventRepository {
  const events: StoredExposureEvent[] = [];

  return {
    async appendExposureEvent(input: InsertExposureEventInput): Promise<AppendExposureEventResult> {
      assertValidExposureOpportunityIdentity(input);

      if (input.sourceOutcomeEventId) {
        const existing = events.find(
          (event) => event.sourceOutcomeEventId === input.sourceOutcomeEventId,
        );
        if (existing) {
          return { status: "already_exists", event: toExposureEvent(existing) };
        }
      }

      const stored: StoredExposureEvent = {
        ...input,
        id: randomUUID(),
      };
      events.push(stored);
      return { status: "appended", event: toExposureEvent(stored) };
    },

    async insertExposureEvent(input: InsertExposureEventInput): Promise<void> {
      await this.appendExposureEvent(input);
    },

    async listExposureEventsForUser(
      userId: string,
      options: ListExposureEventsForUserOptions = {},
    ): Promise<ExposureEvent[]> {
      return events
        .filter((event) => event.userId === userId)
        .filter((event) => !options.since || event.occurredAt >= options.since)
        .map(toExposureEvent);
    },
  };
}
