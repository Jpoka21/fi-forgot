import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studioCollectionsTable } from "./studio-collections";

export const studioArtworkSlotsTable = pgTable("studio_artwork_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => studioCollectionsTable.id),
  name: text("name").notNull(),
  brief: text("brief"),
  quantity: integer("quantity").notNull().default(1),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStudioArtworkSlotSchema = createInsertSchema(studioArtworkSlotsTable).omit({
  id: true,
  collectionId: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStudioArtworkSlot = z.infer<typeof insertStudioArtworkSlotSchema>;
export type StudioArtworkSlot = typeof studioArtworkSlotsTable.$inferSelect;
