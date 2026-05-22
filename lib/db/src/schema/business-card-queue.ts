import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const businessCardQueueTable = pgTable("business_card_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: text("business_id").notNull(),
  clientId: text("client_id").notNull(),
  approvalToken: text("approval_token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  eventType: text("event_type").notNull(),
  occasionDate: text("occasion_date").notNull(),
  mailDate: text("mail_date").notNull(),
  cardMessage: text("card_message").notNull(),
  clientName: text("client_name").notNull(),
  clientAddress: text("client_address"),
  clientCompany: text("client_company"),
  cardFont: text("card_font"),
  cardSignature: text("card_signature"),
  notifyEmail: text("notify_email"),
  hwOrderId: text("hw_order_id"),
  contextNote: text("context_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertBusinessCardQueueSchema = createInsertSchema(businessCardQueueTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBusinessCardQueue = z.infer<typeof insertBusinessCardQueueSchema>;
export type BusinessCardQueue = typeof businessCardQueueTable.$inferSelect;
