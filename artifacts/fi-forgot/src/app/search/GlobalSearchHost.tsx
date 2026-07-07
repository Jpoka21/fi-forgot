import { useCallback } from "react";
import { useLocation } from "wouter";

import { FiGlobalSearch } from "@/app/components/search/FiGlobalSearch";
import { FiGlobalSearchTrigger } from "@/app/components/search/FiGlobalSearchTrigger";
import { useAuth } from "@/app/providers/AuthProvider";
import { useFeatureFlags } from "@/app/state/hooks/useFeatureFlags";
import { useSearchContext } from "@/app/search/SearchProvider";
import { useGlobalSearch } from "@/app/search/hooks/useGlobalSearch";
import type { FiSearchResult } from "@/app/search/searchDomain";

/**
 * Mount inside Wouter Router so result navigation can use client routing.
 */
export function GlobalSearchHost() {
  const { flags } = useFeatureFlags();
  const { authReady, isLoggedIn } = useAuth();
  const { open, setOpen, toggle, enabled } = useSearchContext();
  const [, setLocation] = useLocation();
  const search = useGlobalSearch({ enabled: enabled && open });

  const handleNavigate = useCallback(
    (result: FiSearchResult) => {
      search.handleResultSelect(result);
      if (result.href) {
        setLocation(result.href);
      }
      setOpen(false);
    },
    [search, setLocation, setOpen],
  );

  if (!enabled) return null;
  if (!authReady || !isLoggedIn) return null;

  return (
    <>
      <FiGlobalSearchTrigger onClick={toggle} aria-expanded={open} />
      <FiGlobalSearch
        open={open}
        onOpenChange={setOpen}
        search={search}
        onNavigate={handleNavigate}
        commandPaletteEnabled={flags.enableCommandPalette}
      />
    </>
  );
}
