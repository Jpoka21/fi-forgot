/**
 * AI-powered card picker.
 *
 * Strategy:
 *  1. Fetch live Handwrytten cards — each has an official `category` field
 *     (Anniversary, For Business, Congratulations, etc.) matching Handwrytten's
 *     own taxonomy shown in their sidebar.
 *  2. Ask GPT which Handwrytten categories best fit the event + contextNote.
 *  3. Score cards using: preferred categories + card name keywords + DB occasion tags.
 *  4. Ask GPT to make the final pick from the top candidates, giving it full context.
 *
 * This means even cards not yet classified in card_classifications are found,
 * as long as Handwrytten categorises them and/or their name contains relevant keywords.
 */

import { openai } from "../lib/openai";
import { db } from "@workspace/db";
import { cardClassificationsTable, customHolidayCardsTable, aiCardLibraryTable } from "@workspace/db";
import { inArray, eq, and, sql } from "drizzle-orm";
import { listHandwryttenCards, type HandwryttenCard } from "./handwrytten";
import { logger } from "../lib/logger";


// ─── Types ──────────────────────────────────────────────────────────────────

interface EnrichedCard extends HandwryttenCard {
  /** Occasion tags from card_classifications DB (AI-tagged) */
  occasions: string[];
}

// ─── DB enrichment ──────────────────────────────────────────────────────────

interface EnrichedCard extends HandwryttenCard {
  /** Occasion tags from card_classifications DB (AI-tagged) */
  occasions: string[];
  /** If true, this card is manually flagged as unsuitable — always excluded */
  skip?: boolean;
}

async function enrichCards(cards: HandwryttenCard[]): Promise<EnrichedCard[]> {
  const imageUrls = cards.map(c => c.imageUrl ?? "").filter(Boolean);
  if (!imageUrls.length) return cards.map(c => ({ ...c, occasions: [] }));

  const rows = await db
    .select({
      imageUrl: cardClassificationsTable.imageUrl,
      occasions: cardClassificationsTable.occasions,
      skip: cardClassificationsTable.skip,
    })
    .from(cardClassificationsTable)
    .where(inArray(cardClassificationsTable.imageUrl, imageUrls));

  const byUrl = new Map(rows.map(r => [r.imageUrl, { occasions: (r.occasions as string[]) ?? [], skip: r.skip ?? false }]));
  return cards.map(c => {
    const entry = byUrl.get(c.imageUrl ?? "");
    return { ...c, occasions: entry?.occasions ?? [], skip: entry?.skip ?? false };
  });
}

// ─── Category selection ──────────────────────────────────────────────────────

/**
 * All official Handwrytten categories (matches their sidebar taxonomy).
 */
const ALL_HW_CATEGORIES = [
  "Anniversary",
  "Birthday",
  "Condolences",
  "Congratulations",
  "Employee Appreciation",
  "Everyday",
  "Father's Day",
  "For Business",
  "Get Well",
  "Graduation",
  "Invitations",
  "Just For Fun",
  "Mother's Day",
  "New Baby",
  "Thank You",
  "Wedding",
] as const;

/**
 * Ask GPT which Handwrytten categories are most relevant for this event + context.
 * Returns an ordered list: first = most preferred.
 */
