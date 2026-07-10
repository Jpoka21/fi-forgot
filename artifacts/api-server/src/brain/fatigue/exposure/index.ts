export type {
  ExposureEvent,
  ExposureEventType,
  ExposureRecord,
  ExposureSnapshot,
} from "./exposureTypes";
export {
  assertValidExposureOpportunityIdentity,
  buildExposureOpportunityKey,
} from "./exposureTypes";
export {
  createInMemoryExposureEventRepository,
  type AppendExposureEventResult,
  type ExposureEventRepository,
  type InsertExposureEventInput,
  type ListExposureEventsForUserOptions,
} from "./exposureRepository";
export {
  appendExposureEvent,
  createPgExposureEventRepository,
  insertExposureEvent,
  listExposureEventsForUser,
} from "./pgExposureRepository";
export { materializeExposureSnapshot } from "./materializeExposureSnapshot";
export {
  createEmptyExposureSnapshot,
  loadExposureSnapshot,
  type LoadExposureSnapshotInput,
} from "./loadExposureSnapshot";
export { recordExposureEvent, type RecordExposureEventInput } from "./recordExposureEvent";
export {
  dedupeSurfacedFatigueOpportunities,
  recordSurfacedOpportunities,
  type RecordSurfacedOpportunitiesInput,
} from "./recordSurfacedOpportunities";
