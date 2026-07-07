import { useEffect } from "react";

import { useGlobalSearch } from "@/app/search/hooks/useGlobalSearch";
import { useSearchKeyboardShortcut } from "@/app/search/hooks/useSearchKeyboardShortcut";
import { trackSearchEvent } from "@/app/search/searchAnalytics";
import { searchPageDefaults } from "@/app/search/searchPageDomain";

export function useSearchPage() {
  const search = useGlobalSearch({ enabled: true });

  useSearchKeyboardShortcut(() => {
    const input = document.getElementById("fi-search-page-input");
    input?.focus();
  }, true);

  useEffect(() => {
    trackSearchEvent("search_page_viewed");
    document.getElementById("search-main")?.focus();
  }, []);

  return {
    defaults: searchPageDefaults,
    ...search,
  };
}

export type SearchPageController = ReturnType<typeof useSearchPage>;
