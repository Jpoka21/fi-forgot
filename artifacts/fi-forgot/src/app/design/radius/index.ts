export { radiusCssVar } from "@/app/design/radius/cssVars";

export { radiusScaleTokens } from "@/app/design/radius/scale";
export type { RadiusScaleToken } from "@/app/design/radius/scale";

export {
  componentRadiusRoles,
  componentRadiusTokens,
  isComponentRadiusRole,
} from "@/app/design/radius/semantic";
export type { ComponentRadiusRole } from "@/app/design/radius/semantic";

export {
  getComponentRadiusToken,
  isRadiusConsistencyValid,
  radiusConsistencyMap,
  radiusConsistencyRules,
  verifyRadiusConsistency,
} from "@/app/design/radius/consistency";

export const radiusUtilityClasses = {
  xs: "fi-radius-xs",
  sm: "fi-radius-sm",
  md: "fi-radius-md",
  lg: "fi-radius-lg",
  xl: "fi-radius-xl",
  pill: "fi-radius-pill",
  circle: "fi-radius-circle",
  avatar: "fi-radius-avatar",
  card: "fi-radius-card",
  input: "fi-radius-input",
  dialog: "fi-radius-dialog",
  image: "fi-radius-image",
  button: "fi-radius-button",
  cardTop: "fi-radius-card-top",
  cardBottom: "fi-radius-card-bottom",
  avatarClip: "fi-radius-avatar-clip",
} as const;
