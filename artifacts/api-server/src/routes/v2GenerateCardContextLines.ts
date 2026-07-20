/**
 * Pure helpers for v2 card user-prompt context assembly (Sprint 8A / 8B / 8D / 8G).
 * Kept separate from the Express route so unit tests do not load OpenAI/DB.
 */

export function appendPrimaryAndSupportingDetailLines(
  contextLines: string[],
  primaryOccasionContext?: string,
  details?: string,
): void {
  const primary = primaryOccasionContext?.trim();
  if (primary) {
    contextLines.push(`Primary reason for this card:\n${primary}`);
  }
  if (details?.trim()) {
    contextLines.push(
      primary
        ? `Supporting memory or personal detail:\n${details.trim()}`
        : `Extra details / memories to include: ${details.trim()}`,
    );
  }
}

function appendRelationshipProfileLines(
  contextLines: string[],
  relAnswers?: Record<string, string>,
  /** When primary exists, profile is voice/warmth only — not the subject. */
  asBackgroundCharacterization = false,
): void {
  if (!relAnswers || Object.keys(relAnswers).length === 0) return;
  const entries = Object.entries(relAnswers).filter(([, val]) => val?.trim());
  if (entries.length === 0) return;
  contextLines.push(
    asBackgroundCharacterization
      ? "--- Relationship profile (background characterization — shapes voice and warmth, not the subject) ---"
      : "--- Relationship profile (use as raw material) ---",
  );
  for (const [key, val] of entries) {
    contextLines.push(`  ${key}: ${val}`);
  }
}

/**
 * Body context line order:
 * - With primary: Primary → Relationship profile (background) → Supporting → avoids
 * - Without primary: Relationship profile → Extra details → avoids (legacy)
 */
export function buildOrderedBodyContextLines(opts: {
  relAnswers?: Record<string, string>;
  primaryOccasionContext?: string;
  details?: string;
  avoidMentioning?: string;
}): string[] {
  const lines: string[] = [];
  const primary = opts.primaryOccasionContext?.trim();

  if (primary) {
    lines.push(`Primary reason for this card:\n${primary}`);
    appendRelationshipProfileLines(lines, opts.relAnswers, true);
    if (opts.details?.trim()) {
      lines.push(`Supporting memory or personal detail:\n${opts.details.trim()}`);
    }
  } else {
    appendRelationshipProfileLines(lines, opts.relAnswers);
    appendPrimaryAndSupportingDetailLines(lines, undefined, opts.details);
  }

  if (opts.avoidMentioning?.trim()) {
    lines.push(`NEVER mention any of these: ${opts.avoidMentioning.trim()}`);
  }

  return lines;
}

/**
 * Sprint 8G shared support behavior — normally retain when supplied; not unconditional.
 */
export const SUPPLIED_SUPPORT_BEHAVIOR_RULE = `When the user supplies a meaningful supporting detail, the card should normally contain one brief recognizable callback to that detail while keeping the primary reason dominant.
The model may omit or soften the supporting detail only when doing so clearly produces a more appropriate, tactful, or user-compliant card, such as when:
- the user explicitly requests removing or replacing it
- an avoid instruction conflicts with it
- repeating it would materially reduce the quality of the card
- the detail is inappropriate for the occasion
Paraphrasing is encouraged. The factual core should remain recognizable whenever the supporting detail is retained.
Do not replace a supplied supporting detail with an unrelated generic joke, metaphor, or invented anecdote.`;

/**
 * Sprint 8G: when support is supplied, normally retain one brief recognizable callback;
 * when absent, invent nothing. Primary always dominates.
 */
