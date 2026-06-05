/**
 * Debug routes — development only.
 *
 * These routes are blocked in production. They expose internal data structures
 * that are useful during development but must never be reachable on the live site.
 *
 * Guard: every handler checks NODE_ENV and returns 404 if not "development".
 */

import { Router } from "express";
import { assembleRecipientContext } from "../services/recipient-context";
import { logger } from "../lib/logger";

const router = Router();

function requireDev(res: import("express").Response): boolean {
  if (process.env.NODE_ENV !== "development") {
    res.status(404).json({ error: "Not found" });
    return false;
  }
  return true;
}

function requireUserId(
  req: import("express").Request,
  res: import("express").Response,
): string | null {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) {
    res.status(401).json({ error: "x-user-id required" });
    return null;
  }
  return userId;
}

/**
 * GET /api/debug/recipient-context/:recipientId
 *
 * Returns the fully assembled intelligence context for a recipient.
 * Joins recipients, recipient_profile, question_answers, and personal_cards.
 *
 * Usage:
 *   curl localhost:80/api/debug/recipient-context/<id> -H "x-user-id: <uuid>"
 */
router.get("/debug/recipient-context/:recipientId", async (req, res) => {
  if (!requireDev(res)) return;
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { recipientId } = req.params;

  try {
    const context = await assembleRecipientContext(recipientId, userId);
    res.json(context);
  } catch (err) {
    logger.error({ err, recipientId }, "debug/recipient-context failed");
    res.status(500).json({ error: "Failed to assemble recipient context" });
  }
});

export default router;
