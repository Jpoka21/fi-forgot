import { tokenVar } from "@/app/design/tokens/tokenNames";
import { motionDurationTokens, motionEasingTokens } from "@/app/design/tokens/motion";
import { motionCssVar } from "@/app/design/motion/cssVars";

/** Playbook timing scale — bridges Phase 2 fast/base/slow tokens. */
export const motionDurationScale = {
  instant: tokenVar(motionCssVar.duration.instant),
  fast: motionDurationTokens.fast,
  base: motionDurationTokens.base,
  slow: motionDurationTokens.slow,
  extraSlow: tokenVar(motionCssVar.duration.extraSlow),
} as const;

export type MotionDurationToken = keyof typeof motionDurationScale;

export const motionEasingScale = {
  standard: motionEasingTokens.standard,
  emphasized: motionEasingTokens.emphasized,
  concierge: motionEasingTokens.concierge,
  in: tokenVar(motionCssVar.easing.in),
  out: tokenVar(motionCssVar.easing.out),
  inOut: tokenVar(motionCssVar.easing.inOut),
  quickExit: tokenVar(motionCssVar.easing.quickExit),
} as const;

export type MotionEasingToken = keyof typeof motionEasingScale;
