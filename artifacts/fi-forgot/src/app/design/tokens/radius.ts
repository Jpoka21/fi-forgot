import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const radiusTokens = {
  sm: tokenVar(cssVar.radius.sm),
  md: tokenVar(cssVar.radius.md),
  lg: tokenVar(cssVar.radius.lg),
  xl: tokenVar(cssVar.radius.xl),
  full: tokenVar(cssVar.radius.full),
  legacy: "var(--radius)",
} as const;
