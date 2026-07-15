/**
 * Pure helpers for v2 card user-prompt context assembly (Sprint 8A / 8B / 8D.2B / 8D.2C).
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

export function buildPrimaryContentPriorityBlock(): string {
  return `CONTENT PRIORITY (order of importance):
1. Occasion
2. Primary reason — mandatory center of the card; the explicit subject of the card
3. Relationship voice
4. Tone and emotional level
5. Supporting memories — optional enrichment only; never the subject

The card must revolve around the primary occasion reason. Wording may vary in voice, warmth, pacing, or phrasing — not in what the card is fundamentally about.
Relationship profile answers are background characterization only — they shape how the card feels (voice, warmth, perspective), not what the card is about. Use them to reinforce the primary reason when they naturally fit; never let traits, habits, or long-term descriptions replace the primary reason as the central story.

STRUCTURE WHEN A PRIMARY REASON EXISTS:
Primary subject → optional supporting how/color → appreciation.
Supporting may explain how they acted or deepen feeling. It must not replace, outrank, or erase the primary subject.`;
}

/**
 * User-prompt rule that forces retention of concrete primary subject nouns.
 */
export function buildPrimaryReasonRule(): string {
  return `PRIMARY REASON RULE: The primary reason is the explicit subject of the card. The card must clearly name that concrete reason — keep its important concrete nouns and named subjects visible in the text. Do not replace them with vague stand-ins used alone as the deed, including: "this", "this one", "that", "what I needed", "everything you did", "making me happy", "being there for me", "helping me out", "your help", or "all you've done".
Supporting memories are optional color / explanation only — how they acted or one brief scene — and must not become the main subject, replace the primary reason, or turn the card into a different event.
Slight rewording is fine when the concrete subject still remains (e.g. "new health insurance" may become "health insurance coverage"). Vague substitution that drops the deed is not (e.g. "health insurance" → "what I needed" or "this one" is forbidden).
Never print internal labels such as "Primary reason" or "Supporting memory" in the card text.`;
}

/**
 * Hard output contract placed near generation / JSON instructions (Sprint 8D.2C).
 * Restates the primary fact verbatim and requires a concrete noun phrase in the card.
 * Returns "" when primary is absent (legacy path unchanged).
 */
export function buildPrimarySubjectOutputContract(
  primaryOccasionContext?: string,
  details?: string,
): string {
  const primary = primaryOccasionContext?.trim();
  if (!primary) return "";

  const support = details?.trim()
    ? details.trim()
    : "(none)";

  return `REQUIRED CONTENT CHECKLIST (primary provided — applies to the generated card):
REQUIRED SUBJECT — The card must explicitly state what the sender is thanking the recipient for using a concrete noun phrase from the primary fact (not a vague pointer).
PRIMARY FACT (restate concretely in the card; do not replace with a pronoun or stand-in):
${primary}
OPTIONAL SUPPORT (explanation / color only — must not become the subject):
${support}
FORBIDDEN PRIMARY STAND-INS when used alone as substitutes for the primary deed:
"this", "this one", "that", "what I needed", "everything you did", "making me happy", "being there for me", "helping me out"
OUTPUT VALIDATION — Before returning JSON:
1) Confirm a concrete noun phrase from PRIMARY FACT is explicitly present in the card text.
2) If the primary subject is missing, or only a forbidden stand-in remains, or the card is about OPTIONAL SUPPORT instead of PRIMARY FACT, revise the card now before returning.
Do not satisfy the primary requirement by expanding only the optional support.`;
}

export function buildMemoryDensityRequirement(hasPrimary: boolean): string {
  if (hasPrimary) {
    return `PRIMARY-CENTERED SPECIFICITY: A primary reason was provided. That primary reason alone satisfies the specificity requirement — do not require a second personal reference, and do not invent a supporting memory to satisfy density. Supporting memories or personal details are optional enrichment / explanation / color only; use them briefly when they strengthen the primary reason, and never let a vivid supporting memory outrank or become the main subject.
SUBJECT-PRESERVING PARAPHRASE ONLY: You may lightly rephrase the primary reason for warmth, but the concrete subject must remain intact and recognizable. Do not generalize concrete nouns into vague placeholders (forbidden pattern: health insurance → "what I needed"; hospital visit → "what happened"; new job → "everything"). Do not expand a small supporting detail into a fabricated story that displaces the primary subject.`;
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
