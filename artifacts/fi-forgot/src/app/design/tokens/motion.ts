import { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";

export const motionDurationTokens = {
  fast: tokenVar(cssVar.motion.durationFast),
  base: tokenVar(cssVar.motion.durationBase),
  slow: tokenVar(cssVar.motion.durationSlow),
} as const;

export const motionEasingTokens = {
  standard: tokenVar(cssVar.motion.easeStandard),
  emphasized: tokenVar(cssVar.motion.easeEmphasized),
  concierge: tokenVar(cssVar.motion.easeConcierge),
} as const;

export const animationCurveTokens = {
  routeEnter: "fi-route-fade-in",
  pulseRing: "fi-pulse-ring",
  bob: "fi-bob",
} as const;

export const timingTokens = {
  duration: motionDurationTokens,
  easing: motionEasingTokens,
  curves: animationCurveTokens,
} as const;
