export { spacingCssVar } from "@/app/design/spacing/cssVars";

export { layoutSpacingTokens, spacingScaleTokens } from "@/app/design/spacing/scale";
export type { SpacingScaleKey } from "@/app/design/spacing/scale";

export {
  componentSpacingRoles,
  componentSpacingTokens,
  isComponentSpacingRole,
} from "@/app/design/spacing/semantic";
export type { ComponentSpacingRole } from "@/app/design/spacing/semantic";

export {
  isSpacingConsistencyValid,
  spacingConsistencyMap,
  spacingConsistencyRules,
  verifySpacingConsistency,
} from "@/app/design/spacing/consistency";

export const spacingUtilityClasses = {
  gap0: "fi-gap-0",
  gap2: "fi-gap-2",
  gap4: "fi-gap-4",
  gap6: "fi-gap-6",
  gap8: "fi-gap-8",
  gapX2: "fi-gap-x-2",
  gapX4: "fi-gap-x-4",
  gapX6: "fi-gap-x-6",
  gapY2: "fi-gap-y-2",
  gapY4: "fi-gap-y-4",
  gapY6: "fi-gap-y-6",
  px4: "fi-px-4",
  px6: "fi-px-6",
  pxPage: "fi-px-page",
  py4: "fi-py-4",
  py6: "fi-py-6",
  pySection: "fi-py-section",
  layoutPage: "fi-layout-page",
  layoutSection: "fi-layout-section",
  stackResponsive: "fi-stack-responsive",
  stackSm: "fi-stack-sm",
  stackMd: "fi-stack-md",
  stackLg: "fi-stack-lg",
  inlineSm: "fi-inline-sm",
  inlineMd: "fi-inline-md",
  pCard: "fi-p-card",
  stackForm: "fi-stack-form",
  stackFormField: "fi-stack-form-field",
  gapNav: "fi-gap-nav",
  gapGrid: "fi-gap-grid",
  pModal: "fi-p-modal",
  stackModal: "fi-stack-modal",
  pDrawer: "fi-p-drawer",
  stackTimeline: "fi-stack-timeline",
  gapCalendar: "fi-gap-calendar",
  stackCalendar: "fi-stack-calendar",
  stackEmpty: "fi-stack-empty",
  stackError: "fi-stack-error",
  stackSuccess: "fi-stack-success",
  mxScreen: "fi-mx-screen",
} as const;
