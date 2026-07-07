/**
 * Raw palette values for the F.I. Forgot color system.
 *
 * Primary brand primitives align with the existing personal-brand palette and
 * Phase 2 `--fi-color-*` tokens to preserve current visual behavior.
 * Neutral scale values follow playbook 49_COLOR_SYSTEM.md for opt-in use.
 */
export const brandPalette = {
  cream: "#FAF7F4",
  beige: "#F2E6D3",
  warmWhite: "#FFFCF8",
  ink: "#111111",
  inkSoft: "#1F1F1F",
  charcoal: "#2E2A27",
  accent: "#E23B2E",
  accentHover: "#D32F2F",
  border: "#E5E0D8",
  white: "#FFFFFF",
  sage: "#5B8C6B",
  amber: "#C97A0A",
  mid: "#4B5563",
  info: "#2D5087",
} as const;

/** Playbook neutral scale — available for new opt-in surfaces. */
export const neutralPalette = {
  50: "#FCFBF9",
  100: "#F7F4EF",
  200: "#ECE6DD",
  300: "#DDD4C7",
  400: "#BFAF9A",
  500: "#988775",
  600: "#746659",
  700: "#5B4F45",
  800: "#403832",
  900: "#2E2A27",
} as const;

export const feedbackPalette = {
  success: brandPalette.sage,
  successSubtle: "#E4EDE7",
  warning: brandPalette.amber,
  warningSubtle: "#FDF3E1",
  danger: brandPalette.accentHover,
  dangerSubtle: "#FDEAEA",
  info: brandPalette.info,
  infoSubtle: "#E5EDF8",
} as const;

export const relationshipHealthPalette = {
  excellent: "#166534",
  excellentSubtle: "#F0FDF4",
  healthy: brandPalette.sage,
  healthySubtle: "#E4EDE7",
  needsAttention: brandPalette.amber,
  needsAttentionSubtle: "#FDF3E1",
  priority: brandPalette.accent,
  prioritySubtle: "#FDEAEA",
} as const;

export const browniePointsPalette = {
  gold: "#B8860B",
  goldSubtle: "#FDF6E3",
  progress: brandPalette.amber,
} as const;

export const calendarPalette = {
  upcoming: "#B8860B",
  sent: brandPalette.sage,
  draft: "#6B7C8F",
  missed: brandPalette.accentHover,
  autopilot: "#6B9E7A",
} as const;

export const notificationPalette = {
  info: feedbackPalette.info,
  infoSubtle: feedbackPalette.infoSubtle,
  success: feedbackPalette.success,
  successSubtle: feedbackPalette.successSubtle,
  warning: feedbackPalette.warning,
  warningSubtle: feedbackPalette.warningSubtle,
  danger: feedbackPalette.danger,
  dangerSubtle: feedbackPalette.dangerSubtle,
} as const;

export const billingPalette = {
  surface: brandPalette.warmWhite,
  accent: brandPalette.sage,
  muted: neutralPalette[500],
  highlight: brandPalette.beige,
} as const;

/** Matches existing admin console inline styling. */
export const adminPalette = {
  surface: "#0D2444",
  surfaceElevated: "#122B52",
  border: "rgba(255, 255, 255, 0.15)",
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.55)",
  accent: "#93C5FD",
} as const;

export const darkPalette = {
  background: "#1F1B18",
  surface: "#2A2521",
  surfaceElevated: "#342E29",
  textPrimary: "#F7F3ED",
  textSecondary: "#D7CFC4",
  border: "#4B433D",
} as const;
