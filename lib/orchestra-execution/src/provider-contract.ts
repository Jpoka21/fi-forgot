import type { FrozenAssignment, OrchestraAssignment } from "./assignment.js";
import type { NormalizedExecutionEvent } from "./events.js";
import type { GovernedVerifierExecutionCapability } from "./governed-verifier-capability.js";

export const CURSOR_PROVIDER_ID = "cursor";
export const CODEX_PROVIDER_ID = "codex";

export interface ProviderSessionIdentity {
  providerId: string;
  sessionId: string;
  repositoryPath: string;
  /**
   * Provider-only correlators. Never authoritative Orchestra state.
   */
  correlation?: {
    agentId?: string;
    threadId?: string;
    storeDirectory?: string;
  };
}

export interface ProviderSession {
  readonly providerId: string;
  readonly sessionId: string;
  readonly repositoryPath: string;
}

export interface ProviderRun {
  readonly providerId: string;
  readonly sessionId: string;
  readonly runId: string;
  readonly assignmentHash: string;
}

export interface CreateSessionTarget {
  repositoryPath: string;
  branch: string;
  startingHead: string;
  /**
   * Internal execution capability supplied only by governed verifier dispatch.
   * Not Orchestra authoritative state and not constructible through public API.
   */
  governedVerifierExecution?: GovernedVerifierExecutionCapability;
}

export interface ProviderTerminalReport {
  runId: string;
  sessionId: string;
  status: "finished" | "error" | "cancelled";
  resultText: string | null;
  errorMessage: string | null;
  durationMs: number | null;
}

/**
 * Vendor-neutral execution provider contract from ORCH-ARCH-001.
 * Implementations must not leak Cursor or Codex types through this boundary.
 */
export interface ExecutionProvider {
  readonly providerId: string;
  createSession(target: CreateSessionTarget): Promise<ProviderSession>;
  resumeSession(providerSessionId: string): Promise<ProviderSession>;
  submitAssignment(session: ProviderSession, assignment: FrozenAssignment): Promise<ProviderRun>;
  streamEvents(run: ProviderRun): AsyncIterable<NormalizedExecutionEvent>;
  awaitResult(run: ProviderRun): Promise<ProviderTerminalReport>;
  requestCancellation(run: ProviderRun): Promise<void>;
  getSessionIdentity(session: ProviderSession): ProviderSessionIdentity;
  closeSession(session: ProviderSession): Promise<void>;
}

export function renderAssignmentPrompt(assignment: OrchestraAssignment, assignmentHash: string): string {
  return [
    "ORCHESTRA BOUNDED ASSIGNMENT",
    `assignmentId: ${assignment.assignmentId}`,
    `assignmentHash: ${assignmentHash}`,
    `projectId: ${assignment.projectId}`,
    `role: ${assignment.role}`,
    `branch: ${assignment.branch}`,
    `startingHead: ${assignment.startingHead}`,
    `allowedPaths: ${assignment.allowedPaths.join(", ") || "(none)"}`,
    `protectedPaths: ${assignment.protectedPaths.join(", ") || "(none)"}`,
    `requireNoPush: ${String(assignment.requireNoPush)}`,
    `commitAuthorization: ${String(assignment.commitAuthorization)} (adapter will not commit)`,
    `pushAuthorization: ${String(assignment.pushAuthorization)} (adapter will not push)`,
    "",
    "Hard constraints:",
    "- Do not stage.",
    "- Do not commit.",
    "- Do not push.",
    "- Do not change branches.",
    "- Do not modify hook configuration or hook scripts.",
    "- Do not bypass or disable hooks.",
    "- Do not install packages.",
    "",
    assignment.assignmentText.trim(),
  ].join("\n");
}
