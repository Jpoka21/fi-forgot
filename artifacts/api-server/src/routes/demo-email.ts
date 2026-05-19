import { Router } from "express";
import { db, demoLeadsTable } from "@workspace/db";
import {
  sendDemoEmail,
  pickCard,
  writeMessage,
  mockCheckinQuestions,
  fetchMultipleCardImagesForOccasion,
} from "../services/sendgrid";
import { storeDemoPreview } from "../services/demo-preview-store";
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
const VALID_OCCASIONS = ["Birthday","Anniversary","Mother's Day","Father's Day","Valentine's Day","Christmas","Hanukkah","Thanksgiving","Easter","New Year's","Graduation","Work Anniversary","Just Because","Get Well Soon","Congratulations"];
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
  const appUrl = getAppUrl(req);

  // Compute all preview data up front
  const card = pickCard(safeOccasion, safePersonality, safeRelationship);
  const message = writeMessage(safeName, safeRelationship, safeOccasion, safePersonality);
  const checkinHtml = mockCheckinQuestions(safeOccasion, safePersonality, safeName);
  const cardImageUrls = await fetchMultipleCardImagesForOccasion(safeOccasion, 6, safeRelationship);
  const cardImageUrl = cardImageUrls[0] ?? null;

  // Store preview and build its URL (7-day TTL in memory)
  const previewId = storeDemoPreview({
    recipientName: safeName,
    relationship: safeRelationship,
    occasion: safeOccasion,
    personality: safePersonality,
    card,
    message,
    cardImageUrl,
    cardImageUrls,
    checkinHtml,
  });
  const previewUrl = `${appUrl}/demo/${previewId}`;

  try {
    await sendDemoEmail({ email: normalizedEmail, recipientName: safeName, occasion: safeOccasion, previewUrl });
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

  logger.info({ email: normalizedEmail, recipientName: safeName, occasion: safeOccasion, previewId }, "Demo email sent");
  res.json({ success: true, previewId, previewUrl });
});

export default router;
