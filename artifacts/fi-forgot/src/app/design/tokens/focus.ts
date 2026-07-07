import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const focusTokens = {
  ringColor: tokenVar(cssVar.color.focusRing),
  ringWidth: tokenVar(cssVar.focus.ringWidth),
  ringOffset: tokenVar(cssVar.focus.ringOffset),
} as const;

export const selectionTokens = {
  background: tokenVar(cssVar.color.selectionBg),
  foreground: tokenVar(cssVar.color.selectionFg),
} as const;
