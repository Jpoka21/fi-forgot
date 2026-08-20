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
export {
  deriveVerifierVerificationRequirements,
  obligationRequirementId,
  standardRequirementId,
  classifyRequirementKind,
  VERIFIER_REQUIREMENT_KINDS,
  VERIFIER_REQUIREMENT_CLASSES,
} from "./verification-requirements.js";
export type {
  StructuredObligation,
  VerificationRequirementRef,
  VerifierRequirementKind,
  VerifierRequirementClass,
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
