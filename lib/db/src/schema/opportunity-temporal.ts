import { index, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Unapplied append-only history for Opportunity timing evaluations.
 * Runtime repository wiring exists; schema review and deployment remain deferred.
 */
export const opportunityTemporalHistoryTable = pgTable("opportunity_temporal_history", {
  id: text("id").primaryKey(),
  changeKey: text("change_key").notNull(),
  userId: text("user_id").notNull(),
  opportunityId: text("opportunity_id").notNull(),
  recipientId: text("recipient_id").notNull(),
  source: text("source").notNull(),
  sourceId: text("source_id"),
  sourceVersion: text("source_version"),
  occurrenceCycleId: text("occurrence_cycle_id"),
  state: text("state").notNull(),
  effectiveDate: text("effective_date"),
  reason: text("reason").notNull(),
  evidence: jsonb("evidence").notNull(),
  evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  immutableChange: uniqueIndex("opportunity_temporal_history_change_uq").on(table.id),
  opportunityTimeline: index("opportunity_temporal_history_timeline_idx").on(table.userId, table.opportunityId, table.evaluatedAt),
  recipientTimeline: index("opportunity_temporal_history_recipient_idx").on(table.userId, table.recipientId, table.evaluatedAt),
}));

export type OpportunityTemporalHistoryRow = typeof opportunityTemporalHistoryTable.$inferSelect;
