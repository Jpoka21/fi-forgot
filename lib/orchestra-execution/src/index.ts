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
export { CURSOR_PROVIDER_ID, renderAssignmentPrompt } from "./provider-contract.js";
export type { NormalizedEventType, NormalizedExecutionEvent, ProviderCorrelation } from "./events.js";
export { NORMALIZED_EVENT_TYPES, isNormalizedEventType } from "./events.js";
export type { GitCommitIdentity, GitEvidence, GitEvidenceDelta } from "./git-evidence.js";
export { collectGitEvidence, diffGitEvidence, parseStatusPorcelain } from "./git-evidence.js";
export type { ExecutionResult, ExecutionVerdict } from "./result.js";
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
export { CursorExecutionProvider, isCursorSdkAuthenticated } from "./providers/cursor/cursor-provider.js";
export { normalizeCursorEvent } from "./providers/cursor/normalize-events.js";
export { MockExecutionProvider } from "./providers/mock-provider.js";
