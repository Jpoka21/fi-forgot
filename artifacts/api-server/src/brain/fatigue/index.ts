export { applyFatigue } from "./applyFatigue";
export { buildFatigueContext } from "./buildFatigueContext";
export { getVisibleFatigueOpportunities } from "./getVisibleFatigueOpportunities";
export { runAttentionFatiguePipeline } from "./runAttentionFatiguePipeline";
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
  RecordSurfacedOpportunitiesInput,
} from "./exposure";
export {
  assertValidExposureOpportunityIdentity,
  buildExposureOpportunityKey,
  createEmptyExposureSnapshot,
  createInMemoryExposureEventRepository,
  loadExposureSnapshot,
  materializeExposureSnapshot,
  recordExposureEvent,
  recordSurfacedOpportunities,
} from "./exposure";
export type {
  FatigueContext,
  FatigueDecision,
  FatigueOpportunity,
  FatigueSuppressionReason,
} from "./fatigueTypes";
export type { RunAttentionFatiguePipelineInput } from "./runAttentionFatiguePipeline";
