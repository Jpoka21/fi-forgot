/**
 * Grid CSS custom property names.
 * Extends Phase 2 `--fi-grid-*` and `--fi-container-*` primitives.
 */
export const gridCssVar = {
  columns: {
    mobile: "--fi-grid-columns-mobile",
    tablet: "--fi-grid-columns-tablet",
    desktop: "--fi-grid-columns-desktop",
    current: "--fi-grid-columns",
  },
  gutter: {
    mobile: "--fi-grid-gutter-mobile",
    tablet: "--fi-grid-gutter-tablet",
    desktop: "--fi-grid-gutter-desktop",
    current: "--fi-grid-gutter",
  },
  margin: {
    mobile: "--fi-grid-margin-mobile",
    tablet: "--fi-grid-margin-tablet",
    desktop: "--fi-grid-margin-desktop",
    current: "--fi-grid-margin",
  },
  maxWidth: {
    standard: "--fi-grid-max-standard",
    reading: "--fi-grid-max-reading",
    form: "--fi-grid-max-form",
    detail: "--fi-grid-max-detail",
    canvas: "--fi-grid-max-canvas",
  },
  sidebar: {
    default: "--fi-grid-sidebar-width",
    wide: "--fi-grid-sidebar-wide",
    collapsed: "--fi-grid-sidebar-collapsed",
  },
  layout: {
    dashboard: "--fi-grid-layout-dashboard",
    card: "--fi-grid-layout-card",
    form: "--fi-grid-layout-form",
    calendar: "--fi-grid-layout-calendar",
    admin: "--fi-grid-layout-admin",
  },
} as const;
