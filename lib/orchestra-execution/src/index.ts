export type {
  AssignmentInput,
  AssignmentRole,
  FrozenAssignment,
  OrchestraAssignment,
  ProhibitedCommandClass,
} from "./assignment.js";
export {
  ASSIGNMENT_ROLES,
  DEFAULT_PROHIBITED_COMMAND_CLASSES,
  canonicalizeAssignment,
  deepFreeze,
  isAssignmentRole,
  normalizeAssignment,
  sortKeys,
} from "./assignment.js";
export { assertAssignmentUnchanged, createAssignment, hashAssignment } from "./assignment-hash.js";
export type {
  CreateSessionTarget,
  ExecutionProvider,
  ProviderRun,
  ProviderSession,
  ProviderSessionIdentity,
  ProviderTerminalReport,
} from "./provider-contract.js";
export { CODEX_PROVIDER_ID, CURSOR_PROVIDER_ID, renderAssignmentPrompt } from "./provider-contract.js";
export type { NormalizedEventType, NormalizedExecutionEvent, ProviderCorrelation } from "./events.js";
export { NORMALIZED_EVENT_TYPES, isNormalizedEventType } from "./events.js";
export type { GitCommitIdentity, GitEvidence, GitEvidenceDelta } from "./git-evidence.js";
export { collectGitEvidence, diffGitEvidence, parseStatusPorcelain } from "./git-evidence.js";
export type { ExecutionResult, ExecutionVerdict, IsolationEvidence } from "./result.js";
export { EXECUTION_VERDICTS, synthesizeExecutionResult } from "./result.js";
export type { HookPolicy, HookDecisionRecord, PolicyDecision } from "./hooks/policy-decision.js";
export { decideHookPolicy, detectProhibitedCommand, toHookDecisionRecord } from "./hooks/policy-decision.js";
export {
  collectStrings,
  extractStructuredPaths,
  normalizePathKey,
  pathMentionsProtected,
  structuredPathMissing,
} from "./hooks/path-normalize.js";
export { decodeHookStdin, parseHookPayload } from "./hooks/parse-payload.js";
export {
  buildHookPolicy,
  isForgotIdentifierRepository,
  projectCursorHookPolicy,
} from "./hooks/project-hook.js";
export { correlateHookDenials, readHookInvocations } from "./hooks/hook-evidence.js";
export { createDisposableExecutionFixture } from "./fixture.js";
export type { DisposableFixture } from "./fixture.js";
export { filesystemMarkerPresent, runBoundedAssignment } from "./run-assignment.js";
export { isReadOnlyVerifierAssignment } from "./execution-policy.js";
export {
  applyCandidatePatch,
  cleanupIsolatedExecutionWorkspace,
  cleanupIsolatedWorkspacePath,
  createIsolatedExecutionWorkspace,
  extractCandidateChanges,
  governedStateUnchanged,
} from "./isolated-workspace.js";
export type { CandidateChangeSet, IsolatedExecutionWorkspace } from "./isolated-workspace.js";
export { CursorExecutionProvider, isCursorSdkAuthenticated } from "./providers/cursor/cursor-provider.js";
export { normalizeCursorEvent } from "./providers/cursor/normalize-events.js";
export { CodexExecutionProvider } from "./providers/codex/codex-provider.js";
export type { CodexProviderOptions } from "./providers/codex/codex-provider.js";
export { normalizeCodexEvent } from "./providers/codex/normalize-events.js";
export {
  CODEX_PERMISSION_REFUSALS,
  CODEX_EXECUTION_MODES,
  CodexPermissionProjectionError,
  projectCodexPolicy,
  projectCodexReadOnlyPolicy,
  projectCodexWorkspaceWritePolicy,
} from "./providers/codex/permission-projection.js";
export type {
  CodexPermissionRefusal,
  CodexExecutionMode,
  CodexProjectedPolicy,
  CodexReadOnlyPolicy,
  CodexWorkspaceWritePolicy,
} from "./providers/codex/permission-projection.js";
export { StdioCodexAppServerTransport } from "./providers/codex/app-server-transport.js";
export type {
  AppServerNotification,
  CodexAppServerTransport,
} from "./providers/codex/app-server-transport.js";
export { MockExecutionProvider } from "./providers/mock-provider.js";
export type {
  AssignmentCurrentState,
  AssignmentRelationship,
  AssignmentStatus,
  AuditEvent,
  CrashReceipt,
  EvidenceSourceClass,
  EvidenceSourceClassification,
  ExecutionEvidence,
  FrozenAssignmentRecord,
  StatusEvent,
  VerificationPosture,
  VerifierAuthorizationReceipt,
  VerificationDecision,
  VerificationDecisionRecord,
  PostDecisionAction,
  PostDecisionActionRecord,
  PostDecisionExecutionAuthorizationRecord,
  GovernedContinuationTargetRecord,
  GovernedContinuationTargetLifecycleRecord,
  GovernedContinuationTargetStatus,
  GovernedContinuationSequenceConfigRecord,
  GovernedContinuationSequenceEntry,
  GovernedContinuationSequenceFulfillmentRecord,
  GovernedContinuationTargetAuthoritySource,
  VerifierRequirementOutcome,
  VerifierSemanticFindingRecord,
  VerifierSemanticFindingProposal,
  VerifierSemanticFindingResolution,
} from "./engineering-store/types.js";
export {
  ASSIGNMENT_STATUSES,
  DEFAULT_EVIDENCE_SOURCES,
  ENGINEERING_STORE_SCHEMA_VERSION,
  VERIFICATION_POSTURES,
  VERIFIER_AUTHORIZATION_SOURCE,
  VERIFICATION_DECISIONS,
  VERIFICATION_DECISION_AUTHORITY,
  POST_DECISION_ACTIONS,
  POST_DECISION_ACTION_SOURCE,
  POST_DECISION_EXECUTION_AUTHORIZATION_SOURCE,
  POST_DECISION_EXECUTION_AUTHORIZATION_SCOPE,
  GOVERNED_CONTINUATION_TARGET_SOURCE,
  GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE,
  GOVERNED_CONTINUATION_TARGET_AUTHORITY_SOURCES,
  GOVERNED_CONTINUATION_TARGET_STATUSES,
  GOVERNED_CONTINUATION_TARGET_LIFECYCLE_SOURCE,
  GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE,
  GOVERNED_CONTINUATION_SEQUENCE_FULFILLMENT_SOURCE,
  VERIFIER_REQUIREMENT_OUTCOMES,
  VERIFIER_SEMANTIC_FINDING_SOURCE,
  VERIFIER_SEMANTIC_PROPOSAL_SOURCE,
  VERIFIER_SEMANTIC_FINDING_RESOLUTION,
} from "./engineering-store/types.js";
export { FileEngineeringStore, createFileEngineeringStore, EngineeringStoreError } from "./engineering-store/store.js";
export { dispatchFrozenAssignment } from "./engineering-store/dispatch.js";
export {
  dispatchGovernedVerifierAssignment,
  VERIFIER_DISPATCH_REFUSALS,
} from "./engineering-store/dispatch-verifier.js";
export type {
  DispatchGovernedVerifierAssignmentInput,
  GovernedVerifierDispatchResult,
  VerifierDispatchRefusal,
} from "./engineering-store/dispatch-verifier.js";
export {
  routeGovernedVerifierAssignment,
  resolveActiveExecutionProvider,
  ACTIVE_EXECUTION_PROVIDER_ID,
} from "./engineering-store/route-verifier.js";
export type {
  RouteGovernedVerifierAssignmentInput,
  GovernedVerifierRoutingResult,
  ResolveActiveExecutionProviderOptions,
} from "./engineering-store/route-verifier.js";
export {
  adjudicateVerifierExecution,
  VERIFICATION_ADJUDICATION_REFUSALS,
} from "./engineering-store/adjudicate-verifier.js";
export type {
  AdjudicateVerifierExecutionInput,
  AdjudicateVerifierExecutionResult,
  VerificationAdjudicationRefusal,
} from "./engineering-store/adjudicate-verifier.js";
export {
  captureVerifierSemanticProposalsFromEvidence,
  captureVerifierSemanticFindingsFromEvidence,
  SEMANTIC_PROPOSAL_CAPTURE_REFUSALS,
  SEMANTIC_FINDING_CAPTURE_REFUSALS,
} from "./engineering-store/capture-verifier-findings.js";
export type {
  CaptureVerifierSemanticProposalsInput,
  CaptureVerifierSemanticProposalsResult,
  CaptureVerifierSemanticFindingsInput,
  CaptureVerifierSemanticFindingsResult,
  SemanticProposalCaptureRefusal,
  SemanticFindingCaptureRefusal,
} from "./engineering-store/capture-verifier-findings.js";
export {
  resolveVerifierSemanticFindings,
} from "./engineering-store/resolve-verifier-findings.js";
export type {
  ResolveVerifierSemanticFindingsInput,
  ResolveVerifierSemanticFindingsResult,
} from "./engineering-store/resolve-verifier-findings.js";
export {
  formatEvidenceReference,
  parseEvidenceReference,
  resolveEvidenceReferences,
  defaultSemanticEvidenceReferences,
} from "./engineering-store/evidence-reference-resolution.js";
export { structuredFindingEvent, parseStructuredFindingEvent } from "./structured-finding-event.js";
export type { ParsedStructuredFindingEvent } from "./structured-finding-event.js";
export { evaluateFrozenAcceptanceCheck } from "./engineering-store/acceptance-check-evaluation.js";
export type { AcceptanceCheckEvaluation } from "./engineering-store/acceptance-check-evaluation.js";
export {
  deriveVerifierVerificationRequirements,
  obligationRequirementId,
  standardRequirementId,
  classifyRequirementKind,
  VERIFIER_REQUIREMENT_KINDS,
  VERIFIER_REQUIREMENT_CLASSES,
  VERIFICATION_MODES,
  ACCEPTANCE_CHECK_KINDS,
} from "./verification-requirements.js";
export type {
  StructuredObligation,
  VerificationRequirementRef,
  VerifierRequirementKind,
  VerifierRequirementClass,
  VerificationMode,
  AcceptanceCheckKind,
  FrozenAcceptanceCheckSpec,
} from "./verification-requirements.js";
export {
  buildVerifierAuthorizationReceipt,
  hashVerifierAuthorizationReceipt,
  validateVerifierAuthorizationReceipt,
} from "./engineering-store/authorization-receipt.js";
export { buildExecutionEvidence, validateEvidenceHash } from "./engineering-store/evidence.js";
export {
  authorizeAndFreezeVerifierAssignment,
  findVerifierAssignments,
  prepareVerifierAssignment,
  VERIFIER_PREPARATION_REFUSALS,
} from "./engineering-store/prepare-verifier.js";
export type {
  AuthorizeAndFreezeVerifierAssignmentInput,
  PrepareVerifierAssignmentInput,
  VerifierPreparationRefusal,
  VerifierPreparationResult,
} from "./engineering-store/prepare-verifier.js";
export {
  preparePostDecisionAction,
  POST_DECISION_PREPARATION_REFUSALS,
} from "./engineering-store/prepare-post-decision-action.js";
export type {
  PreparePostDecisionActionInput,
  PreparePostDecisionActionResult,
  PostDecisionPreparationRefusal,
} from "./engineering-store/prepare-post-decision-action.js";
export {
  validatePostDecisionAction,
  postDecisionActionId,
} from "./engineering-store/post-decision-action-record.js";
export {
  authorizePostDecisionExecution,
  POST_DECISION_AUTHORIZATION_REFUSALS,
} from "./engineering-store/authorize-post-decision-execution.js";
export type {
  AuthorizePostDecisionExecutionInput,
  AuthorizePostDecisionExecutionResult,
  PostDecisionAuthorizationRefusal,
} from "./engineering-store/authorize-post-decision-execution.js";
export {
  executeAuthorizedPostDecisionAction,
  POST_DECISION_EXECUTION_REFUSALS,
} from "./engineering-store/execute-authorized-post-decision-action.js";
export type {
  ExecuteAuthorizedPostDecisionActionInput,
  ExecuteAuthorizedPostDecisionActionResult,
  PostDecisionExecutionRefusal,
} from "./engineering-store/execute-authorized-post-decision-action.js";
export {
  validatePostDecisionExecutionAuthorization,
  postDecisionExecutionAuthorizationId,
} from "./engineering-store/post-decision-execution-authorization.js";
export { correctionAssignmentId } from "./engineering-store/build-correction-assignment.js";
export { continuationAssignmentId } from "./engineering-store/build-continuation-assignment.js";
export {
  evaluatePredecessorPathAuthority,
  includesAllPaths,
  isSubsetPaths,
  PREDECESSOR_PATH_AUTHORITY_REFUSALS,
} from "./engineering-store/predecessor-path-authority.js";
export type { PredecessorPathAuthorityRefusal } from "./engineering-store/predecessor-path-authority.js";
export {
  registerGovernedContinuationTarget,
  GOVERNED_CONTINUATION_TARGET_REGISTRATION_REFUSALS,
} from "./engineering-store/register-governed-continuation-target.js";
export type {
  RegisterGovernedContinuationTargetInput,
  RegisterGovernedContinuationTargetResult,
  GovernedContinuationTargetRegistrationRefusal,
} from "./engineering-store/register-governed-continuation-target.js";
export {
  resolveGovernedContinuationTargetForAction,
  CONTINUATION_TARGET_RESOLUTION_REFUSALS,
} from "./engineering-store/resolve-governed-continuation-target.js";
export type {
  ResolveGovernedContinuationTargetResult,
  ContinuationTargetResolutionRefusal,
} from "./engineering-store/resolve-governed-continuation-target.js";
export {
  validateGovernedContinuationTarget,
  governedContinuationTargetId,
  buildGovernedContinuationSequenceConfig,
  validateGovernedContinuationSequenceConfig,
  governedContinuationSequenceId,
  selectAuthoritativeSequenceFulfillments,
  buildSequenceFulfillmentRecord,
  validateSequenceFulfillment,
} from "./engineering-store/governed-continuation-target-record.js";
export { markGovernedContinuationTargetStatus } from "./engineering-store/mark-governed-continuation-target.js";
export {
  persistGovernedContinuationSequenceConfig,
  materializeNextGovernedContinuationTargetFromSequence,
  SEQUENCE_CONFIG_REFUSALS,
  MATERIALIZE_SEQUENCE_REFUSALS,
} from "./engineering-store/materialize-continuation-from-sequence.js";
export type {
  SequenceConfigRefusal,
  MaterializeSequenceRefusal,
} from "./engineering-store/materialize-continuation-from-sequence.js";
