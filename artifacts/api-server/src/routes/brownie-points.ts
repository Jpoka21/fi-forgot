import { Router } from "express";
import { db, usersTable, browniePointTransactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { logger } from "../lib/logger";
import { awardPoints, type BrownieActionType } from "../services/brownie-points";

const router = Router();

function requireUserId(
  req: Parameters<Parameters<typeof router.get>[1]>[0],
  res: Parameters<Parameters<typeof router.get>[1]>[1],
): string | null {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.status(401).json({ error: "x-user-id header required" }); return null; }
  return userId;
}

// ── GET balance + recent history ──────────────────────────────────────────────

router.get("/v2/brownie-points/balance", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const [user] = await db
    .select({ balance: usersTable.browniePointsBalance, lifetime: usersTable.lifetimeBrowniePoints })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const recent = await db
    .select()
    .from(browniePointTransactionsTable)
    .where(eq(browniePointTransactionsTable.userId, userId))
    .orderBy(desc(browniePointTransactionsTable.createdAt))
    .limit(30);

  res.json({
    balance:  user?.balance  ?? 0,
    lifetime: user?.lifetime ?? 0,
    recent,
  });
});

// ── POST client-side award (card_send only) ───────────────────────────────────

const ALLOWED_CLIENT_ACTIONS: BrownieActionType[] = ["card_send", "card_send_early"];

router.post("/v2/brownie-points/award", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { actionType, recipientId } = req.body as {
    actionType?: string;
    recipientId?: string;
  };

  if (!actionType || !ALLOWED_CLIENT_ACTIONS.includes(actionType as BrownieActionType)) {
    res.status(400).json({ error: "Invalid actionType" });
    return;
  }

  try {
    const result = await awardPoints(userId, actionType as BrownieActionType, {
      recipientId: recipientId ?? undefined,
    });
    res.json({ browniePoints: result });
  } catch (err) {
    logger.warn({ err, userId, actionType }, "brownie-points: client award failed");
    res.json({ browniePoints: null });
  }
});

export default router;
