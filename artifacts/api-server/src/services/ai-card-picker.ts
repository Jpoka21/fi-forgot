/**
 * AI-powered card picker.
 *
 * Uses the card_classifications DB table (occasion labels) joined with
 * the live Handwrytten catalog (card IDs + images) to find the best card.
 *
 * Strategy:
 *  1. Fetch live Handwrytten cards (id + imageUrl + name)
 *  2. Join with card_classifications by imageUrl to get occasion tags
 *  3. Score cards based on event type + contextNote
 *  4. When context is ambiguous, ask GPT to pick from the top candidates
 */

import OpenAI from "openai";
import { db } from "@workspace/db";
import { cardClassificationsTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { listHandwryttenCards, type HandwryttenCard } from "./handwrytten";
import { logger } from "../lib/logger";

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

// Occasions that indicate a romantic/wedding card — avoid for business contexts
const ROMANTIC_OCCASIONS = new Set(["Valentine's Day"]);
// Pure-anniversary-only cards are usually wedding cards
function isRomantic(occasions: string[]): boolean {
  if (occasions.some(o => ROMANTIC_OCCASIONS.has(o))) return true;
  // If the only occasion is "Anniversary" with no "Just Because" safety, likely wedding
  if (occasions.length === 1 && occasions[0] === "Anniversary") return true;
  return false;
}

interface EnrichedCard extends HandwryttenCard {
  occasions: string[];
}

async function enrichCards(cards: HandwryttenCard[]): Promise<EnrichedCard[]> {
  const imageUrls = cards.map(c => c.imageUrl ?? "").filter(Boolean);
  if (!imageUrls.length) return cards.map(c => ({ ...c, occasions: [] }));

  const rows = await db
    .select({ imageUrl: cardClassificationsTable.imageUrl, occasions: cardClassificationsTable.occasions })
    .from(cardClassificationsTable)
    .where(inArray(cardClassificationsTable.imageUrl, imageUrls));

  const byUrl = new Map(rows.map(r => [r.imageUrl, r.occasions as string[] ?? []]));
  return cards.map(c => ({ ...c, occasions: byUrl.get(c.imageUrl ?? "") ?? [] }));
}

/**
 * Score a card for a given event + context.
 * Higher = better match.
 */
function scoreCard(card: EnrichedCard, eventType: string, contextNote: string | null): number {
  const occ = card.occasions;
  const name = (card.name ?? "").toLowerCase();
  const ctx  = (contextNote ?? "").toLowerCase();
  let score = 0;

  // Hard exclude romantic cards in all cases (this is a business service)
  if (isRomantic(occ)) return -999;

  const isHomeContext = ctx.includes("home") || ctx.includes("house") || ctx.includes("property") || ctx.includes("real estate") || ctx.includes("mortgage");
  const isWorkContext = ctx.includes("work") || ctx.includes("job") || ctx.includes("career") || ctx.includes("business") || ctx.includes("compan");
  const isPersonalAnniversary = eventType === "Anniversary" && !isHomeContext && !isWorkContext;

  // Perfect name match for home
  if (isHomeContext && (name.includes("home") || name.includes("house") || name.includes("housiversary"))) score += 100;

  // Occasion scoring
  if (eventType === "Birthday" && occ.includes("Birthday")) score += 50;
  if (eventType === "Happy Holidays" && occ.includes("Holiday")) score += 50;
  if (eventType === "Anniversary") {
    if (isHomeContext && occ.includes("Just Because")) score += 40;
    if (isWorkContext && (occ.includes("Work Anniversary") || occ.includes("Just Because"))) score += 40;
    if (isPersonalAnniversary && occ.includes("Anniversary") && occ.includes("Just Because")) score += 40;
    if (occ.includes("Congratulations")) score += 30;
  }

  // General boosts
  if (occ.includes("Just Because")) score += 10;
  if (occ.includes("Congratulations")) score += 8;
  if (occ.includes("Work Anniversary")) score += (isWorkContext ? 20 : 5);
  if (occ.includes("Client Appreciation")) score += 12;

  return score;
}

export async function pickBestCard(
  eventType: string,
  contextNote?: string | null,
): Promise<HandwryttenCard> {
  const cards = await listHandwryttenCards();
  if (!cards.length) return { id: "hw-4421", name: "Classic Card", category: "General" };

  const enriched = await enrichCards(cards);

  // Score every card
  const scored = enriched
    .map(c => ({ card: c, score: scoreCard(c, eventType, contextNote ?? null) }))
    .filter(x => x.score > -999)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return cards[0]!;

  // If top card has a very strong score (clear winner), use it directly
  const top = scored[0]!;
  if (top.score >= 80) {
    logger.info({ eventType, contextNote, chosenId: top.card.id, chosenName: top.card.name, score: top.score }, "ai-card-picker: direct score win");
    return top.card;
  }

  // Otherwise ask GPT to pick from top 12 candidates
  const candidates = scored.slice(0, 12).map(x => x.card);

  try {
    const catalog = candidates.map(c => {
      const occ = c.occasions.length ? ` occasions=[${c.occasions.join(", ")}]` : "";
      return `id="${c.id}" name="${c.name}"${occ}`;
    }).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 60,
      messages: [
        {
          role: "system",
          content: `You are a business greeting card selector for a professional card-mailing service. Pick the single most appropriate card for the occasion. This is NOT a personal/romantic context — it is a business sending cards to clients. Avoid anything romantic or wedding-themed. Reply ONLY with the card id value, nothing else.`,
        },
        {
          role: "user",
          content: `Occasion: ${eventType}\nContext: ${contextNote || "none"}\n\nCandidates:\n${catalog}\n\nBest card id?`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const chosen = candidates.find(c => String(c.id) === raw.replace(/^"|"$/g, "").trim());
    if (chosen) {
      logger.info({ eventType, contextNote, chosenId: chosen.id, chosenName: chosen.name }, "ai-card-picker: GPT selected");
      return chosen;
    }
  } catch (err) {
    logger.warn({ err }, "ai-card-picker: GPT failed, using top scored card");
  }

  logger.info({ eventType, contextNote, chosenId: top.card.id, chosenName: top.card.name, score: top.score }, "ai-card-picker: score fallback");
  return top.card;
}

export async function pickCardId(
  eventType: string,
  contextNote?: string | null,
): Promise<string | number> {
  try {
    const card = await pickBestCard(eventType, contextNote);
    return card.id;
  } catch {
    return "hw-4421";
  }
}
