import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const businessSettingsTable = pgTable("business_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: text("business_id").notNull().unique(),

  bizType:       text("biz_type"),
  bizTypeOther:  text("biz_type_other"),
  tone:          text("tone"),
  cardSignature: text("card_signature"),
  cardFont:      text("card_font"),

  notifyTiming:   text("notify_timing"),
  notifyChannel:  text("notify_channel"),
  notifyEmail:    text("notify_email"),
  notifyPhone:    text("notify_phone"),
  automationMode: text("automation_mode"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBusinessSettingsSchema = createInsertSchema(businessSettingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBusinessSettings = z.infer<typeof insertBusinessSettingsSchema>;
export type BusinessSettings = typeof businessSettingsTable.$inferSelect;
