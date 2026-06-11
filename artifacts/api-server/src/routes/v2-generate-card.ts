import { Router } from "express";
import { openai } from "../lib/openai";
import { db, recipientMemoryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";
import { assembleRecipientContext } from "../services/recipient-context";
import { buildContextSupplement, extractContextAvoids } from "../services/recipient-context-prompt";
import { awardPoints } from "../services/brownie-points";
import type { RecipientContext } from "../services/recipient-context";

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

// ── Banned phrase list ────────────────────────────────────────────────────────
// Any of these in a card = automatic quality failure. Keep in sync with
// QUALITY_SCORER_BANNED_PHRASES below.

const BANNED_PHRASES_SYSTEM = [
  // Generic wishes
  "wishing you all the best", "wishing you the best", "warmest wishes", "heartfelt wishes",
  "wishing you happiness", "wishing you joy", "wishing you a wonderful",
  "hope your day is as special as you are", "hope this day brings you",
  "may all your wishes come true", "may your year be filled with",
  "may your day be filled with",
  // Calendar filler
  "on this special day", "on this special occasion", "this special day",
  "another trip around the sun", "time to celebrate", "this is your day",
  "celebrate you",
  // Filler openers
  "just wanted to wish you", "i just wanted to take a moment",
  "wanted to take a moment", "i wanted to reach out",
  // Generic closers
  "have a wonderful day", "have a great day", "hope your day is amazing",
  "all the best", "best wishes",
  // Empty affirmations
  "cherish every moment", "you deserve all the best", "you deserve only the best",
  "so blessed to have you", "truly blessed", "you are so special",
  "words cannot express", "from the bottom of my heart",
  "rare person", "one of a kind", "impossible not to like",
  // AI hallmarks
  "in these uncertain times", "this year more than ever",
  "thoughts and prayers", "here's to you and",
  "today and every day",
] as const;

// ── Relationship rules ────────────────────────────────────────────────────────

function buildRelRules(relationship: string, occasion: string): string {
  const rel = relationship.toLowerCase();
  const occ = occasion.toLowerCase();
  const isPro = PROFESSIONAL_RELS.includes(rel);

  if (isPro) {
    return `This is a PROFESSIONAL relationship. Rules:
- Warm and genuine but professionally appropriate at all times
- No romantic language, no emotional dependency language, no aggressive teasing
- Reference the work context: shared projects, professional growth, team moments
- A good work card feels personal without feeling private`;
  }

  if (["husband","wife","spouse","partner","boyfriend","girlfriend","fiancé","fiancée"].includes(rel)) {
    return `This is a PARTNER/SPOUSE card. Rules:
- The sender knows this person better than anyone alive — write like it
- Avoid generic romance; favor real-life specific moments over broad declarations
- Reference the shared life: the small habits, the running jokes, the things only they would understand
- Intimacy here is in the detail, not the volume of sentiment
- Do NOT write "you are my everything" or similar sweeping declarations — those are earned through specifics
- Allowed to be vulnerable, playful, or both — depends on what the context shows`;
  }

  if (["mom","mother"].includes(rel)) {
    return `This is a MOTHER card. Rules:
- Channel genuine gratitude and a sense of life perspective — she shaped who the sender is
- Favor specific inherited qualities, sacrifices she made, or things the sender now does because of her
- Can be warm and slightly reverent, but avoid saccharine — earned sentiment beats empty praise
- She will likely keep this card — write accordingly
- Allowed to reference family history, specific memories, or recent life milestones`;
  }

  if (["dad","father"].includes(rel)) {
    return `This is a FATHER card. Rules:
- Dad cards often understate — that's a feature, not a bug
- Favor quiet appreciation, things he taught without saying them, and specific shared moments
- If the relationship shows humor, a well-placed joke or callback earns more than pure sentimentality
- Avoid over-the-top emotional language — a card that makes him proud without making him uncomfortable
- References to specific skills, hobbies, or shared experiences land best`;
  }

  if (["son","boy"].includes(rel)) {
    return `This is a PARENT-TO-SON card. Rules:
- Write as a proud parent — this is about his growth, not generic encouragement
- Reference specific things he's doing, becoming, or has achieved
- The emotional range spans proud → playful → deeply loving — let the context guide which
- Avoid life-lesson lectures in the card — a specific observation is worth ten pieces of advice
- He should feel genuinely seen, not universally praised`;
  }

  if (["daughter","girl"].includes(rel)) {
    return `This is a PARENT-TO-DAUGHTER card. Rules:
- Write as a proud parent who notices the specific person she's becoming
- Reference her actual life: her interests, her recent moments, her growth
- Can be warmer and more openly emotional than a son card — but still grounded in specifics
- Avoid telling her who to be; celebrate who she already is
- She should feel seen, not just loved`;
  }

  if (["brother"].includes(rel)) {
    return `This is a SIBLING (BROTHER) card. Rules:
- Only a sibling can mix roast and sincerity in the same breath — lean into that
- The dynamic: shared history, mutual knowing, teasing as a form of love
- If there's an inside joke or shared embarrassing memory in the context — use it
- The card should have at least one moment of genuine warmth buried under the banter
- Avoid being too Hallmark; avoid being too mean — the sweet spot is the callback`;
  }

  if (["sister"].includes(rel)) {
    return `This is a SIBLING (SISTER) card. Rules:
- Sister cards can carry more open warmth than brother cards but still benefit from humor
- Shared history, the specific dynamic they have, moments only they remember
- She knows the sender too well for generic sentiment to land — be specific
- A good sister card reads like a text they'd actually send, just more considered`;
  }

  if (rel.includes("grandma") || rel.includes("grandmother") || rel.includes("grandpa") || rel.includes("grandfather") || rel.includes("grandparent")) {
    return `This is a GRANDPARENT card. Rules:
- Warmth and respect, with a specific generational connection
- Reference what they've given across generations — wisdom, stories, presence
- Avoid being condescending or overly simplified
- A good grandparent card references something specific about this person — not just "grandparent"
- Can be nostalgic, loving, and reflective`;
  }

  if (rel.includes("friend") || rel.includes("bestie") || rel.includes("buddy")) {
    const isBestFriend = rel.includes("best") || rel.includes("bestie");
    return `This is a FRIEND card${isBestFriend ? " (best friend)" : ""}. Rules:
- A friend card should sound like the sender, not a greeting card company
- Conversational, specific, and real — favor stories and callbacks over broad affirmations
- If humor fits the context, use it — friends appreciate being made to laugh
- The opening line should feel like something you'd actually say to this person
- Avoid "you've always been there for me" and similar vague loyalty statements
- Reference what makes THIS friendship specific`;
  }

  return `This is a personal relationship card. Rules:
- Be genuine and specific to what we know about this person
- Write like the sender, not like a card company
- Use the provided context to make this feel like it could only be about them`;
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildSystemPrompt(
  firstName: string,
  relationship: string,
  occasion: string,
  archetypes: string[],
  avoidList: string[],
): string {
  const relRules = buildRelRules(relationship, occasion);
  const archetypeStr = archetypes.join(" + ");
  const avoidStr = avoidList.length > 0
    ? `\n\nHARD AVOIDS (from sender preferences — absolute, no exceptions):\n${avoidList.map(p => `- "${p}"`).join("\n")}`
    : "";

  return `You are a professional card writer for F*I Forgot — a high-end card service that writes cards people would have written themselves if they'd had the time.

Relationship: ${relationship} (${archetypeStr} occasion: ${occasion})

${relRules}

═══════════════════════════════════════════
QUALITY REQUIREMENTS — every card must pass all of these
═══════════════════════════════════════════

1. SPECIFICITY
   Every card must contain at least 2 specific personal references drawn from the provided context.
   If a card could be sent to 100 people without modification, it has failed.
   Good: "It still makes me laugh that a casual attempt to try pickleball somehow turned into a regular part of your week."
   Bad: "Hope you have a wonderful birthday."

2. MEMORY WEAVING
   Do not mention one memory at a time. Weave multiple sources together naturally.
   Good: "Between the kitchen renovation finally wrapping up and your new pickleball phase, it feels like you've turned this year into two completely different adventures."
   Bad: "Congrats on finishing your kitchen." / "You enjoy pickleball."

3. OPENING LINES
   The first sentence must immediately feel personal. Never open with a generic greeting.
   Do NOT open with: "Happy Birthday", "Just wanted to wish you", "Hope you have", any holiday greeting phrase.
   Instead open with: a memory, an observation, a callback, a joke, a recent life update, a reflection.
   Each of the 3 versions must have a COMPLETELY different opening line — different structure, different angle.

4. CLOSING LINES
   End with something memorable: appreciation, a shared memory, optimism about something happening in their life, or a relationship-specific sentiment.
   Do NOT end with: "Have a great day", "Have a wonderful day", "Hope your day is amazing", "Wishing you the best", or any of the banned phrases below.
   The final paragraph should feel like it could only be written by someone who actually knows this person.

5. RELATIONSHIP VOICE
   A card to a spouse must read completely differently from a card to a parent, which reads completely differently from a card to a friend.
   The voice, familiarity, and emotional register should make the relationship obvious.

6. STORYTELLING
   Reference events as small stories, not as facts.
   Bad: "You enjoy pickleball." Better: "It still makes me laugh that a casual attempt to try pickleball somehow turned into a regular part of your week."

═══════════════════════════════════════════
BANNED PHRASES — using any of these is an automatic failure
═══════════════════════════════════════════
${BANNED_PHRASES_SYSTEM.map(p => `"${p}"`).join(", ")}${avoidStr}`;
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
  signOff: string | undefined,
  contextSupplement: string | null,
): string {
  const contextLines: string[] = [];
  const rel = relationship.toLowerCase();

  if (relAnswers && Object.keys(relAnswers).length > 0) {
    contextLines.push("--- Relationship profile (use as raw material) ---");
    for (const [key, val] of Object.entries(relAnswers)) {
      if (val?.trim()) contextLines.push(`  ${key}: ${val}`);
    }
  }
  if (details?.trim()) contextLines.push(`Extra details / memories to include: ${details}`);
  if (avoidMentioning?.trim()) contextLines.push(`NEVER mention any of these: ${avoidMentioning}`);

  const bodyContext = contextLines.length > 0
    ? `${contextLines.join("\n")}`
    : "";

  const context = (bodyContext || contextSupplement)
    ? `\nWhat we know about ${firstName}:\n${bodyContext}${bodyContext && contextSupplement ? "\n" : ""}${contextSupplement ?? ""}\n`
    : "";

  const emotional = emotionalOpenness.toLowerCase();
  const emotionGuide =
    emotional.includes("just funny")        ? "Keep emotion to zero — pure humor." :
    emotional.includes("little appreciation") ? "Add just one genuine line of appreciation at the very end." :
    emotional.includes("not mushy")          ? "Be meaningful but keep it grounded — no over-the-top sentiment." :
    emotional.includes("heartfelt")          ? "Go clearly heartfelt — let the real feeling show." :
    emotional.includes("deep")               ? "Go deep and emotional — this is the full version." :
    "Be genuine but not excessive.";

  const isPro = PROFESSIONAL_RELS.includes(rel);

  const options = isPro ? [
    { label: "Best Match",      desc: `Professional, warm, specific to the work relationship with ${firstName}.` },
    { label: "More Casual",     desc: `Warmer and slightly more personal — still appropriate for work.` },
    { label: "More Heartfelt",  desc: `More genuinely human — the version that actually means something.` },
  ] : [
    { label: "Best Match",      desc: `Closest to inputs. ${tone} tone. ${emotionGuide} Uses the most personally relevant memories from context.` },
    { label: "More Casual",     desc: `Looser and more conversational — like something the sender would actually text. May lead with humor or a casual callback. ${emotionGuide}` },
    { label: "More Heartfelt",  desc: `Goes deeper into the emotional register — the version they might keep. Leans into the most meaningful memory or observation available.` },
  ];

  const optionBlock = options.map(o => `Option: "${o.label}" — ${o.desc}`).join("\n");

  return `Write 3 versions of a ${occasion} card for ${firstName} (${relationship}).
${context}
Occasion: ${occasion}
Main objective: ${objective}
Requested tone: ${tone}
Emotional level: ${emotionGuide}

${optionBlock}

MEMORY DENSITY REQUIREMENT: Every card must contain at least 2 specific personal references from the context above. Do not write a generic card when context exists. Weave multiple memories or facts together naturally rather than listing them.

PRIORITY ORDER for context when space is limited:
1. Event Briefing Answers (most specific to this card)
2. Fresh Updates — last 90 days (most recent life moments)
3. Follow-Up Answers (recent conversations)
4. Profile Question Answers
5. Fresh Updates — 90–180 days old
6. Older context
7. Card history (to avoid repetition)

Write as ${senderName} speaking directly to ${firstName}.
Each version must open completely differently — different angle, different voice, different structure.
Never write a specific number of years (e.g. "seven years", "3 years") — use the depth of history to inform emotional familiarity, not as literal text.
${signOff ? `End every card with exactly this sign-off on its own line: "${signOff}" — do not alter, rephrase, or add anything to it.` : `End every card with the sender's name on its own line — use "${senderName}" unless it is "Me", in which case write "[Your Name]".`}

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

// ── Internal quality scorer ───────────────────────────────────────────────────
// Pure TypeScript — no API call. Scores 0–100 across five dimensions.
// This score is INTERNAL ONLY and never shown to users.

export interface CardQualityScore {
  total:            number;  // 0–100
  specificity:      number;  // 0–25: count of context-item hits in card text
  memoryUsage:      number;  // 0–25: multiple memory sources woven in
  openingQuality:   number;  // 0–20: non-generic opening line
  closingQuality:   number;  // 0–15: non-generic closing line
  aiPhraseDetection: number; // 0–15: absence of banned phrases (high = clean)
}

const QUALITY_SCORER_BANNED_PHRASES: string[] = [
  "wishing you all the best", "wishing you the best", "warmest wishes", "heartfelt wishes",
  "wishing you happiness", "wishing you joy", "wishing you a wonderful",
  "hope your day is as special as you are", "hope this day brings you",
  "may all your wishes come true", "may your year be filled with", "may your day be filled with",
  "on this special day", "on this special occasion", "this special day",
  "another trip around the sun", "time to celebrate", "this is your day", "celebrate you",
  "just wanted to wish you", "i just wanted to take a moment", "wanted to take a moment",
  "i wanted to reach out", "have a wonderful day", "have a great day",
  "hope your day is amazing", "all the best", "best wishes",
  "cherish every moment", "you deserve all the best", "you deserve only the best",
  "so blessed to have you", "truly blessed", "you are so special",
  "words cannot express", "from the bottom of my heart", "rare person",
  "one of a kind", "impossible not to like", "in these uncertain times",
  "this year more than ever", "thoughts and prayers", "today and every day",
];

const GENERIC_OPENINGS = [
  "happy birthday", "happy anniversary", "happy mother's day", "happy father's day",
  "happy valentine's day", "happy holidays", "just wanted", "i just wanted",
  "hope you have a", "wishing you a", "it's your birthday",
];

const GENERIC_CLOSINGS = [
  "have a great day", "have a wonderful day", "hope your day is amazing",
  "wishing you the best", "all the best", "best wishes", "warmest wishes",
  "many more to come", "wishing you all the best",
];

function scoreCardQuality(
  cardText: string,
  context: RecipientContext | null,
  contextSupplement: string | null,
): CardQualityScore {
  const lower = cardText.toLowerCase();
  const paragraphs = cardText.split(/\n+/).filter(p => p.trim());
  const firstParagraph = (paragraphs[0] ?? "").toLowerCase();
  const lastParagraph  = (paragraphs[paragraphs.length - 1] ?? "").toLowerCase();

  // ── AI Phrase Detection (0–15) ─────────────────────────────────────────────
  let bannedHits = 0;
  for (const phrase of QUALITY_SCORER_BANNED_PHRASES) {
    if (lower.includes(phrase)) bannedHits++;
  }
  const aiPhraseDetection = Math.max(0, 15 - bannedHits * 5);

  // ── Opening Quality (0–20) ─────────────────────────────────────────────────
  const badOpening = GENERIC_OPENINGS.some(g => firstParagraph.startsWith(g));
  const openingQuality = badOpening ? 0 : 20;

  // ── Closing Quality (0–15) ─────────────────────────────────────────────────
  const badClosing = GENERIC_CLOSINGS.some(g => lastParagraph.includes(g));
  const closingQuality = badClosing ? 0 : 15;

  // ── Specificity & Memory Usage (0–25 each) ────────────────────────────────
  // Collect all known context items: answers, interests, memories, traits
  const contextItems: string[] = [];
  let memorySources = 0;

  if (context) {
    // Fresh updates
    if (context.freshUpdates.length > 0) {
      memorySources++;
      for (const u of context.freshUpdates) {
        // Extract significant words from each answer (>5 chars)
        const words = u.answer.split(/\s+/).filter(w => w.length > 5).slice(0, 5);
        contextItems.push(...words);
      }
    }
    // Briefing answers
    if (context.briefingSummary.totalAnswers > 0) {
      memorySources++;
      for (const a of context.briefingSummary.allAnswers) {
        const words = a.answer.split(/\s+/).filter(w => w.length > 5).slice(0, 5);
        contextItems.push(...words);
      }
    }
    // Follow-up answers
    if (context.followUpAnswers && context.followUpAnswers.length > 0) {
      memorySources++;
      for (const a of context.followUpAnswers) {
        const words = a.answer.split(/\s+/).filter(w => w.length > 5).slice(0, 5);
        contextItems.push(...words);
      }
    }
    // Memories / interests
    if (context.memories.favoriteMemories) {
      memorySources++;
      contextItems.push(...context.memories.favoriteMemories.split(/\s+/).filter(w => w.length > 5).slice(0, 8));
    }
    if (context.interests.length > 0) {
      memorySources++;
      contextItems.push(...context.interests);
    }
    if (context.personality.traits.length > 0) {
      contextItems.push(...context.personality.traits);
    }
  }

  // Deduplicate and score hits
  const uniqueItems = [...new Set(contextItems.map(i => i.toLowerCase()))];
  let specificityHits = 0;
  for (const item of uniqueItems) {
    if (item.length > 4 && lower.includes(item)) specificityHits++;
  }
  const specificity  = Math.min(25, specificityHits * 5);
  const memoryUsage  = Math.min(25, memorySources >= 2 ? 25 : memorySources === 1 ? 15 : 0);

  const total = aiPhraseDetection + openingQuality + closingQuality + specificity + memoryUsage;

  return { total, specificity, memoryUsage, openingQuality, closingQuality, aiPhraseDetection };
}

// ── Kept In Mind builder ──────────────────────────────────────────────────────

type KeptInMindSource = "freshUpdate" | "followUp" | "briefing" | "memory" | "insideJoke" | "tone";

function buildKeptInMindItems(context: RecipientContext | null): { items: string[]; sources: KeptInMindSource[] } {
  if (!context) return { items: [], sources: [] };
  const items: string[] = [];
  const sources: KeptInMindSource[] = [];

  function add(text: string, source: KeptInMindSource) {
    if (items.length >= 3 || !text.trim()) return;
    const trimmed = text.trim();
    items.push(trimmed.length > 72 ? trimmed.slice(0, 70) + "…" : trimmed);
    sources.push(source);
  }

  for (const u of context.freshUpdates.slice(0, 2))              { if (u.answer) add(u.answer, "freshUpdate"); }
  for (const a of (context.followUpAnswers ?? []).slice(0, 2))   { if (a.answer) add(a.answer, "followUp"); }
  for (const a of context.briefingSummary.allAnswers.slice(0, 1)){ if (a.answer) add(a.answer, "briefing"); }
  if (context.memories.favoriteMemories)   add(context.memories.favoriteMemories, "memory");
  if (context.memories.insideJokes)        add(context.memories.insideJokes, "insideJoke");
  if (context.tone.thingsToAlwaysInclude)  add(context.tone.thingsToAlwaysInclude, "tone");

  return { items, sources };
}

// ── Completeness calc ─────────────────────────────────────────────────────────

function calcCompleteness(relAnswers: Record<string, string>, details: string): number {
  let score = 30;
  if (Object.keys(relAnswers).length >= 1) score += 20;
  if (Object.keys(relAnswers).length >= 2) score += 10;
  if (details?.trim()) score += 30;
  return Math.min(score, 100);
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.post("/v2/generate-card", async (req, res) => {
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
    signOff,
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
    signOff?: string;
    recipientId?: string;
  };

  if (!firstName || !relationship || !occasion) {
    res.status(400).json({ error: "firstName, relationship, and occasion are required" });
    return;
  }

  // ── Recipient context assembly (non-blocking) ─────────────────────────────
  const userId = req.headers["x-user-id"] as string | undefined;
  let recipientContext: RecipientContext | null = null;

  if (recipientId && userId) {
    try {
      recipientContext = await assembleRecipientContext(recipientId, userId);
      logger.info({
        recipientId,
        contextVersion: recipientContext.contextVersion,
        contextUsed: true,
        briefingAnswers: recipientContext.briefingSummary.totalAnswers,
        followUpAnswers: recipientContext.followUpAnswers?.length ?? 0,
        freshUpdates: recipientContext.freshUpdates.length,
        hasCardHistory: recipientContext.cardHistory.totalSent > 0,
        archived: recipientContext.identity?.archived ?? false,
        profileScore: recipientContext.profileCompleteness.score,
      }, "v2-generate-card: recipient context assembled");
    } catch (ctxErr) {
      logger.warn({ ctxErr, recipientId }, "v2-generate-card: context assembly failed (non-fatal) — falling back to body fields");
    }
  } else {
    logger.info({
      recipientId: recipientId ?? null,
      hasUserId: !!userId,
      contextUsed: false,
    }, "v2-generate-card: no context (recipientId or x-user-id missing)");
  }

  const mergedAvoidList = [...avoidList, ...extractContextAvoids(recipientContext)];
  const contextSupplement = buildContextSupplement(recipientContext);

  const archetypes = determineArchetypes(relationship, occasion, objective, tone);
  logger.info({ firstName, relationship, occasion, archetypes, contextUsed: !!recipientContext }, "v2-generate-card: archetypes determined");

  const systemPrompt = buildSystemPrompt(firstName, relationship, occasion, archetypes, mergedAvoidList);
  const userPrompt = buildUserPrompt(firstName, relationship, occasion, objective, emotionalOpenness, tone, details, avoidMentioning, relAnswers, senderName, signOff, contextSupplement);

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

    // ── Quality scoring ────────────────────────────────────────────────────
    const scoredCards = parsed.cards.map(card => {
      const quality = scoreCardQuality(card.text, recipientContext, contextSupplement);
      return { ...card, _qualityScore: quality };
    });

    const avgQuality = scoredCards.length > 0
      ? Math.round(scoredCards.reduce((sum, c) => sum + c._qualityScore.total, 0) / scoredCards.length)
      : 0;

    logger.info({
      firstName, occasion,
      cardCount: scoredCards.length,
      avgQualityScore: avgQuality,
      cardScores: scoredCards.map(c => ({ tone: c.tone, quality: c._qualityScore.total })),
    }, "v2-generate-card: quality scored");

    // ── Save preferences to recipient memory ──────────────────────────────
    if (recipientId) {
      try {
        const completeness = calcCompleteness(relAnswers, details ?? "");
        await db
          .insert(recipientMemoryTable)
          .values({
            id: randomUUID(),
            recipientId,
            cardFuel: { details, avoidMentioning, relAnswers },
            cardPreferences: {
              preferredTone: tone,
              emotionalOpenness,
              avoidList,
              archetype: archetypes[0],
              lastQualityScore: avgQuality,
            },
            profileCompleteness: completeness,
          })
          .onConflictDoUpdate({
            target: recipientMemoryTable.recipientId,
            set: {
              cardFuel: { details, avoidMentioning, relAnswers },
              cardPreferences: {
                preferredTone: tone,
                emotionalOpenness,
                avoidList,
                archetype: archetypes[0],
                lastQualityScore: avgQuality,
              },
              profileCompleteness: completeness,
              updatedAt: new Date(),
            },
          });
      } catch (memErr) {
        logger.warn({ memErr }, "v2-generate-card: failed to save memory (non-fatal)");
      }
    }

    const browniePoints = userId
      ? await awardPoints(userId, "card_generate", recipientId ? { recipientId } : undefined).catch(() => null)
      : null;

    const { items: keptInMind, sources: keptInMindSources } = buildKeptInMindItems(recipientContext);
    res.json({ cards: scoredCards, browniePoints, keptInMind, keptInMindSources });
  } catch (err) {
    logger.error({ err }, "v2-generate-card: OpenAI call failed");
    res.status(500).json({ error: "Card generation failed" });
  }
});

// ── Feedback save ─────────────────────────────────────────────────────────────

router.post("/v2/card-feedback", async (req, res) => {
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

router.post("/v2/refine-card", async (req, res) => {
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
            "Do NOT add clichés or generic greeting-card language. " +
            `These phrases are banned: ${BANNED_PHRASES_SYSTEM.slice(0, 15).join(", ")}. ` +
            "Return ONLY the refined card text — no labels, no explanation.",
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
    res.json({ text: cardText });
  }
});

export default router;
