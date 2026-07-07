import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const shadowTokens = {
  sm: tokenVar(cssVar.shadow.sm),
  md: tokenVar(cssVar.shadow.md),
  lg: tokenVar(cssVar.shadow.lg),
  xl: tokenVar(cssVar.shadow.xl),
  legacySm: "var(--shadow-sm)",
  legacyMd: "var(--shadow-md)",
  legacyLg: "var(--shadow-lg)",
} as const;

export const elevationTokens = {
  1: tokenVar(cssVar.elevation[1]),
  2: tokenVar(cssVar.elevation[2]),
} as const;
