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
import {
  buildAuthenticatedContextRules,
  buildMemoryDensityRequirement,
  buildOrderedBodyContextLines,
  buildPrimaryContentPriorityBlock,
  buildPrimaryReasonRule,
  buildPrimarySubjectOutputContract,
  formatMainObjectiveLine,
} from "./v2GenerateCardContextLines";
import {
  buildRefineSystemPrompt,
  buildRefineUserPrompt,
  normalizeRefineGrounding,
  type RefineGroundingContext,
} from "./v2RefineCardGrounding";

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

export const BANNED_PHRASES_SYSTEM = [
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

export function buildRelRules(relationship: string, occasion: string): string {
  const rel = relationship.toLowerCase();
  const occ = occasion.toLowerCase();
  const isPro = PROFESSIONAL_RELS.includes(rel);

  if (isPro) {
    return `This is a PROFESSIONAL relationship. Rules:
- Warm and genuine but professionally appropriate at all times
- No romantic language, no emotional dependency language, no aggressive teasing
- Reference the work context: shared projects, professional growth, team moments — only what is present in the provided context
- A good work card feels personal without feeling private`;
  }

  if (["husband","wife","spouse","partner","boyfriend","girlfriend","fiancé","fiancée"].includes(rel)) {
    return `This is a PARTNER/SPOUSE card. Rules:
- The sender knows this person better than anyone alive — write like it
- Avoid generic romance; favor real-life specific moments over broad declarations
- If context provides shared life details, use them — small habits, running jokes, things only they would understand. If no context is provided, write with the warmth and earned familiarity of a close relationship without inventing those specifics
- Intimacy here is in the detail, not the volume of sentiment
- Do NOT write "you are my everything" or similar sweeping declarations — those are earned through specifics
- Allowed to be vulnerable, playful, or both — depends on what the context shows`;
  }

  if (["mom","mother"].includes(rel)) {
    return `This is a MOTHER card. Rules:
- Channel genuine gratitude and a sense of life perspective — she shaped who the sender is
- Favor specific inherited qualities, sacrifices she made, or things the sender now does because of her — only when present in context
- Can be warm and slightly reverent, but avoid saccharine — earned sentiment beats empty praise
- She will likely keep this card — write accordingly
- Reference family history, specific memories, or recent life milestones ONLY when they are present in the provided context — do not invent them`;
  }

  if (["dad","father"].includes(rel)) {
    return `This is a FATHER card. Rules:
- Dad cards often understate — that's a feature, not a bug
- Favor quiet appreciation, things he taught without saying them, and specific shared moments — but only use memories and moments that are present in context; do not invent them
- If the relationship shows humor, a well-placed joke or callback earns more than pure sentimentality
- Avoid over-the-top emotional language — a card that makes him proud without making him uncomfortable
- References to specific skills, hobbies, or shared experiences land best — only when those specifics are provided`;
  }

  if (["son","boy"].includes(rel)) {
    return `This is a PARENT-TO-SON card. Rules:
- Write as a proud parent — this is about his growth, not generic encouragement
- Reference specific things he's doing, becoming, or has achieved — drawn from the provided context, not invented
- The emotional range spans proud → playful → deeply loving — let the context guide which
- Avoid life-lesson lectures in the card — a specific observation is worth ten pieces of advice
- He should feel genuinely seen, not universally praised`;
  }

  if (["daughter","girl"].includes(rel)) {
    return `This is a PARENT-TO-DAUGHTER card. Rules:
- Write as a proud parent who notices the specific person she's becoming
- Reference her actual life from the provided context — her interests, her recent moments, her growth. Do not invent these details
- Can be warmer and more openly emotional than a son card — but still grounded in specifics from context
- Avoid telling her who to be; celebrate who she already is
- She should feel seen, not just loved`;
  }

  if (["brother"].includes(rel)) {
    return `This is a SIBLING (BROTHER) card. Rules:
- Only a sibling can mix roast and sincerity in the same breath — lean into that
- The dynamic: shared history and mutual knowing — but only reference shared history when it exists in the provided context; do not invent it simply because a sibling relationship implies one might exist
- If there's an inside joke or shared embarrassing memory in the context — use it
- The card should have at least one moment of genuine warmth buried under the banter
- Avoid being too Hallmark; avoid being too mean — the sweet spot is the callback`;
  }

  if (["sister"].includes(rel)) {
    return `This is a SIBLING (SISTER) card. Rules:
- Sister cards can carry more open warmth than brother cards but still benefit from humor
- Reference shared history and the specific dynamic they have — but only when present in context. Do not invent shared moments, memories, or traditions
- She knows the sender too well for generic sentiment to land — be specific to what context provides
- A good sister card reads like a text they'd actually send, just more considered`;
  }

  if (rel.includes("grandma") || rel.includes("grandmother") || rel.includes("grandpa") || rel.includes("grandfather") || rel.includes("grandparent")) {
    return `This is a GRANDPARENT card. Rules:
- Warmth and respect, with a specific generational connection
- Reference what they've given across generations — wisdom, stories, presence — when the context supports it
- Avoid being condescending or overly simplified
- A good grandparent card references something specific about this person when context provides it — do not invent specifics when context is absent
- Can be nostalgic, loving, and reflective`;
  }

  if (rel.includes("friend") || rel.includes("bestie") || rel.includes("buddy")) {
    const isBestFriend = rel.includes("best") || rel.includes("bestie");
    return `This is a FRIEND card${isBestFriend ? " (best friend)" : ""}. Rules:
- A friend card should sound like the sender, not a greeting card company
- Conversational, specific, and real — favor stories and callbacks WHEN THEY EXIST in context. Without context, write warmly and genuinely about the value of the friendship without inventing its history
- If humor fits the context, use it — friends appreciate being made to laugh
- The opening line should feel like something you'd actually say to this person
- Avoid "you've always been there for me" and similar vague loyalty statements
- Reference what makes THIS friendship specific — but only what the context actually tells you; do not invent the specific
- WITHOUT CONTEXT — do NOT imply the friendship has any documented history, even abstractly. No "adventures", "memories we've made", "what we've been through", "fun times and the hard ones", "endless laughs", "shared moments", or anything that asserts an undocumented past. A correct no-context friend card says something genuinely true: that you're glad they're your friend, that the occasion is worth noting, and that you hope the year ahead is good for them. Nothing more.`;
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
  hasPrimary = false,
  hasSupport = false,
): string {
  const relRules = buildRelRules(relationship, occasion);
  const archetypeStr = archetypes.join(" + ");
  const avoidStr = avoidList.length > 0
    ? `\n\nHARD AVOIDS (from sender preferences — absolute, no exceptions):\n${avoidList.map(p => `- "${p}"`).join("\n")}`
    : "";

  const specificityBlock = hasPrimary
    ? (hasSupport
      ? `1. SPECIFICITY
   A primary reason for this card is provided in the user message. That primary reason is the required subject.
   Keep important concrete nouns and named subjects from the primary reason visible in the card. Do not replace them with vague stand-ins ("what I needed", "everything you did", "being there for me", "your help").
   A supporting memory is also provided. When retained, keep one brief recognizable callback subordinate to the primary, normally once. The card should normally contain that callback while keeping the primary reason dominant. The model may omit or soften the supporting detail only when doing so clearly produces a more appropriate, tactful, or user-compliant card, such as when the user explicitly requests removing or replacing it, an avoid instruction conflicts with it, repeating it would materially reduce the quality of the card, or the detail is inappropriate for the occasion. Paraphrasing is encouraged. The factual core should remain recognizable whenever the supporting detail is retained. Do not invent additional memories. Do not replace the supplied supporting memory with an unrelated generic joke, metaphor, or invented anecdote. A vivid supporting memory must never outrank or replace the primary subject.
   If a card could be sent to 100 people without modification, it has failed.
   Good: name the concrete deed from the primary reason and a brief recognizable callback to the supplied support (when retained).
   Bad: vague gratitude that could apply to any favor, or a generic joke that displaces the supplied personal detail.

   PROHIBITED — do NOT use any of these, even abstractly:
   - Implied shared history: "adventures", "another adventure", "shared moments", "we've been through", "shared so many moments", "fun times and the hard ones", "memories we've made", "unforgettable memories", "all we've shared"
   - Abstract emotional claims: "endless laughs", "always there for me", "always been there", "through thick and thin", "every step of the way"
   - Invented traits or qualities: "your kindness", "your warmth", "your humor", "your steady presence", "your integrity", "your support"
   - Anything implying a documented past: road trips, inside jokes, playlists, gaming, family chaos, "what we've built", "how far we've come"

   A simple truthful card that keeps the primary subject (and normally retains supplied support when appropriate) passes. A card that invents history or erases the primary subject fails.`
      : `1. SPECIFICITY
   A primary reason for this card is provided in the user message. That primary reason is the required subject.
   Keep important concrete nouns and named subjects from the primary reason visible in the card. Do not replace them with vague stand-ins ("what I needed", "everything you did", "being there for me", "your help").
   No supporting memory was provided — do not invent one.
   If a card could be sent to 100 people without modification, it has failed.
   Good: name the concrete deed from the primary reason.
   Bad: vague gratitude that could apply to any favor.

   PROHIBITED — do NOT use any of these, even abstractly:
   - Implied shared history: "adventures", "another adventure", "shared moments", "we've been through", "shared so many moments", "fun times and the hard ones", "memories we've made", "unforgettable memories", "all we've shared"
   - Abstract emotional claims: "endless laughs", "always there for me", "always been there", "through thick and thin", "every step of the way"
   - Invented traits or qualities: "your kindness", "your warmth", "your humor", "your steady presence", "your integrity", "your support"
   - Anything implying a documented past: road trips, inside jokes, playlists, gaming, family chaos, "what we've built", "how far we've come"

   A simple truthful card that keeps the primary subject passes. A card that invents history or erases the primary subject fails.`)
    : `1. SPECIFICITY
   IF context is provided above (profile answers, memories, fresh updates):
   The card must contain at least 2 specific personal references drawn from that context.
   If a card could be sent to 100 people without modification, it has failed.
   Good: "Six months of training and a finish line later — that's not a small thing."
   Bad: "Hope you have a wonderful birthday."

   IF context is absent (no profile answers, no memories, no updates provided):
   Write a warm, honest, 3–5 sentence card. Do NOT invent or imply anything not provided.

   PROHIBITED — do NOT use any of these, even abstractly:
   - Implied shared history: "adventures", "another adventure", "shared moments", "we've been through", "shared so many moments", "fun times and the hard ones", "memories we've made", "unforgettable memories", "all we've shared"
   - Abstract emotional claims: "endless laughs", "always there for me", "always been there", "through thick and thin", "every step of the way"
   - Invented traits or qualities: "your kindness", "your warmth", "your humor", "your steady presence", "your integrity", "your support"
   - Anything implying a documented past: road trips, inside jokes, playlists, gaming, family chaos, "what we've built", "how far we've come"

   WHAT IS ALLOWED without context:
   - Honest appreciation for the relationship itself: "Glad to have you as a friend."
   - Observation about the occasion: "Birthdays are a good excuse to say the things you don't always get around to saying."
   - A genuine forward-looking sentiment: "Hope this year brings you good things."

   CORRECT (no context): "Matty, birthdays are a good excuse to say I'm glad to have you as a friend. I hope this year brings you good things, good people, and plenty worth looking forward to. Happy Birthday."
   WRONG (no context): "Here's to another adventure in the books — so many memories, endless laughs, the fun times and the hard ones."

   A simple truthful card passes. A card that invents or implies history fails.`;

  const memoryWeavingBlock = hasPrimary
    ? (hasSupport
      ? `2. MEMORY WEAVING
   Center the card on the primary subject. Normally weave the supplied supporting detail once as brief subordinate color — recognizable, not overexplained. Omit or soften only when that clearly produces a more appropriate, tactful, or user-compliant card (explicit remove/replace request, avoid conflict, material quality harm, or occasion-inappropriate detail). Do not invent additional memories. Prefer the supplied support for humor/color over inventing an unrelated joke.`
      : `2. MEMORY WEAVING
   When a primary reason exists: center the card on that primary subject. No supporting detail was supplied — do not invent one to weave. Write warmly without invented history.`)
    : `2. MEMORY WEAVING
   IF multiple memories are present in context: Weave them together naturally rather than listing them.
   Good: "Between the kitchen renovation finally wrapping up and your new pickleball phase, it feels like you've turned this year into two completely different adventures."
   Bad: "Congrats on finishing your kitchen." / "You enjoy pickleball."
   IF one memory is present: Build the card around that single anchor — do not invent additional memories to weave.
   IF no memories are present: Do not invent memories to weave. Write warmly without invented history.`;

  const openingBlock = hasPrimary
    ? `3. OPENING LINES
   The first sentence must feel personal. Never open with a generic greeting.
   Do NOT open with: "Happy Birthday", "Just wanted to wish you", "Hope you have", any holiday greeting phrase.
   Open with or immediately center the primary reason for this card. Supporting memories may follow as color, but must not lead the card into a different subject.`
    : `3. OPENING LINES
   The first sentence must feel personal. Never open with a generic greeting.
   Do NOT open with: "Happy Birthday", "Just wanted to wish you", "Hope you have", any holiday greeting phrase.
   When context exists, open with: a memory, an observation, a callback, a joke, a recent life update, a reflection.
   When no context exists, open with: a relationship reflection, an occasion reflection, or honest appreciation — NOT an invented memory or invented shared experience.`;

  return `You are a professional card writer for F*I Forgot — a high-end card service that writes cards people would have written themselves if they'd had the time.

Relationship: ${relationship} (${archetypeStr} occasion: ${occasion})

${relRules}

═══════════════════════════════════════════
QUALITY REQUIREMENTS — the card must pass all of these
═══════════════════════════════════════════

${specificityBlock}

${memoryWeavingBlock}

${openingBlock}

4. CLOSING LINES
   End with something memorable: appreciation, a shared memory, optimism about something happening in their life, or a relationship-specific sentiment.
   Do NOT end with: "Have a great day", "Have a wonderful day", "Hope your day is amazing", "Wishing you the best", or any of the banned phrases below.
   The final paragraph should feel like it could only be written by someone who actually knows this person.
   GOOD closing examples — use these as models, adapted to the specific person and context:
   - Forward reference: "Next time you're on that court, I'll be thinking of you." (ties the ending to something active in their life)
   - Callback to shared history: "I keep thinking about how far you've come from that first tiny apartment."
   - Relationship anchor: "Being your dad is still the best thing I've done."
   - Current-moment tie-in: "With everything you've got going on this year, I just want you to know I see it."
   A strong closing references something specific about this person's life right now, not a generic wish.

5. RELATIONSHIP VOICE
   A card to a spouse must read completely differently from a card to a parent, which reads completely differently from a card to a friend.
   The voice, familiarity, and emotional register should make the relationship obvious.

6. STORYTELLING
   Reference facts from context as small stories, not as bare facts.
   Good: "Six months of training and one finish line later — that's not a small thing."
   Bad (when that origin story is not in the context): "It still makes me laugh that a casual attempt to try pickleball somehow turned into a regular part of your week." — this invents the "casual attempt" origin and the escalation. Only expand on facts that exist. Do not add invented origin stories, invented escalation, or invented emotional framing to bare facts.

7. ANTI-FABRICATION (permanent — applies regardless of context level — no exceptions)
   NEVER invent any of the following unless they are explicitly present in the provided context:
   - Trips or travel ("remember our road trip to the coast...")
   - Hobbies or interests not stated ("you make the perfect cup of coffee")
   - Personality traits not stated ("your kindness, humor, and unwavering support")
   - Traditions or rituals not stated
   - Conversations or exchanges not stated
   - Family dynamics not stated
   - Inside jokes not stated
   - Relationship history not stated
   - Shared experiences not stated
   If context is limited, write with humility. Do not pretend the relationship is richer, closer, or more documented than the available information supports. A card that honestly reflects a simple relationship is better than a card that invents a rich one.

   ONE INFERENCE RULE — one fact → one observation about the difficulty or significance of THAT ACTION only.

   SINGLE-FACT CARD FORMULA — when context contains only one fact, the card must contain EXACTLY these elements and nothing else:
   [1] Name the fact: "Your first 10K last weekend" / "finishing that marathon after six months of training"
   [2] Comment on THAT ACTION — its difficulty, what it took physically, or what it meant logistically: "Those miles are not a joke." / "Months of early mornings and sore legs." / "That's a hard thing to do."
   [3] Sender's genuine feeling: "I'm proud of you." / "Glad you're my friend." / "Couldn't be happier for you."
   [4] Birthday wish.

   After step 4: STOP. The card is complete. Do NOT add any of the following:
   - Any adjective describing the person's character: dedicated, driven, determined, disciplined, resilient, motivated, inspiring, or any paraphrase
   - Any claim about what the person "always" or "never" does
   - Any claim about how the person affects others: "you inspire me / everyone / people around you"
   - Any claim that the action reveals something about who they are as a person
   - "What dedication looks like" / "shown real commitment" / "that's so you" / "that's just who you are"

   ASK YOURSELF before each sentence: "Does this say something about the action, or about the person?" If about the person and NOT in the provided context — cut it.

═══════════════════════════════════════════
BANNED PHRASES — using any of these is an automatic failure
═══════════════════════════════════════════
${BANNED_PHRASES_SYSTEM.map(p => `"${p}"`).join(", ")}${avoidStr}

═══════════════════════════════════════════
MANDATORY OUTPUT REVIEW — do this before returning JSON
═══════════════════════════════════════════
Before writing the JSON, scan every sentence in the card for these patterns. If any appear and are NOT explicitly stated in the provided context, rewrite that sentence before outputting:

SCAN FOR AND REMOVE if not in context:
- The words "dedication", "dedicated" applied to the person ("a testament to your dedication" → cut entirely or rewrite as "that race was hard-earned")
- The words "inspiring", "inspired" applied to person or action ("was honestly inspiring" → cut or rewrite as "I'm proud of you for seeing it through")
- The words "driven", "determined", "disciplined", "resilient", "motivated" applied to the person
- Any variant of "you always/never [trait]"
- Any claim about how the person affects others ("you inspire me", "having you as a friend pushes me")
- "a testament to your [anything]" when not in context
- "shown what [trait] looks like"

REWRITE STRATEGY: Replace character-adjective sentences with one of:
- A direct description of what the action required: "Those were real miles."
- The sender's genuine feeling: "I'm proud of you." / "Glad to have you as a friend."
- A birthday wish.
If you cut a sentence and the card becomes shorter — that is correct. A shorter honest card is better than a longer invented one.`;
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
  primaryOccasionContext?: string,
  objectiveProvided = false,
): string {
  const rel = relationship.toLowerCase();
  const primary = primaryOccasionContext?.trim() || "";
  const hasPrimary = primary.length > 0;
  const hasSupport = !!(details?.trim());

  const contextLines = buildOrderedBodyContextLines({
    relAnswers,
    primaryOccasionContext,
    details,
    avoidMentioning,
  });

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
  const hasContext = !!(bodyContext || contextSupplement);
  const hasContextSupplement = !!contextSupplement?.trim();

  const supportBrief = hasSupport
    ? `Normally include one brief recognizable callback to the supplied supporting detail while keeping the primary reason dominant. Omit or soften only when that clearly produces a more appropriate, tactful, or user-compliant card (explicit remove/replace request, avoid conflict, material quality harm, or occasion-inappropriate detail). Prefer that detail for humor/color when retained over inventing an unrelated joke. Do not invent extra memories. Do not replace a supplied supporting detail with an unrelated generic joke, metaphor, or invented anecdote.`
    : `No supporting detail was supplied — do not invent one.`;

  const polishGuide = isPro
    ? (hasPrimary
      ? `Write one polished professional card. ${tone} tone. ${emotionGuide} Center the primary reason. ${supportBrief}`
      : `Write one polished professional card for ${firstName}. ${tone} tone. ${emotionGuide}`)
    : hasPrimary
      ? `Write one polished card. ${tone} tone. ${emotionGuide} Center the primary reason. ${supportBrief}`
      : hasContext
        ? `Write one polished card. ${tone} tone. ${emotionGuide} Open with and use the most personally relevant facts from the provided context. Do not invent facts.`
        : `Write one polished card. ${tone} tone. ${emotionGuide} Warm, honest, and genuine — no specific memories to invent. Write 3–5 sentences that feel real for this relationship and occasion.`;

  const primaryBlocks = hasPrimary
    ? `\n${buildPrimaryContentPriorityBlock(hasSupport)}

${buildPrimaryReasonRule(hasSupport)}
`
    : "";

  const objectiveLine = formatMainObjectiveLine(objectiveProvided, objective);
  const densityBlock = buildMemoryDensityRequirement(hasPrimary, hasSupport);
  const authRules = buildAuthenticatedContextRules({
    hasContextSupplement,
    hasPrimary,
  });
  const primaryOutputContract = hasPrimary
    ? buildPrimarySubjectOutputContract(primaryOccasionContext, details)
    : "";

  return `Write one ${occasion} card for ${firstName} (${relationship}).
${context}
Occasion: ${occasion}
${objectiveLine}Requested tone: ${tone}
Emotional level: ${emotionGuide}
${primaryBlocks}
CARD BRIEF: ${polishGuide}

${densityBlock}
${authRules}${!hasContext ? `
LOW-CONTEXT CONSTRAINT — no context was provided for this person. These phrases are banned. Using any one of them is an automatic failure:
"adventure", "adventures", "another adventure in the books", "shared moments", "shared so many moments", "we've been through", "been through a lot", "fun times and the hard ones", "the hard ones", "unforgettable memories", "unforgettable", "endless laughs", "always there for me", "always been there", "through thick and thin", "every step of the way", "road trip", "inside jokes", "gaming", "playlists", "family chaos", "unwavering support", "kindness", "what we've built", "how far we've come", "memories we've made"
The card must be 3–5 sentences. Warm, honest, and simple. No invented history. No implied past.
` : ""}
Write as ${senderName} speaking directly to ${firstName}.
Never write a specific number of years (e.g. "seven years", "3 years") — use the depth of history to inform emotional familiarity, not as literal text.
${signOff ? `End the card with exactly this sign-off on its own line: "${signOff}" — do not alter, rephrase, or add anything to it.` : `End the card with the sender's name on its own line — use "${senderName}" unless it is "Me", in which case write "[Your Name]".`}
${primaryOutputContract ? `\n${primaryOutputContract}\n` : ""}
Return valid JSON only:
{
  "cards": [
    { "tone": "Draft", "text": "..." }
  ]
}
Use \\n for line breaks. No markdown. JSON only. The cards array must contain exactly one card.`;
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

type KeptInMindSource =
  | "freshUpdate" | "followUp" | "briefing"
  | "memory" | "insideJoke"
  | "avoid" | "tone"
  | "interest" | "personality";

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

  // Most specific / freshest first
  for (const u of context.freshUpdates.slice(0, 2))              { if (u.answer) add(u.answer, "freshUpdate"); }
  for (const a of (context.followUpAnswers ?? []).slice(0, 2))   { if (a.answer) add(a.answer, "followUp"); }
  for (const a of context.briefingSummary.allAnswers.slice(0, 1)){ if (a.answer) add(a.answer, "briefing"); }
  if (context.memories.favoriteMemories)                           add(context.memories.favoriteMemories, "memory");
  if (context.memories.insideJokes)                                add(context.memories.insideJokes, "insideJoke");
  if (context.tone.thingsToAvoid)                                  add(context.tone.thingsToAvoid, "avoid");
  if (context.tone.thingsToAlwaysInclude)                          add(context.tone.thingsToAlwaysInclude, "tone");
  if (context.interests.length > 0)                                add(context.interests.slice(0, 3).join(", "), "interest");
  if (context.personality.traits.length > 0)                      add(context.personality.traits.join(", "), "personality");
  if (context.personality.notes)                                   add(context.personality.notes, "personality");

  return { items, sources };
}

// ── Post-generation character-adjective filter ────────────────────────────────
// Strips sentences that attribute fabricated character traits to the recipient
// when those traits were NOT present in the provided context.
// This is a hard-enforcement layer — the model's prior for athletic/achievement
// facts → character adjectives is too strong to eliminate via prompt alone.

const CHARACTER_TRAIT_WORDS: RegExp[] = [
  /\bdedication\b/i,
  /\bdedicated\b/i,
  /\bdriven\b/i,
  /\bdetermined\b/i,
  /\bdetermination\b/i,
  /\bdisciplined\b/i,
  /\bresilient\b/i,
  /\bresilience\b/i,
  /\binspiring\b/i,
  /\binspirations?\b/i,
  /\binspires?\b/i,
  /\binspired\b/i,
  /\bmotivated\b/i,
  /\bmotivation\b/i,
  /\bgrit\b/i,
  /\btenacious\b/i,
  /\btenacity\b/i,
  /\bresolve\b/i,
  /\bcommitment\b/i,
  /\bcommitted\b/i,
  /\bwillpower\b/i,
  /\bundaunted\b/i,
  /\bperseverance\b/i,
  /\bpersevere\b/i,
  /\bpersevered\b/i,
  /\bpushes? (yourself|themselves|herself|himself)\b/i,
  /\btestament to your\b/i,
];

function stripFabricatedCharacterAdjectives(
  cardText: string,
  contextText: string,
  firstName: string,
): { text: string; strippedSentences: string[] } {
  const ctxLower = contextText.toLowerCase();
  const strippedSentences: string[] = [];

  // Split on sentence-ending punctuation + space, keeping delimiters
  const sentences: string[] = [];
  let remainder = cardText;
  const re = /[^.!?]*[.!?]+["']?(\s*)/g;
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(cardText)) !== null) {
    sentences.push(m[0]);
    remainder = cardText.slice(re.lastIndex);
  }
  if (remainder.trim()) sentences.push(remainder);

  const filtered = sentences.filter(sentence => {
    const sLower = sentence.toLowerCase();
    // Only examine sentences that address the recipient
    if (!/\b(you|your)\b/i.test(sentence)) return true;

    for (const pattern of CHARACTER_TRAIT_WORDS) {
      const wordMatch = sLower.match(pattern);
      if (wordMatch) {
        const word = wordMatch[0];
        if (!ctxLower.includes(word)) {
          strippedSentences.push(sentence.trim());
          return false;
        }
      }
    }
    return true;
  });

  let cleaned = filtered.join("").replace(/\s{2,}/g, " ").trim();

  // Dangling opener repair: if stripping removed the first sentence and the
  // result now starts with a pronoun that has no antecedent (It's, That's,
  // This is, This was), prepend the recipient's name so the card isn't broken.
  const DANGLING_RE = /^(it'?s|it was|that'?s|that was|this is|this was)\b/i;
  if (strippedSentences.length > 0 && DANGLING_RE.test(cleaned)) {
    // Capitalise first letter of cleaned and prepend name
    cleaned = `${firstName}, ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  }

  return { text: cleaned || cardText, strippedSentences };
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
  const body = req.body as {
    firstName: string;
    relationship: string;
    occasion: string;
    objective?: string;
    tone?: string;
    emotionalOpenness?: string;
    avoidList?: string[];
    details?: string;
    primaryOccasionContext?: string;
    avoidMentioning?: string;
    relAnswers?: Record<string, string>;
    senderName?: string;
    signOff?: string;
    recipientId?: string;
  };

  const {
    firstName,
    relationship,
    occasion,
    tone = "Heartfelt",
    emotionalOpenness = "Meaningful But Not Mushy",
    avoidList = [],
    details,
    primaryOccasionContext,
    avoidMentioning,
    relAnswers = {},
    senderName = "Me",
    signOff,
    recipientId,
  } = body;

  const objectiveProvided =
    typeof body.objective === "string" && body.objective.trim().length > 0;
  const objective = objectiveProvided
    ? body.objective!.trim()
    : "Tell Them I Appreciate Them";

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

  const systemPrompt = buildSystemPrompt(firstName, relationship, occasion, archetypes, mergedAvoidList, !!primaryOccasionContext?.trim(), !!details?.trim());
  const userPrompt = buildUserPrompt(firstName, relationship, occasion, objective, emotionalOpenness, tone, details, avoidMentioning, relAnswers, senderName, signOff, contextSupplement, primaryOccasionContext, objectiveProvided);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      max_completion_tokens: 900,
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

    if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
      logger.error({ raw }, "v2-generate-card: empty cards array");
      res.status(500).json({ error: "Failed to parse card response" });
      return;
    }

    // Product contract: exactly one card. Truncate if the model returns extras.
    const singleCard = parsed.cards.slice(0, 1);

    // ── Post-generation character-adjective filter ─────────────────────────
    // Build full context string: everything the sender actually provided
    const rawContextText = [
      Object.values(relAnswers).join(" "),
      details ?? "",
      contextSupplement ?? "",
    ].filter(Boolean).join(" ");

    const filteredCards = singleCard.map(card => {
      const { text, strippedSentences } = stripFabricatedCharacterAdjectives(card.text, rawContextText, firstName);
      if (strippedSentences.length > 0) {
        logger.info({ tone: card.tone, strippedSentences }, "v2-generate-card: stripped fabricated character adjectives");
      }
      return { ...card, text };
    });

    // ── Quality scoring ────────────────────────────────────────────────────
    const scoredCards = filteredCards.map(card => {
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
  const body = req.body as {
    cardText: string;
    instruction: string;
    context?: string;
    groundingContext?: RefineGroundingContext;
    facts?: RefineGroundingContext;
  };
  const { cardText, instruction, context } = body;
  if (!cardText || !instruction) {
    res.status(400).json({ error: "cardText and instruction required" });
    return;
  }

  const grounding = normalizeRefineGrounding(body.groundingContext ?? body.facts);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      max_completion_tokens: 4000,
      messages: [
        {
          role: "system",
          content: buildRefineSystemPrompt(),
        },
        {
          role: "user",
          content: buildRefineUserPrompt({
            grounding,
            cardText,
            instruction,
            legacyContext: context,
          }),
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
