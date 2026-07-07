import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const iconSizeTokens = {
  sm: tokenVar(cssVar.icon.sm),
  md: tokenVar(cssVar.icon.md),
  lg: tokenVar(cssVar.icon.lg),
} as const;

export const iconSizeScale = {
  sm: "16px",
  md: "20px",
  lg: "24px",
} as const;
