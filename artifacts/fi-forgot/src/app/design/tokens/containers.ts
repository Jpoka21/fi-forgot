import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const containerTokens = {
  sm: tokenVar(cssVar.container.sm),
  md: tokenVar(cssVar.container.md),
  lg: tokenVar(cssVar.container.lg),
  xl: tokenVar(cssVar.container.xl),
} as const;

export const containerScale = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1200px",
} as const;
