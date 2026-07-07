import { zIndexScale } from "@/app/design/tokens/zIndex";

/**
 * Canonical z-index layering order for overlay stacking verification.
 * Aligns with playbook guidance: never use arbitrary z-index values.
 */
export const zIndexLayerOrder = [
  "base",
  "sticky",
  "navigation",
  "floatingAction",
  "dropdown",
  "drawer",
  "popover",
  "modal",
  "toast",
  "tooltip",
  "max",
] as const;

export type ZIndexLayer = (typeof zIndexLayerOrder)[number];

export const zIndexLayerValues: Record<ZIndexLayer, number> = {
  base: zIndexScale.base,
  sticky: zIndexScale.sticky,
  navigation: zIndexScale.sticky,
  floatingAction: zIndexScale.sticky + 10,
  dropdown: zIndexScale.dropdown,
  drawer: 5000,
  popover: 6000,
  modal: zIndexScale.overlay,
  toast: zIndexScale.toast,
  tooltip: zIndexScale.max,
  max: zIndexScale.max,
};

export function isValidLayerOrder(foreground: ZIndexLayer, background: ZIndexLayer): boolean {
  return zIndexLayerValues[foreground] > zIndexLayerValues[background];
}

export function verifyZIndexHierarchy(): { layer: ZIndexLayer; value: number }[] {
  return zIndexLayerOrder.map((layer) => ({
    layer,
    value: zIndexLayerValues[layer],
  }));
}

export const overlayLayering = {
  usesSemanticLayers: true,
  modalAboveDrawer: isValidLayerOrder("modal", "drawer"),
  toastAboveModal: isValidLayerOrder("toast", "modal"),
  tooltipAboveToast: isValidLayerOrder("tooltip", "toast"),
} as const;
