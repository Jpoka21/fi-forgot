import { tokenVar } from "@/app/design/tokens/tokenNames";
import { shadowTokens } from "@/app/design/tokens/shadows";
import { elevationCssVar } from "@/app/design/elevation/cssVars";

/** Playbook elevation levels 0–5 mapped to the existing shadow scale. */
export const elevationLevels = {
  0: tokenVar(elevationCssVar.level[0]),
  1: tokenVar(elevationCssVar.level[1]),
  2: tokenVar(elevationCssVar.level[2]),
  3: tokenVar(elevationCssVar.level[3]),
  4: tokenVar(elevationCssVar.level[4]),
  5: tokenVar(elevationCssVar.level[5]),
} as const;

export type ElevationLevel = keyof typeof elevationLevels;

export const shadowScaleTokens = {
  none: tokenVar(elevationCssVar.shadow.none),
  sm: shadowTokens.sm,
  md: shadowTokens.md,
  lg: shadowTokens.lg,
  xl: shadowTokens.xl,
  floating: tokenVar(elevationCssVar.shadow.floating),
  modal: tokenVar(elevationCssVar.shadow.modal),
} as const;
