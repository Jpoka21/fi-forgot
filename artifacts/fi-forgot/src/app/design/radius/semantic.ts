import { tokenVar } from "@/app/design/tokens/tokenNames";
import { radiusCssVar } from "@/app/design/radius/cssVars";

export const componentRadiusRoles = [
  "avatar",
  "card",
  "input",
  "dialog",
  "image",
  "button",
] as const;

export type ComponentRadiusRole = (typeof componentRadiusRoles)[number];

export const componentRadiusTokens = {
  avatar: tokenVar(radiusCssVar.component.avatar),
  card: tokenVar(radiusCssVar.component.card),
  input: tokenVar(radiusCssVar.component.input),
  dialog: tokenVar(radiusCssVar.component.dialog),
  image: tokenVar(radiusCssVar.component.image),
  button: tokenVar(radiusCssVar.component.button),
} as const;

export function isComponentRadiusRole(value: string): value is ComponentRadiusRole {
  return (componentRadiusRoles as readonly string[]).includes(value);
}
