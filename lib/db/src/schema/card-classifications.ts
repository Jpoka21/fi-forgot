import { pgTable, text, boolean, jsonb, bigint } from "drizzle-orm/pg-core";

export const cardClassificationsTable = pgTable("card_classifications", {
  imageUrl: text("image_url").primaryKey(),
  occasions: jsonb("occasions").$type<string[]>().notNull().default([]),
  confirmedOccasions: jsonb("confirmed_occasions").$type<string[]>().notNull().default([]),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
  claudeKeywords: jsonb("claude_keywords").$type<string[]>().notNull().default([]),
  gptKeywords: jsonb("gpt_keywords").$type<string[]>().notNull().default([]),
  skip: boolean("skip").notNull().default(false),
  classifiedAt: bigint("classified_at", { mode: "number" }).notNull(),
  models: jsonb("models").$type<string[]>().notNull().default([]),
});

export type CardClassificationRow = typeof cardClassificationsTable.$inferSelect;
