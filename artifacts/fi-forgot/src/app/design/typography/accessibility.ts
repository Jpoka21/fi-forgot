/**
 * Typography accessibility guardrails for the Relationship Concierge system.
 * Used for verification during component and screen implementation.
 */
export const typographyAccessibility = {
  /** Minimum body text size (WCAG-friendly baseline). */
  minBodyFontSizePx: 16,
  /** Minimum supporting text size for captions and labels. */
  minCaptionFontSizePx: 12,
  /** Target contrast ratio for body text. */
  minBodyContrastRatio: 4.5,
  /** Target contrast ratio for large text / headings. */
  minLargeTextContrastRatio: 3,
  /** Recommended maximum line length for comfortable reading. */
  maxLineLengthCh: 65,
  /** Minimum line height multiplier for body copy. */
  minBodyLineHeight: 1.5,
} as const;

export const responsiveTypographyChecks = {
  usesClampScale: true,
  minViewportScaleRem: 1,
  maxViewportScaleRem: 1.125,
} as const;

export const localizationTypography = {
  /** Prefer rem-based sizing for locale and user zoom compatibility. */
  usesRelativeUnits: true,
  supportsRtl: true,
  supportsCjkLineBreak: true,
} as const;

export function meetsMinimumFontSize(fontSizePx: number, role: "body" | "caption"): boolean {
  const minimum =
    role === "body"
      ? typographyAccessibility.minBodyFontSizePx
      : typographyAccessibility.minCaptionFontSizePx;

  return fontSizePx >= minimum;
}
