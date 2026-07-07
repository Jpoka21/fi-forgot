import { tokenVar } from "@/app/design/tokens/tokenNames";
import { radiusTokens } from "@/app/design/tokens/radius";
import { radiusCssVar } from "@/app/design/radius/cssVars";

/** Playbook scale: extra small through extra large, pill, and circle. */
export const radiusScaleTokens = {
  xs: tokenVar(radiusCssVar.scale.xs),
  sm: radiusTokens.sm,
  md: radiusTokens.md,
  lg: radiusTokens.lg,
  xl: radiusTokens.xl,
  pill: tokenVar(radiusCssVar.scale.pill),
  circle: tokenVar(radiusCssVar.scale.circle),
  legacy: radiusTokens.legacy,
} as const;

export type RadiusScaleToken = keyof typeof radiusScaleTokens;
