/**
 * Personal card picker — for individual (non-business) recipients.
 *
 * Differs from the business picker:
 *  - Full personal holiday set: Birthday, Anniversary, Mother's Day, Father's Day,
 *    Valentine's Day, Christmas, Hanukkah, Thanksgiving, Easter, New Year's,
 *    Graduation, Work Anniversary, Just Because
 *  - Valentine's Day cards are NOT excluded (appropriate for personal use)
 *  - Romantic / wedding cards are allowed for Valentine's Day + Anniversary
 *  - GPT prompts use personal / family context, not business context
 */

import { openai } from "../lib/openai";
import { db } from "@workspace/db";
import { cardClassificationsTable, aiCardLibraryTable } from "@workspace/db";
import { inArray, and, eq, sql } from "drizzle-orm";
import { listHandwryttenCards, type HandwryttenCard } from "./handwrytten";
import { logger } from "../lib/logger";


interface EnrichedCard extends HandwryttenCard {
  occasions: string[];
  skip?: boolean;
}

// ── All Handwrytten categories relevant to personal occasions ────────────────

const ALL_HW_CATEGORIES = [
  "Anniversary",
  "Birthday",
  "Condolences",
  "Congratulations",
  "Everyday",
  "Father's Day",
  "Get Well",
  "Graduation",
  "Just For Fun",
  "Mother's Day",
  "New Baby",
  "Thank You",
  "Wedding",
] as const;

// ── AI library (our generated cards) ─────────────────────────────────────────

function resolveLibraryCategories(eventType: string): string[] {
  const evt = eventType.toLowerCase();
  if (evt === "birthday")                             return ["birthday", "humor"];
  if (evt === "anniversary")                          return ["personal_anniversary"];
  if (evt === "valentine's day" || evt === "valentines day")
                                                      return ["personal_anniversary", "holiday_personal"];
  if (evt === "mother's day" || evt === "mothers day") return ["holiday_personal"];
  if (evt === "father's day" || evt === "fathers day") return ["holiday_personal"];
  if (evt === "christmas" || evt === "holiday")        return ["holiday_personal"];
  if (evt === "thanksgiving")                         return ["holiday_personal"];
  if (evt === "hanukkah")                             return ["holiday_personal"];
  if (evt === "new year's" || evt === "new years")    return ["holiday_personal"];
  if (evt === "graduation")                           return ["graduation", "congratulations_personal"];
  if (evt === "thank you" || evt === "referral thank you" || evt === "referral")
                                                      return ["thank_you"];
  if (evt === "just because")                         return ["just_because", "humor"];
  if (evt === "thinking of you")                      return ["thinking_of_you", "just_because"];
  if (evt === "get well" || evt === "get well soon")  return ["get_well"];
  if (evt === "miss you")                             return ["miss_you", "thinking_of_you"];
  if (evt === "encouragement")                        return ["encouragement", "thinking_of_you"];
  if (evt === "congratulations" || evt === "congrats" || evt === "new job" || evt === "promotion")
                                                      return ["congratulations_personal"];
  if (evt === "new baby" || evt === "baby shower")    return ["new_baby"];
  if (evt === "work anniversary")                     return ["congratulations_personal", "just_because"];
  return [];
}

