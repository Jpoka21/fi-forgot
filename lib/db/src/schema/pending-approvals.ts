import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pendingApprovalsTable = pgTable("pending_approvals", {
  id: text("id").primaryKey(),
  queueItemId: text("queue_item_id").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  recipientName: text("recipient_name").notNull(),
  eventType: text("event_type").notNull(),
  scheduledMailDate: text("scheduled_mail_date").notNull(),
  messageText: text("message_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastReminderSentAt: timestamp("last_reminder_sent_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertPendingApprovalSchema = createInsertSchema(pendingApprovalsTable).omit({
  createdAt: true,
  lastReminderSentAt: true,
  resolvedAt: true,
});

export type InsertPendingApproval = z.infer<typeof insertPendingApprovalSchema>;
export type PendingApproval = typeof pendingApprovalsTable.$inferSelect;
