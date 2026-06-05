import { pgTable, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const recipientsTable = pgTable("recipients", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  nickname: text("nickname"),
  relationshipType: text("relationship_type").notNull(),
  relationshipLabel: text("relationship_label"),
  birthday: text("birthday"),
  anniversary: text("anniversary"),
  email: text("email"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country").default("US"),
  active: boolean("active").notNull().default(true),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const recipientProfileTable = pgTable("recipient_profile", {
  id: text("id").primaryKey(),
  recipientId: text("recipient_id").notNull().unique(),
  personalityNotes: text("personality_notes"),
  personalityTraits: jsonb("personality_traits").$type<string[]>(),
  interests: jsonb("interests").$type<string[]>(),
  hobbies: text("hobbies"),
  dislikes: text("dislikes"),
  favoriteMemories: text("favorite_memories"),
  insideJokes: text("inside_jokes"),
  preferredTone: text("preferred_tone"),
  emotionalOpenness: integer("emotional_openness"),
  thingsToAvoid: text("things_to_avoid"),
  thingsToAlwaysInclude: text("things_to_always_include"),
  senderNickname: text("sender_nickname"),
  signOff: text("sign_off"),
  deliveryPreference: text("delivery_preference"),
  previewDays: integer("preview_days"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type RecipientRow = typeof recipientsTable.$inferSelect;
export type RecipientProfileRow = typeof recipientProfileTable.$inferSelect;
