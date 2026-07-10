export type {
  BrainOutcomeEvent,
  BrainOutcomeMetadata,
  BrainOutcomeType,
  CardOutcomeMetadata,
  OpportunityDismissedOutcomeMetadata,
  QuestionAnsweredOutcomeMetadata,
} from "./outcomeTypes";
export {
  assertValidBrainOutcomeOpportunityIdentity,
  BRAIN_OUTCOME_TYPES,
  isBrainOutcomeType,
} from "./outcomeTypes";
export type {
  BrainOutcomeRecorder,
  RecordBrainOutcomeInput,
  RecordBrainOutcomeInputFor,
} from "./brainOutcomeRecorder";
export {
  createNoOpBrainOutcomeRecorder,
  noOpBrainOutcomeRecorder,
} from "./noOpBrainOutcomeRecorder";
export type {
  BrainOutcomeRepository,
  ListBrainOutcomeEventsForUserOptions,
  AppendOnceBrainOutcomeInput,
  AppendOnceBrainOutcomeResult,
} from "./outcomeRepository";
export { createInMemoryBrainOutcomeRepository } from "./outcomeRepository";
export {
  appendBrainOutcomeEvent,
  appendOnceBrainOutcomeEventForSourceAction,
  createPgBrainOutcomeRepository,
  listBrainOutcomeEventsForUser,
} from "./pgOutcomeRepository";
export { createPersistentBrainOutcomeRecorder } from "./createPersistentBrainOutcomeRecorder";
export {
  formatQuestionAnswerSourceActionId,
  parseQuestionAnswerSourceActionId,
  QUESTION_ANSWER_SOURCE_ACTION_PREFIX,
  formatCardCreatedSourceActionId,
  formatCardApprovedSourceActionId,
  formatCardSentSourceActionId,
  formatCardOutcomeSourceActionId,
  CARD_CREATED_SOURCE_ACTION_PREFIX,
  CARD_APPROVED_SOURCE_ACTION_PREFIX,
  CARD_SENT_SOURCE_ACTION_PREFIX,
} from "./sourceActionId";
export {
  assertValidOutcomeMetadataCorrelation,
  assertValidRecordBrainOutcomeInput,
} from "./outcomeValidation";
export type {
  BrainOutcomeExposureProjector,
  BrainOutcomeProjectionIgnoredReason,
  BrainOutcomeProjectionResult,
} from "./projection/outcomeProjectionTypes";
export {
  mapBrainOutcomeToExposure,
  type OutcomeDerivedExposureAppendInput,
} from "./projection/mapBrainOutcomeToExposure";
export { createBrainOutcomeExposureProjector } from "./projection/createBrainOutcomeExposureProjector";
export { projectBrainOutcomeEvents } from "./projection/projectBrainOutcomeEvents";
export {
  recordAndProjectBrainOutcome,
  type RecordAndProjectBrainOutcomeDependencies,
  type RecordAndProjectBrainOutcomeResult,
} from "./recordAndProjectBrainOutcome";
export {
  createQuestionAnsweredBrainOutcomeDependencies,
  getQuestionAnsweredBrainOutcomeDependencies,
  recordQuestionAnsweredBrainOutcome,
  recordQuestionAnsweredBrainOutcomeForProduction,
  resolveQuestionAnswerOutcomeContext,
  type PersistedQuestionAnswer,
  type QuestionAnsweredBrainOutcomeProducerResult,
  type RecordQuestionAnsweredBrainOutcomeInput,
  type ResolvedQuestionAnswerOutcomeContext,
  type CardBrainOutcomeProducerResult,
  type CardOutcomeTransitionType,
  type PersistedPersonalCard,
  type RecordCardBrainOutcomesResult,
  type ResolvedCardOutcomeContext,
  detectCardOutcomeTransitions,
  resolveCardOutcomeContext,
  recordCardBrainOutcome,
  recordCardBrainOutcomes,
  recordCardBrainOutcomesForProduction,
  createCardBrainOutcomeDependencies,
  getCardBrainOutcomeDependencies,
} from "./producers";
