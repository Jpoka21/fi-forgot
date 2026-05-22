/**
 * AI-powered card picker.
 *
 * Given an event type and optional context note (e.g. "new home purchase anniversary"),
 * asks GPT to select the best card from the Handwrytten catalog.
 *
 * Falls back to simple category matching if OpenAI is unavailable.
 */

import OpenAI from "openai";
import { listHandwryttenCards, type HandwryttenCard } from "./handwrytten";
import { logger } from "../lib/logger";

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

/** Simple category-based fallback (original logic) */
function categoryFallback(cards: HandwryttenCard[], eventType: string): HandwryttenCard {
  const category =
    eventType === "Birthday"       ? "birthday"   :
    eventType === "Happy Holidays" ? "holiday"    :
    eventType === "Anniversary"    ? "anniversary" : null;
  const match = category ? cards.find(c => c.category?.toLowerCase().includes(category)) : null;
  return match ?? cards[0]!;
}

/**
 * Pick the best card from the catalog for the given event + context.
 * Uses AI when a contextNote is provided to avoid wrong category matches
 * (e.g. picking a wedding card for a home-purchase anniversary).
 */
export async function pickBestCard(
  eventType: string,
  contextNote?: string | null,
): Promise<HandwryttenCard> {
  const cards = await listHandwryttenCards();
  if (!cards.length) return { id: "hw-4421", name: "Classic Card", category: "General" };

  // Only use AI when context makes category matching unreliable
  const needsAI = !!contextNote?.trim();

  if (!needsAI) {
    return categoryFallback(cards, eventType);
  }

  try {
    const catalog = cards.map((c, i) => `${i + 1}. id="${c.id}" name="${c.name}" category="${c.category ?? "General"}"`).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 60,
      messages: [
        {
          role: "system",
          content: `You are a card-selection assistant. Given an occasion and a list of greeting cards from Handwrytten, pick the single best card. Reply with ONLY the card's id value, nothing else. Prefer general/just-because/blank-inside cards over specific ones when the occasion doesn't match any category well.`,
        },
        {
          role: "user",
          content: `Occasion: ${eventType}\nContext: ${contextNote}\n\nCards:\n${catalog}\n\nWhich card id is the best fit?`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    // Extract the id — GPT might return just the id or wrap it in quotes
    const chosen = cards.find(c => String(c.id) === raw.replace(/^"|"$/g, "").trim());
    if (chosen) {
      logger.info({ eventType, contextNote, chosenId: chosen.id, chosenName: chosen.name }, "ai-card-picker: selected");
      return chosen;
    }
    logger.warn({ raw }, "ai-card-picker: couldn't match GPT response, falling back");
  } catch (err) {
    logger.warn({ err }, "ai-card-picker: OpenAI call failed, falling back");
  }

  return categoryFallback(cards, eventType);
}

/** Convenience: returns just the card id */
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
