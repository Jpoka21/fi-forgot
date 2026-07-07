import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useFeatureFlags } from "@/app/state/hooks/useFeatureFlags";
import { trackSearchEvent } from "@/app/search/searchAnalytics";
import { useSearchKeyboardShortcut } from "@/app/search/hooks/useSearchKeyboardShortcut";

interface SearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  enabled: boolean;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const { flags } = useFeatureFlags();
  const [open, setOpenState] = useState(false);

  const enabled = flags.enableGlobalSearch || flags.enableCommandPalette;

  const setOpen = useCallback((nextOpen: boolean) => {
    setOpenState(nextOpen);
    trackSearchEvent(nextOpen ? "search_opened" : "search_closed");
  }, []);

  const toggle = useCallback(() => {
    setOpenState((current) => {
      const nextOpen = !current;
      trackSearchEvent(nextOpen ? "search_opened" : "search_closed");
      return nextOpen;
    });
  }, []);

  useSearchKeyboardShortcut(toggle, enabled);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      enabled,
    }),
    [enabled, open, setOpen, toggle],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }
  return context;
}
