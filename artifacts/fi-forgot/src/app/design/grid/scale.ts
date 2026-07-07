import { tokenVar } from "@/app/design/tokens/tokenNames";
import { gridTokens } from "@/app/design/tokens/grid";
import { containerTokens } from "@/app/design/tokens/containers";
import { gridCssVar } from "@/app/design/grid/cssVars";

/** Responsive column counts per playbook layout system. */
export const gridColumnScale = {
  mobile: 4,
  tablet: 6,
  desktop: 12,
} as const;

export const gridGutterScale = {
  mobile: "1rem",
  tablet: "1.25rem",
  desktop: "1.5rem",
} as const;

export const gridMarginScale = {
  mobile: "1rem",
  tablet: "1.5rem",
  desktop: "2rem",
} as const;

export const gridScaleTokens = {
  columns: tokenVar(gridCssVar.columns.current),
  gutter: gridTokens.gutter,
  margin: tokenVar(gridCssVar.margin.current),
} as const;

export const contentWidthTokens = {
  standard: tokenVar(gridCssVar.maxWidth.standard),
  reading: tokenVar(gridCssVar.maxWidth.reading),
  form: tokenVar(gridCssVar.maxWidth.form),
  detail: tokenVar(gridCssVar.maxWidth.detail),
  canvas: tokenVar(gridCssVar.maxWidth.canvas),
  containerSm: containerTokens.sm,
  containerMd: containerTokens.md,
  containerLg: containerTokens.lg,
  containerXl: containerTokens.xl,
} as const;

export const sidebarWidthTokens = {
  default: tokenVar(gridCssVar.sidebar.default),
  wide: tokenVar(gridCssVar.sidebar.wide),
  collapsed: tokenVar(gridCssVar.sidebar.collapsed),
} as const;
