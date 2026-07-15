/**
 * Pure helpers for v2 refine-card factual grounding (Sprint 8E).
 * Kept separate from Express so unit tests do not load OpenAI/DB.
 */

export type RefineGroundingContext = {
  firstName?: string;
  relationship?: string;
  occasion?: string;
  primaryOccasionContext?: string;
  details?: string;
  tone?: string;
  emotionalOpenness?: string;
  avoidList?: string[];
  avoidMentioning?: string;
  signOff?: string;
};

export function normalizeRefineGrounding(
  raw: RefineGroundingContext | null | undefined,
): RefineGroundingContext {
  if (!raw || typeof raw !== "object") return {};
  const trim = (v?: string) => (typeof v === "string" ? v.trim() : "");
  const avoidList = Array.isArray(raw.avoidList)
    ? raw.avoidList.map((x) => String(x).trim()).filter(Boolean)
    : [];
  return {
    firstName: trim(raw.firstName) || undefined,
    relationship: trim(raw.relationship) || undefined,
    occasion: trim(raw.occasion) || undefined,
    primaryOccasionContext: trim(raw.primaryOccasionContext) || undefined,
    details: trim(raw.details) || undefined,
    tone: trim(raw.tone) || undefined,
    emotionalOpenness: trim(raw.emotionalOpenness) || undefined,
    avoidList: avoidList.length ? avoidList : undefined,
    avoidMentioning: trim(raw.avoidMentioning) || undefined,
    signOff: trim(raw.signOff) || undefined,
  };
}

export function buildRefineSystemPrompt(): string {
  return `You are refining a greeting card. Apply the requested adjustment while preserving the sender's personal voice.

FACTUAL GROUNDING (mandatory):
- Treat as true ONLY facts present in the original card text or in AUTHORITATIVE FACTS.
- Do NOT invent people, places, events, memories, quotes, hobbies, activities, possessions, trips, or shared history.
- Do NOT add illustrative anecdotes as though they happened.
- Style, humor, warmth, structure, rhythm, and intensity may change freely.
- Style changes do NOT authorize factual invention.
- When asked for more specificity or "more personal" without new facts, improve phrasing and emphasis of EXISTING facts — never invent details.
- Preserve the recipient, occasion, primary reason, supporting personal details, and sign-off when they appear in AUTHORITATIVE FACTS or the original card.
- Preserve known personal facts unless the requested adjustment EXPLICITLY asks to remove, omit, or replace a specific fact.
- If a sign-off is listed in AUTHORITATIVE FACTS or appears on its own line in the original card, end with that exact sign-off once — do not alter, rephrase, duplicate, or invent a different signature unless the user explicitly requests a sign-off change.

Avoid clichés and generic greeting-card stock phrasing.
Return ONLY the revised card text — no labels, no explanation, no markdown fences.`;
}

export function buildAuthoritativeFactsBlock(
  grounding: RefineGroundingContext,
  legacyContext?: string,
): string {
  const lines: string[] = [];
  const push = (label: string, value?: string) => {
    if (value?.trim()) lines.push(`${label}: ${value.trim()}`);
  };
  push("Recipient", grounding.firstName);
  push("Relationship", grounding.relationship);
  push("Occasion", grounding.occasion);
  push("Primary reason", grounding.primaryOccasionContext);
  push("Supporting detail", grounding.details);
  push("Tone", grounding.tone);
  push("Emotional intensity", grounding.emotionalOpenness);
  if (grounding.avoidList?.length) {
    lines.push(`Avoid styles: ${grounding.avoidList.join(", ")}`);
  }
  push("Avoid mentioning", grounding.avoidMentioning);
  push("Sign-off (exact)", grounding.signOff);

  if (lines.length === 0) {
    const legacy = legacyContext?.trim();
    return legacy
      ? `AUTHORITATIVE FACTS (legacy thin context — still binding; do not invent beyond this and the original card):\n${legacy}`
      : `AUTHORITATIVE FACTS:\n(None supplied beyond the original card text. Invent nothing not already present there.)`;
  }

  return `AUTHORITATIVE FACTS (binding — do not invent beyond these and the original card):\n${lines.join("\n")}`;
}

export function buildRefineUserPrompt(opts: {
  grounding: RefineGroundingContext;
  cardText: string;
  instruction: string;
  legacyContext?: string;
}): string {
  const facts = buildAuthoritativeFactsBlock(opts.grounding, opts.legacyContext);
  return `${facts}

ORIGINAL CARD:
${opts.cardText}

REQUESTED ADJUSTMENT (controls style and expression only — does NOT authorize factual invention):
${opts.instruction}

Revise the card now. Return only the revised card text.`;
}
