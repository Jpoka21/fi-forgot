/**
 * Pure helpers for v2 refine-card factual grounding (Sprint 8E / 8G).
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
- VISIBLE FACT RETENTION: When AUTHORITATIVE FACTS list a primary reason, the revised card must contain a recognizable reference to it. When AUTHORITATIVE FACTS list a supporting detail, the revised card should normally contain one brief recognizable callback to that detail while keeping the primary reason dominant. Paraphrasing is encouraged. The factual core should remain recognizable whenever the supporting detail is retained. "Preserve" means visibly retain in the revised text when retained — not merely avoid contradicting.
- SUPPLIED SUPPORT BEHAVIOR: The model may omit or soften the supporting detail only when doing so clearly produces a more appropriate, tactful, or user-compliant card, such as when the user explicitly requests removing or replacing it, an avoid instruction conflicts with it, repeating it would materially reduce the quality of the card, or the detail is inappropriate for the occasion. Do not replace a supplied supporting detail with an unrelated generic joke, metaphor, or invented anecdote.
- If an AUTHORITATIVE supporting detail is absent from the ORIGINAL CARD, normally weave it into the revision briefly while keeping the primary reason dominant — unless a listed SUPPLIED SUPPORT BEHAVIOR omission reason applies.
- AVOID CONFLICT: If an avoid instruction conflicts with a supporting detail, the avoid instruction wins — omit or soften only the conflicting piece while keeping primary fidelity and any non-conflicting support core.
- Preserve the recipient, occasion, primary reason, and sign-off when they appear in AUTHORITATIVE FACTS (or the original card when no authoritative override applies). Normally preserve supporting personal details under SUPPLIED SUPPORT BEHAVIOR.
- Preserve known personal facts unless the requested adjustment EXPLICITLY asks to remove, omit, exclude, avoid, or replace a specific fact (supporting detail may also be omitted/softened for the other listed SUPPLIED SUPPORT BEHAVIOR reasons).
- If a sign-off is listed in AUTHORITATIVE FACTS or appears on its own line in the original card, end with that exact sign-off once — do not alter, rephrase, duplicate, or invent a different signature unless the user explicitly requests a sign-off change.
- REWRITE / NEW VERSION: When the adjustment asks for a rewrite or new version, use a genuinely different opening and a different sentence progression or structural beat order; substantially change wording and rhythm. Do not reuse distinctive metaphors, punchlines, invented jokes, or framing from the ORIGINAL CARD unless those exact elements came from AUTHORITATIVE FACTS. Do not create replacement memories or anecdotes. Do not produce a sentence-by-sentence paraphrase.

Avoid clichés and generic greeting-card stock phrasing.
Return ONLY the revised card text — no labels, no explanation, no markdown fences.`;
}

/**
 * Sprint 8G: retention / recovery / freshness rules appended to the user prompt
 * when authoritative primary or support is present.
 */
export function buildRefineVisibleRetentionContract(
  grounding: RefineGroundingContext,
): string {
  const primary = grounding.primaryOccasionContext?.trim();
  const support = grounding.details?.trim();
  if (!primary && !support) return "";

  const lines: string[] = [
    "VISIBLE RETENTION CONTRACT (Sprint 8G — binding):",
  ];

  if (primary) {
    lines.push(
      `- PRIMARY: Keep the primary reason dominant and clearly visible (concrete subject recognizable). Primary fact: ${primary}`,
    );
  }

  if (support) {
    lines.push(
      `- SUPPORT: When the user supplies a meaningful supporting detail, the card should normally contain one brief recognizable callback to that detail while keeping the primary reason dominant — even if the ORIGINAL CARD omitted it. Weave it in subordinate to the primary when retained. Paraphrase encouraged; factual core should remain recognizable whenever retained. Support fact: ${support}`,
    );
    lines.push(
      `- OMISSION: The model may omit or soften the supporting detail only when doing so clearly produces a more appropriate, tactful, or user-compliant card, such as when: the user explicitly requests removing or replacing it; an avoid instruction conflicts with it; repeating it would materially reduce the quality of the card; or the detail is inappropriate for the occasion.`,
    );
    lines.push(
      `- Do not invent additional personal history. Do not replace a supplied supporting detail with an unrelated generic joke, metaphor, or invented anecdote.`,
    );
  }

  lines.push(
    `- AVOID CONFLICT: If avoid styles / avoid mentioning conflict with support, avoid wins for the conflicting piece only.`,
  );
  lines.push(
    `- SIGN-OFF: If a sign-off is listed in AUTHORITATIVE FACTS, end with that exact text once.`,
  );

  return lines.join("\n");
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
  const retention = buildRefineVisibleRetentionContract(opts.grounding);
  const retentionBlock = retention ? `\n\n${retention}\n` : "\n";
  return `${facts}

ORIGINAL CARD:
${opts.cardText}

REQUESTED ADJUSTMENT (controls style and expression only — does NOT authorize factual invention):
${opts.instruction}
${retentionBlock}
Revise the card now. Return only the revised card text.`;
}
