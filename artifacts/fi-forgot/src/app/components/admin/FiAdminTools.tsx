import { useMemo, useState } from "react";

import { trackAdminEvent } from "@/app/admin/adminAnalytics";
import { adminDefaults } from "@/app/admin/adminDomain";
import { searchAdminDirectory } from "@/app/admin/adminEngine";
import type { AdminTab } from "@/app/admin/adminDomain";
import { FiInput } from "@/app/components/input/FiInput";
import { FiAdminEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";

export function FiAdminTools({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchAdminDirectory(query), [query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      trackAdminEvent("admin_search", { length: value.length });
    }
  };

  return (
    <section aria-labelledby="admin-tools-title">
      <header className="fi-admin__panel-header">
        <h2 id="admin-tools-title" className="fi-admin__panel-title">
          {adminDefaults.toolsTitle}
        </h2>
        <p className="fi-admin__panel-subtitle">{adminDefaults.toolsSubtitle}</p>
      </header>

      <div className="fi-admin__search">
        <FiInput
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder={adminDefaults.searchPlaceholder}
          aria-label={adminDefaults.searchPlaceholder}
        />
      </div>

      {query.trim() && results.length === 0 ? (
        <FiAdminEmptyState title={adminDefaults.noResultsLabel} description="" />
      ) : (
        <div className="fi-admin__results">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              type="button"
              className="fi-admin__result"
              onClick={() => onNavigate(result.tab as AdminTab)}
            >
              <span>
                <strong>{result.title}</strong>
                <div className="fi-admin__metric-label">{result.subtitle}</div>
              </span>
              <span className="fi-admin__metric-label">{result.type}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
