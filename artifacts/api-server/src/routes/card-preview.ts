import { Router } from "express";
import { randomBytes } from "crypto";
import { db } from "@workspace/db";
import { cardPreviewsTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

function generateToken(): string {
  return randomBytes(9).toString("base64url");
}

function getBaseUrl(req: import("express").Request): string {
  // Prefer the first entry in REPLIT_DOMAINS (the canonical public domain)
  const replitDomains = process.env.REPLIT_DOMAINS;
  if (replitDomains) {
    const first = replitDomains.split(",")[0].trim();
    if (first) return `https://${first}`;
  }
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const proto = req.headers["x-forwarded-proto"] ?? (req.secure ? "https" : "http");
  return `${proto}://${host}`;
}

// ── Create a shareable preview ─────────────────────────────────────────────

router.post("/card-preview", async (req, res) => {
  const { imageUrl, cardName, messageText, recipientName, eventType } = req.body as {
    imageUrl: string;
    cardName?: string;
    messageText: string;
    recipientName: string;
    eventType: string;
  };

  if (!imageUrl || !messageText || !recipientName || !eventType) {
    res.status(400).json({ error: "imageUrl, messageText, recipientName, and eventType are required" });
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    await db.insert(cardPreviewsTable).values({
      token,
      imageUrl,
      cardName: cardName ?? "",
      messageText,
      recipientName,
      eventType,
      expiresAt,
    });

    const base = getBaseUrl(req);
    const url = `${base}/preview/${token}`;
    req.log.info({ token, recipientName, eventType }, "card-preview: created");
    res.json({ token, url });
  } catch (err) {
    req.log.error({ err }, "card-preview: create failed");
    res.status(500).json({ error: "Failed to create preview" });
  }
});

// ── Fetch a preview by token ───────────────────────────────────────────────

router.get("/card-preview/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Clean up expired rows opportunistically
    await db.delete(cardPreviewsTable).where(lt(cardPreviewsTable.expiresAt, new Date()));

    const [row] = await db
      .select()
      .from(cardPreviewsTable)
      .where(eq(cardPreviewsTable.token, token))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Preview not found or expired" });
      return;
    }

    res.json(row);
  } catch (err) {
    logger.error({ err, token }, "card-preview: fetch failed");
    res.status(500).json({ error: "Failed to fetch preview" });
  }
});

export default router;
