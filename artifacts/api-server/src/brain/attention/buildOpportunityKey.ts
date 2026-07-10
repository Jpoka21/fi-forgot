/**
 * Canonical Brain opportunity key format — recipientId:sourceRuleId.
 */

export function buildOpportunityKey(recipientId: string, sourceRuleId: string): string {
  return `${recipientId}:${sourceRuleId}`;
}
