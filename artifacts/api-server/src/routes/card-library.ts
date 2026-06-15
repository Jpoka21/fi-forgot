import { Router } from "express";
import { db } from "@workspace/db";
import { aiCardLibraryTable } from "@workspace/db";
import { eq, sql, and, inArray, or } from "drizzle-orm";
import { generateLibraryCards, regenerateLibraryCard, CARD_DESIGNS } from "../services/ai-card-library-generator";
import { logger } from "../lib/logger";

const router = Router();

/* ── V2 metadata suggestion engine ───────────────────────────────────────────
   Pure function — no DB writes. Returns suggested V2 fields based on
   existing category, subcategory, tags, title, style, and tone.          */

type MetadataSuggestion = {
  occasion:     string[];
  relationship: string[];
  interests:    string[];
  season:       string;
  audience:     string;
  genderLean:   string;
  styleCanonical: string | null;
  toneCanonical:  string | null;
};

const CATEGORY_OCCASION: Record<string, string[]> = {
  birthday:                           ["birthday"],
  personal_anniversary:               ["anniversary"],
  thank_you:                          ["thank_you"],
  thinking_of_you:                    ["thinking_of_you"],
  encouragement:                      ["encouragement"],
  congratulations_personal:           ["congratulations"],
  new_baby:                           ["new_baby"],
  get_well:                           ["get_well"],
  miss_you:                           ["thinking_of_you"],
  humor:                              ["just_because", "thinking_of_you", "thank_you"],
  retirement:                         ["retirement"],
  graduation:                         ["graduation"],
  just_because:                       ["just_because"],
  home_purchase_anniversary:          ["home_purchase_anniversary"],
  business_relationship_anniversary:  ["client_appreciation", "anniversary"],
  closing_anniversary:                ["home_purchase_anniversary", "client_appreciation"],
  general_milestone:                  ["congratulations", "client_appreciation"],
  holiday:                            ["holiday", "christmas"],
  holiday_personal:                   ["holiday"],
};

const SUBCATEGORY_OCCASION: Record<string, string[]> = {
  christmas_tree:       ["christmas"],
  holiday_wreath:       ["christmas", "holiday"],
  winter_hearth:        ["christmas", "holiday"],
  snowy_home:           ["christmas", "holiday"],
  fathers_day:          ["fathers_day"],
  mothers_day:          ["mothers_day"],
  thanksgiving_table:   ["thanksgiving"],
  valentine_roses:      ["valentines_day"],
};

const CATEGORY_RELATIONSHIP: Record<string, string[]> = {
  birthday:                           ["spouse", "parent", "child", "sibling", "friend", "general"],
  personal_anniversary:               ["spouse"],
  thinking_of_you:                    ["friend", "parent", "sibling", "general"],
  miss_you:                           ["spouse", "friend", "parent", "sibling"],
  new_baby:                           ["friend", "sibling", "general"],
  get_well:                           ["parent", "friend", "sibling", "general"],
  encouragement:                      ["friend", "parent", "child", "sibling", "general"],
  congratulations_personal:           ["friend", "parent", "child", "sibling", "general"],
  graduation:                         ["child", "sibling", "friend", "general"],
  holiday_personal:                   ["spouse", "parent", "child", "sibling", "friend", "general"],
  just_because:                       ["spouse", "friend", "parent", "sibling", "general"],
  humor:                              ["friend", "sibling", "colleague", "general"],
  retirement:                         ["friend", "sibling", "parent", "colleague", "general"],
  thank_you:                          ["friend", "parent", "colleague", "general"],
  home_purchase_anniversary:          ["client", "colleague", "general"],
  business_relationship_anniversary:  ["client", "colleague", "boss"],
  closing_anniversary:                ["client", "colleague"],
  general_milestone:                  ["client", "colleague", "boss"],
  holiday:                            ["client", "colleague", "boss"],
};

const CATEGORY_AUDIENCE: Record<string, string> = {
  home_purchase_anniversary:          "business",
  business_relationship_anniversary:  "business",
  closing_anniversary:                "business",
  general_milestone:                  "business",
  holiday:                            "business",
  just_because:                       "universal",
  thinking_of_you:                    "universal",
  encouragement:                      "universal",
  humor:                              "universal",
  retirement:                         "personal",
  thank_you:                          "universal",
};

