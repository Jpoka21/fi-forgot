export { gridCssVar } from "@/app/design/grid/cssVars";

export {
  contentWidthTokens,
  gridColumnScale,
  gridGutterScale,
  gridMarginScale,
  gridScaleTokens,
  sidebarWidthTokens,
} from "@/app/design/grid/scale";

export {
  isLayoutGridRole,
  layoutGridRoles,
  layoutGridTokens,
} from "@/app/design/grid/semantic";
export type { LayoutGridRole } from "@/app/design/grid/semantic";

export {
  isResponsiveGridValid,
  responsiveGridExpectations,
  responsiveGridRules,
  verifyResponsiveGridBehavior,
} from "@/app/design/grid/responsive";

export const gridUtilityClasses = {
  grid: "fi-grid",
  gridInline: "fi-grid-inline",
  container: "fi-container",
  containerStandard: "fi-container-standard",
  containerReading: "fi-container-reading",
  containerForm: "fi-container-form",
  containerDetail: "fi-container-detail",
  containerCanvas: "fi-container-canvas",
  sidebar: "fi-sidebar",
  sidebarWide: "fi-sidebar-wide",
  sidebarCollapsed: "fi-sidebar-collapsed",
  layoutDashboard: "fi-layout-dashboard",
  layoutCard: "fi-layout-card",
  layoutForm: "fi-layout-form",
  layoutCalendar: "fi-layout-calendar",
  layoutAdmin: "fi-layout-admin",
  colSpanFull: "fi-col-span-full",
  colSpanHalf: "fi-col-span-half",
  colSpanThird: "fi-col-span-third",
} as const;
