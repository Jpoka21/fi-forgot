export { blurScale, blurTokens } from "@/app/design/tokens/blur";
export { breakpointTokens, breakpointValues, mediaQueries } from "@/app/design/tokens/breakpoints";
export { brandColors, colorTokens } from "@/app/design/tokens/colors";
export { containerScale, containerTokens } from "@/app/design/tokens/containers";
export { focusTokens, selectionTokens } from "@/app/design/tokens/focus";
export { gridScale, gridTokens } from "@/app/design/tokens/grid";
export { iconSizeScale, iconSizeTokens } from "@/app/design/tokens/icons";
export {
  animationCurveTokens,
  motionDurationTokens,
  motionEasingTokens,
  timingTokens,
} from "@/app/design/tokens/motion";
export { opacityScale, opacityTokens } from "@/app/design/tokens/opacity";
export { radiusTokens } from "@/app/design/tokens/radius";
export { responsiveSpacingTokens, responsiveTypographyTokens } from "@/app/design/tokens/responsive";
export { semanticColorTokens } from "@/app/design/tokens/semantic";
export { elevationTokens, shadowTokens } from "@/app/design/tokens/shadows";
export { spacingScalePx, spacingTokens } from "@/app/design/tokens/spacing";
export { cssVar, tokenVar } from "@/app/design/tokens/tokenNames";
export {
  fontFamilyTokens,
  fontSizeTokens,
  fontWeightTokens,
  letterSpacingTokens,
  lineHeightTokens,
} from "@/app/design/tokens/typography";
export { zIndexScale, zIndexTokens } from "@/app/design/tokens/zIndex";

import { blurTokens } from "@/app/design/tokens/blur";
import { colorTokens } from "@/app/design/tokens/colors";
import { containerTokens } from "@/app/design/tokens/containers";
import { focusTokens, selectionTokens } from "@/app/design/tokens/focus";
import { gridTokens } from "@/app/design/tokens/grid";
import { iconSizeTokens } from "@/app/design/tokens/icons";
import { timingTokens } from "@/app/design/tokens/motion";
import { opacityTokens } from "@/app/design/tokens/opacity";
import { radiusTokens } from "@/app/design/tokens/radius";
import { responsiveSpacingTokens, responsiveTypographyTokens } from "@/app/design/tokens/responsive";
import { semanticColorTokens } from "@/app/design/tokens/semantic";
import { elevationTokens, shadowTokens } from "@/app/design/tokens/shadows";
import { spacingTokens } from "@/app/design/tokens/spacing";
import { fontFamilyTokens, fontSizeTokens } from "@/app/design/tokens/typography";
import { zIndexTokens } from "@/app/design/tokens/zIndex";

/** Grouped token registry for programmatic access. */
export const designTokens = {
  color: colorTokens,
  semantic: semanticColorTokens,
  spacing: spacingTokens,
  responsiveSpacing: responsiveSpacingTokens,
  radius: radiusTokens,
  shadow: shadowTokens,
  elevation: elevationTokens,
  typography: {
    family: fontFamilyTokens,
    size: fontSizeTokens,
    responsive: responsiveTypographyTokens,
  },
  motion: timingTokens,
  zIndex: zIndexTokens,
  opacity: opacityTokens,
  blur: blurTokens,
  grid: gridTokens,
  container: containerTokens,
  icon: iconSizeTokens,
  focus: focusTokens,
  selection: selectionTokens,
} as const;
