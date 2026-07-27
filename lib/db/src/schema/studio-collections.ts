import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studioCollectionsTable = pgTable("studio_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  occasion: text("occasion").notNull(),
  relationship: text("relationship").notNull(),
  style: text("style"),
  description: text("description"),
  status: text("status").notNull().default("planning"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStudioCollectionSchema = createInsertSchema(studioCollectionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStudioCollection = z.infer<typeof insertStudioCollectionSchema>;
export type StudioCollection = typeof studioCollectionsTable.$inferSelect;
