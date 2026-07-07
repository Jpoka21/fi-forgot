/**
 * Border radius CSS custom property names.
 * Extends Phase 2 `--fi-radius-*` primitives without replacing them.
 */
export const radiusCssVar = {
  scale: {
    xs: "--fi-radius-xs",
    sm: "--fi-radius-sm",
    md: "--fi-radius-md",
    lg: "--fi-radius-lg",
    xl: "--fi-radius-xl",
    pill: "--fi-radius-pill",
    circle: "--fi-radius-circle",
  },
  component: {
    avatar: "--fi-radius-avatar",
    card: "--fi-radius-card",
    input: "--fi-radius-input",
    dialog: "--fi-radius-dialog",
    image: "--fi-radius-image",
    button: "--fi-radius-button",
  },
} as const;
