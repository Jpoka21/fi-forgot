/**
 * Event category taxonomy helpers.
 */

import type { EventCategory } from "./types.js";

export const EVENT_CATEGORIES: readonly EventCategory[] = [
  "calendar",
  "life_milestone",
  "sentiment",
  "business",
  "ad_hoc",
] as const;

export function isEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value);
}
