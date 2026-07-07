import { tokenVar } from "@/app/design/tokens/tokenNames";
import { gridCssVar } from "@/app/design/grid/cssVars";

export const layoutGridRoles = [
  "dashboard",
  "card",
  "form",
  "calendar",
  "admin",
] as const;

export type LayoutGridRole = (typeof layoutGridRoles)[number];

export const layoutGridTokens = {
  dashboard: tokenVar(gridCssVar.layout.dashboard),
  card: tokenVar(gridCssVar.layout.card),
  form: tokenVar(gridCssVar.layout.form),
  calendar: tokenVar(gridCssVar.layout.calendar),
  admin: tokenVar(gridCssVar.layout.admin),
} as const;

export function isLayoutGridRole(value: string): value is LayoutGridRole {
  return (layoutGridRoles as readonly string[]).includes(value);
}
