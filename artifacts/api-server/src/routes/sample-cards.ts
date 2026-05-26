import { Router } from "express";
import OpenAI from "openai";
import { db, cardClassificationsTable, sampleCardMessagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// ── Category derivation ────────────────────────────────────────────────────────
// Only three categories are supported for business cards.

function deriveCategory(occasions: string[]): string | null {
  const lower = occasions.map((o) => o.toLowerCase());
  if (lower.some((o) => o.includes("birthday"))) return "Birthday";
  if (lower.some((o) =>
    o.includes("christmas") || o.includes("holiday") ||
    o.includes("hanukkah") || o.includes("thanksgiving") || o.includes("new year")
  )) return "Holiday";
  if (lower.some((o) =>
    o.includes("work anniversary") || o.includes("business anniversary") ||
    o.includes("job anniversary") || o.includes("client anniversary") ||
    o.includes("work milestone")
  )) return "Anniversary";
  return null; // filtered out — not a category we send
}

function bestForText(category: string): string {
  const map: Record<string, string> = {
    "Birthday":     "Best for client birthdays",
    "Holiday":      "Best for seasonal greetings",
    "Anniversary":  "Best for client work milestones",
  };
  return map[category] ?? "Best for client moments";
}

const FALLBACK_MESSAGES: Record<string, string> = {
  "Birthday":    "Happy Birthday. I hope you have a great day and a year ahead filled with good things. It's a pleasure staying connected — wishing you all the best.",
  "Holiday":     "Wishing you and your family a wonderful holiday season. I hope this time of year brings you a chance to relax, recharge, and enjoy the people who matter most.",
  "Anniversary": "Congratulations on reaching another milestone. It means a lot to be part of your journey — wishing you continued success in the year ahead.",
};

// ── GET /sample-cards ──────────────────────────────────────────────────────────

router.get("/sample-cards", async (req, res) => {
  try {
    const rows = await db
      .select({
        imageUrl:   cardClassificationsTable.imageUrl,
        occasions:  cardClassificationsTable.occasions,
        keywords:   cardClassificationsTable.keywords,
      })
      .from(cardClassificationsTable)
      .where(eq(cardClassificationsTable.skip, false))
      .limit(120);

    const cards = rows
      .filter((r) => r.occasions.length > 0 || r.imageUrl)
      .flatMap((r) => {
        const category = deriveCategory(r.occasions);
        if (!category) return []; // skip cards that don't fit Birthday / Holiday / Anniversary
        return [{
          imageUrl:        r.imageUrl,
          category,
          bestFor:         bestForText(category),
          occasions:       r.occasions,
          fallbackMessage: FALLBACK_MESSAGES[category] ?? "",
        }];
      });

    res.json({ cards });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch sample cards");
    res.status(500).json({ error: "Failed to load cards" });
  }
});

// ── POST /sample-card-message ──────────────────────────────────────────────────

router.post("/sample-card-message", async (req, res) => {
  const {
    cardImageUrl      = "",
    category          = "General Follow Up",
    tone              = "Professional",
    businessType      = "",
    recipientType     = "Client",
    relationshipContext = "",
  } = req.body as {
    cardImageUrl?: string;
    category?: string;
    tone?: string;
    businessType?: string;
    recipientType?: string;
    relationshipContext?: string;
  };

  // Check cache first
  if (cardImageUrl) {
    const cached = await db
      .select()
      .from(sampleCardMessagesTable)
      .where(
        and(
          eq(sampleCardMessagesTable.cardImageUrl, cardImageUrl),
          eq(sampleCardMessagesTable.category, category),
          eq(sampleCardMessagesTable.tone, tone),
          eq(sampleCardMessagesTable.businessType, businessType),
          eq(sampleCardMessagesTable.recipientType, recipientType),
          eq(sampleCardMessagesTable.relationshipContext, relationshipContext),
        )
      )
      .limit(1);

    if (cached.length > 0) {
      res.json({ message: cached[0].message, cached: true });
      return;
    }
  }

  const prompt = `Write a short handwritten card message for a business to send to a client.

Occasion: ${category}
Tone: ${tone}
Business type: ${businessType || "business"}
Recipient type: ${recipientType}
${relationshipContext ? `Relationship context: ${relationshipContext}` : ""}

Rules:
- Sound human, warm, and natural — like a real person wrote it
- Keep it under 55 words
- Do not mention AI, automation, or technology
- Do not use sales language or overpromise
- Match the occasion and tone precisely
- Do not address the recipient by name (left blank for personalization)
- Write in first person singular ("I" or "we")
- Output ONLY the message text. No quotes, no labels.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 150,
      messages: [
        {
          role: "system",
          content: "You write natural, concise handwritten greeting card messages for businesses. The message should feel thoughtful, personal, and appropriate for a real client relationship.",
        },
        { role: "user", content: prompt },
      ],
    });

    const message = completion.choices[0]?.message?.content?.trim() ?? FALLBACK_MESSAGES[category] ?? "";

    // Cache it
    if (cardImageUrl && message) {
      await db.insert(sampleCardMessagesTable).values({
        cardImageUrl,
        category,
        tone,
        businessType,
        recipientType,
        relationshipContext,
        message,
        createdAt: Date.now(),
      }).onConflictDoNothing();
    }

    res.json({ message, cached: false });
  } catch (err) {
    req.log.error({ err }, "Failed to generate sample card message");
    const fallback = FALLBACK_MESSAGES[category] ?? "";
    res.json({ message: fallback, cached: false, fallback: true });
  }
});

export default router;
