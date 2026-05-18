import { Router } from "express";
import { and, eq, gt } from "drizzle-orm";
import { db, demoLeadsTable } from "@workspace/db";
import { sendDemoEmail } from "../services/sendgrid";
import { logger } from "../lib/logger";

const router = Router();

function getAppUrl(req: import("express").Request): string {
  const domains = process.env["REPLIT_DOMAINS"];
  if (domains) return `https://${domains.split(",")[0].trim()}`;
  const devDomain = process.env["REPLIT_DEV_DOMAIN"];
  if (devDomain) return `https://${devDomain}`;
  return `${req.protocol}://${req.get("host")}`;
}

const VALID_RELATIONSHIPS = ["Spouse / Partner","Parent","Child","Sibling","Friend","Coworker","Other"];
const VALID_OCCASIONS = ["Upcoming Birthday","Anniversary","Just Because","Holiday / Christmas","Thank You","Thinking of You"];
const VALID_PERSONALITIES = ["Sentimental & Heartfelt","Funny & Witty","Warm & Nurturing","Down-to-Earth & Practical"];

router.post("/demo-email", async (req, res) => {
  const { email, recipientName, relationship, occasion, personality, honeypot } = req.body as {
    email?: string; recipientName?: string; relationship?: string;
    occasion?: string; personality?: string; honeypot?: string;
  };

  if (honeypot) { res.json({ success: true }); return; }

  if (!email || !recipientName || !relationship || !occasion || !personality) {
    res.status(400).json({ error: "missing_fields", message: "Please fill in all fields." });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "invalid_email", message: "That email address doesn't look right." });
    return;
  }

  const safeName = String(recipientName).replace(/<[^>]*>/g, "").trim().slice(0, 100);
  if (!safeName) {
    res.status(400).json({ error: "missing_fields", message: "Please enter the recipient's name." });
    return;
  }

  const safeRelationship = VALID_RELATIONSHIPS.includes(relationship) ? relationship : "Friend";
  const safeOccasion = VALID_OCCASIONS.includes(occasion) ? occasion : "Just Because";
  const safePersonality = VALID_PERSONALITIES.includes(personality) ? personality : "Warm & Nurturing";
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await db
      .select({ id: demoLeadsTable.id })
      .from(demoLeadsTable)
      .where(and(eq(demoLeadsTable.email, normalizedEmail), gt(demoLeadsTable.createdAt, oneDayAgo)))
      .limit(1);
    if (existing.length > 0) {
      res.status(429).json({ error: "duplicate", message: "We already sent you a demo. Check your inbox." });
      return;
    }
  } catch (err) {
    req.log.warn({ err }, "Rate limit check failed, proceeding");
  }

  const appUrl = getAppUrl(req);

  try {
    await sendDemoEmail({
      email: normalizedEmail,
      recipientName: safeName,
      relationship: safeRelationship,
      occasion: safeOccasion,
      personality: safePersonality,
      appUrl,
    });
  } catch (err) {
    req.log.error({ err }, "Demo email send failed");
    res.status(500).json({ error: "send_failed", message: "Something went wrong sending the demo. Try again in a minute." });
    return;
  }

  try {
    const id = `dl_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await db.insert(demoLeadsTable).values({
      id,
      email: normalizedEmail,
      recipientName: safeName,
      relationship: safeRelationship,
      occasion: safeOccasion,
      personality: safePersonality,
      lastDemoEmailSentAt: new Date(),
      demoEmailSendCount: 1,
    });
  } catch (err) {
    req.log.warn({ err }, "Failed to store demo lead — email was still sent");
  }

  logger.info({ email: normalizedEmail, recipientName: safeName, occasion: safeOccasion }, "Demo email sent");
  res.json({ success: true });
});

export default router;
