import { pgTable, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const questionAnswersTable = pgTable("question_answers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  recipientId: text("recipient_id").notNull(),
  eventType: text("event_type").notNull(),
  eventYear: integer("event_year").notNull(),
  questionKey: text("question_key").notNull(),
  questionText: text("question_text").notNull(),
  answerText: text("answer_text").notNull(),
  wasSkipped: boolean("was_skipped").notNull().default(false),
  triggerType: text("trigger_type").notNull().default("event_briefing"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type QuestionAnswer = typeof questionAnswersTable.$inferSelect;
