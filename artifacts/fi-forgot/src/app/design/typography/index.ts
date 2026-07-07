export {
  FONT_GOOGLE_STYLESHEET,
  fontFallbackStacks,
  fontLoadingStrategy,
  productionFonts,
} from "@/app/design/typography/fonts";
export type { ProductionFontRole } from "@/app/design/typography/fonts";

export {
  localizationTypography,
  meetsMinimumFontSize,
  responsiveTypographyChecks,
  typographyAccessibility,
} from "@/app/design/typography/accessibility";

export {
  semanticTypographyRoles,
  semanticTypographyTokens,
  typographySpacingTokens,
} from "@/app/design/typography/semantic";
export type { SemanticTypographyRole } from "@/app/design/typography/semantic";

export const typographyUtilityClasses = {
  displayLg: "fi-type-display-lg",
  displayMd: "fi-type-display-md",
  h1: "fi-type-h1",
  h2: "fi-type-h2",
  h3: "fi-type-h3",
  bodyLg: "fi-type-body-lg",
  body: "fi-type-body",
  bodySm: "fi-type-body-sm",
  caption: "fi-type-caption",
  label: "fi-type-label",
  helper: "fi-type-helper",
  error: "fi-type-error",
  success: "fi-type-success",
  prose: "fi-type-prose",
} as const;
