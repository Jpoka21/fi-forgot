import { colorTokens } from "@/app/design/tokens/colors";

export const semanticColorTokens = {
  background: {
    canvas: colorTokens.background,
    surface: colorTokens.surface,
    elevated: colorTokens.surfaceElevated,
    accentSubtle: colorTokens.beige,
  },
  text: {
    primary: colorTokens.textPrimary,
    secondary: colorTokens.textSecondary,
    muted: colorTokens.textMuted,
    inverse: colorTokens.cream,
    link: colorTokens.accent,
  },
  border: {
    default: colorTokens.border,
    strong: colorTokens.ink,
  },
  action: {
    primary: colorTokens.accent,
    primaryHover: colorTokens.accentHover,
    focus: colorTokens.focusRing,
  },
  feedback: {
    success: colorTokens.success,
    warning: colorTokens.warning,
    danger: colorTokens.danger,
    info: colorTokens.info,
  },
  selection: {
    background: colorTokens.selectionBg,
    foreground: colorTokens.selectionFg,
  },
} as const;
