import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cardPreviewsTable = pgTable("card_previews", {
  token:         text("token").primaryKey(),
  imageUrl:      text("image_url").notNull(),
  cardName:      text("card_name").notNull().default(""),
  messageText:   text("message_text").notNull(),
  recipientName: text("recipient_name").notNull(),
  eventType:     text("event_type").notNull(),
  expiresAt:     timestamp("expires_at").notNull(),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

export const insertCardPreviewSchema = createInsertSchema(cardPreviewsTable).omit({
  createdAt: true,
});

export type InsertCardPreview = z.infer<typeof insertCardPreviewSchema>;
export type CardPreview = typeof cardPreviewsTable.$inferSelect;
