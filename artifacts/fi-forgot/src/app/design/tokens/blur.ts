import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const blurTokens = {
  sm: tokenVar(cssVar.blur.sm),
  md: tokenVar(cssVar.blur.md),
  lg: tokenVar(cssVar.blur.lg),
} as const;

export const blurScale = {
  sm: "4px",
  md: "8px",
  lg: "16px",
} as const;
