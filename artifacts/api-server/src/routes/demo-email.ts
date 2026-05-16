import { Router } from "express";
import { and, eq, gt } from "drizzle-orm";
import OpenAI from "openai";
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

const CARD_STYLES: Record<string, {
  bgColor: string; titleColor: string; accentColor: string; title: string; seriesLabel: string;
}> = {
  "Funny":        { bgColor: "#1a1a1a", titleColor: "#ffffff", accentColor: "rgba(255,255,255,0.4)", title: "Don't Be Dave Edition",          seriesLabel: "HUMOR SERIES"          },
  "Sweet":        { bgColor: "#f5ede0", titleColor: "#3d2b1f", accentColor: "#c4966a",               title: "The 'I Actually Mean It' Card",   seriesLabel: "SWEET SERIES"          },
  "Romantic":     { bgColor: "#6b0f1a", titleColor: "#fff8f0", accentColor: "rgba(255,248,240,0.5)", title: "The Screenshot-This Edition",     seriesLabel: "ROMANTIC SERIES"       },
  "Heartfelt":    { bgColor: "#1a2540", titleColor: "#e8edf8", accentColor: "rgba(232,237,248,0.5)", title: "The 'Read Twice' Card",           seriesLabel: "HEARTFELT SERIES"      },
  "Classy":       { bgColor: "#f9f9f6", titleColor: "#1a1a1a", accentColor: "#888888",               title: "The Quietly Thoughtful Card",     seriesLabel: "CLASSIC SERIES"        },
  "Apologetic":   { bgColor: "#2d2d2d", titleColor: "#f0f0f0", accentColor: "rgba(240,240,240,0.4)", title: "The 'I Know, I Know' Card",       seriesLabel: "DAMAGE CONTROL SERIES" },
  "Please don't make me sleep outside": {
    bgColor: "#E23B2E", titleColor: "#ffffff", accentColor: "rgba(255,255,255,0.55)",
    title: "Emergency Response Edition", seriesLabel: "EMERGENCY SERIES",
  },
};
const DEFAULT_CARD = { bgColor: "#1a1a1a", titleColor: "#ffffff", accentColor: "rgba(255,255,255,0.4)", title: "The 'I Actually Remembered' Card", seriesLabel: "STANDARD SERIES" };

function pickCard(vibe: string) {
  return CARD_STYLES[vibe] ?? DEFAULT_CARD;
}

function getCardWhy(recipientType: string, occasionType: string, vibe: string): string {
  const reasons: Record<string, string> = {
    "Funny":        "warm, funny, and safe",
    "Sweet":        "genuine and warm",
    "Romantic":     "sweeping and personal",
    "Heartfelt":    "quiet, real, and meaningful",
    "Classy":       "elegant and understated",
    "Apologetic":   "sincere and self-aware",
    "Please don't make me sleep outside": "a credible emergency-level olive branch",
  };
  return `It's ${reasons[vibe] ?? "appropriate"} for a ${occasionType} for your ${recipientType}. Picked because it says what you mean without giving gas-station-card energy.`;
}

function generateFallbackMessage(recipientType: string, occasionType: string, vibe: string, personalDetail: string | null): string {
  const openers: Record<string, string> = {
    "Funny":        "Look, I know my track record isn't perfect. But I remembered this time, which I think we can all agree is growth.",
    "Sweet":        "I don't say it enough, but I mean it every time I do. You deserve more than a card, but this is a start.",
    "Romantic":     "There are a lot of things I'm not great at. Appreciating you isn't one of them.",
    "Heartfelt":    "Some things are hard to say out loud, so I'm letting this card say them instead.",
    "Classy":       "This isn't the grandest gesture — but I hope it says exactly what I mean.",
    "Apologetic":   "Okay. I know. I dropped the ball. You deserve better than that, and I know it.",
    "Please don't make me sleep outside": "So. Full transparency: I almost forgot. But I didn't. I caught it. That counts for something. Please.",
  };
  const opener = openers[vibe] ?? `Happy ${occasionType}.`;
  const closer = personalDetail
    ? `${personalDetail.endsWith(".") ? personalDetail : personalDetail + "."} I'm grateful for you every day.`
    : `Happy ${occasionType}. Genuinely.`;
  return `${opener}\n\n${closer}\n\n— [Your Name]`;
}

