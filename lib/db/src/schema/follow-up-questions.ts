import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export type FollowUpCategory =
  | "NEW_HOBBY"
  | "ACCOMPLISHMENT"
  | "CAREER"
  | "CHALLENGE"
  | "FAMILY"
  | "HOME_LIFE"
  | "GENERAL";

export type FollowUpStatus = "pending" | "answered" | "expired";

export const followUpQuestionsTable = pgTable("follow_up_questions", {
  id:             text("id").primaryKey(),
  userId:         text("user_id").notNull(),
  recipientId:    text("recipient_id").notNull(),
  sourceAnswerId: text("source_answer_id").notNull(),
  category:       text("category").$type<FollowUpCategory>().notNull(),
  triggerDate:    timestamp("trigger_date", { withTimezone: true }).notNull(),
  question:       text("question").notNull(),
  originalAnswer: text("original_answer").notNull(),
  status:         text("status").$type<FollowUpStatus>().notNull().default("pending"),
  createdAt:      timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  answeredAt:     timestamp("answered_at", { withTimezone: true }),
});

export type FollowUpQuestion = typeof followUpQuestionsTable.$inferSelect;
