/**
 * Stable answer row identifiers for POST /v2/recipients/:id/answer-question.
 *
 * Fresh-update rows include a timestamp — each submit creates a distinct row.
 * Profile-gap rows upsert on a recipient plus field key identity.
 */

export function buildFreshUpdateAnswerId(
  recipientId: string,
  fieldKey: string,
  now: Date,
): string {
  return `fresh_update_${recipientId}_${fieldKey}_${now.getTime()}`;
}

export function buildProfileGapAnswerId(recipientId: string, fieldKey: string): string {
  return `profile_gap_${recipientId}_${fieldKey}`;
}
