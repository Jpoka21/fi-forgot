import { tokenVar } from "@/app/design/tokens/tokenNames";
import { elevationCssVar } from "@/app/design/elevation/cssVars";

export const componentElevationRoles = [
  "card",
  "modal",
  "drawer",
  "navigation",
  "floatingAction",
  "dropdown",
  "tooltip",
  "toast",
] as const;

export type ComponentElevationRole = (typeof componentElevationRoles)[number];

export const componentElevationTokens = {
  card: tokenVar(elevationCssVar.component.card),
  modal: tokenVar(elevationCssVar.component.modal),
  drawer: tokenVar(elevationCssVar.component.drawer),
  navigation: tokenVar(elevationCssVar.component.navigation),
  floatingAction: tokenVar(elevationCssVar.component.floatingAction),
  dropdown: tokenVar(elevationCssVar.component.dropdown),
  tooltip: tokenVar(elevationCssVar.component.tooltip),
  toast: tokenVar(elevationCssVar.component.toast),
} as const;

export const overlayLayerTokens = {
  background: tokenVar(elevationCssVar.overlay.background),
} as const;

export const layerZIndexTokens = {
  navigation: tokenVar(elevationCssVar.layer.navigation),
  floatingAction: tokenVar(elevationCssVar.layer.floatingAction),
  dropdown: tokenVar(elevationCssVar.layer.dropdown),
  drawer: tokenVar(elevationCssVar.layer.drawer),
  popover: tokenVar(elevationCssVar.layer.popover),
  modal: tokenVar(elevationCssVar.layer.modal),
  toast: tokenVar(elevationCssVar.layer.toast),
  tooltip: tokenVar(elevationCssVar.layer.tooltip),
} as const;

export function isComponentElevationRole(value: string): value is ComponentElevationRole {
  return (componentElevationRoles as readonly string[]).includes(value);
}
