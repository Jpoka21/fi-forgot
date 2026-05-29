import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const personalRecipientsTable = pgTable("personal_recipients", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PersonalRecipientRow = typeof personalRecipientsTable.$inferSelect;