export function buildPrimaryContentPriorityBlock(hasSupport = false): string {
  const supportTier = hasSupport
    ? `5. Supporting memory — normally retain with one brief recognizable callback when supplied; never the subject; normally once; concise if long; omit/soften only per SUPPLIED SUPPORT BEHAVIOR`
    : `5. Supporting memories — none supplied; do not invent any`;

  const structure = hasSupport
    ? `STRUCTURE WHEN A PRIMARY REASON AND SUPPLIED SUPPORT EXIST:
Primary subject → normally one brief supplied-support callback → appreciation / occasion close.
The supporting detail must remain subordinate when retained. It must not replace, outrank, or erase the primary subject.
If the support is long, use a short recognizable paraphrase of its factual core — do not reproduce it fully.

SUPPLIED SUPPORT BEHAVIOR:
${SUPPLIED_SUPPORT_BEHAVIOR_RULE}`
    : `STRUCTURE WHEN A PRIMARY REASON EXISTS (no supporting detail supplied):
Primary subject → appreciation / occasion close.
Do not invent a supporting memory.`;

  return `CONTENT PRIORITY (order of importance):
1. Occasion
2. Primary reason — mandatory center of the card; the explicit subject of the card
3. Relationship voice
4. Tone and emotional level
${supportTier}

The card must revolve around the primary occasion reason. Wording may vary in voice, warmth, pacing, or phrasing — not in what the card is fundamentally about.
Relationship profile answers are background characterization only — they shape how the card feels (voice, warmth, perspective), not what the card is about. Use them to reinforce the primary reason when they naturally fit; never let traits, habits, or long-term descriptions replace the primary reason as the central story.

${structure}
AVOID CONFLICT: If an avoid instruction (avoid mentioning / avoid styles) conflicts with a supporting detail, the avoid instruction wins — omit or soften only the conflicting piece while still favoring primary fidelity.`;
}

/**
 * User-prompt rule that forces retention of concrete primary subject nouns.
 */
export function buildPrimaryReasonRule(hasSupport = false): string {
  const supportLine = hasSupport
    ? `SUPPORTING DETAIL RULE:
${SUPPLIED_SUPPORT_BEHAVIOR_RULE}
Do not invent additional shared history. The support must not become the main subject or displace the primary reason.`
    : `Supporting memories: none were supplied — do not invent any.`;

  return `PRIMARY REASON RULE: The primary reason is the explicit subject of the card. The card must clearly name that concrete reason — keep its important concrete nouns and named subjects visible in the text. Do not replace them with vague stand-ins used alone as the deed, including: "this", "this one", "that", "what I needed", "everything you did", "making me happy", "being there for me", "helping me out", "your help", or "all you've done".
${supportLine}
Slight rewording of the primary is fine when the concrete subject still remains (e.g. "new health insurance" may become "health insurance coverage"). Vague substitution that drops the deed is not (e.g. "health insurance" → "what I needed" or "this one" is forbidden).
Never print internal labels such as "Primary reason" or "Supporting memory" in the card text.`;
}

/**
 * Hard output contract placed near generation / JSON instructions (Sprint 8D.2C / 8G).
 * Restates the primary fact verbatim and requires a concrete noun phrase in the card.
 * When support is supplied, normally retains a recognizable brief callback (subordinate).
 * Returns "" when primary is absent (legacy path unchanged).
 */
