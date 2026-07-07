import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const spacingTokens = {
  0: tokenVar(cssVar.space[0]),
  1: tokenVar(cssVar.space[1]),
  2: tokenVar(cssVar.space[2]),
  3: tokenVar(cssVar.space[3]),
  4: tokenVar(cssVar.space[4]),
  5: tokenVar(cssVar.space[5]),
  6: tokenVar(cssVar.space[6]),
  8: tokenVar(cssVar.space[8]),
  10: tokenVar(cssVar.space[10]),
  12: tokenVar(cssVar.space[12]),
  16: tokenVar(cssVar.space[16]),
  page: tokenVar(cssVar.space.page),
  section: tokenVar(cssVar.space.section),
} as const;

export const spacingScalePx = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;
