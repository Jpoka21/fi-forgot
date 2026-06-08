import { db, usersTable, browniePointTransactionsTable } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";

export type BrownieActionType =
  | "profile_complete"
  | "fresh_update"
  | "fresh_update_first"
  | "card_generate"
  | "card_send"
  | "card_send_early"
  | "recipient_created"
  | "birthday_added"
  | "anniversary_added"
  | "follow_up_answered";

const POINT_VALUES: Record<BrownieActionType, number> = {
  profile_complete:    100,
  fresh_update:         10,
  fresh_update_first:   25,
  card_generate:         5,
  card_send:            25,
  card_send_early:      25,
  recipient_created:    15,
  birthday_added:       10,
  anniversary_added:    10,
  follow_up_answered:   15,
};

const ACTION_DESCRIPTIONS: Record<BrownieActionType, string> = {
  profile_complete:    "Completed recipient profile",
  fresh_update:        "Added fresh update",
  fresh_update_first:  "First fresh update for this person",
  card_generate:       "Generated a card draft",
  card_send:           "Approved and sent a card",
  card_send_early:     "Sent a card 7+ days early",
  recipient_created:   "Added a new recipient",
  birthday_added:      "Added a birthday",
  anniversary_added:   "Added an anniversary",
  follow_up_answered:  "Answered a follow-up question",
};

export const BROWNIE_TOAST_MESSAGES: Record<BrownieActionType, string> = {
  profile_complete:    "Recipient profile completed. Future cards just got a lot more personal.",
  fresh_update:        "Nice touch. Future cards just got better.",
  fresh_update_first:  "First update for this person. They'll feel the difference.",
  card_generate:       "Draft created. Off to a great start.",
  card_send:           "Card sent. Thoughtfulness counts.",
  card_send_early:     "Sent early. You're ahead of schedule.",
  recipient_created:   "New relationship added. Cards on autopilot.",
  birthday_added:      "Birthday locked in. No more scrambling.",
  anniversary_added:   "Anniversary saved. They'll be impressed.",
  follow_up_answered:  "You remembered. That's what makes the relationship feel real.",
};

export interface AwardResult {
  awarded:      number;
  newBalance:   number;
  description:  string;
  toastMessage: string;
  milestone?:   { threshold: number; message: string };
}

const MILESTONES = [100, 500, 1000, 2500, 5000, 10000];

function getMilestoneMessage(threshold: number): string {
  const m: Record<number, string> = {
    100:   "100 Brownie Points. You're investing in the people who matter.",
    500:   "500 Brownie Points. You're building something real here.",
    1000:  "1,000 Brownie Points. That's a lot of thoughtful moments.",
    2500:  "2,500 Brownie Points. The people in your life are lucky to have you.",
    5000:  "5,000 Brownie Points. A remarkable level of care.",
    10000: "10,000 Brownie Points. You've set the standard.",
  };
  return m[threshold] ?? `You've reached ${threshold.toLocaleString()} Brownie Points.`;
}

function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function countTodayActions(userId: string, actionType: BrownieActionType): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(browniePointTransactionsTable)
    .where(and(
      eq(browniePointTransactionsTable.userId, userId),
      eq(browniePointTransactionsTable.actionType, actionType),
      gte(browniePointTransactionsTable.createdAt, startOfDay()),
    ));
  return row?.count ?? 0;
}

async function countTodayActionsForRecipient(userId: string, actionType: BrownieActionType, recipientId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(browniePointTransactionsTable)
    .where(and(
      eq(browniePointTransactionsTable.userId, userId),
      eq(browniePointTransactionsTable.actionType, actionType),
      eq(browniePointTransactionsTable.recipientId, recipientId),
      gte(browniePointTransactionsTable.createdAt, startOfDay()),
    ));
  return row?.count ?? 0;
}

async function countAllTimeActionsForRecipient(userId: string, actionType: BrownieActionType, recipientId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(browniePointTransactionsTable)
    .where(and(
      eq(browniePointTransactionsTable.userId, userId),
      eq(browniePointTransactionsTable.actionType, actionType),
      eq(browniePointTransactionsTable.recipientId, recipientId),
    ));
  return row?.count ?? 0;
}

