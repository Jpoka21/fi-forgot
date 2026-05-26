import { pgTable, text, boolean, integer, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aiCardLibraryTable = pgTable("ai_card_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  handwryttenCardId: text("handwrytten_card_id").unique(),
  promptUsed: text("prompt_used").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  style: text("style"),
  tone: text("tone"),
  primaryColor: text("primary_color"),
  seasonal: boolean("seasonal").notNull().default(false),
  active: boolean("active").notNull().default(true),
  timesShown: integer("times_shown").notNull().default(0),
  timesSelected: integer("times_selected").notNull().default(0),
  timesRejected: integer("times_rejected").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiCardLibrarySchema = createInsertSchema(aiCardLibraryTable).omit({
  id: true,
  createdAt: true,
});

export type InsertAiCardLibrary = z.infer<typeof insertAiCardLibrarySchema>;
export type AiCardLibrary = typeof aiCardLibraryTable.$inferSelect;
