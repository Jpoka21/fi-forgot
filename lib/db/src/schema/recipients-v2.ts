import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

export const recipientsV2Table = pgTable("recipients_v2", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  firstName: text("first_name").notNull(),
  relationshipType: text("relationship_type").notNull(),
  birthday: text("birthday"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipientMemoryTable = pgTable("recipient_memory", {
  id: text("id").primaryKey(),
  recipientId: text("recipient_id").notNull().unique(),
  permanentFacts: jsonb("permanent_facts").$type<Record<string, unknown>>().default({}),
  relationshipDna: jsonb("relationship_dna").$type<Record<string, unknown>>().default({}),
  cardFuel: jsonb("card_fuel").$type<Record<string, unknown>>().default({}),
  cardPreferences: jsonb("card_preferences").$type<Record<string, unknown>>().default({}),
  profileCompleteness: integer("profile_completeness").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RecipientV2 = typeof recipientsV2Table.$inferSelect;
export type RecipientMemory = typeof recipientMemoryTable.$inferSelect;
