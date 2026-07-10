/**
 * Fatigue rule enforcement flags — read at evaluation time.
 */

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

export function isRecentlySurfacedShadowEnabled(): boolean {
  return parseBooleanEnv(process.env["BRAIN_FATIGUE_SHADOW_RECENTLY_SURFACED"], true);
}

export function isRecentlySurfacedEnforced(): boolean {
  return parseBooleanEnv(process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"], false);
}
