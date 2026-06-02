import { Router } from "express";
import { openai } from "../lib/openai";
import { db, recipientMemoryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";

const router = Router();

// ── Archetype engine ─────────────────────────────────────────────────────────

const PROFESSIONAL_RELS = ["coworker","employee","boss","client","teacher","coach"];

function determineArchetypes(
  relationship: string,
  occasion: string,
  objective: string,
  tone: string,
): string[] {
  const rel = relationship.toLowerCase();
  const occ = occasion.toLowerCase();
  const obj = objective.toLowerCase();
  const t = tone.toLowerCase();

  const archetypes: string[] = [];

  if (t.includes("roast") || obj.includes("roast")) archetypes.push("Roast");
  if (t === "romantic" || occ === "anniversary" || occ === "valentine's day") archetypes.push("Love");
  if (obj.includes("appreciate") || obj.includes("grateful") || t === "heartfelt" || t === "warm") archetypes.push("Appreciation");
  if (obj.includes("memory") || t === "nostalgic") archetypes.push("Nostalgia");
  if (obj.includes("proud") || obj.includes("celebrate")) archetypes.push("Pride");
  if (obj.includes("encourage") || t === "encouraging") archetypes.push("Encouragement");
  if (obj.includes("comfort") || occ === "sympathy" || occ === "get well") archetypes.push("Comfort");
  if (occ === "thank you") archetypes.push("Gratitude");
  if (occ === "apology") archetypes.push("Apology");
  if (PROFESSIONAL_RELS.includes(rel) || obj.includes("recogniz")) archetypes.push("Recognition");
  if (["birthday","graduation","congratulations","retirement","new baby","wedding"].includes(occ)) archetypes.push("Celebration");
  if (obj.includes("laugh") || t === "funny") archetypes.push("Simple Check In");

  return archetypes.length > 0 ? archetypes : ["Appreciation"];
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildSystemPrompt(
  firstName: string,
  relationship: string,
  occasion: string,
  archetypes: string[],
  avoidList: string[],
): string {
  const rel = relationship.toLowerCase();
  const isPro = PROFESSIONAL_RELS.includes(rel);

  const relRules = isPro
    ? `This is a professional relationship. No romantic language. No emotional dependency language. No aggressive roasting. Keep it warm, appropriate, and professional.`
    : rel.includes("friend")
    ? `Write for a friendship. Favor teasing, inside jokes, shared history, and understated appreciation. A card to a best friend should not sound like a Hallmark card.`
    : ["mom","dad"].includes(rel)
    ? `Write for a parent. Favor gratitude, life lessons, sacrifice, and pride. Make it feel earned, not generic.`
    : ["husband","wife","boyfriend","girlfriend"].includes(rel)
    ? `Write for a spouse or partner. Favor real life details and specific moments over generic romance. Make it personal.`
    : ["brother","sister"].includes(rel)
    ? `Write for a sibling. Mix annoyance and loyalty. Only siblings know how to tease and still be sincere at the same time.`
    : ["son","daughter"].includes(rel)
    ? `Write as a parent to their child. Favor pride, warmth, encouragement, and real moments.`
    : `Write for a personal relationship. Be genuine and specific to what we know about this person.`;

  const avoidStr = avoidList.length > 0
    ? `\nAVOID ABSOLUTELY: ${avoidList.join(", ")}. Cards that sound like any of these will be rejected.`
    : "";

  const archetypeStr = archetypes.join(" + ");

  return `You are a professional card writer for F*I Forgot — a concierge card service that writes cards people actually want to send.

Relationship: ${relationship} (${archetypeStr} card)
${relRules}

Rules:
- Write like the sender themselves wrote it — specific, personal, never generic
- Use relationship type heavily — a card to a ${relationship} reads nothing like a card to anyone else
- Use specific details provided — if the sender gave us memories, stories, or facts, those go in the card
- NEVER use clichés: "words cannot express", "on this special day", "from the bottom of my heart", "rare person", "one of a kind", "impossible not to like"
- Each of the 3 versions must have a COMPLETELY different opening line — different structure, different angle
- Do not overuse sentimental language when the relationship calls for humor or lightness
- Cards should feel earned, not manufactured${avoidStr}`;
}

function buildUserPrompt(
  firstName: string,
  relationship: string,
  occasion: string,
  objective: string,
  emotionalOpenness: string,
  tone: string,
  details: string | undefined,
  avoidMentioning: string | undefined,
  relAnswers: Record<string, string> | undefined,
  senderName: string,
): string {
  const contextLines: string[] = [];
  const rel = relationship.toLowerCase();

  if (relAnswers && Object.keys(relAnswers).length > 0) {
    contextLines.push("--- Relationship profile (use as raw material) ---");
    for (const [key, val] of Object.entries(relAnswers)) {
      if (val?.trim()) contextLines.push(`  ${key}: ${val}`);
    }
  }
  if (details?.trim()) contextLines.push(`Memories / specific details to include: ${details}`);
  if (avoidMentioning?.trim()) contextLines.push(`NEVER mention: ${avoidMentioning}`);

  const context = contextLines.length > 0
    ? `\nWhat we know about ${firstName}:\n${contextLines.join("\n")}\n`
    : "";

  const emotional = emotionalOpenness.toLowerCase();
  const emotionGuide =
    emotional.includes("just funny") ? "Keep emotion to zero — pure humor." :
    emotional.includes("little appreciation") ? "Add just one genuine line of appreciation at the very end." :
    emotional.includes("not mushy") ? "Be meaningful but keep it grounded — no over-the-top sentiment." :
    emotional.includes("heartfelt") ? "Go clearly heartfelt — let the real feeling show." :
    emotional.includes("deep") ? "Go deep and emotional — this is the full version." :
    "Be genuine but not excessive.";

  const isPro = PROFESSIONAL_RELS.includes(rel);

  const options = isPro ? [
    { label: "Best Match", desc: `Closest to what was asked — professional, warm, appropriate for ${relationship}.` },
    { label: "More Casual", desc: `Warmer and slightly more personal — still appropriate for work.` },
    { label: "More Heartfelt", desc: `More genuine and human — the version that actually means something.` },
  ] : [
    { label: "Best Match", desc: `Closest to inputs. ${tone} tone. ${emotionGuide}` },
    { label: "More Casual", desc: `Looser and funnier — lighter touch, makes them smile first.` },
    { label: "More Heartfelt", desc: `Goes a little deeper — the version they might keep.` },
  ];

  const optionBlock = options.map(o => `Option: "${o.label}" — ${o.desc}`).join("\n");

  return `Write 3 versions of a ${occasion} card for ${firstName} (${relationship}).
${context}
Occasion: ${occasion}
Main objective: ${objective}
Requested tone: ${tone}
Emotional level: ${emotionGuide}

${optionBlock}

Write as ${senderName} speaking directly to ${firstName}.
Each version must open completely differently — different angle, different voice.
Return valid JSON only:
{
  "cards": [
    { "tone": "Best Match", "text": "..." },
    { "tone": "More Casual", "text": "..." },
    { "tone": "More Heartfelt", "text": "..." }
  ]
}
Use \\n for line breaks. No markdown. JSON only.`;
}

// ── Completeness calc ─────────────────────────────────────────────────────────

function calcCompleteness(relAnswers: Record<string, string>, details: string): number {
  let score = 30; // base: has name + relationship
  if (Object.keys(relAnswers).length >= 1) score += 20;
  if (Object.keys(relAnswers).length >= 2) score += 10;
  if (details?.trim()) score += 30;
  return Math.min(score, 100);
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.post("/api/v2/generate-card", async (req, res) => {
  const {
    firstName,
    relationship,
    occasion,
    objective = "Tell Them I Appreciate Them",
    tone = "Heartfelt",
    emotionalOpenness = "Meaningful But Not Mushy",
    avoidList = [],
    details,
    avoidMentioning,
    relAnswers = {},
    senderName = "Me",
    recipientId,
  } = req.body as {
    firstName: string;
    relationship: string;
    occasion: string;
    objective?: string;
    tone?: string;
    emotionalOpenness?: string;
    avoidList?: string[];
    details?: string;
    avoidMentioning?: string;
    relAnswers?: Record<string, string>;
    senderName?: string;
    recipientId?: string;
  };

  if (!firstName || !relationship || !occasion) {
    res.status(400).json({ error: "firstName, relationship, and occasion are required" });
    return;
  }

  const archetypes = determineArchetypes(relationship, occasion, objective, tone);
  logger.info({ firstName, relationship, occasion, archetypes }, "v2-generate-card: archetypes determined");

  const systemPrompt = buildSystemPrompt(firstName, relationship, occasion, archetypes, avoidList);
  const userPrompt = buildUserPrompt(firstName, relationship, occasion, objective, emotionalOpenness, tone, details, avoidMentioning, relAnswers, senderName);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 2400,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: { cards: { tone: string; text: string }[] };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      logger.error({ raw }, "v2-generate-card: JSON parse failed");
      res.status(500).json({ error: "Failed to parse card response" });
      return;
    }

    // Save card preferences to recipient memory if recipientId provided
    if (recipientId) {
      try {
        const completeness = calcCompleteness(relAnswers, details ?? "");
        await db
          .insert(recipientMemoryTable)
          .values({
            id: randomUUID(),
            recipientId,
            cardFuel: { details, avoidMentioning, relAnswers },
            cardPreferences: { preferredTone: tone, emotionalOpenness, avoidList, archetype: archetypes[0] },
            profileCompleteness: completeness,
          })
          .onConflictDoUpdate({
            target: recipientMemoryTable.recipientId,
            set: {
              cardFuel: { details, avoidMentioning, relAnswers },
              cardPreferences: { preferredTone: tone, emotionalOpenness, avoidList, archetype: archetypes[0] },
              profileCompleteness: completeness,
              updatedAt: new Date(),
            },
          });
      } catch (memErr) {
        logger.warn({ memErr }, "v2-generate-card: failed to save memory (non-fatal)");
      }
    }

    logger.info({ firstName, occasion, cardCount: parsed.cards?.length }, "v2-generate-card: success");
    res.json(parsed);
  } catch (err) {
    logger.error({ err }, "v2-generate-card: OpenAI call failed");
    res.status(500).json({ error: "Card generation failed" });
  }
});

// ── Feedback save ─────────────────────────────────────────────────────────────

router.post("/api/v2/card-feedback", async (req, res) => {
  const { recipientId, feedback } = req.body as { recipientId: string; feedback: string };
  if (!recipientId || !feedback) { res.status(400).json({ error: "recipientId and feedback required" }); return; }

  try {
    const [existing] = await db
      .select()
      .from(recipientMemoryTable)
      .where(eq(recipientMemoryTable.recipientId, recipientId))
      .limit(1);

    if (existing) {
      const prefs = (existing.cardPreferences as Record<string, unknown>) ?? {};
      const feedbackList = Array.isArray(prefs.feedbackHistory) ? prefs.feedbackHistory : [];
      feedbackList.push({ feedback, ts: new Date().toISOString() });

      await db
        .update(recipientMemoryTable)
        .set({
          cardPreferences: { ...prefs, feedbackHistory: feedbackList },
          updatedAt: new Date(),
        })
        .where(eq(recipientMemoryTable.recipientId, recipientId));
    }
    res.json({ ok: true });
  } catch (err) {
    logger.warn({ err }, "v2-card-feedback: failed (non-fatal)");
    res.json({ ok: false });
  }
});

// ── Single-card refine ────────────────────────────────────────────────────────

router.post("/api/v2/refine-card", async (req, res) => {
  const { cardText, instruction, context } = req.body as {
    cardText: string;
    instruction: string;
    context?: string;
  };
  if (!cardText || !instruction) {
    res.status(400).json({ error: "cardText and instruction required" });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 600,
      messages: [
        {
          role: "system",
          content:
            "You are refining a greeting card. Apply the requested change while preserving the sender's personal voice and core message. " +
            "Do NOT add clichés or generic greeting-card language. Return ONLY the refined card text — no labels, no explanation.",
        },
        {
          role: "user",
          content: `Context: ${context ?? "personal card"}\n\nOriginal card:\n${cardText}\n\nChange requested: ${instruction}\n\nReturn only the refined card text.`,
        },
      ],
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? cardText;
    res.json({ text });
  } catch (err) {
    logger.warn({ err }, "v2-refine-card: failed");
    res.json({ text: cardText }); // graceful fallback — return original
  }
});

export default router;
