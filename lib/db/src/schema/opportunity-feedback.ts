import { boolean, index, integer, jsonb, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const opportunityFeedbackTable = pgTable("opportunity_feedback_events", {
  id: text("id").primaryKey(), lineageId: text("lineage_id").notNull(), version: integer("version").notNull(),
  ownerId: text("owner_id").notNull(), recipientId: text("recipient_id").notNull(), opportunityId: text("opportunity_id").notNull(),
  occurrenceCycleId: text("occurrence_cycle_id"), relationshipId: text("relationship_id"), family: text("family").notNull(),
  action: text("action").notNull(), feedbackType: text("feedback_type").notNull(), scope: text("scope").notNull(),
  notBefore: text("not_before"), timingProvenance: text("timing_provenance").notNull(), provenance: text("provenance").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull(), supersedesId: text("supersedes_id"),
  withdrawnEventId: text("withdrawn_event_id"), idempotencyKey: text("idempotency_key").notNull(), active: boolean("active").notNull(),
}, table => ({
  lineageVersion: unique("opportunity_feedback_lineage_version_uq").on(table.lineageId, table.version),
  ownerIdempotency: unique("opportunity_feedback_owner_idempotency_uq").on(table.ownerId, table.idempotencyKey),
  ownerRecipient: index("opportunity_feedback_owner_recipient_idx").on(table.ownerId, table.recipientId, table.receivedAt),
}));

export type OpportunityFeedbackRow = typeof opportunityFeedbackTable.$inferSelect;

export const opportunityFeedbackReceiptTable = pgTable("opportunity_feedback_receipts", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), idempotencyKey: text("idempotency_key").notNull(),
  requestFingerprint: text("request_fingerprint").notNull(), response: jsonb("response").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
}, table => ({ ownerKey: unique("opportunity_feedback_receipt_owner_key_uq").on(table.ownerId, table.idempotencyKey) }));
