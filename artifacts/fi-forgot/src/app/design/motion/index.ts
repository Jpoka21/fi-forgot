export { motionCssVar } from "@/app/design/motion/cssVars";

export { motionDurationScale, motionEasingScale } from "@/app/design/motion/scale";
export type { MotionDurationToken, MotionEasingToken } from "@/app/design/motion/scale";

export {
  componentMotionRoles,
  componentMotionTokens,
  isComponentMotionRole,
} from "@/app/design/motion/semantic";
export type { ComponentMotionRole } from "@/app/design/motion/semantic";

export {
  isMotionAccessibilityValid,
  motionAccessibility,
  motionAccessibilityChecks,
  verifyMotionAccessibility,
} from "@/app/design/motion/accessibility";

export const motionUtilityClasses = {
  hover: "fi-motion-hover",
  focus: "fi-motion-focus",
  button: "fi-motion-button",
  card: "fi-motion-card",
  input: "fi-motion-input",
  dialogEnter: "fi-motion-dialog-enter",
  drawerEnter: "fi-motion-drawer-enter",
  navEnter: "fi-motion-nav-enter",
  screenEnter: "fi-motion-screen-enter",
  loading: "fi-motion-loading",
  skeleton: "fi-motion-skeleton",
  ai: "fi-motion-ai",
  timelineEnter: "fi-motion-timeline-enter",
  notificationEnter: "fi-motion-notification-enter",
  calendarEnter: "fi-motion-calendar-enter",
  reducedSafe: "fi-motion-reduced-safe",
} as const;