export function buildPrimarySubjectOutputContract(
  primaryOccasionContext?: string,
  details?: string,
): string {
  const primary = primaryOccasionContext?.trim();
  if (!primary) return "";

  const support = details?.trim() || "";
  const hasSupport = support.length > 0;

  if (hasSupport) {
    return `REQUIRED CONTENT CHECKLIST (primary + supplied support — applies to the generated card):
REQUIRED SUBJECT — The card must explicitly state the primary reason using a concrete noun phrase from the primary fact (not a vague pointer).
PRIMARY FACT (restate concretely in the card; do not replace with a pronoun or stand-in):
${primary}
SUPPLIED SUPPORT (normally retain — subordinate brief recognizable callback; normally once; concise if long):
${support}
SUPPLIED SUPPORT BEHAVIOR:
${SUPPLIED_SUPPORT_BEHAVIOR_RULE}
FORBIDDEN:
- Replacing SUPPLIED SUPPORT with an unrelated generic joke, metaphor, or invented anecdote as the only humor / color beat
- Inventing additional personal memories, people, places, or shared history not in PRIMARY FACT or SUPPLIED SUPPORT
- Letting support outrank or replace the primary subject
FORBIDDEN PRIMARY STAND-INS when used alone as substitutes for the primary deed:
"this", "this one", "that", "what I needed", "everything you did", "making me happy", "being there for me", "helping me out"
AVOID CONFLICT: If avoid instructions conflict with SUPPLIED SUPPORT, omit only the conflict while keeping the primary and any non-conflicting support core.
OUTPUT VALIDATION — Before returning JSON:
1) Confirm a concrete noun phrase from PRIMARY FACT is explicitly present in the card text.
2) Prefer a recognizable reference to SUPPLIED SUPPORT (paraphrase OK; factual core recognizable when retained). Omission is allowed only for the listed SUPPLIED SUPPORT BEHAVIOR reasons — not for inventing a generic joke instead.
3) When support is retained, confirm it is brief and subordinate — the card is still mainly about PRIMARY FACT.
4) Confirm no unrelated personal memory or shared history was invented.
5) Confirm SUPPLIED SUPPORT was not replaced by a generic joke as the only humor beat.
6) If any check fails, revise the card now before returning.
Do not satisfy the primary requirement by expanding only the support.`;
  }

  return `REQUIRED CONTENT CHECKLIST (primary provided — applies to the generated card):
REQUIRED SUBJECT — The card must explicitly state what the sender is thanking the recipient for using a concrete noun phrase from the primary fact (not a vague pointer).
PRIMARY FACT (restate concretely in the card; do not replace with a pronoun or stand-in):
${primary}
OPTIONAL SUPPORT: (none supplied — do not invent a supporting memory)
FORBIDDEN PRIMARY STAND-INS when used alone as substitutes for the primary deed:
"this", "this one", "that", "what I needed", "everything you did", "making me happy", "being there for me", "helping me out"
OUTPUT VALIDATION — Before returning JSON:
1) Confirm a concrete noun phrase from PRIMARY FACT is explicitly present in the card text.
2) If the primary subject is missing, or only a forbidden stand-in remains, revise the card now before returning.
3) Confirm no supporting memory was invented.
Do not invent support to pad the card.`;
}

export function buildMemoryDensityRequirement(
  hasPrimary: boolean,
  hasSupport = false,
): string {
  if (hasPrimary && hasSupport) {
    return `PRIMARY + SUPPLIED SUPPORT SPECIFICITY: A primary reason and a supporting detail were both provided. Center the primary reason.
${SUPPLIED_SUPPORT_BEHAVIOR_RULE}
Do not invent additional supporting memories. Do not expand support into a fabricated story that displaces the primary subject. If support is long and retained, keep the callback concise.
SUBJECT-PRESERVING PARAPHRASE ONLY: You may lightly rephrase the primary reason for warmth, but the concrete subject must remain intact and recognizable. Do not generalize concrete nouns into vague placeholders (forbidden pattern: health insurance → "what I needed"; hospital visit → "what happened"; new job → "everything").`;
  }

  if (hasPrimary) {
    return `PRIMARY-CENTERED SPECIFICITY: A primary reason was provided and no supporting detail was supplied. That primary reason alone satisfies the specificity requirement — do not invent a supporting memory. Do not invent shared history to pad the card.
SUBJECT-PRESERVING PARAPHRASE ONLY: You may lightly rephrase the primary reason for warmth, but the concrete subject must remain intact and recognizable. Do not generalize concrete nouns into vague placeholders (forbidden pattern: health insurance → "what I needed"; hospital visit → "what happened"; new job → "everything").`;
  }

  return `MEMORY DENSITY REQUIREMENT: If context is provided above, the card must contain at least 2 specific personal references from that context. Do not write a generic card when context exists. Weave multiple memories or facts together naturally rather than listing them. If no context is provided, write a shorter, honest, occasion-appropriate card — 3 to 5 sentences is correct. Do not invent context to satisfy this requirement.`;
}

/**
 * Authenticated briefing / fresh-update rules — omit entirely when no contextSupplement (guest).
 */
