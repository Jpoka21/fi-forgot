import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const personalRecipientsTable = pgTable("personal_recipients", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export type PersonalRecipientRow = typeof personalRecipientsTable.$inferSelect;
