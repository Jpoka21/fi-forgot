/**
 * GET /api/v2/notifications
 *
 * Returns ranked relationship notifications from Brain decisions.
 * Internally runs executeBrain per owned recipient — does not expose Brain internals.
 */

import { Router } from "express";
import { db, recipientsTable } from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import { buildNotifications } from "../brain/product/buildNotifications";
import { executeBrain } from "../brain/orchestrator";
import { logger } from "../lib/logger";

const router = Router();

function requireUserId(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): string | null {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.status(401).json({ error: "x-user-id header required" }); return null; }
  return userId;
}

function formatRecipientName(recipient: {
  firstName: string;
  lastName: string | null;
  nickname: string | null;
}): string {
  if (recipient.nickname?.trim()) return recipient.nickname.trim();
  const last = recipient.lastName?.trim();
  return last ? `${recipient.firstName} ${last}` : recipient.firstName;
}

router.get("/v2/notifications", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const rows = await db
      .select({
        id: recipientsTable.id,
        firstName: recipientsTable.firstName,
        lastName: recipientsTable.lastName,
        nickname: recipientsTable.nickname,
      })
      .from(recipientsTable)
      .where(and(eq(recipientsTable.userId, userId), isNull(recipientsTable.archivedAt)));

    const payload = await buildNotifications({
      userId,
      recipients: rows.map((row) => ({
        recipientId: row.id,
        recipientName: formatRecipientName(row),
      })),
      runBrain: executeBrain,
    });

    logger.info({
      userId,
      recipientCount: rows.length,
      notificationCount: payload.notifications.length,
      unreadCount: payload.unreadCount,
    }, "v2-notifications");

    res.json(payload);
  } catch (err) {
    logger.error({ err, userId }, "v2-notifications failed");
    res.status(500).json({ error: "Failed to load notifications" });
  }
});

export default router;
