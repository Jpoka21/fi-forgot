export { applyFatigue } from "./applyFatigue";
export type {
  ExposureEvent,
  ExposureEventType,
  ExposureRecord,
  ExposureSnapshot,
  ExposureEventRepository,
  InsertExposureEventInput,
  ListExposureEventsForUserOptions,
  LoadExposureSnapshotInput,
  RecordExposureEventInput,
} from "./exposure";
export {
  assertValidExposureOpportunityIdentity,
  buildExposureOpportunityKey,
  createEmptyExposureSnapshot,
  createInMemoryExposureEventRepository,
  loadExposureSnapshot,
  materializeExposureSnapshot,
  recordExposureEvent,
} from "./exposure";
export type {
  FatigueContext,
  FatigueDecision,
  FatigueOpportunity,
  FatigueSuppressionReason,
} from "./fatigueTypes";
