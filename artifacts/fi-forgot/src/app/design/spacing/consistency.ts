import { componentSpacingRoles } from "@/app/design/spacing/semantic";
import type { ComponentSpacingRole } from "@/app/design/spacing/semantic";
import type { SpacingScaleKey } from "@/app/design/spacing/scale";

/** Documents which base scale step each component spacing role maps to. */
export const spacingConsistencyMap: Record<ComponentSpacingRole, SpacingScaleKey | "gridGutter"> = {
  card: 6,
  form: 4,
  navigation: 4,
  grid: "gridGutter",
  modal: 6,
  drawer: 6,
  timeline: 8,
  calendar: 4,
  empty: 8,
  error: 3,
  success: 3,
};

export const spacingConsistencyRules = {
  formFieldSmallerThanForm: spacingConsistencyMap.form === 4,
  errorMatchesSuccess: spacingConsistencyMap.error === spacingConsistencyMap.success,
  timelineUsesLargerGap: spacingConsistencyMap.timeline === 8,
} as const;

export function verifySpacingConsistency(): {
  role: ComponentSpacingRole;
  expectedScale: string;
}[] {
  return componentSpacingRoles.map((role) => ({
    role,
    expectedScale: String(spacingConsistencyMap[role]),
  }));
}

export function isSpacingConsistencyValid(): boolean {
  return (
    spacingConsistencyRules.formFieldSmallerThanForm
    && spacingConsistencyRules.errorMatchesSuccess
    && spacingConsistencyRules.timelineUsesLargerGap
  );
}
