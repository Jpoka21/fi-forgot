/**
 * Elevation and layering CSS custom property names.
 * Extends Phase 2 `--fi-shadow-*`, `--fi-elevation-*`, and `--fi-z-*` primitives.
 */
export const elevationCssVar = {
  shadow: {
    none: "--fi-shadow-none",
    floating: "--fi-shadow-floating",
    modal: "--fi-shadow-modal",
  },
  level: {
    0: "--fi-elevation-level-0",
    1: "--fi-elevation-level-1",
    2: "--fi-elevation-level-2",
    3: "--fi-elevation-level-3",
    4: "--fi-elevation-level-4",
    5: "--fi-elevation-level-5",
  },
  component: {
    card: "--fi-elevation-card",
    modal: "--fi-elevation-modal",
    drawer: "--fi-elevation-drawer",
    navigation: "--fi-elevation-navigation",
    floatingAction: "--fi-elevation-floating-action",
    dropdown: "--fi-elevation-dropdown",
    tooltip: "--fi-elevation-tooltip",
    toast: "--fi-elevation-toast",
  },
  overlay: {
    background: "--fi-elevation-overlay-bg",
  },
  layer: {
    navigation: "--fi-z-layer-navigation",
    floatingAction: "--fi-z-layer-floating-action",
    dropdown: "--fi-z-layer-dropdown",
    drawer: "--fi-z-layer-drawer",
    popover: "--fi-z-layer-popover",
    modal: "--fi-z-layer-modal",
    toast: "--fi-z-layer-toast",
    tooltip: "--fi-z-layer-tooltip",
  },
} as const;
