/**
 * Parse exposure timestamps for fatigue evaluation.
 */

export function parseExposureTimestamp(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}
