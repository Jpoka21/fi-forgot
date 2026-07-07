import { tokenVar } from "@/app/design/tokens/tokenNames";
import { spacingCssVar } from "@/app/design/spacing/cssVars";

export const componentSpacingRoles = [
  "card",
  "form",
  "navigation",
  "grid",
  "modal",
  "drawer",
  "timeline",
  "calendar",
  "empty",
  "error",
  "success",
] as const;

export type ComponentSpacingRole = (typeof componentSpacingRoles)[number];

export const componentSpacingTokens = {
  cardPadding: tokenVar(spacingCssVar.component.cardPadding),
  formGap: tokenVar(spacingCssVar.component.formGap),
  formFieldGap: tokenVar(spacingCssVar.component.formFieldGap),
  navigationGap: tokenVar(spacingCssVar.component.navigationGap),
  gridGap: tokenVar(spacingCssVar.component.gridGap),
  modalPadding: tokenVar(spacingCssVar.component.modalPadding),
  modalGap: tokenVar(spacingCssVar.component.modalGap),
  drawerPadding: tokenVar(spacingCssVar.component.drawerPadding),
  timelineGap: tokenVar(spacingCssVar.component.timelineGap),
  calendarCell: tokenVar(spacingCssVar.component.calendarCell),
  calendarSection: tokenVar(spacingCssVar.component.calendarSection),
  emptyGap: tokenVar(spacingCssVar.component.emptyGap),
  errorGap: tokenVar(spacingCssVar.component.errorGap),
  successGap: tokenVar(spacingCssVar.component.successGap),
} as const;

export function isComponentSpacingRole(value: string): value is ComponentSpacingRole {
  return (componentSpacingRoles as readonly string[]).includes(value);
}