async function countAllTimeActions(userId: string, actionType: BrownieActionType): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(browniePointTransactionsTable)
    .where(and(
      eq(browniePointTransactionsTable.userId, userId),
      eq(browniePointTransactionsTable.actionType, actionType),
    ));
  return row?.count ?? 0;
}

export async function awardPoints(
  userId: string,
  actionType: BrownieActionType,
  opts?: { recipientId?: string },
): Promise<AwardResult | null> {
  try {
    // Anti-spam checks
    if (actionType === "fresh_update") {
      const recipientId = opts?.recipientId;
      if (!recipientId) return null;
      const todayCount = await countTodayActionsForRecipient(userId, "fresh_update", recipientId);
      if (todayCount >= 3) return null;
    } else if (actionType === "fresh_update_first") {
      const recipientId = opts?.recipientId;
      if (!recipientId) return null;
      const totalCount = await countAllTimeActionsForRecipient(userId, "fresh_update_first", recipientId);
      if (totalCount >= 1) return null;
    } else if (actionType === "card_generate") {
      const todayCount = await countTodayActions(userId, "card_generate");
      if (todayCount >= 5) return null;
    } else if (actionType === "card_send" || actionType === "card_send_early") {
      const todayCount = await countTodayActions(userId, "card_send");
      if (todayCount >= 3) return null;
    } else if (actionType === "profile_complete") {
      const recipientId = opts?.recipientId;
      if (!recipientId) return null;
      const totalCount = await countAllTimeActionsForRecipient(userId, "profile_complete", recipientId);
      if (totalCount >= 1) return null;
    } else if (actionType === "birthday_added") {
      const recipientId = opts?.recipientId;
      if (!recipientId) return null;
      const totalCount = await countAllTimeActionsForRecipient(userId, "birthday_added", recipientId);
      if (totalCount >= 1) return null;
    } else if (actionType === "anniversary_added") {
      const recipientId = opts?.recipientId;
      if (!recipientId) return null;
      const totalCount = await countAllTimeActionsForRecipient(userId, "anniversary_added", recipientId);
      if (totalCount >= 1) return null;
    } else if (actionType === "follow_up_answered") {
      const todayCount = await countTodayActions(userId, "follow_up_answered");
      if (todayCount >= 3) return null;
    }

    const points = POINT_VALUES[actionType];
    const description = ACTION_DESCRIPTIONS[actionType];

    await db.insert(browniePointTransactionsTable).values({
      id:          randomUUID(),
      userId,
      recipientId: opts?.recipientId ?? null,
      actionType,
      points,
      description,
    });

    await db
      .update(usersTable)
      .set({
        browniePointsBalance:  sql`${usersTable.browniePointsBalance} + ${points}`,
        lifetimeBrowniePoints: sql`${usersTable.lifetimeBrowniePoints} + ${points}`,
      })
      .where(eq(usersTable.id, userId));

    const [userRow] = await db
      .select({ balance: usersTable.browniePointsBalance })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    const newBalance = userRow?.balance ?? 0;
    const prevBalance = newBalance - points;

    let milestone: AwardResult["milestone"] | undefined;
    for (const threshold of MILESTONES) {
      if (prevBalance < threshold && newBalance >= threshold) {
        milestone = { threshold, message: getMilestoneMessage(threshold) };
        break;
      }
    }

    logger.info({ userId, actionType, points, newBalance }, "brownie-points: awarded");

    return {
      awarded:      points,
      newBalance,
      description,
      toastMessage: BROWNIE_TOAST_MESSAGES[actionType],
      milestone,
    };
  } catch (err) {
    logger.warn({ err, userId, actionType }, "brownie-points: award failed (non-fatal)");
    return null;
  }
}

export async function getBalance(userId: string): Promise<{ balance: number; lifetime: number }> {
  const [row] = await db
    .select({ balance: usersTable.browniePointsBalance, lifetime: usersTable.lifetimeBrowniePoints })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return { balance: row?.balance ?? 0, lifetime: row?.lifetime ?? 0 };
}
