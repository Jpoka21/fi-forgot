import { fontSizeTokens, fontWeightTokens, lineHeightTokens, letterSpacingTokens } from "@/app/design/tokens/typography";
import { colorTokens } from "@/app/design/tokens/colors";
import { spacingTokens } from "@/app/design/tokens/spacing";

export const semanticTypographyRoles = [
  "displayLg",
  "displayMd",
  "h1",
  "h2",
  "h3",
  "bodyLg",
  "body",
  "bodySm",
  "caption",
  "label",
  "helper",
  "error",
  "success",
] as const;

export type SemanticTypographyRole = (typeof semanticTypographyRoles)[number];

export const semanticTypographyTokens = {
  displayLg: {
    fontSize: fontSizeTokens.displayLg,
    lineHeight: lineHeightTokens.tight,
    fontWeight: fontWeightTokens.bold,
    letterSpacing: letterSpacingTokens.display,
  },
  displayMd: {
    fontSize: fontSizeTokens.displayMd,
    lineHeight: lineHeightTokens.tight,
    fontWeight: fontWeightTokens.bold,
    letterSpacing: letterSpacingTokens.display,
  },
  h1: {
    fontSize: fontSizeTokens.h1,
    lineHeight: lineHeightTokens.tight,
    fontWeight: fontWeightTokens.semibold,
    letterSpacing: letterSpacingTokens.display,
  },
  h2: {
    fontSize: fontSizeTokens.h2,
    lineHeight: lineHeightTokens.snug,
    fontWeight: fontWeightTokens.semibold,
    letterSpacing: letterSpacingTokens.display,
  },
  h3: {
    fontSize: fontSizeTokens.h3,
    lineHeight: lineHeightTokens.snug,
    fontWeight: fontWeightTokens.medium,
    letterSpacing: "0.02em",
  },
  bodyLg: {
    fontSize: fontSizeTokens.bodyLg,
    lineHeight: lineHeightTokens.relaxed,
    fontWeight: fontWeightTokens.regular,
    letterSpacing: "normal",
  },
  body: {
    fontSize: fontSizeTokens.body,
    lineHeight: lineHeightTokens.normal,
    fontWeight: fontWeightTokens.regular,
    letterSpacing: "normal",
  },
  bodySm: {
    fontSize: fontSizeTokens.bodySm,
    lineHeight: lineHeightTokens.normal,
    fontWeight: fontWeightTokens.regular,
    letterSpacing: "normal",
  },
  caption: {
    fontSize: fontSizeTokens.caption,
    lineHeight: lineHeightTokens.snug,
    fontWeight: fontWeightTokens.medium,
    letterSpacing: letterSpacingTokens.label,
  },
  label: {
    fontSize: fontSizeTokens.label,
    lineHeight: lineHeightTokens.snug,
    fontWeight: fontWeightTokens.semibold,
    letterSpacing: letterSpacingTokens.label,
  },
  helper: {
    fontSize: fontSizeTokens.bodySm,
    lineHeight: lineHeightTokens.normal,
    fontWeight: fontWeightTokens.regular,
    color: colorTokens.textMuted,
  },
  error: {
    fontSize: fontSizeTokens.bodySm,
    lineHeight: lineHeightTokens.normal,
    fontWeight: fontWeightTokens.medium,
    color: colorTokens.danger,
  },
  success: {
    fontSize: fontSizeTokens.bodySm,
    lineHeight: lineHeightTokens.normal,
    fontWeight: fontWeightTokens.medium,
    color: colorTokens.success,
  },
} as const;

export const typographySpacingTokens = {
  paragraphGap: spacingTokens[4],
  listGap: spacingTokens[2],
  listIndent: spacingTokens[6],
  headingTop: spacingTokens[6],
  headingBottom: spacingTokens[2],
} as const;
