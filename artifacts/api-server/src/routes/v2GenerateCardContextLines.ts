/**
 * Pure helpers for ordering primary vs supporting context in v2 card prompts.
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