async function pickFromLibrary(
  eventType: string,
  excludeIds: string[],
): Promise<HandwryttenCard | null> {
  const categories = resolveLibraryCategories(eventType);
  if (!categories.length) return null;

  try {
    const rows = await db
      .select()
      .from(aiCardLibraryTable)
      .where(and(
        eq(aiCardLibraryTable.active, true),
        inArray(aiCardLibraryTable.category, categories),
      ));

    const available = rows.filter(r =>
      r.handwryttenCardId !== null &&
      !excludeIds.includes(r.handwryttenCardId),
    );
    if (!available.length) return null;

    const catOrder = new Map(categories.map((c, i) => [c, i]));
    const scored = available.map(r => {
      let score = 0;
      score -= (catOrder.get(r.category) ?? 99) * 10;
      score += (r.timesSelected / Math.max(r.timesShown, 1)) * 20;
      score -= r.timesRejected * 5;
      score += Math.random() * 3;
      return { card: r, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0]!.card;

    await db
      .update(aiCardLibraryTable)
      .set({ timesShown: sql`${aiCardLibraryTable.timesShown} + 1` })
      .where(eq(aiCardLibraryTable.id, chosen.id));

    logger.info({ id: chosen.id, title: chosen.title, category: chosen.category }, "personal-card-picker: library card selected");

    return {
      id: chosen.handwryttenCardId!,
      name: chosen.title,
      category: "Custom",
      imageUrl: chosen.imageUrl,
    };
  } catch (err) {
    logger.warn({ err }, "personal-card-picker: library pick failed, falling back");
    return null;
  }
}

// ── DB enrichment ────────────────────────────────────────────────────────────

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

// ── Category selection via GPT ───────────────────────────────────────────────

async function pickCategories(eventType: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      max_completion_tokens: 120,
      messages: [
        {
          role: "system",
          content:
            `You help a personal greeting-card service pick cards for friends and family. ` +
            `Given an event type, return an ordered JSON array of the best Handwrytten category ` +
            `names to search. Choose from ONLY these categories: ` +
            ALL_HW_CATEGORIES.join(", ") + `. ` +
            `Rules: ` +
            `Birthday → ["Birthday"]. ` +
            `Anniversary (personal/wedding) → ["Anniversary", "Wedding", "Just For Fun"]. ` +
            `Mother's Day → ["Mother's Day", "Everyday"]. ` +
            `Father's Day → ["Father's Day", "Everyday"]. ` +
            `Valentine's Day → ["Everyday", "Just For Fun", "Anniversary"]. ` +
            `Christmas / Hanukkah / Happy Holidays / holiday → ["Everyday", "Just For Fun"]. ` +
            `Thanksgiving → ["Everyday", "Just For Fun", "Thank You"]. ` +
            `Easter → ["Everyday", "Just For Fun"]. ` +
            `New Year's → ["Everyday", "Just For Fun", "Congratulations"]. ` +
            `Graduation → ["Graduation", "Congratulations"]. ` +
            `Work Anniversary → ["Congratulations", "Everyday", "Just For Fun"]. ` +
            `Just Because → ["Just For Fun", "Everyday"]. ` +
            `Return ONLY a JSON array of strings, nothing else.`,
        },
        { role: "user", content: `Event type: ${eventType}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      logger.info({ eventType, categories: parsed }, "personal-card-picker: GPT picked categories");
      return parsed as string[];
    }
  } catch (err) {
    logger.warn({ err }, "personal-card-picker: category GPT failed, using fallback");
  }

  // Fallback heuristics
  const evt = eventType.toLowerCase();
  if (evt === "birthday")                          return ["Birthday"];
  if (evt === "anniversary")                       return ["Anniversary", "Wedding", "Just For Fun"];
  if (evt === "mother's day")                      return ["Mother's Day", "Everyday"];
  if (evt === "father's day")                      return ["Father's Day", "Everyday"];
  if (evt === "valentine's day")                   return ["Everyday", "Just For Fun"];
  if (evt === "christmas" || evt === "hanukkah" || evt === "happy holidays" || evt === "holiday")
                                                   return ["Everyday", "Just For Fun"];
  if (evt === "thanksgiving")                      return ["Everyday", "Just For Fun", "Thank You"];
  if (evt === "easter")                            return ["Everyday", "Just For Fun"];
  if (evt === "new year's" || evt === "new year")  return ["Everyday", "Just For Fun", "Congratulations"];
  if (evt === "graduation")                        return ["Graduation", "Congratulations"];
  if (evt === "work anniversary")                  return ["Congratulations", "Everyday"];
  return ["Just For Fun", "Everyday"];
}

// ── Scoring ──────────────────────────────────────────────────────────────────

function scoreCard(
  card: EnrichedCard,
  preferredCategories: string[],
  eventType: string,
): number {
  const name     = (card.name ?? "").toLowerCase();
  const hwCat    = (card.category ?? "").toLowerCase();
  const occ      = card.occasions;
  const evt      = eventType.toLowerCase();
  const imgLower = (card.imageUrl ?? "").toLowerCase();
  let score      = 0;

  // Hard-exclude cards manually flagged as unsuitable
  if (card.skip) return -999;

  // Hard-exclude invitations for all events
  if (hwCat === "invitations") return -999;
  if (name.includes("invitation") || name.includes("invite") || name.includes("rsvp")) return -999;

  // Hard-exclude wrong-occasion mismatches
  if (evt === "birthday") {
    const anniversarySignal =
      (name.includes("anniversary") && !name.includes("birthday")) ||
      (imgLower.includes("anniversary") && !imgLower.includes("birthday"));
    if (anniversarySignal) return -999;
  }
  // Wedding cards only make sense for anniversary and valentine's day
  if (evt === "anniversary" || evt === "valentine's day") {
    // Allow romantic/wedding cards — appropriate here
  } else if (hwCat === "wedding") {
    return -999;
  }

  // Holiday / seasonal hard-excludes
  const isHolidayEvt = ["christmas", "hanukkah", "happy holidays", "holiday", "thanksgiving", "new year's", "new year", "easter"].includes(evt);
  if (isHolidayEvt) {
    if (name.includes("workiversary") || name.includes("work anniversary")) return -999;
    // Exclude spring/floral imagery for winter holidays
    if (["christmas","hanukkah","happy holidays","holiday"].includes(evt)) {
      const springWords = ["blossom","bouquet","floral","flower","spring","cherry","tulip","daisy","sunflower","peony","garden","botanical"];
      if (springWords.some(w => name.includes(w) || imgLower.includes(w))) return -999;
    }
  }

  // Preferred-category bonus
  const catIdx = preferredCategories.findIndex(c => c.toLowerCase() === hwCat);
  if (catIdx === 0) score += 60;
  else if (catIdx === 1) score += 40;
  else if (catIdx === 2) score += 25;
  else if (catIdx > 2) score += 10;

  // Event-specific keyword boosts
  const bdayWords    = ["birthday","bday","born","celebrate","another year","candles","balloons","party hat"];

  // Just Because hard-excludes — no holiday, birthday, thank-you, or seasonal cards
  if (evt === "just because") {
    const seasonalWords = ["christmas","xmas","holiday","hanukkah","thanksgiving","easter","new year","valentine","halloween","pumpkin","turkey","santa","snowflake","menorah","reindeer","ornament","wreath"];
    if (seasonalWords.some(w => name.includes(w) || imgLower.includes(w))) return -999;
    if (occ.some(o => ["Christmas","Hanukkah","Easter","Thanksgiving","Valentine's Day","New Year's","Birthday"].includes(o))) return -999;
    if (hwCat === "thank you") score -= 40;
    if (bdayWords.some(w => name.includes(w) || imgLower.includes(w))) score -= 50;
  }
  const holidayWords = ["holiday","christmas","xmas","merry","winter","new year","festive","yuletide","tis the season"];
  const valentineWords = ["love","heart","valentine","roses","romance","xoxo"];
  const graduationWords = ["grad","graduate","diploma","congratulations","cap","tassel","commencement"];
  const thanksgivingWords = ["thankful","grateful","thanks","harvest","autumn","fall","pumpkin","turkey"];

  if (evt === "birthday") {
    if (occ.includes("Birthday")) score += 60;
    if (bdayWords.some(w => name.includes(w) || imgLower.includes(w))) score += 40;
  }
  if (["christmas","hanukkah","happy holidays","holiday"].includes(evt)) {
    if (occ.includes("Christmas") || occ.includes("Hanukkah")) score += 100;
    if (holidayWords.some(w => name.includes(w) || imgLower.includes(w))) score += 70;
  }
  if (evt === "valentine's day") {
    if (occ.includes("Valentine's Day")) score += 80;
    if (valentineWords.some(w => name.includes(w) || imgLower.includes(w))) score += 50;
  }
  if (evt === "graduation") {
    if (occ.includes("Graduation")) score += 80;
    if (graduationWords.some(w => name.includes(w) || imgLower.includes(w))) score += 50;
  }
  if (evt === "thanksgiving") {
    if (thanksgivingWords.some(w => name.includes(w) || imgLower.includes(w))) score += 60;
  }
  if (evt === "mother's day" && occ.includes("Mother's Day")) score += 80;
  if (evt === "father's day" && occ.includes("Father's Day")) score += 80;
  if (evt === "new year's" || evt === "new year") {
    if (occ.includes("New Year's")) score += 80;
    if (name.includes("new year") || imgLower.includes("new_year")) score += 50;
  }
  if (evt === "anniversary") {
    if (occ.includes("Anniversary")) score += 70;
    if (name.includes("anniversary") || imgLower.includes("anniversary")) score += 50;
  }
  if (evt === "work anniversary") {
    if (name.includes("work") || name.includes("job") || name.includes("career")) score += 50;
    if (["congratulations","achievement","milestone"].some(w => name.includes(w))) score += 30;
  }

  return score;
}

// ── Final GPT pick from candidates ──────────────────────────────────────────

async function gpxPickFromCandidates(
  candidates: EnrichedCard[],
  eventType: string,
): Promise<EnrichedCard | null> {
  try {
    const catalog = candidates.map(c => {
      const occ = c.occasions.length ? ` occasions=[${c.occasions.join(", ")}]` : "";
      const cat = c.category ? ` hwCategory="${c.category}"` : "";
      return `id="${c.id}" name="${c.name}"${cat}${occ}`;
    }).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      max_completion_tokens: 60,
      messages: [
        {
          role: "system",
          content:
            `You are selecting a physical greeting card for a personal occasion — ` +
            `to be sent to a family member, friend, or partner. ` +
            `Pick the card whose name, category, and occasions tags best match the event. ` +
            `For Valentine's Day and Anniversary, romantic and heartfelt cards are ideal. ` +
            `For Mother's Day and Father's Day, warm and appreciative cards are ideal. ` +
            `For birthdays, fun and celebratory cards are ideal. ` +
            `NEVER pick an invitation, RSVP, or clearly business-focused card. ` +
            `Reply ONLY with the card id value, nothing else.`,
        },
        {
          role: "user",
          content: `Occasion: ${eventType}\n\nCandidates:\n${catalog}\n\nBest card id?`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const chosen = candidates.find(c => String(c.id) === raw.replace(/^"|"$/g, "").trim());
    if (chosen) {
      logger.info({ eventType, chosenId: chosen.id, chosenName: chosen.name }, "personal-card-picker: GPT final pick");
      return chosen;
    }
  } catch (err) {
    logger.warn({ err }, "personal-card-picker: final GPT pick failed");
  }
  return null;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function pickPersonalCard(
  eventType: string,
  excludeIds: string[] = [],
  cardMessage?: string | null,
): Promise<HandwryttenCard> {
  // Try our AI-generated library first for personal event types
  const libCard = await pickFromLibrary(eventType, excludeIds.map(String));
  if (libCard) return libCard;

  const allCards = await listHandwryttenCards();
  const cards = excludeIds.length
    ? allCards.filter(c => !excludeIds.includes(String(c.id)))
    : allCards;
  if (!cards.length) return { id: "hw-4421", name: "Classic Card", category: "General" };

  const enriched = await enrichCards(cards);
  const preferredCategories = await pickCategories(eventType);

  const scored = enriched
    .map(c => ({ card: c, score: scoreCard(c, preferredCategories, eventType) }))
    .filter(x => x.score > -999)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return cards[0]!;

  const top = scored[0]!;

  // Direct win on overwhelming score
  if (top.score >= 120) {
    logger.info({ eventType, chosenId: top.card.id, chosenName: top.card.name, score: top.score }, "personal-card-picker: direct score win");
    return top.card;
  }

  // GPT picks from top 15 candidates
  const candidates = scored.slice(0, 15).map(x => x.card);
  const gptPick = await gpxPickFromCandidates(candidates, eventType);
  if (gptPick) return gptPick;

  logger.info({ eventType, chosenId: top.card.id, chosenName: top.card.name, score: top.score }, "personal-card-picker: score fallback");
  return top.card;
}
