import type { FiSearchResult } from "@/app/search/searchDomain";
import { FiSearchResultItem } from "@/app/components/search/FiSearchResultItem";

export interface FiSearchResultsProps {
  results: FiSearchResult[];
  query: string;
  selectedId?: string;
  onSelect: (result: FiSearchResult) => void;
}

export function FiSearchResults({ results, query, selectedId, onSelect }: FiSearchResultsProps) {
  const groups = results.reduce<Record<string, FiSearchResult[]>>((acc, result) => {
    const key = result.group ?? "Results";
    acc[key] = acc[key] ?? [];
    acc[key].push(result);
    return acc;
  }, {});

  return (
    <div className="fi-search-results" role="listbox" aria-label="Search results">
      {Object.entries(groups).map(([group, groupResults]) => (
        <section key={group} className="fi-search-results__group" aria-label={group}>
          <h3 className="fi-search-results__group-label">{group}</h3>
          {groupResults.map((result) => (
            <FiSearchResultItem
              key={result.id}
              id={result.id}
              label={result.label}
              description={result.description}
              group={result.group}
              query={query}
              selected={selectedId === result.id}
              onSelect={() => onSelect(result)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
