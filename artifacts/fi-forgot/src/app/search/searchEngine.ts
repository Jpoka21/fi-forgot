import { getRecipients } from "@/lib/data";

import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { buildDynamicSearchIndex } from "@/app/search/searchIndexBuilders";
import {
  searchFilterEntityMap,
  searchGroupLabels,
  staticSearchIndex,
  type FiSearchEntityType,
  type FiSearchFilterOption,
  type FiSearchResult,
  type FiSearchSortOption,
} from "@/app/search/searchDomain";
import { normalizeSearchQuery } from "@/app/search/searchHighlight";

function recipientToSearchResult(recipient: {
  id: string;
  name: string;
  relationship?: string;
  profileUpdatedAt?: string;
}): FiSearchResult {
  return {
    id: `recipient-${recipient.id}`,
    label: recipient.name,
    description: recipient.relationship
      ? `${recipient.relationship.charAt(0).toUpperCase()}${recipient.relationship.slice(1)}`
      : "Relationship",
    group: searchGroupLabels.recipient,
    entityType: "recipient",
    href: ROUTE_PATHS.recipientProfile.replace(":id", recipient.id),
    keywords: [recipient.name, recipient.relationship ?? ""].filter(Boolean),
    updatedAt: recipient.profileUpdatedAt,
  };
}

export function buildSearchIndex(): FiSearchResult[] {
  const recipientResults = getRecipients().map(recipientToSearchResult);
  return [...staticSearchIndex, ...recipientResults, ...buildDynamicSearchIndex()];
}

function scoreResult(result: FiSearchResult, query: string): number {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return 0;

  const haystack = [
    result.label,
    result.description ?? "",
    ...(result.keywords ?? []),
    result.group ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (haystack === normalizedQuery) return 100;
  if (result.label.toLowerCase() === normalizedQuery) return 95;
  if (result.label.toLowerCase().startsWith(normalizedQuery)) return 85;
  if (haystack.includes(normalizedQuery)) return 70;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const matchedTokens = tokens.filter((token) => haystack.includes(token)).length;
  if (matchedTokens === 0) return 0;

  return 40 + (matchedTokens / tokens.length) * 30;
}

function matchesFilter(result: FiSearchResult, filter: FiSearchFilterOption): boolean {
  if (filter === "all") return true;
  return searchFilterEntityMap[filter].includes(result.entityType);
}

function sortResults(results: FiSearchResult[], sort: FiSearchSortOption): FiSearchResult[] {
  const copy = [...results];

  if (sort === "alphabetical") {
    return copy.sort((a, b) => a.label.localeCompare(b.label));
  }

  if (sort === "recent") {
    return copy.sort((a, b) => {
      const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return bTime - aTime;
    });
  }

  return copy.sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
}

export interface RunGlobalSearchOptions {
  filter?: FiSearchFilterOption;
  sort?: FiSearchSortOption;
  limit?: number;
}

export function runGlobalSearch(
  query: string,
  options: RunGlobalSearchOptions = {},
): FiSearchResult[] {
  const {
    filter = "all",
    sort = "relevance",
    limit = 50,
  } = options;

  const normalizedQuery = normalizeSearchQuery(query);
  const index = buildSearchIndex();

  const filtered = index
    .map((result) => ({
      ...result,
      relevance: normalizedQuery ? scoreResult(result, normalizedQuery) : result.entityType === "action" ? 10 : 5,
    }))
    .filter((result) => matchesFilter(result, filter))
    .filter((result) => !normalizedQuery || (result.relevance ?? 0) > 0);

  return sortResults(filtered, sort).slice(0, limit);
}

export function entityTypeForFilter(filter: FiSearchFilterOption): FiSearchEntityType[] | null {
  if (filter === "all") return null;
  return searchFilterEntityMap[filter];
}
