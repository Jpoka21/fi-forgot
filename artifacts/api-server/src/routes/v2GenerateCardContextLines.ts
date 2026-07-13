/**
 * Pure helpers for v2 card user-prompt context assembly (Sprint 8A / 8B).
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
): void {
  if (!relAnswers || Object.keys(relAnswers).length === 0) return;
  const entries = Object.entries(relAnswers).filter(([, val]) => val?.trim());
  if (entries.length === 0) return;
  contextLines.push("--- Relationship profile (use as raw material) ---");
  for (const [key, val] of entries) {
    contextLines.push(`  ${key}: ${val}`);
  }
}

/**
 * Body context line order:
 * - With primary: Primary → Relationship profile → Supporting → avoids
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
    appendRelationshipProfileLines(lines, opts.relAnswers);
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
2. Primary reason — mandatory center of every version
3. Relationship voice
4. Tone and emotional level
5. Supporting memories — optional enrichment only

All three versions must revolve around the same primary occasion reason. They may differ in voice, warmth, pacing, or phrasing — not in what the card is fundamentally about.`;
}

export function buildMemoryDensityRequirement(hasPrimary: boolean): string {
  if (hasPrimary) {
    return `PRIMARY-CENTERED SPECIFICITY: A primary reason was provided. Every card must clearly address that primary reason — that alone is enough specificity. Do not require a second personal reference. Do not invent a supporting memory to satisfy density. Supporting memories or personal details are optional; use them only briefly when they naturally strengthen the primary reason, and never let them become the main subject. Natural paraphrasing of the primary reason is allowed — keep cards warm and human, not stiff or mechanical. Do not expand a small supporting detail into a fabricated story.`;
  }

  return `MEMORY DENSITY REQUIREMENT: If context is provided above, every card must contain at least 2 specific personal references from that context. Do not write a generic card when context exists. Weave multiple memories or facts together naturally rather than listing them. If no context is provided, write a shorter, honest, occasion-appropriate card — 3 to 5 sentences is correct. Do not invent context to satisfy this requirement.`;
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
