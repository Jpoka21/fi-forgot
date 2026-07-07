/**
 * Brain debug routes — development only.
 *
 * Exposes the Brain orchestrator output for internal inspection.
 * Blocked in production via requireDev().
 *
 * Usage:
 *   curl localhost:80/api/debug/brain/<recipientId> -H "x-user-id: <uuid>"
 */

import { Router } from "express";
import { runBrain } from "../index";
import { logger } from "../../lib/logger";

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
 * GET /api/debug/brain/:recipientId
 *
 * Returns the raw BrainResponse from runBrain().
 */
router.get("/debug/brain/:recipientId", async (req, res) => {
  if (!requireDev(res)) return;
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { recipientId } = req.params;

  try {
    const response = await runBrain(recipientId, userId);

    logger.info({ recipientId, outcome: response.decision.outcome }, "debug/brain");

    res.json(response);
  } catch (err) {
    logger.error({ err, recipientId }, "debug/brain failed");
    res.status(500).json({ error: "Failed to run brain" });
  }
});

export default router;
