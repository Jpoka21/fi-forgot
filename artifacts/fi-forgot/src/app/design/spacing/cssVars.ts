/**
 * Spacing CSS custom property names.
 * Extends Phase 2 `--fi-space-*` and `--fi-grid-gutter` primitives.
 */
export const spacingCssVar = {
  scale: {
    0: "--fi-space-0",
    1: "--fi-space-1",
    2: "--fi-space-2",
    3: "--fi-space-3",
    4: "--fi-space-4",
    5: "--fi-space-5",
    6: "--fi-space-6",
    8: "--fi-space-8",
    10: "--fi-space-10",
    12: "--fi-space-12",
    16: "--fi-space-16",
    page: "--fi-space-page",
    section: "--fi-space-section",
  },
  layout: {
    screenMargin: "--fi-space-screen-margin",
    sectionGap: "--fi-space-section-gap",
    stackSm: "--fi-space-stack-sm",
    stackMd: "--fi-space-stack-md",
    stackLg: "--fi-space-stack-lg",
    inlineSm: "--fi-space-inline-sm",
    inlineMd: "--fi-space-inline-md",
    responsiveStack: "--fi-space-responsive-stack",
  },
  component: {
    cardPadding: "--fi-space-card-padding",
    formGap: "--fi-space-form-gap",
    formFieldGap: "--fi-space-form-field-gap",
    navigationGap: "--fi-space-nav-gap",
    gridGap: "--fi-space-grid-gap",
    modalPadding: "--fi-space-modal-padding",
    modalGap: "--fi-space-modal-gap",
    drawerPadding: "--fi-space-drawer-padding",
    timelineGap: "--fi-space-timeline-gap",
    calendarCell: "--fi-space-calendar-cell",
    calendarSection: "--fi-space-calendar-section",
    emptyGap: "--fi-space-empty-gap",
    errorGap: "--fi-space-error-gap",
    successGap: "--fi-space-success-gap",
  },
} as const;
