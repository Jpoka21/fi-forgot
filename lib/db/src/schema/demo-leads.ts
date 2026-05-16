import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const demoLeadsTable = pgTable("demo_leads", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  recipientType: text("recipient_type").notNull(),
  occasionType: text("occasion_type").notNull(),
  vibe: text("vibe").notNull(),
  personalDetail: text("personal_detail"),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  source: text("source").notNull().default("send_yourself_the_save"),
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
