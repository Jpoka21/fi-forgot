import { tokenVar } from "@/app/design/tokens/tokenNames";
import { motionCssVar } from "@/app/design/motion/cssVars";

export const componentMotionRoles = [
  "hover",
  "focus",
  "button",
  "card",
  "input",
  "dialog",
  "drawer",
  "navigation",
  "screen",
  "loading",
  "skeleton",
  "ai",
  "timeline",
  "notification",
  "calendar",
] as const;

export type ComponentMotionRole = (typeof componentMotionRoles)[number];

export const componentMotionTokens = {
  hover: tokenVar(motionCssVar.component.hover),
  focus: tokenVar(motionCssVar.component.focus),
  button: tokenVar(motionCssVar.component.button),
  card: tokenVar(motionCssVar.component.card),
  input: tokenVar(motionCssVar.component.input),
  dialog: tokenVar(motionCssVar.component.dialog),
  drawer: tokenVar(motionCssVar.component.drawer),
  navigation: tokenVar(motionCssVar.component.navigation),
  screen: tokenVar(motionCssVar.component.screen),
  loading: tokenVar(motionCssVar.component.loading),
  skeleton: tokenVar(motionCssVar.component.skeleton),
  ai: tokenVar(motionCssVar.component.ai),
  timeline: tokenVar(motionCssVar.component.timeline),
  notification: tokenVar(motionCssVar.component.notification),
  calendar: tokenVar(motionCssVar.component.calendar),
} as const;

export function isComponentMotionRole(value: string): value is ComponentMotionRole {
  return (componentMotionRoles as readonly string[]).includes(value);
}
