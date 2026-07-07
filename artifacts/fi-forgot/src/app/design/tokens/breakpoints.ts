export const breakpointValues = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointName = keyof typeof breakpointValues;

export const breakpointTokens = {
  sm: `${breakpointValues.sm}px`,
  md: `${breakpointValues.md}px`,
  lg: `${breakpointValues.lg}px`,
  xl: `${breakpointValues.xl}px`,
  "2xl": `${breakpointValues["2xl"]}px`,
} as const;

export const mediaQueries = {
  sm: `(min-width: ${breakpointTokens.sm})`,
  md: `(min-width: ${breakpointTokens.md})`,
  lg: `(min-width: ${breakpointTokens.lg})`,
  xl: `(min-width: ${breakpointTokens.xl})`,
  "2xl": `(min-width: ${breakpointTokens["2xl"]})`,
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;
