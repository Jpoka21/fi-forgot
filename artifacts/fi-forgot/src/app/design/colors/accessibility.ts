/**
 * Color accessibility guardrails aligned with playbook 49_COLOR_SYSTEM.md.
 */
export const colorAccessibility = {
  minBodyContrastRatio: 4.5,
  minLargeTextContrastRatio: 3,
  minInteractiveContrastRatio: 3,
} as const;

export const verifiedContrastPairs = [
  { foreground: "#1F1F1F", background: "#FAF7F4", role: "body-on-canvas" },
  { foreground: "#1F1F1F", background: "#FFFFFF", role: "body-on-surface" },
  { foreground: "#4B5563", background: "#FAF7F4", role: "secondary-on-canvas" },
  { foreground: "#FFFFFF", background: "#E23B2E", role: "inverse-on-primary" },
  { foreground: "#5B8C6B", background: "#FAF7F4", role: "success-on-canvas" },
  { foreground: "#D32F2F", background: "#FAF7F4", role: "error-on-canvas" },
] as const;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const lighter = Math.max(relativeLuminance(foregroundHex), relativeLuminance(backgroundHex));
  const darker = Math.min(relativeLuminance(foregroundHex), relativeLuminance(backgroundHex));

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrastRatio(
  foregroundHex: string,
  backgroundHex: string,
  minimumRatio = colorAccessibility.minBodyContrastRatio,
): boolean {
  return getContrastRatio(foregroundHex, backgroundHex) >= minimumRatio;
}

export function verifyPaletteContrast(): { role: string; ratio: number; passes: boolean }[] {
  return verifiedContrastPairs.map(({ foreground, background, role }) => {
    const ratio = getContrastRatio(foreground, background);
    const minimum =
      role.includes("secondary") || role.includes("success") || role.includes("error")
        ? colorAccessibility.minLargeTextContrastRatio
        : colorAccessibility.minBodyContrastRatio;

    return { role, ratio: Number(ratio.toFixed(2)), passes: ratio >= minimum };
  });
}
