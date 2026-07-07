import { fontSizeTokens } from "@/app/design/tokens/typography";
import { spacingTokens } from "@/app/design/tokens/spacing";

export const responsiveTypographyTokens = {
  display: fontSizeTokens.displayMd,
  displayLg: fontSizeTokens.displayLg,
  heading: fontSizeTokens.h1,
  body: fontSizeTokens.bodyLg,
  caption: fontSizeTokens.caption,
} as const;

export const responsiveSpacingTokens = {
  pagePadding: spacingTokens.page,
  sectionGap: spacingTokens.section,
  stackGap: spacingTokens[4],
  inlineGap: spacingTokens[2],
} as const;
