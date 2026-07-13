/**
 * Integration registries — declarative metadata only.
 *
 * Must not import SDK clients, execute calls, generate URLs/content,
 * send email, invoke AI, or contain secrets.
 */

import {
  assertCompleteEventRecord,
  type CompleteEventRecord,
  type EventId,
} from "../core/eventIds.js";
import type {
  AiGenerationIntegration,
  CardClassifierIntegration,
  CardLibraryIntegration,
  EmailDeliveryIntegration,
  HandwryttenIntegration,
} from "./types.js";

function freezeHw(entry: HandwryttenIntegration): HandwryttenIntegration {
  return Object.freeze({
    ...entry,
    categories: Object.freeze([...entry.categories]),
    excludeCategories: entry.excludeCategories
      ? Object.freeze([...entry.excludeCategories])
      : undefined,
    scoringHints: entry.scoringHints
      ? Object.freeze([...entry.scoringHints])
      : undefined,
  });
}

function freezeAi(entry: AiGenerationIntegration): AiGenerationIntegration {
  return Object.freeze({
    ...entry,
    archetypes: Object.freeze([...entry.archetypes]),
    toneHints: entry.toneHints ? Object.freeze([...entry.toneHints]) : undefined,
  });
}

function freezeClassifier(
  entry: CardClassifierIntegration,
): CardClassifierIntegration {
  return Object.freeze({
    ...entry,
    matchKeywords: Object.freeze([...entry.matchKeywords]),
    excludeKeywords: entry.excludeKeywords
      ? Object.freeze([...entry.excludeKeywords])
      : undefined,
  });
}

function freezeLibrary(entry: CardLibraryIntegration): CardLibraryIntegration {
  return Object.freeze({
    ...entry,
    libraryCategories: Object.freeze([...entry.libraryCategories]),
  });
}

function freezeEmail(entry: EmailDeliveryIntegration): EmailDeliveryIntegration {
  return Object.freeze({
    ...entry,
    matchKeywords: Object.freeze([...entry.matchKeywords]),
    excludeKeywords: entry.excludeKeywords
      ? Object.freeze([...entry.excludeKeywords])
      : undefined,
  });
}

export const HANDWRYTTEN_INTEGRATION_REGISTRY: CompleteEventRecord<HandwryttenIntegration> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: freezeHw({
          eventId: "birthday",
          categories: ["Birthday"],
          scoringHints: ["birthday", "bday", "cake", "candle"],
        }),
        anniversary: freezeHw({
          eventId: "anniversary",
          categories: ["Anniversary", "Wedding"],
          scoringHints: ["anniversary"],
        }),
        valentines_day: freezeHw({
          eventId: "valentines_day",
          categories: ["Everyday", "Just For Fun", "Anniversary"],
          scoringHints: ["valentine", "sweetheart", "romance"],
        }),
      },
      "HANDWRYTTEN_INTEGRATION_REGISTRY",
    ),
  );

export const AI_GENERATION_INTEGRATION_REGISTRY: CompleteEventRecord<AiGenerationIntegration> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: freezeAi({
          eventId: "birthday",
          archetypes: ["Celebration"],
        }),
        anniversary: freezeAi({
          eventId: "anniversary",
          archetypes: ["Love"],
        }),
        valentines_day: freezeAi({
          eventId: "valentines_day",
          archetypes: ["Love"],
        }),
      },
      "AI_GENERATION_INTEGRATION_REGISTRY",
    ),
  );

export const CARD_CLASSIFIER_INTEGRATION_REGISTRY: CompleteEventRecord<CardClassifierIntegration> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: freezeClassifier({
          eventId: "birthday",
          matchKeywords: ["Birthday"],
          excludeKeywords: [
            "father",
            "dad",
            "mother",
            "mom",
            "valentine",
            "get well",
          ],
        }),
        anniversary: freezeClassifier({
          eventId: "anniversary",
          matchKeywords: ["Anniversary"],
          excludeKeywords: ["father", "dad", "mother", "mom", "get well"],
        }),
        valentines_day: freezeClassifier({
          eventId: "valentines_day",
          matchKeywords: ["Valentine's Day"],
          excludeKeywords: ["father", "dad", "mother", "mom", "get well"],
        }),
      },
      "CARD_CLASSIFIER_INTEGRATION_REGISTRY",
    ),
  );

export const CARD_LIBRARY_INTEGRATION_REGISTRY: CompleteEventRecord<CardLibraryIntegration> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: freezeLibrary({
          eventId: "birthday",
          libraryCategories: ["birthday", "humor"],
        }),
        anniversary: freezeLibrary({
          eventId: "anniversary",
          libraryCategories: ["personal_anniversary"],
        }),
        valentines_day: freezeLibrary({
          eventId: "valentines_day",
          libraryCategories: ["personal_anniversary", "holiday_personal"],
        }),
      },
      "CARD_LIBRARY_INTEGRATION_REGISTRY",
    ),
  );

export const EMAIL_DELIVERY_INTEGRATION_REGISTRY: CompleteEventRecord<EmailDeliveryIntegration> =
  Object.freeze(
    assertCompleteEventRecord(
      {
        birthday: freezeEmail({
          eventId: "birthday",
          matchKeywords: ["birthday", "bday", "candle", "cake"],
          excludeKeywords: [
            "father",
            "dad",
            "mother",
            "mom",
            "valentine",
            "get well",
          ],
        }),
        anniversary: freezeEmail({
          eventId: "anniversary",
          matchKeywords: ["anniversary"],
          excludeKeywords: ["father", "dad", "mother", "mom", "get well"],
        }),
        valentines_day: freezeEmail({
          eventId: "valentines_day",
          matchKeywords: ["valentine", "sweetheart", "romance", "cupid"],
          excludeKeywords: ["father", "dad", "mother", "mom", "get well"],
        }),
      },
      "EMAIL_DELIVERY_INTEGRATION_REGISTRY",
    ),
  );

export function getHandwryttenIntegration(
  eventId: EventId,
): HandwryttenIntegration | null {
  return HANDWRYTTEN_INTEGRATION_REGISTRY[eventId] ?? null;
}

export function getAiGenerationIntegration(
  eventId: EventId,
): AiGenerationIntegration | null {
  return AI_GENERATION_INTEGRATION_REGISTRY[eventId] ?? null;
}

export function getCardClassifierIntegration(
  eventId: EventId,
): CardClassifierIntegration | null {
  return CARD_CLASSIFIER_INTEGRATION_REGISTRY[eventId] ?? null;
}

export function getCardLibraryIntegration(
  eventId: EventId,
): CardLibraryIntegration | null {
  return CARD_LIBRARY_INTEGRATION_REGISTRY[eventId] ?? null;
}

export function getEmailDeliveryIntegration(
  eventId: EventId,
): EmailDeliveryIntegration | null {
  return EMAIL_DELIVERY_INTEGRATION_REGISTRY[eventId] ?? null;
}
