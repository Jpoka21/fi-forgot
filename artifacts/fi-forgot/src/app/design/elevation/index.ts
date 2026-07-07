export { elevationCssVar } from "@/app/design/elevation/cssVars";

export { elevationLevels, shadowScaleTokens } from "@/app/design/elevation/scale";
export type { ElevationLevel } from "@/app/design/elevation/scale";

export {
  componentElevationRoles,
  componentElevationTokens,
  isComponentElevationRole,
  layerZIndexTokens,
  overlayLayerTokens,
} from "@/app/design/elevation/semantic";
export type { ComponentElevationRole } from "@/app/design/elevation/semantic";

export {
  isValidLayerOrder,
  overlayLayering,
  verifyZIndexHierarchy,
  zIndexLayerOrder,
  zIndexLayerValues,
} from "@/app/design/elevation/layering";
export type { ZIndexLayer } from "@/app/design/elevation/layering";

export const elevationUtilityClasses = {
  shadowNone: "fi-shadow-none",
  shadowSm: "fi-shadow-sm",
  shadowMd: "fi-shadow-md",
  shadowLg: "fi-shadow-lg",
  shadowXl: "fi-shadow-xl",
  elevCard: "fi-elev-card",
  elevModal: "fi-elev-modal",
  elevDrawer: "fi-elev-drawer",
  elevNavigation: "fi-elev-navigation",
  elevFloatingAction: "fi-elev-floating-action",
  elevDropdown: "fi-elev-dropdown",
  elevTooltip: "fi-elev-tooltip",
  elevToast: "fi-elev-toast",
  elev0: "fi-elev-0",
  elev1: "fi-elev-1",
  elev2: "fi-elev-2",
  elev3: "fi-elev-3",
  elev4: "fi-elev-4",
  elev5: "fi-elev-5",
  layerNavigation: "fi-layer-navigation",
  layerFloatingAction: "fi-layer-floating-action",
  layerDropdown: "fi-layer-dropdown",
  layerDrawer: "fi-layer-drawer",
  layerPopover: "fi-layer-popover",
  layerModal: "fi-layer-modal",
  layerToast: "fi-layer-toast",
  layerTooltip: "fi-layer-tooltip",
  layerOverlay: "fi-layer-overlay",
  layerOverlayBelowModal: "fi-layer-overlay-below-modal",
} as const;