const TAG_INTEREST_MAP: [RegExp, string][] = [
  [/botanical|roses|garden|flowers|wildflower|bloom|floral|lavender|peony|sunflower/, "garden"],
  [/mountain|adventure|hiking|trail|climbing|outdoor|path|road|summit/, "outdoor"],
  [/ocean|waves|coastal|beach|\bwater\b|horizon|sea/, "outdoor"],   // \bwater\b: avoids matching "watercolor"
  [/music|vinyl|record/, "music"],
  [/reading|book|nook|library/, "reading"],
  [/cat|dog|pet/, "pets"],
  [/\bcoffee\b/, "coffee"],                                         // coffee as own interest category
  [/cooking|grill|bbq|farmers.market|kitchen|food/, "cooking"],
  [/wine|champagne|toast|pour|glass/, "wine"],
  [/travel|journey|wanderlust|destination|road.trip/, "travel"],
  [/home|house|hearth|cozy|fireplace|living.room|cottage|porch|neighborhood/, "home"],
  [/humor|funny|playful|parody|silly/, "humor"],
  [/sports|athletic|game|workout|fitness/, "sports"],
  [/calm|serene|wellness|meditation|peace|mindful|gentle/, "wellness"],
];

// feminine: added wildflower/wildflowers/bouquet/blossom/blossoms
// masculine: removed "bold" (art-style descriptor, not a gender signal)
const FEMININE_TAGS  = /roses|botanical|blush|floral|pink|lavender|wedding|mothers|bridal|peony|delicate|soft|wildflower|wildflowers|bouquet|blossom|blossoms/i;
const MASCULINE_TAGS = /whiskey|masculine|beer|sports|tool|workshop|bbq|grill|car|vehicle|strong|rugged/i;

// Aesthetic-only tags that should not drive interests or gender on business cards
const BUSINESS_AESTHETIC_TAGS = /\b(botanical|floral|bouquet|wildflower|wildflowers|blossom|blossoms)\b/gi;

const STYLE_CANONICAL: Record<string, string> = {
  "cozy lifestyle":          "cozy_lifestyle",
  "watercolor":              "watercolor",
  "modern minimal":          "modern_minimal",
  "luxury painting":         "luxury_painting",
  "luxury photography":      "luxury_photography",
  "illustration":            "illustration",
  "bold illustration":       "bold_illustration",
  "oil painting parody":     "humor_parody",
  "whimsical illustration":  "humor_parody",
  "whimsical watercolor":    "humor_parody",
  "baroque parody":          "humor_parody",
  "surrealist illustration": "humor_parody",
  "vintage cartography":     "humor_parody",
  "flat illustration":       "humor_parody",
  "vintage illustration":    "illustration",
  "dramatic still life":     "luxury_photography",
  "still life parody":       "humor_parody",
  "elegant illustration":    "illustration",
  "warm illustration":       "illustration",
};

const TONE_CANONICAL: Record<string, string> = {
  "warm": "warm", "celebratory": "celebratory", "playful": "playful",
  "joyful": "celebratory", "professional": "professional", "romantic": "romantic",
  "sophisticated": "sophisticated", "tender": "tender", "inspirational": "hopeful",
  "hopeful": "hopeful", "comforting": "tender", "adventurous": "hopeful",
  "serene": "sophisticated", "fresh": "hopeful", "wistful": "tender",
  "energizing": "hopeful", "triumphant": "celebratory", "calm": "sophisticated",
  "nostalgic": "warm", "gentle": "tender", "contemplative": "sophisticated",
  "relaxed": "warm", "expansive": "hopeful", "grounding": "warm",
  "prestigious": "sophisticated",
};

