/**
 * Motion CSS custom property names.
 * Extends Phase 2 `--fi-motion-*` primitives.
 */
export const motionCssVar = {
  duration: {
    instant: "--fi-motion-duration-instant",
    fast: "--fi-motion-duration-fast",
    base: "--fi-motion-duration-base",
    slow: "--fi-motion-duration-slow",
    extraSlow: "--fi-motion-duration-extra-slow",
  },
  easing: {
    standard: "--fi-motion-ease-standard",
    emphasized: "--fi-motion-ease-emphasized",
    concierge: "--fi-motion-ease-concierge",
    in: "--fi-motion-ease-in",
    out: "--fi-motion-ease-out",
    inOut: "--fi-motion-ease-in-out",
    quickExit: "--fi-motion-ease-quick-exit",
  },
  component: {
    hover: "--fi-motion-hover",
    focus: "--fi-motion-focus",
    button: "--fi-motion-button",
    card: "--fi-motion-card",
    input: "--fi-motion-input",
    dialog: "--fi-motion-dialog",
    drawer: "--fi-motion-drawer",
    navigation: "--fi-motion-navigation",
    screen: "--fi-motion-screen",
    loading: "--fi-motion-loading",
    skeleton: "--fi-motion-skeleton",
    ai: "--fi-motion-ai",
    timeline: "--fi-motion-timeline",
    notification: "--fi-motion-notification",
    calendar: "--fi-motion-calendar",
  },
} as const;
