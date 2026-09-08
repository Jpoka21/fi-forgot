export const NORMALIZED_EVENT_TYPES = [
  "session_started",
  "run_started",
  "assistant_progress",
  "tool_invocation",
  "policy_denied",
  "provider_error",
  "run_finished",
  "usage",
  "verification_finding",
] as const;

export type NormalizedEventType = (typeof NORMALIZED_EVENT_TYPES)[number];

export interface ProviderCorrelation {
  providerId?: string;
  sessionId?: string;
  runId?: string;
  requestId?: string;
  toolUseId?: string;
  providerEventType?: string;
}

/**
 * Governed command evidence. Stream hashes are SHA-256 over the complete,
 * redacted UTF-8 stream; excerpts are independently redacted and bounded.
 * A stream is absent unless the provider supplied that stream independently.
 */
export interface CommandExecutionProvenance {
  commandId: string;
  phase: "started" | "completed";
  command: string;
  invocation: string[];
  workingDirectory: string;
  status?: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  stdoutSha256?: string;
  stderrSha256?: string;
  verifierAssignmentId?: string;
  executorAssignmentId?: string;
  executorExecutionEvidenceId?: string;
  repositoryPath?: string;
  startingHead?: string;
  candidatePaths?: string[];
  candidateContentSha256?: Record<string, string | null>;
  requiredCheckIds?: string[];
}

export interface NormalizedExecutionEvent {
  type: NormalizedEventType;
  timestamp: string;
  message?: string;
  toolName?: string;
  targetPath?: string | null;
  permission?: "allow" | "deny";
  reason?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
  commandExecution?: CommandExecutionProvenance;
  correlation?: ProviderCorrelation;
  /**
   * Opaque provider payload summary for evidence only. Not Orchestra truth.
   */
  rawSummary?: Record<string, unknown>;
}

export function isNormalizedEventType(value: unknown): value is NormalizedEventType {
  return typeof value === "string" && (NORMALIZED_EVENT_TYPES as readonly string[]).includes(value);
}