async function pickCategories(eventType: string, contextNote: string | null): Promise<string[]> {
  const ctx = contextNote?.trim() || "none";
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      max_completion_tokens: 120,
      messages: [
        {
          role: "system",
          content:
            `You help a business greeting-card service pick cards for clients. ` +
            `Given an event type and context note, return an ordered JSON array of the best ` +
            `Handwrytten category names to search. Choose from ONLY these categories: ` +
            ALL_HW_CATEGORIES.join(", ") + `. ` +
            `IMPORTANT: This is a business service — never choose "Wedding". ` +
            `For home-purchase anniversaries use ["Anniversary","Congratulations","For Business"]. ` +
            `For work anniversaries use ["Employee Appreciation","For Business","Congratulations"]. ` +
            `For "Happy Holidays" or any holiday/seasonal event use ["Everyday","Congratulations","Just For Fun"] — ` +
            `seasonal/New Year celebration cards are ideal, NOT thank-you cards. ` +
            `Return ONLY a JSON array of strings, nothing else.`,
        },
        {
          role: "user",
          content: `Event type: ${eventType}\nContext: ${ctx}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      logger.info({ eventType, contextNote, categories: parsed }, "ai-card-picker: GPT picked categories");
      return parsed as string[];
    }
  } catch (err) {
    logger.warn({ err }, "ai-card-picker: category GPT failed, using fallback");
  }

  // Fallback heuristic
  if (eventType === "Birthday") return ["Birthday"];
  if (eventType === "Happy Holidays") return ["Everyday", "Just For Fun"];
  if (eventType === "Anniversary") {
    const ctx2 = (contextNote ?? "").toLowerCase();
    const isHome = ctx2.includes("home") || ctx2.includes("house") || ctx2.includes("propert") || ctx2.includes("real estate") || ctx2.includes("mortgage");
    const isWork = ctx2.includes("work") || ctx2.includes("job") || ctx2.includes("career") || ctx2.includes("business") || ctx2.includes("compan");
    if (isHome) return ["Anniversary", "Congratulations", "For Business"];
    if (isWork) return ["Employee Appreciation", "For Business", "Congratulations"];
    return ["Anniversary", "Just For Fun", "Congratulations"];
  }
  return ["For Business", "Congratulations", "Everyday"];
}

// ─── Keyword scoring ─────────────────────────────────────────────────────────

/**
 * Score a single card.  Higher = better.
 * Uses: Handwrytten category, card name keywords, and DB occasion tags.
 */
function scoreCard(
  card: EnrichedCard,
  preferredCategories: string[],
  contextNote: string | null,
  eventType: string,
): number {
  const name    = (card.name ?? "").toLowerCase();
  const ctx     = (contextNote ?? "").toLowerCase();
  const hwCat   = (card.category ?? "").toLowerCase();
  const occ     = card.occasions;
  let score     = 0;

  // Hard exclude cards manually flagged as unsuitable in the DB
  if (card.skip) return -999;

  // Hard exclude invitations, romantic/wedding cards — this is a business card-sending service
  if (hwCat === "wedding") return -999;
  if (hwCat === "invitations") return -999;
  const nameLower = name;
  if (
    nameLower.includes("invitation") || nameLower.includes("invite") ||
    nameLower.includes("rsvp") || nameLower.includes("you're invited") ||
    nameLower.includes("join us for") || nameLower.includes("join us to")
  ) return -999;
  if (occ.includes("Valentine's Day") && occ.length === 1) return -999;

  // Hard exclude cards whose name OR image URL signals the wrong occasion
  const eventLower = eventType.toLowerCase();
  const imgLower   = (card.imageUrl ?? "").toLowerCase();

  if (eventLower === "birthday") {
    // Exclude anniversary-themed cards (name or image URL is the giveaway)
    const anniversarySignal =
      (nameLower.includes("anniversary") && !nameLower.includes("birthday")) ||
      (imgLower.includes("anniversary") && !imgLower.includes("birthday"));
    if (anniversarySignal) return -999;
    if (nameLower.includes("workiversary") || nameLower.includes("housiversary") || nameLower.includes("work anniversary")) return -999;
  }
  if (eventLower === "anniversary") {
    // Exclude pure birthday cards
    const birthdaySignal =
      (nameLower.includes("birthday") && !nameLower.includes("anniversary")) ||
      (imgLower.includes("birthday") && !imgLower.includes("anniversary"));
    if (birthdaySignal) return -999;
  }

  // Preferred-category bonus (first = highest)
  const catIdx = preferredCategories.findIndex(
    c => c.toLowerCase() === hwCat,
  );
  if (catIdx === 0) score += 60;
  else if (catIdx === 1) score += 40;
  else if (catIdx === 2) score += 25;
  else if (catIdx > 2)   score += 10;

  // Card NAME keyword matching against context
  const homeWords    = ["home", "house", "housiversary", "houseiversary", "realtor", "real estate", "mortgage", "property"];
  const workWords    = ["work", "job", "career", "business", "office", "professional", "employee", "colleague"];
  const bdayWords    = ["birthday", "bday", "born", "celebrate", "another year", "candles", "balloons", "party hat"];
  const holidayWords = ["holiday", "christmas", "xmas", "merry", "winter", "new year", "festive", "yuletide", "tis the season"];
  const congrats     = ["congrat", "congratulations", "achievement", "milestone"];

  const isHomeCtx    = homeWords.some(w => ctx.includes(w));
  const isWorkCtx    = workWords.some(w => ctx.includes(w));
  const isBdayEvt    = eventLower === "birthday";
  const isHolidayEvt = eventLower === "happy holidays" || eventLower === "holiday";

  // For holidays, hard-exclude thank-you, grateful, support, and work-anniversary cards
  if (isHolidayEvt && (
    name.includes("thank") || name.includes("grateful") || name.includes("support") ||
    name.includes("workiversary") || name.includes("work anniversary") ||
    imgLower.includes("thank_you") || imgLower.includes("thankyou") ||
    imgLower.includes("grateful") || imgLower.includes("support") ||
    imgLower.includes("workiversary")
  )) return -999;

  if (isHomeCtx) {
    const nameHomeMatch = homeWords.some(w => name.includes(w));
    if (nameHomeMatch) score += 80;
  }
  if (isWorkCtx) {
    const nameWorkMatch = workWords.some(w => name.includes(w));
    if (nameWorkMatch) score += 60;
  }

  // Birthday event: strongly boost actual birthday cards
  if (isBdayEvt) {
    if (occ.includes("Birthday")) score += 60;
    if (bdayWords.some(w => name.includes(w) || imgLower.includes(w))) score += 40;
  }

  // Holiday event: strongly boost actual holiday/seasonal cards
  if (isHolidayEvt) {
    if (occ.includes("Christmas")) score += 100;
    if (occ.includes("New Year's")) score += 90;
    if (holidayWords.some(w => name.includes(w) || imgLower.includes(w))) score += 70;
    // Hard-exclude spring/floral imagery — cherry blossom, bouquet, etc. are not holiday cards
    const springWords = ["blossom","bouquet","floral","flower","spring","cherry","tulip","daisy","sunflower","peony","garden","botanical","wreath"];
    if (springWords.some(w => name.includes(w) || imgLower.includes(w))) return -999;
  }

  if (congrats.some(w => name.includes(w))) score += 15;

  // DB occasion tag bonuses (supplementary)
  if (occ.includes("Just Because")) score += 8;
  if (occ.includes("Congratulations")) score += 8;
  if (occ.includes("Work Anniversary")) score += (isWorkCtx ? 15 : 3);

  return score;
}

// ─── Final GPT pick ──────────────────────────────────────────────────────────

async function gpxPickFromCandidates(
  candidates: EnrichedCard[],
  eventType: string,
  contextNote: string | null,
): Promise<EnrichedCard | null> {
  try {
    const catalog = candidates.map(c => {
      const occ  = c.occasions.length ? ` occasions=[${c.occasions.join(", ")}]` : "";
      const cat  = c.category ? ` hwCategory="${c.category}"` : "";
      return `id="${c.id}" name="${c.name}"${cat}${occ}`;
    }).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      max_completion_tokens: 60,
      messages: [
        {
          role: "system",
          content:
            `You are selecting a physical greeting card for a business to send to a client. ` +
            `Read the occasion and context carefully. Pick the card whose NAME and category best ` +
            `match the specific situation — not just the generic event type. ` +
            `For example, a home-purchase anniversary → home/house-themed card. ` +
            `A work anniversary → employee-appreciation card. ` +
            `A Happy Holidays / holiday event → celebration, seasonal, New Year's, or champagne card — ` +
            `NOT a thank-you card, NOT a generic everyday card. ` +
            `NEVER pick a romantic, wedding, invitation, or thank-you card for holidays. ` +
            `Reply ONLY with the card id value, nothing else.`,
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
      logger.info({ eventType, contextNote, chosenId: chosen.id, chosenName: chosen.name }, "ai-card-picker: GPT final pick");
      return chosen;
    }
  } catch (err) {
    logger.warn({ err }, "ai-card-picker: final GPT pick failed");
  }
  return null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * For Happy Holidays events: check the custom_holiday_cards table first.
 * Returns a card shaped like HandwryttenCard, or null if none available.
 */
async function pickCustomHolidayCard(excludeIds: string[]): Promise<HandwryttenCard | null> {
  try {
    const rows = await db
      .select()
      .from(customHolidayCardsTable)
      .where(eq(customHolidayCardsTable.active, true));

    const available = rows.filter(r => !excludeIds.includes(String(r.handwryttenCardId)));
    if (!available.length) return null;

    // Rotate randomly so each refresh shows a different option
    const pick = available[Math.floor(Math.random() * available.length)]!;
    logger.info({ cardId: pick.handwryttenCardId, name: pick.name }, "ai-card-picker: custom holiday card selected");
    return {
      id: pick.handwryttenCardId,
      name: pick.name,
      category: "Custom",
      imageUrl: pick.imageUrl,
    };
  } catch (err) {
    logger.warn({ err }, "ai-card-picker: custom holiday card lookup failed, falling back");
    return null;
  }
}

// ─── Library picker ──────────────────────────────────────────────────────────

/**
 * Detect which ai_card_library categories to search for a given event + context.
 */
function resolveLibraryCategories(eventType: string, contextNote: string | null): string[] {
  const evt = eventType.toLowerCase();
  const ctx = (contextNote ?? "").toLowerCase();

  if (evt === "birthday" || evt === "client birthday") {
    return ["birthday"];
  }

  if (evt === "thank you" || evt === "referral thank you" || evt === "referral") {
    return ["thank_you"];
  }

  if (evt === "happy holidays" || evt === "holiday" || evt === "christmas") {
    return ["holiday", "holiday_personal"];
  }

  if (evt === "anniversary") {
    const isHome  = /home|house|propert|real.?estate|mortgage|closing|sold|bought|purchas/.test(ctx);
    const isWork  = /work|job|career|business|compan|employ|office|client|partner/.test(ctx);
    const isClose = /closing|sold|keys|real.?estate|realtor/.test(ctx);

    if (isClose) return ["closing_anniversary", "home_purchase_anniversary"];
    if (isHome)  return ["home_purchase_anniversary", "closing_anniversary", "general_milestone"];
    if (isWork)  return ["business_relationship_anniversary", "general_milestone"];
    return ["home_purchase_anniversary", "business_relationship_anniversary", "closing_anniversary", "general_milestone"];
  }

  if (evt === "just because") {
    return ["just_because"];
  }

  if (evt === "thinking of you") {
    return ["thinking_of_you", "just_because"];
  }

  if (evt === "encouragement" || evt === "you've got this" || evt === "support") {
    return ["encouragement", "thinking_of_you"];
  }

  if (evt === "congratulations" || evt === "congrats" || evt === "new job" || evt === "promotion") {
    return ["congratulations_personal", "encouragement"];
  }

  if (evt === "new baby" || evt === "baby shower") {
    return ["new_baby"];
  }

  if (evt === "get well" || evt === "get well soon") {
    return ["get_well"];
  }

  if (evt === "miss you" || evt === "long distance" || evt === "farewell") {
    return ["miss_you", "thinking_of_you"];
  }

  return [];
}

/**
 * Pick a card from ai_card_library.  Returns null if no active cards are available.
 * Prioritises cards with higher selection rates and fewer rejections.
 * Increments timesShown on the chosen card.
 */
async function pickFromLibrary(
  eventType: string,
  contextNote: string | null,
  excludeIds: string[],   // Handwrytten card IDs to skip
): Promise<(HandwryttenCard & { libraryCardId: string }) | null> {
  const categories = resolveLibraryCategories(eventType, contextNote);
  if (!categories.length) return null;

  try {
    const rows = await db
      .select()
      .from(aiCardLibraryTable)
      .where(
        and(
          eq(aiCardLibraryTable.active, true),
          inArray(aiCardLibraryTable.category, categories),
        ),
      );

    const available = rows.filter(r =>
      r.handwryttenCardId !== null &&
      !excludeIds.includes(r.handwryttenCardId),
    );

    if (!available.length) return null;

    // Score: prefer cards with high selection rate and shown to the right category first
    const catOrder = new Map(categories.map((c, i) => [c, i]));

    const scored = available.map(r => {
      let score = 0;
      // Category preference (earlier in list = better)
      const catRank = catOrder.get(r.category) ?? 99;
      score -= catRank * 10;
      // Selection rate bonus (selected / max(shown,1))
      const rate = r.timesSelected / Math.max(r.timesShown, 1);
      score += rate * 20;
      // Rejection penalty
      score -= r.timesRejected * 5;
      // Small random jitter so we rotate among equal cards
      score += Math.random() * 3;
      return { card: r, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0]!.card;

    // Increment timesShown
    await db
      .update(aiCardLibraryTable)
      .set({ timesShown: sql`${aiCardLibraryTable.timesShown} + 1` })
      .where(eq(aiCardLibraryTable.id, chosen.id));

    logger.info({ id: chosen.id, title: chosen.title, category: chosen.category }, "ai-card-picker: library card selected");

    return {
      id: chosen.handwryttenCardId!,
      name: chosen.title,
      category: "Custom",
      imageUrl: chosen.imageUrl,
      libraryCardId: chosen.id,
    };
  } catch (err) {
    logger.warn({ err }, "ai-card-picker: library pick failed, falling back");
    return null;
  }
}

export async function pickBestCard(
  eventType: string,
  contextNote?: string | null,
  excludeIds: string[] = [],
  cardMessage?: string | null,
): Promise<HandwryttenCard & { libraryCardId?: string }> {
  const isHoliday    = eventType.toLowerCase() === "happy holidays" || eventType.toLowerCase() === "holiday";
  const isAnniversary = eventType.toLowerCase() === "anniversary";

  // For Anniversary and Holiday: try the AI card library first
  if (isAnniversary || isHoliday) {
    const libCard = await pickFromLibrary(eventType, contextNote ?? null, excludeIds);
    if (libCard) return libCard;
  }

  // Holiday fallback: custom_holiday_cards table (legacy)
  if (isHoliday) {
    const custom = await pickCustomHolidayCard(excludeIds);
    if (custom) return custom;
  }

  const allCards = await listHandwryttenCards();
  const cards = excludeIds.length
    ? allCards.filter(c => !excludeIds.includes(String(c.id)))
    : allCards;
  if (!cards.length) return { id: "hw-4421", name: "Classic Card", category: "General" };

  const enriched = await enrichCards(cards);

  // Step 1: Ask GPT which Handwrytten categories are relevant
  const preferredCategories = await pickCategories(eventType, contextNote ?? null);

  // Step 2: Score all cards
  const scored = enriched
    .map(c => ({ card: c, score: scoreCard(c, preferredCategories, contextNote ?? null, eventType) }))
    .filter(x => x.score > -999)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return cards[0]!;

  const top = scored[0]!;

  // Step 3: If there's an overwhelming winner (strong name + category match), use it
  if (top.score >= 120) {
    logger.info({ eventType, contextNote, chosenId: top.card.id, chosenName: top.card.name, score: top.score, categories: preferredCategories }, "ai-card-picker: direct score win");
    return top.card;
  }

  // Step 4: GPT makes the final call from top 15 candidates
  const candidates = scored.slice(0, 15).map(x => x.card);
  const gptPick = await gpxPickFromCandidates(candidates, eventType, contextNote ?? null);
  if (gptPick) return gptPick;

  // Fallback
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
