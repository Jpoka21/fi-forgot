import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const zIndexTokens = {
  base: tokenVar(cssVar.z.base),
  sticky: tokenVar(cssVar.z.sticky),
  dropdown: tokenVar(cssVar.z.dropdown),
  overlay: tokenVar(cssVar.z.overlay),
  toast: tokenVar(cssVar.z.toast),
  max: tokenVar(cssVar.z.max),
} as const;

export const zIndexScale = {
  base: 0,
  sticky: 100,
  dropdown: 1000,
  overlay: 9999,
  toast: 10000,
  max: 11000,
} as const;
