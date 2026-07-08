/**
 * Relationship type matchers — reusable classification helpers for decision rules.
 *
 * Operates on relationship.type strings from RelationshipContext.
 * Future holiday and event rules should reuse these matchers rather than
 * re-deriving classifications inside individual rules.
 */

const ROMANTIC_RELATIONSHIP_TOKENS = [
  "wife",
  "husband",
  "girlfriend",
  "boyfriend",
  "partner",
  "spouse",
  "fiancée",
  "fiancee",
  "fiancé",
  "fiance",
] as const;

function normalizedType(type: string | null | undefined): string {
  return type?.trim().toLowerCase() ?? "";
}

function includesToken(type: string, token: string): boolean {
  return type.includes(token);
}

/** True when relationship.type indicates a romantic partner relationship. */
export function isRomanticRelationshipType(type: string | null | undefined): boolean {
  const normalized = normalizedType(type);
  if (!normalized) {
    return false;
  }
  return ROMANTIC_RELATIONSHIP_TOKENS.some((token) => includesToken(normalized, token));
}
