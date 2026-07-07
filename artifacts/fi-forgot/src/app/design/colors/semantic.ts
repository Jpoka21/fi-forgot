import { tokenVar } from "@/app/design/tokens/tokenNames";
import { colorCssVar } from "@/app/design/colors/cssVars";

export const semanticColorRoles = [
  "primary",
  "secondary",
  "accent",
  "canvas",
  "surface",
  "surfaceSecondary",
  "surfaceTertiary",
  "surfaceElevated",
  "textPrimary",
  "textSecondary",
  "textMuted",
  "textDisabled",
  "textInverse",
  "link",
  "divider",
  "border",
  "borderHover",
  "borderActive",
  "focus",
  "hover",
  "disabledBackground",
  "disabledForeground",
  "success",
  "warning",
  "error",
  "info",
] as const;

export type SemanticColorRole = (typeof semanticColorRoles)[number];

/** Core semantic colors — maps roles to `--fi-color-*` CSS variables. */
export const semanticColorMap = {
  primary: tokenVar(colorCssVar.primary),
  secondary: tokenVar(colorCssVar.secondary),
  accent: tokenVar(colorCssVar.accent),
  canvas: tokenVar(colorCssVar.canvas),
  surface: tokenVar(colorCssVar.surface),
  surfaceSecondary: tokenVar(colorCssVar.surfaceSecondary),
  surfaceTertiary: tokenVar(colorCssVar.surfaceTertiary),
  surfaceElevated: tokenVar(colorCssVar.surfaceElevated),
  textPrimary: tokenVar(colorCssVar.textPrimary),
  textSecondary: tokenVar(colorCssVar.textSecondary),
  textMuted: tokenVar(colorCssVar.textMuted),
  textDisabled: tokenVar(colorCssVar.textDisabled),
  textInverse: tokenVar(colorCssVar.textInverse),
  link: tokenVar(colorCssVar.link),
  divider: tokenVar(colorCssVar.divider),
  border: tokenVar(colorCssVar.border),
  borderHover: tokenVar(colorCssVar.borderHover),
  borderActive: tokenVar(colorCssVar.borderActive),
  focus: tokenVar(colorCssVar.focus),
  hover: tokenVar(colorCssVar.hover),
  disabledBackground: tokenVar(colorCssVar.disabledBackground),
  disabledForeground: tokenVar(colorCssVar.disabledForeground),
  success: tokenVar(colorCssVar.success),
  warning: tokenVar(colorCssVar.warning),
  error: tokenVar(colorCssVar.error),
  info: tokenVar(colorCssVar.info),
} as const;

export const domainColorTokens = {
  relationshipHealth: {
    excellent: tokenVar(colorCssVar.health.excellent),
    healthy: tokenVar(colorCssVar.health.healthy),
    needsAttention: tokenVar(colorCssVar.health.needsAttention),
    priority: tokenVar(colorCssVar.health.priority),
  },
  browniePoints: {
    gold: tokenVar(colorCssVar.brownie.gold),
    progress: tokenVar(colorCssVar.brownie.progress),
  },
  calendar: {
    upcoming: tokenVar(colorCssVar.calendar.upcoming),
    sent: tokenVar(colorCssVar.calendar.sent),
    draft: tokenVar(colorCssVar.calendar.draft),
    missed: tokenVar(colorCssVar.calendar.missed),
    autopilot: tokenVar(colorCssVar.calendar.autopilot),
  },
  notification: {
    info: tokenVar(colorCssVar.notification.info),
    success: tokenVar(colorCssVar.notification.success),
    warning: tokenVar(colorCssVar.notification.warning),
    danger: tokenVar(colorCssVar.notification.danger),
  },
  billing: {
    surface: tokenVar(colorCssVar.billing.surface),
    accent: tokenVar(colorCssVar.billing.accent),
    muted: tokenVar(colorCssVar.billing.muted),
  },
  admin: {
    surface: tokenVar(colorCssVar.admin.surface),
    text: tokenVar(colorCssVar.admin.text),
    accent: tokenVar(colorCssVar.admin.accent),
  },
} as const;

export function isSemanticColorRole(value: string): value is SemanticColorRole {
  return (semanticColorRoles as readonly string[]).includes(value);
}
