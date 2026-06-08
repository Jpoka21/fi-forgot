import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const browniePointTransactionsTable = pgTable("brownie_point_transactions", {
  id:          text("id").primaryKey(),
  userId:      text("user_id").notNull(),
  recipientId: text("recipient_id"),
  actionType:  text("action_type").notNull(),
  points:      integer("points").notNull(),
  description: text("description").notNull(),
  createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type BrowniePointTransaction = typeof browniePointTransactionsTable.$inferSelect;