function suggestMetadata(card: {
  category: string;
  subcategory: string;
  tags: string[];
  style: string | null;
  tone: string | null;
  seasonal: boolean;
}): MetadataSuggestion {
  const tagStr = card.tags.join(" ").toLowerCase();
  const sub    = card.subcategory.toLowerCase();
  const cat    = card.category.toLowerCase();

  // occasion[]
  const occasionSet = new Set<string>(CATEGORY_OCCASION[cat] ?? ["just_because"]);
  const subOccasions = SUBCATEGORY_OCCASION[sub];
  if (subOccasions) subOccasions.forEach(o => occasionSet.add(o));
  // holiday_personal: override with subcategory-specific occasion
  if (cat === "holiday_personal" && subOccasions) {
    occasionSet.delete("holiday");
    subOccasions.forEach(o => occasionSet.add(o));
  }

  // relationship[]
  const rel = CATEGORY_RELATIONSHIP[cat] ?? ["general"];

  // season
  let season = "year_round";
  if (card.seasonal || /christmas|holiday|winter/i.test(sub)) season = "winter";
  else if (/mothers.day|spring|easter/i.test(sub)) season = "spring";
  else if (/fathers.day|summer/i.test(sub)) season = "summer";
  else if (/thanksgiving|fall|autumn/i.test(sub)) season = "fall";

  // audience — computed before interests so the business guard can use it
  let audience = CATEGORY_AUDIENCE[cat] ?? "personal";
  if (cat === "holiday_personal" || cat === "birthday" || cat === "personal_anniversary") {
    audience = "personal";
  }

  // interests[] — business cards: strip aesthetic-only tags before pattern matching
  // so that visual style choices (botanical, floral, bouquet…) don't imply recipient interests
  const tagStrForInt = audience === "business"
    ? tagStr.replace(BUSINESS_AESTHETIC_TAGS, "")
    : tagStr;
  const subForInt = audience === "business"
    ? sub.replace(BUSINESS_AESTHETIC_TAGS, "")
    : sub;
  const interestSet = new Set<string>();
  for (const [pattern, interest] of TAG_INTEREST_MAP) {
    if (pattern.test(tagStrForInt) || pattern.test(subForInt)) interestSet.add(interest);
  }

  // gender_lean — business cards always neutral (aesthetic style ≠ recipient gender)
  let genderLean = "neutral";
  if (audience !== "business") {
    if (FEMININE_TAGS.test(tagStr) || FEMININE_TAGS.test(sub)) genderLean = "feminine";
    else if (MASCULINE_TAGS.test(tagStr) || MASCULINE_TAGS.test(sub)) genderLean = "masculine";
  }
  if (sub === "birthday_masculine") genderLean = "masculine";

  // canonical style and tone
  const styleCanonical = card.style ? (STYLE_CANONICAL[card.style.toLowerCase()] ?? card.style) : null;
  const toneCanonical  = card.tone  ? (TONE_CANONICAL[card.tone.toLowerCase()]   ?? card.tone)  : null;

  return {
    occasion:     Array.from(occasionSet),
    relationship: rel,
    interests:    Array.from(interestSet),
    season,
    audience,
    genderLean,
    styleCanonical,
    toneCanonical,
  };
}

/* ── Print audit ──────────────────────────────────────────────────────────── */

router.get("/admin/print-audit", async (_req, res) => {
  const cards = await db
    .select({
      id:                aiCardLibraryTable.id,
      title:             aiCardLibraryTable.title,
      category:          aiCardLibraryTable.category,
      subcategory:       aiCardLibraryTable.subcategory,
      imageUrl:          aiCardLibraryTable.imageUrl,
      handwryttenCardId: aiCardLibraryTable.handwryttenCardId,
      active:            aiCardLibraryTable.active,
    })
    .from(aiCardLibraryTable)
    .orderBy(aiCardLibraryTable.category, aiCardLibraryTable.title);
  res.json({ cards });
});

/* ── List cards ───────────────────────────────────────────────────────────── */

