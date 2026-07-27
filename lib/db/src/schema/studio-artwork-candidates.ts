import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studioArtworkSlotsTable } from "./studio-artwork-slots";
import { studioCollectionsTable } from "./studio-collections";

export const studioArtworkCandidatesTable = pgTable("studio_artwork_candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => studioCollectionsTable.id),
  artworkSlotId: uuid("artwork_slot_id")
    .notNull()
    .references(() => studioArtworkSlotsTable.id),
  name: text("name").notNull(),
  brief: text("brief"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStudioArtworkCandidateSchema = createInsertSchema(
  studioArtworkCandidatesTable,
).omit({
  id: true,
  collectionId: true,
  artworkSlotId: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStudioArtworkCandidate = z.infer<typeof insertStudioArtworkCandidateSchema>;
export type StudioArtworkCandidate = typeof studioArtworkCandidatesTable.$inferSelect;
