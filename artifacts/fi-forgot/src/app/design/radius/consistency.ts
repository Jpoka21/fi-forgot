import { componentRadiusRoles, componentRadiusTokens } from "@/app/design/radius/semantic";
import { radiusScaleTokens } from "@/app/design/radius/scale";
import type { ComponentRadiusRole } from "@/app/design/radius/semantic";

/**
 * Expected scale token for each component role.
 * CSS bridges `--fi-radius-card` → `--fi-radius-lg`, etc. in radius.css.
 */
export const radiusConsistencyMap: Record<ComponentRadiusRole, keyof typeof radiusScaleTokens> = {
  avatar: "circle",
  card: "lg",
  input: "md",
  dialog: "xl",
  image: "md",
  button: "lg",
};

export const radiusConsistencyRules = {
  cardMatchesButton: radiusConsistencyMap.card === radiusConsistencyMap.button,
  inputMatchesImage: radiusConsistencyMap.input === radiusConsistencyMap.image,
  dialogUsesLargestInteractiveRadius: radiusConsistencyMap.dialog === "xl",
} as const;

export function getComponentRadiusToken(role: ComponentRadiusRole): string {
  return componentRadiusTokens[role];
}

export function verifyRadiusConsistency(): {
  role: ComponentRadiusRole;
  componentVariable: string;
  expectedScale: keyof typeof radiusScaleTokens;
  scaleReference: string;
}[] {
  return componentRadiusRoles.map((role) => ({
    role,
    componentVariable: componentRadiusTokens[role],
    expectedScale: radiusConsistencyMap[role],
    scaleReference: radiusScaleTokens[radiusConsistencyMap[role]],
  }));
}

export function isRadiusConsistencyValid(): boolean {
  return (
    radiusConsistencyRules.cardMatchesButton
    && radiusConsistencyRules.inputMatchesImage
    && radiusConsistencyRules.dialogUsesLargestInteractiveRadius
  );
}
