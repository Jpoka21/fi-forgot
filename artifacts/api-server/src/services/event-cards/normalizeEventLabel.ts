/**
 * Normalizes persisted event labels for cross-source matching.
 *
 * Product briefing and card rows use the same canonical display strings
 * (e.g. "Birthday", "Valentine's Day"). Trim whitespace only — do not rewrite labels.
 */

export function normalizeEventLabel(label: string): string {
  return label.trim();
}
