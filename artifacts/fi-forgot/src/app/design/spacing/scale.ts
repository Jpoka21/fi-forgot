import { tokenVar } from "@/app/design/tokens/tokenNames";
import { spacingTokens } from "@/app/design/tokens/spacing";
import { spacingCssVar } from "@/app/design/spacing/cssVars";

/** Base spacing scale — bridges Phase 2 numeric tokens. */
export const spacingScaleTokens = {
  0: spacingTokens[0],
  1: spacingTokens[1],
  2: spacingTokens[2],
  3: spacingTokens[3],
  4: spacingTokens[4],
  5: spacingTokens[5],
  6: spacingTokens[6],
  8: spacingTokens[8],
  10: spacingTokens[10],
  12: spacingTokens[12],
  16: spacingTokens[16],
  page: spacingTokens.page,
  section: spacingTokens.section,
} as const;

export type SpacingScaleKey = keyof typeof spacingScaleTokens;

export const layoutSpacingTokens = {
  screenMargin: tokenVar(spacingCssVar.layout.screenMargin),
  sectionGap: tokenVar(spacingCssVar.layout.sectionGap),
  stackSm: tokenVar(spacingCssVar.layout.stackSm),
  stackMd: tokenVar(spacingCssVar.layout.stackMd),
  stackLg: tokenVar(spacingCssVar.layout.stackLg),
  inlineSm: tokenVar(spacingCssVar.layout.inlineSm),
  inlineMd: tokenVar(spacingCssVar.layout.inlineMd),
  responsiveStack: tokenVar(spacingCssVar.layout.responsiveStack),
} as const;
