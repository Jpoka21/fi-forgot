import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const gridTokens = {
  columns: tokenVar(cssVar.grid.columns),
  gutter: tokenVar(cssVar.grid.gutter),
} as const;

export const gridScale = {
  columns: 12,
  gutter: "1.5rem",
} as const;
