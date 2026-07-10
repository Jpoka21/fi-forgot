import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export type BrainOpportunityExposureEventType = "surfaced" | "dismissed" | "completed";

export const brainOpportunityExposureEventsTable = pgTable(
  "brain_opportunity_exposure_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    opportunityKey: text("opportunity_key").notNull(),
    recipientId: text("recipient_id").notNull(),
    sourceRuleId: text("source_rule_id").notNull(),
    eventType: text("event_type").$type<BrainOpportunityExposureEventType>().notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("brain_opp_exposure_user_key_idx").on(table.userId, table.opportunityKey),
    index("brain_opp_exposure_user_occurred_idx").on(table.userId, table.occurredAt),
  ],
);

export type BrainOpportunityExposureEvent =
  typeof brainOpportunityExposureEventsTable.$inferSelect;
