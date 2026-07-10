import { index, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export type BrainOutcomeEventType =
  | "question_answered"
  | "card_created"
  | "card_approved"
  | "card_sent"
  | "opportunity_dismissed";

export type BrainOutcomeEventMetadata =
  | {
      fieldKey: string;
      triggerType: "profile_gap" | "fresh_update" | "follow_up" | "event_briefing";
      followUpId?: string;
    }
  | {
      cardId: string;
      cardStatus: string;
    }
  | {
      dismissSource: string;
    };

export const brainOutcomeEventsTable = pgTable(
  "brain_outcome_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    recipientId: text("recipient_id").notNull(),
    opportunityKey: text("opportunity_key").notNull(),
    outcomeType: text("outcome_type").$type<BrainOutcomeEventType>().notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    metadata: jsonb("metadata").$type<BrainOutcomeEventMetadata>(),
    /** Stable domain action identity for producer idempotency (e.g. persisted answer id). */
    sourceActionId: text("source_action_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("brain_outcome_user_key_idx").on(table.userId, table.opportunityKey),
    index("brain_outcome_user_occurred_idx").on(table.userId, table.occurredAt),
    uniqueIndex("brain_outcome_source_action_uidx").on(table.sourceActionId),
  ],
);

export type BrainOutcomeEventRow = typeof brainOutcomeEventsTable.$inferSelect;
