export interface FiSearchHighlightSegment {
  text: string;
  highlighted: boolean;
}

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function splitSearchHighlight(text: string, query: string): FiSearchHighlightSegment[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return [{ text, highlighted: false }];

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [{ text, highlighted: false }];

  const pattern = tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex).filter((part) => part.length > 0);

  return parts.map((part) => ({
    text: part,
    highlighted: tokens.some((token) => part.toLowerCase() === token),
  }));
}
