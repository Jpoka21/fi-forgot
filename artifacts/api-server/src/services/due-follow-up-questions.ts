import { followUpQuestionsTable } from "@workspace/db/schema";
import { eq, and, lte, lt } from "drizzle-orm";
import type { FollowUpCategory } from "@workspace/db";
const EXPIRY_DAYS = 180;
export interface DueFollowUp {
  id:             string;
  category:       FollowUpCategory;
  question:       string;
  originalAnswer: string;
}


/** Same production expiry/selection behavior, with a testable database boundary. */
export function createDueFollowUpQuestionReader(db: typeof import("@workspace/db").db) {
return async function getDueFollowUpQuestion(
  userId: string,
  recipientId: string,
): Promise<DueFollowUp | null> {
  const now = new Date();

  // Expire overdue records (180 days past triggerDate) — best effort
  const expiryThreshold = new Date();
  expiryThreshold.setDate(expiryThreshold.getDate() - EXPIRY_DAYS);
  try {
    await db
      .update(followUpQuestionsTable)
      .set({ status: "expired" })
      .where(and(
        eq(followUpQuestionsTable.userId, userId),
        eq(followUpQuestionsTable.recipientId, recipientId),
        eq(followUpQuestionsTable.status, "pending"),
        lt(followUpQuestionsTable.triggerDate, expiryThreshold),
      ));
  } catch { /* non-fatal */ }

  // Fetch the oldest due pending follow-up
  const rows = await db
    .select()
    .from(followUpQuestionsTable)
    .where(and(
      eq(followUpQuestionsTable.userId, userId),
      eq(followUpQuestionsTable.recipientId, recipientId),
      eq(followUpQuestionsTable.status, "pending"),
      lte(followUpQuestionsTable.triggerDate, now),
    ))
    .orderBy(followUpQuestionsTable.triggerDate)
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    id:             row.id,
    category:       row.category,
    question:       row.question,
    originalAnswer: row.originalAnswer,
  };
}
}

export async function getDueFollowUpQuestion(userId:string,recipientId:string):Promise<DueFollowUp|null>{
 const {db}=await import("@workspace/db");
 return createDueFollowUpQuestionReader(db)(userId,recipientId);
}
