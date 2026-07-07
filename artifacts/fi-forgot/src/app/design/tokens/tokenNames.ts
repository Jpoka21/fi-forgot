/**
 * Canonical CSS custom property names for the F.I. Forgot design token layer.
 * Prefixed with `--fi-` to coexist with legacy shadcn/tailwind variables.
 */
export const cssVar = {
  color: {
    cream: "--fi-color-cream",
    beige: "--fi-color-beige",
    paper: "--fi-color-paper",
    ink: "--fi-color-ink",
    inkSoft: "--fi-color-ink-soft",
    accent: "--fi-color-accent",
    accentHover: "--fi-color-accent-hover",
    border: "--fi-color-border",
    surface: "--fi-color-surface",
    surfaceElevated: "--fi-color-surface-elevated",
    textPrimary: "--fi-color-text-primary",
    textSecondary: "--fi-color-text-secondary",
    textMuted: "--fi-color-text-muted",
    success: "--fi-color-success",
    warning: "--fi-color-warning",
    danger: "--fi-color-danger",
    info: "--fi-color-info",
    focusRing: "--fi-color-focus-ring",
    selectionBg: "--fi-color-selection-bg",
    selectionFg: "--fi-color-selection-fg",
  },
  space: {
    0: "--fi-space-0",
    1: "--fi-space-1",
    2: "--fi-space-2",
    3: "--fi-space-3",
    4: "--fi-space-4",
    5: "--fi-space-5",
    6: "--fi-space-6",
    8: "--fi-space-8",
    10: "--fi-space-10",
    12: "--fi-space-12",
    16: "--fi-space-16",
    page: "--fi-space-page",
    section: "--fi-space-section",
  },
  radius: {
    sm: "--fi-radius-sm",
    md: "--fi-radius-md",
    lg: "--fi-radius-lg",
    xl: "--fi-radius-xl",
    full: "--fi-radius-full",
  },
  shadow: {
    sm: "--fi-shadow-sm",
    md: "--fi-shadow-md",
    lg: "--fi-shadow-lg",
    xl: "--fi-shadow-xl",
  },
  elevation: {
    1: "--fi-elevation-1",
    2: "--fi-elevation-2",
  },
  font: {
    sans: "--fi-font-sans",
    display: "--fi-font-display",
    handwriting: "--fi-font-handwriting",
    mono: "--fi-font-mono",
  },
  text: {
    displayLg: "--fi-text-display-lg",
    displayMd: "--fi-text-display-md",
    h1: "--fi-text-h1",
    h2: "--fi-text-h2",
    h3: "--fi-text-h3",
    bodyLg: "--fi-text-body-lg",
    body: "--fi-text-body",
    bodySm: "--fi-text-body-sm",
    caption: "--fi-text-caption",
    label: "--fi-text-label",
  },
  motion: {
    durationFast: "--fi-motion-duration-fast",
    durationBase: "--fi-motion-duration-base",
    durationSlow: "--fi-motion-duration-slow",
    easeStandard: "--fi-motion-ease-standard",
    easeEmphasized: "--fi-motion-ease-emphasized",
    easeConcierge: "--fi-motion-ease-concierge",
  },
  z: {
    base: "--fi-z-base",
    sticky: "--fi-z-sticky",
    dropdown: "--fi-z-dropdown",
    overlay: "--fi-z-overlay",
    toast: "--fi-z-toast",
    max: "--fi-z-max",
  },
  opacity: {
    disabled: "--fi-opacity-disabled",
    muted: "--fi-opacity-muted",
    overlay: "--fi-opacity-overlay",
  },
  blur: {
    sm: "--fi-blur-sm",
    md: "--fi-blur-md",
    lg: "--fi-blur-lg",
  },
  container: {
    sm: "--fi-container-sm",
    md: "--fi-container-md",
    lg: "--fi-container-lg",
    xl: "--fi-container-xl",
  },
  grid: {
    columns: "--fi-grid-columns",
    gutter: "--fi-grid-gutter",
  },
  icon: {
    sm: "--fi-icon-sm",
    md: "--fi-icon-md",
    lg: "--fi-icon-lg",
  },
  focus: {
    ringWidth: "--fi-focus-ring-width",
    ringOffset: "--fi-focus-ring-offset",
  },
} as const;

export function tokenVar(name: string): string {
  return `var(${name})`;
}
