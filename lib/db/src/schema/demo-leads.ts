import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const demoLeadsTable = pgTable("demo_leads", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  recipientName: text("recipient_name").notNull(),
  relationship: text("relationship").notNull(),
  occasion: text("occasion"),
  personality: text("personality"),
  source: text("source").notNull().default("demo_for_free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastDemoEmailSentAt: timestamp("last_demo_email_sent_at"),
  demoEmailSendCount: integer("demo_email_send_count").notNull().default(0),
});

export const insertDemoLeadSchema = createInsertSchema(demoLeadsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertDemoLead = z.infer<typeof insertDemoLeadSchema>;
export type DemoLead = typeof demoLeadsTable.$inferSelect;