router.get("/admin/card-library", async (req, res) => {
  const { category, active } = req.query;
  let query = db.select().from(aiCardLibraryTable).$dynamic();

  const conditions = [];
  if (category && typeof category === "string") {
    conditions.push(eq(aiCardLibraryTable.category, category));
  }
  if (active !== undefined) {
    conditions.push(eq(aiCardLibraryTable.active, active === "true"));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const cards = await query.orderBy(aiCardLibraryTable.createdAt);
  res.json({ cards });
});

/* ── Categories + counts ──────────────────────────────────────────────────── */

router.get("/admin/card-library/categories", async (_req, res) => {
  const rows = await db
    .select({
      category:    aiCardLibraryTable.category,
      count:       sql<number>`count(*)::int`,
      activeCount: sql<number>`count(*) filter (where ${aiCardLibraryTable.active})::int`,
    })
    .from(aiCardLibraryTable)
    .groupBy(aiCardLibraryTable.category);

  const defined = [
    { key: "home_purchase_anniversary",         label: "Home Purchase Anniversary",       target: 12 },
    { key: "business_relationship_anniversary", label: "Business Relationship Anniversary",target: 10 },
    { key: "closing_anniversary",               label: "Closing Anniversary",              target: 8  },
    { key: "general_milestone",                 label: "General Business Milestone",       target: 5  },
    { key: "holiday",                           label: "Holiday",                          target: 5  },
    { key: "just_because",                      label: "Just Because",                     target: 10 },
    { key: "humor",                             label: "Humor & Funny",                    target: 15 },
    { key: "retirement",                        label: "Retirement",                        target: 4  },
    { key: "thinking_of_you",                   label: "Thinking of You",                  target: 8  },
    { key: "encouragement",                     label: "Encouragement",                    target: 8  },
    { key: "congratulations_personal",          label: "Congratulations (Personal)",       target: 6  },
    { key: "new_baby",                          label: "New Baby",                         target: 6  },
    { key: "get_well",                          label: "Get Well",                         target: 6  },
    { key: "miss_you",                          label: "Miss You",                         target: 6  },
    { key: "birthday",                          label: "Birthday",                         target: 12 },
    { key: "personal_anniversary",              label: "Personal Anniversary",             target: 8  },
    { key: "thank_you",                         label: "Thank You",                        target: 8  },
    { key: "graduation",                        label: "Graduation",                       target: 6  },
    { key: "holiday_personal",                  label: "Holiday (Personal)",               target: 8  },
  ];

  const byKey = new Map(rows.map(r => [r.category, r]));
  const categories = defined.map(d => ({
    key:         d.key,
    label:       d.label,
    target:      d.target,
    count:       byKey.get(d.key)?.count       ?? 0,
    activeCount: byKey.get(d.key)?.activeCount ?? 0,
  }));

  res.json({ categories });
});

/* ── V2: Metadata audit ───────────────────────────────────────────────────── */

router.get("/admin/card-library/metadata-audit", async (req, res) => {
  const { category, missing } = req.query;

  const allCards = await db.select().from(aiCardLibraryTable).orderBy(
    aiCardLibraryTable.category,
    aiCardLibraryTable.subcategory
  );

  const filtered = allCards.filter(c => {
    if (category && typeof category === "string" && c.category !== category) return false;
    if (missing && typeof missing === "string") {
      switch (missing) {
        case "occasion":     return (c.occasion     ?? []).length === 0;
        case "relationship": return (c.relationship ?? []).length === 0;
        case "interests":    return (c.interests    ?? []).length === 0;
        case "season":       return !c.season;
        case "audience":     return !c.audience;
        case "gender_lean":  return !c.genderLean;
        case "style":        return !c.style;
        case "tone":         return !c.tone;
      }
    }
    return true;
  });

  // Summary stats over all cards (not filtered)
  const summary = {
    total:              allCards.length,
    missingOccasion:    allCards.filter(c => (c.occasion     ?? []).length === 0).length,
    missingRelationship:allCards.filter(c => (c.relationship ?? []).length === 0).length,
    missingInterests:   allCards.filter(c => (c.interests    ?? []).length === 0).length,
    missingSeason:      allCards.filter(c => !c.season).length,
    missingAudience:    allCards.filter(c => !c.audience).length,
    missingGenderLean:  allCards.filter(c => !c.genderLean).length,
    missingStyle:       allCards.filter(c => !c.style).length,
    missingTone:        allCards.filter(c => !c.tone).length,
  };

  res.json({ summary, cards: filtered });
});

/* ── V2: Suggest metadata for a card ─────────────────────────────────────── */

router.get("/admin/card-library/suggest/:id", async (req, res) => {
  const { id } = req.params;
  const rows = await db
    .select()
    .from(aiCardLibraryTable)
    .where(eq(aiCardLibraryTable.id, id))
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const card = rows[0];
  const suggestion = suggestMetadata({
    category:   card.category,
    subcategory: card.subcategory,
    tags:       card.tags ?? [],
    style:      card.style,
    tone:       card.tone,
    seasonal:   card.seasonal,
  });

  res.json({ suggestion, card: { id: card.id, title: card.title, category: card.category } });
});

/* ── V2: Search / filter by V2 fields ────────────────────────────────────── */

router.get("/admin/card-library/search-v2", async (req, res) => {
  const {
    occasion, style, tone, relationship, interest, season, audience, category,
  } = req.query;

  const conditions = [];

  if (category && typeof category === "string") {
    conditions.push(eq(aiCardLibraryTable.category, category));
  }
  if (style && typeof style === "string") {
    conditions.push(eq(aiCardLibraryTable.style, style));
  }
  if (tone && typeof tone === "string") {
    conditions.push(eq(aiCardLibraryTable.tone, tone));
  }
  if (season && typeof season === "string") {
    conditions.push(eq(aiCardLibraryTable.season, season));
  }
  if (audience && typeof audience === "string") {
    conditions.push(eq(aiCardLibraryTable.audience, audience));
  }
  if (occasion && typeof occasion === "string") {
    conditions.push(sql`${aiCardLibraryTable.occasion} @> ${JSON.stringify([occasion])}::jsonb`);
  }
  if (relationship && typeof relationship === "string") {
    conditions.push(sql`${aiCardLibraryTable.relationship} @> ${JSON.stringify([relationship])}::jsonb`);
  }
  if (interest && typeof interest === "string") {
    conditions.push(sql`${aiCardLibraryTable.interests} @> ${JSON.stringify([interest])}::jsonb`);
  }

  conditions.push(eq(aiCardLibraryTable.active, true));

  const cards = conditions.length > 0
    ? await db.select().from(aiCardLibraryTable).where(and(...conditions))
    : await db.select().from(aiCardLibraryTable).where(eq(aiCardLibraryTable.active, true));

  res.json({ cards, total: cards.length });
});

/* ── Trigger batch generation ────────────────────────────────────────────── */

router.post("/admin/card-library/generate", async (req, res) => {
  const { categories, force } = req.body as { categories?: string[]; force?: boolean };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let closed = false;
  req.on("close", () => { closed = true; });

  const send = (data: object) => {
    if (closed) return;
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch { closed = true; }
  };

  const keepalive = setInterval(() => {
    if (closed) { clearInterval(keepalive); return; }
    try { res.write(": keepalive\n\n"); } catch { closed = true; clearInterval(keepalive); }
  }, 20_000);

  send({ type: "start", message: "Starting generation…" });

  try {
    const result = await generateLibraryCards({
      categories,
      force: force ?? false,
      onProgress: (msg) => send({ type: "progress", message: msg }),
    });

    send({ type: "done", result });
    logger.info({ succeeded: result.succeeded.length, failed: result.failed.length }, "ai-card-library: batch generation complete");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    send({ type: "error", message: msg });
    logger.error({ err }, "ai-card-library: batch generation error");
  }

  clearInterval(keepalive);
  try { res.end(); } catch { /* already closed */ }
});

/* ── Update a card ───────────────────────────────────────────────────────── */

router.patch("/admin/card-library/:id", async (req, res) => {
  const { id } = req.params;
  const {
    active, title,
    // V2 fields
    occasion, relationship, interests, season, audience, genderLean,
  } = req.body as {
    active?: boolean; title?: string;
    occasion?: string[]; relationship?: string[]; interests?: string[];
    season?: string; audience?: string; genderLean?: string;
  };

  const updates: Partial<typeof aiCardLibraryTable.$inferInsert> = {};
  if (active       !== undefined) updates.active       = active;
  if (title        !== undefined) updates.title        = title;
  if (occasion     !== undefined) updates.occasion     = occasion;
  if (relationship !== undefined) updates.relationship = relationship;
  if (interests    !== undefined) updates.interests    = interests;
  if (season       !== undefined) updates.season       = season;
  if (audience     !== undefined) updates.audience     = audience;
  if (genderLean   !== undefined) updates.genderLean   = genderLean;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  await db.update(aiCardLibraryTable).set(updates).where(eq(aiCardLibraryTable.id, id));
  res.json({ ok: true });
});

/* ── Delete a card ───────────────────────────────────────────────────────── */

router.delete("/admin/card-library/:id", async (req, res) => {
  const { id } = req.params;
  await db.delete(aiCardLibraryTable).where(eq(aiCardLibraryTable.id, id));
  res.json({ ok: true });
});

/* ── Regenerate a single card ────────────────────────────────────────────── */

router.post("/admin/card-library/:id/regenerate", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await regenerateLibraryCard(id);
    res.json({ ok: true, card: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err, id }, "ai-card-library: regenerate failed");
    res.status(500).json({ error: msg });
  }
});

/* ── Track engagement stats ──────────────────────────────────────────────── */

router.post("/admin/card-library/:id/track", async (req, res) => {
  const { id } = req.params;
  const { event } = req.body as { event: "shown" | "selected" | "rejected" };

  if (!["shown", "selected", "rejected"].includes(event)) {
    res.status(400).json({ error: "event must be shown, selected, or rejected" });
    return;
  }

  const col =
    event === "shown"    ? aiCardLibraryTable.timesShown :
    event === "selected" ? aiCardLibraryTable.timesSelected :
                           aiCardLibraryTable.timesRejected;

  await db
    .update(aiCardLibraryTable)
    .set({ [col.name]: sql`${col} + 1` })
    .where(eq(aiCardLibraryTable.id, id));

  res.json({ ok: true });
});

export default router;
