import { breakpointValues } from "@/app/design/tokens/breakpoints";
import { gridColumnScale, gridGutterScale, gridMarginScale } from "@/app/design/grid/scale";

export const responsiveGridExpectations = {
  mobile: {
    minWidth: breakpointValues.xs,
    maxWidth: breakpointValues.md - 1,
    columns: gridColumnScale.mobile,
    gutter: gridGutterScale.mobile,
    margin: gridMarginScale.mobile,
  },
  tablet: {
    minWidth: breakpointValues.md,
    maxWidth: breakpointValues.lg - 1,
    columns: gridColumnScale.tablet,
    gutter: gridGutterScale.tablet,
    margin: gridMarginScale.tablet,
  },
  desktop: {
    minWidth: breakpointValues.lg,
    columns: gridColumnScale.desktop,
    gutter: gridGutterScale.desktop,
    margin: gridMarginScale.desktop,
  },
} as const;

export const responsiveGridRules = {
  mobileFewerColumnsThanDesktop: gridColumnScale.mobile < gridColumnScale.desktop,
  tabletBetweenMobileAndDesktop:
    gridColumnScale.tablet > gridColumnScale.mobile
    && gridColumnScale.tablet < gridColumnScale.desktop,
  gutterIncreasesWithViewport:
    gridGutterScale.mobile < gridGutterScale.tablet
    && gridGutterScale.tablet <= gridGutterScale.desktop,
} as const;

export function verifyResponsiveGridBehavior(): {
  viewport: keyof typeof responsiveGridExpectations;
  columns: number;
  gutter: string;
  margin: string;
}[] {
  return (Object.keys(responsiveGridExpectations) as Array<keyof typeof responsiveGridExpectations>).map(
    (viewport) => ({
      viewport,
      columns: responsiveGridExpectations[viewport].columns,
      gutter: responsiveGridExpectations[viewport].gutter,
      margin: responsiveGridExpectations[viewport].margin,
    }),
  );
}

export function isResponsiveGridValid(): boolean {
  return (
    responsiveGridRules.mobileFewerColumnsThanDesktop
    && responsiveGridRules.tabletBetweenMobileAndDesktop
    && responsiveGridRules.gutterIncreasesWithViewport
  );
}