async function generateAIMessage(opts: {
  recipientType: string; occasionType: string; vibe: string; personalDetail: string | null;
}): Promise<string> {
  const baseURL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  if (!baseURL || !apiKey) throw new Error("OpenAI not configured");

  const openai = new OpenAI({ baseURL, apiKey });

  const vibeInstructions: Record<string, string> = {
    "Funny":        "Make them laugh. Self-deprecating humor works. Still land with real feeling underneath the joke.",
    "Sweet":        "Warm and genuine. Show real appreciation without being over-the-top. Notice the small things.",
    "Romantic":     "Go big. Sweeping and emotional. The version they'd screenshot and send to friends.",
    "Heartfelt":    "Quiet and real. Says more by saying less. Doesn't try too hard.",
    "Classy":       "Elegant and understated. Timeless. Not showy.",
    "Apologetic":   "Own it fully. Sincere without being dramatic. A little self-awareness goes a long way.",
    "Please don't make me sleep outside": "You're in trouble and you know it. Funny, apologetic, slightly desperate — but ends with genuine warmth.",
  };

  const systemPrompt = `You are a professional greeting card writer for F.I. Forgot — a concierge card service that writes personalized cards for busy people who care but sometimes forget.
Your cards sound human, never corporate. Never use clichés like "on this special day," "words cannot express," or "from the bottom of my heart."
Write in first person as the card sender. Keep it warm, specific, and genuinely personal when details are provided.
4-7 sentences maximum. End with "— [Your Name]" on its own line.`;

  const userPrompt = `Write a ${opts.vibe} ${opts.occasionType} card for someone's ${opts.recipientType}.
Vibe direction: ${vibeInstructions[opts.vibe] ?? "Be genuine and thoughtful."}
${opts.personalDetail ? `Personal detail to incorporate naturally: "${opts.personalDetail}"` : "No personal detail provided — write a strong, personal-feeling message anyway."}
Return only the card message text. No JSON, no markdown, no explanation.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 400,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("Empty OpenAI response");
  return text;
}

router.post("/demo-email", async (req, res) => {
  const { recipientType, occasionType, vibe, personalDetail, email, marketingConsent, honeypot } = req.body as {
    recipientType?: string; occasionType?: string; vibe?: string;
    personalDetail?: string; email?: string; marketingConsent?: boolean; honeypot?: string;
  };

  if (honeypot) { res.json({ success: true }); return; }

  if (!recipientType || !occasionType || !vibe || !email) {
    res.status(400).json({ error: "missing_fields", message: "Dave skipped a step. Don't be Dave." });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "invalid_email", message: "That email looks a little too Dave. Try again." });
    return;
  }

  const safeDetail = personalDetail
    ? String(personalDetail).replace(/<[^>]*>/g, "").trim().slice(0, 500) || null
    : null;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await db
      .select({ id: demoLeadsTable.id })
      .from(demoLeadsTable)
      .where(and(eq(demoLeadsTable.email, normalizedEmail), gt(demoLeadsTable.createdAt, oneDayAgo)))
      .limit(1);
    if (existing.length > 0) {
      res.status(429).json({ error: "duplicate", message: "We already sent you the demo. Check your inbox before Dave checks his excuses." });
      return;
    }
  } catch (err) {
    req.log.warn({ err }, "Rate limit check failed, proceeding");
  }

  let messageText: string;
  try {
    messageText = await generateAIMessage({ recipientType, occasionType, vibe, personalDetail: safeDetail });
  } catch (err) {
    req.log.warn({ err }, "AI generation failed, using fallback");
    messageText = generateFallbackMessage(recipientType, occasionType, vibe, safeDetail);
  }

  const card = pickCard(vibe);
  const cardWhy = getCardWhy(recipientType, occasionType, vibe);
  const appUrl = getAppUrl(req);

  try {
    await sendDemoEmail({
      email: normalizedEmail,
      recipientType,
      occasionType,
      vibe,
      messageText,
      card,
      cardWhy,
      appUrl,
      marketingConsent: Boolean(marketingConsent),
    });
  } catch (err) {
    req.log.error({ err }, "Demo email send failed");
    res.status(500).json({ error: "send_failed", message: "Something broke. Probably Dave. Try again in a minute." });
    return;
  }

  try {
    const id = `dl_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await db.insert(demoLeadsTable).values({
      id,
      email: normalizedEmail,
      recipientType,
      occasionType,
      vibe,
      personalDetail: safeDetail,
      marketingConsent: Boolean(marketingConsent),
      lastDemoEmailSentAt: new Date(),
      demoEmailSendCount: 1,
    });
  } catch (err) {
    req.log.warn({ err }, "Failed to store demo lead — email was still sent");
  }

  logger.info({ email: normalizedEmail, recipientType, occasionType, vibe }, "Demo email sent");
  res.json({ success: true });
});

export default router;
