import { useTheme } from "@/app/providers/ThemeProvider";
import type { ThemeState } from "@/app/state/types";

export function useThemeState(): ThemeState {
  return useTheme();
}
