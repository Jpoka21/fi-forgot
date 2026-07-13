/**
 * Consumer-specific projection DTO shapes.
 *
 * Each projection exposes ONLY the fields its named consumer requires.
 * Projections never expose the full internal event definition.
 * All fields are readonly; builders return frozen plain objects.
 *
 * No Brain projection lives here — Brain owns its adapter and rule registry.
 */

import type { EventCategory, EventId, EventKind } from "../core/types.js";
import type { BriefingQuestionSetId } from "../briefing/types.js";
import type { TimingDefinition } from "../scheduling/types.js";
import type { CalendarFilterGroup } from "../presentation/types.js";
import type { AiArchetype } from "../integrations/types.js";

export interface CatalogProjection {
  readonly eventId: EventId;
  readonly displayLabel: string;
  readonly category: EventCategory;
  readonly kind: EventKind;
  readonly active: boolean;
}

export interface FrontendOccasionProjection {
  readonly eventId: EventId;
  readonly displayLabel: string;
  readonly emoji: string | null;
  readonly personal: boolean;
  readonly business: boolean;
  readonly briefingQuestionSetId: BriefingQuestionSetId | null;
}

export interface CalendarProjection {
  readonly eventId: EventId;
  readonly displayLabel: string;
  readonly emoji: string | null;
  readonly calendarVisible: boolean;
  readonly filterGroup: CalendarFilterGroup | null;
  readonly timingKind: TimingDefinition["kind"] | null;
}

export interface BriefingProjection {
  readonly eventId: EventId;
  readonly displayLabel: string;
  readonly questionSetId: BriefingQuestionSetId;
  readonly questionSetVersion: number;
  readonly questionSetTitle: string;
}

export interface AdminProjection {
  readonly eventId: EventId;
  readonly displayLabel: string;
  readonly adminBadgeClass: string | null;
  readonly calendarVisible: boolean;
  readonly active: boolean;
}

export interface HandwryttenProjection {
  readonly eventId: EventId;
  readonly displayLabel: string;
  readonly categories: readonly string[];
  readonly libraryCategories: readonly string[];
  readonly scoringHints: readonly string[];
}

export interface AiProjection {
  readonly eventId: EventId;
  readonly displayLabel: string;
  readonly archetypes: readonly AiArchetype[];
  readonly matchKeywords: readonly string[];
  readonly excludeKeywords: readonly string[];
}

export interface CardLibraryProjection {
  readonly eventId: EventId;
  readonly displayLabel: string;
  readonly libraryCategories: readonly string[];
}
