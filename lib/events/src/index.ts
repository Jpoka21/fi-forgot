/**
 * @workspace/events — Unified Event Domain public API.
 *
 * Phase 7B.2: architecture-hardened, behaviorally inert.
 * No production consumers yet.
 *
 * This package never defines or exports Brain sourceRuleId.
 * EventId is not interchangeable with sourceRuleId, briefing IDs, or
 * external integration IDs.
 */

// Core
export type {
  EventCategory,
  EventId,
  EventIdentity,
  EventKind,
  EventOccurrenceRef,
} from "./core/index.js";
export {
  EVENT_CATEGORIES,
  EVENT_IDS,
  EVENT_IDENTITY_REGISTRY,
  INITIAL_EVENT_IDS,
  assertCompleteEventRecord,
  getEvent,
  isEventCategory,
  isEventId,
  listActiveEventIds,
  listEvents,
  listRegisteredEventIds,
  requireEvent,
  type CompleteEventRecord,
} from "./core/index.js";

// Scheduling
export type {
  EventScheduling,
  OccurrenceResolutionContext,
  OccurrenceResolutionResult,
  RecipientDateField,
  RelationshipRole,
  SchedulingConstraints,
  TimingDefinition,
  TimingResolver,
} from "./scheduling/index.js";
export {
  EVENT_SCHEDULING_REGISTRY,
  SCHEDULING_NOT_MIGRATED_REASON,
  getEventScheduling,
  isWithinWindow,
  listEventScheduling,
  resolveOccurrence,
} from "./scheduling/index.js";

// Normalization
export {
  canonicalLabel,
  listAliases,
  matchesEvent,
  resolveEventId,
} from "./normalization/index.js";

// Availability
export type {
  EventAvailability,
  EventSurface,
  RelationshipFilter,
  RelationshipFilterContext,
  RelationshipRoleFilter,
} from "./availability/index.js";
export {
  EVENT_AVAILABILITY_REGISTRY,
  getEventAvailability,
  isAvailableOnSurface,
  listAvailableEventIds,
  matchesRelationshipFilter,
} from "./availability/index.js";

// Briefing
export type {
  BriefingQuestionSetId,
  BriefingQuestionSetMeta,
  EventBriefingRef,
} from "./briefing/index.js";
export {
  BRIEFING_QUESTION_SET_META,
  EVENT_BRIEFING_REGISTRY,
  asBriefingQuestionSetId,
  getBriefingQuestionSetMeta,
  getEventBriefingRef,
  listEventBriefingRefs,
} from "./briefing/index.js";

// Integrations
export type {
  AiArchetype,
  AiGenerationIntegration,
  CardClassifierIntegration,
  CardLibraryIntegration,
  EmailDeliveryIntegration,
  HandwryttenIntegration,
} from "./integrations/index.js";
export {
  getAiGenerationIntegration,
  getCardClassifierIntegration,
  getCardLibraryIntegration,
  getEmailDeliveryIntegration,
  getHandwryttenIntegration,
} from "./integrations/index.js";

// Presentation
export type { CalendarFilterGroup, EventPresentation } from "./presentation/index.js";
export {
  EVENT_PRESENTATION_REGISTRY,
  getEventEmoji,
  getEventPresentation,
  listEventPresentations,
} from "./presentation/index.js";

// Projections
export type {
  AdminProjection,
  AiProjection,
  BriefingProjection,
  CalendarProjection,
  CardLibraryProjection,
  CatalogProjection,
  FrontendOccasionProjection,
  HandwryttenProjection,
} from "./projections/index.js";
export {
  getAdminProjection,
  getAiProjection,
  getBriefingProjection,
  getCalendarProjection,
  getCardLibraryProjection,
  getCatalogProjection,
  getFrontendOccasionProjection,
  getHandwryttenProjection,
  listBriefingProjections,
  listCalendarProjections,
  listCatalogProjections,
  listFrontendOccasionProjections,
} from "./projections/index.js";
