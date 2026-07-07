/**
 * Production font faces for F.I. Forgot.
 *
 * Loading strategy:
 * - `display=swap` for fast text visibility
 * - Preconnect hints live in index.html
 * - Imported once at the top of the CSS bundle
 */
export const FONT_GOOGLE_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@400..700&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap";

export const productionFonts = {
  sans: "Plus Jakarta Sans",
  display: "Bebas Neue",
  handwriting: "Caveat",
  serif: "Lora",
  legacyUi: "Inter",
  mono: "Menlo",
} as const;

export const fontFallbackStacks = {
  sans: `'${productionFonts.sans}', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  display: `'${productionFonts.display}', 'Arial Narrow', sans-serif`,
  handwriting: `'${productionFonts.handwriting}', 'Segoe Script', cursive`,
  serif: `'${productionFonts.serif}', Georgia, 'Times New Roman', serif`,
  legacyUi: `'${productionFonts.legacyUi}', ui-sans-serif, system-ui, sans-serif`,
  mono: `'${productionFonts.mono}', ui-monospace, 'Cascadia Code', monospace`,
} as const;

export type ProductionFontRole = keyof typeof fontFallbackStacks;

export const fontLoadingStrategy = {
  display: "swap" as const,
  preconnectOrigins: ["https://fonts.googleapis.com", "https://fonts.gstatic.com"] as const,
  stylesheet: FONT_GOOGLE_STYLESHEET,
} as const;
