import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const fontFamilyTokens = {
  sans: tokenVar(cssVar.font.sans),
  display: tokenVar(cssVar.font.display),
  handwriting: tokenVar(cssVar.font.handwriting),
  mono: tokenVar(cssVar.font.mono),
} as const;

export const fontSizeTokens = {
  displayLg: tokenVar(cssVar.text.displayLg),
  displayMd: tokenVar(cssVar.text.displayMd),
  h1: tokenVar(cssVar.text.h1),
  h2: tokenVar(cssVar.text.h2),
  h3: tokenVar(cssVar.text.h3),
  bodyLg: tokenVar(cssVar.text.bodyLg),
  body: tokenVar(cssVar.text.body),
  bodySm: tokenVar(cssVar.text.bodySm),
  caption: tokenVar(cssVar.text.caption),
  label: tokenVar(cssVar.text.label),
} as const;

export const fontWeightTokens = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeightTokens = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const letterSpacingTokens = {
  display: "0.04em",
  label: "0.08em",
  caps: "0.12em",
} as const;
