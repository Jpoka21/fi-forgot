import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const personalCardsTable = pgTable("personal_cards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipientId: text("recipient_id").notNull(),
  recipientName: text("recipient_name").notNull(),
  eventType: text("event_type").notNull(),
  eventDate: text("event_date"),
  status: text("status").notNull().default("draft"),
  messageOriginal: text("message_original"),
  messageFinal: text("message_final"),
  wasEdited: boolean("was_edited").notNull().default(false),
  generationVersion: text("generation_version").notNull().default("v1"),
  archetype: text("archetype"),
  handwryttenCardId: text("handwrytten_card_id"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  mailedAt: timestamp("mailed_at", { withTimezone: true }),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type PersonalCard = typeof personalCardsTable.$inferSelect;
