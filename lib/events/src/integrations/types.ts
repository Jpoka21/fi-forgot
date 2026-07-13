/**
 * Integration metadata types.
 *
 * Declarative identifiers and lookup keys only.
 * Must not import SDK clients, execute integrations, generate content/URLs,
 * send email, invoke AI, or contain secrets.
 */

import type { EventId } from "../core/types.js";

export type AiArchetype =
  | "Love"
  | "Comfort"
  | "Celebration"
  | "Gratitude"
  | "Apology"
  | "Encouragement";

export interface HandwryttenIntegration {
  readonly eventId: EventId;
  readonly categories: readonly string[];
  readonly excludeCategories?: readonly string[];
  readonly scoringHints?: readonly string[];
}

export interface AiGenerationIntegration {
  readonly eventId: EventId;
  readonly archetypes: readonly AiArchetype[];
  readonly toneHints?: readonly string[];
}

export interface CardClassifierIntegration {
  readonly eventId: EventId;
  readonly matchKeywords: readonly string[];
  readonly excludeKeywords?: readonly string[];
}

export interface CardLibraryIntegration {
  readonly eventId: EventId;
  readonly libraryCategories: readonly string[];
}

export interface EmailDeliveryIntegration {
  readonly eventId: EventId;
  readonly matchKeywords: readonly string[];
  readonly excludeKeywords?: readonly string[];
}
