/**
 * Outcome timestamp normalization — persistence-owned UTC ISO contract.
 */

export function resolveOutcomeOccurredAt(input?: Date): Date {
  return input ?? new Date();
}

export function normalizeOutcomeOccurredAtIso(date: Date): string {
  return date.toISOString();
}
