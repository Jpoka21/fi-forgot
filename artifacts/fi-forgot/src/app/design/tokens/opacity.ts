import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const opacityTokens = {
  disabled: tokenVar(cssVar.opacity.disabled),
  muted: tokenVar(cssVar.opacity.muted),
  overlay: tokenVar(cssVar.opacity.overlay),
} as const;

export const opacityScale = {
  disabled: 0.45,
  muted: 0.72,
  overlay: 0.72,
} as const;