export function buildAuthenticatedContextRules(opts: {
  hasContextSupplement: boolean;
  hasPrimary: boolean;
}): string {
  if (!opts.hasContextSupplement) return "";

  const primaryVsAuth = opts.hasPrimary
    ? `\nPRIMARY VS AUTHENTICATED CONTEXT: The primary reason determines what the card is about. Authenticated recipient memory may enrich the card but must not replace or outrank the primary reason.\n`
    : "";

  return `PRIORITY ORDER for context when space is limited:
1. Event Briefing Answers (most specific to this card)
2. Fresh Updates — last 90 days (most recent life moments)
3. Follow-Up Answers (recent conversations)
4. Profile Question Answers
5. Fresh Updates — 90–180 days old
6. Older context
7. Card history (to avoid repetition)

FRESH UPDATE OPENING RULE: If a fresh update dated within the last 45 days exists in the context above, at least one of the 3 card versions MUST open with a direct reference to it — not as a footnote or supporting detail, but as the emotional entry point. Connect it to what you know about this person's character or the relationship. A recent life moment is almost always the strongest possible opening hook.
${primaryVsAuth}`;
}

export function formatMainObjectiveLine(
  objectiveProvided: boolean,
  objective: string,
): string {
  if (!objectiveProvided) return "";
  return `Main objective: ${objective}\n`;
}

/**
 * Sprint 9B.2 gate: professional relationship + Thank You occasion only.
 * `isPro` must come from the canonical PROFESSIONAL_RELS check in v2-generate-card
 * (single source — no duplicate membership list here).
 */
export function isProfessionalThankYouOccasion(
  isPro: boolean,
  occasion: string,
): boolean {
  return isPro && occasion.toLowerCase() === "thank you";
}

/**
 * Sprint 9B.2 — anti gratitude-stack brief for professional Thank You cards.
 * One clear thank for the deed is allowed; stacked thank synonyms are not.
 * When support is supplied, retain proof/color/warmth (protect G13).
 */
export function buildProfessionalThankYouAntiStackBrief(
  hasSupport: boolean,
  signOff?: string | null,
): string {
  const signOffText = signOff?.trim() ?? "";
  const signOffAlreadyThanks = /\b(thank|thanks|appreciate|grateful)\b/i.test(
    signOffText,
  );

  const signOffGuidance = signOffAlreadyThanks
    ? `The required sign-off already contains thank / thanks / appreciate / grateful language — do not add another gratitude restatement in the body immediately before it. Preserve the exact required sign-off unchanged.`
    : `Preserve the exact required sign-off unchanged.`;

  const supportGuidance = hasSupport
    ? `A supporting detail was supplied — keep its brief recognizable proof, color, and warmth. This rule forbids stacking gratitude synonyms; it does not remove supporting detail, storytelling, or heartfelt professional warmth, and it does not require shortening a rich card into a sterile note.`
    : `Do not invent supporting facts or extra history to create sentence variety.`;

  return `PROFESSIONAL THANK-YOU RHYTHM (anti gratitude-stack):
Thank the recipient once for the specific deed — that first gratitude expression is allowed and expected.
After that first gratitude expression, do not restate the same gratitude using phrases such as "I really appreciate", "I am grateful", "thank you again", or "thanks again".
Shape the body as: specific deed acknowledgment → practical effect, what the deed enabled, or the burden they took on → exact sign-off.
Avoid: thank → appreciation synonym → thanks-again close.
${signOffGuidance}
${supportGuidance}
Do not suppress the primary deed. Do not make the card cold, abrupt, or purely transactional.`;
}

/**
 * Soft fixture helper for Sprint 8G tests — flags drafts that omit support
 * while relying only on a generic battery-style joke (not a model runtime gate).
 */
export function draftRecognizesSuppliedSupport(
  cardText: string,
  supportDetail: string,
): boolean {
  const text = cardText.toLowerCase();
  const support = supportDetail.toLowerCase();
  const cues = [
    /five\s*seconds?/,
    /\bkids?\b/,
    /\bgirl\b/,
  ];
  if (cues.some((re) => re.test(support) && re.test(text))) return true;
  // Fallback: require at least two distinctive content words from support (≥4 letters)
  const words = support
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !["when", "were", "over", "lasted", "that", "this", "with", "have", "had"].includes(w));
  const hits = words.filter((w) => text.includes(w));
  return hits.length >= 2;
}
