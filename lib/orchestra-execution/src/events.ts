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
  correlation?: ProviderCorrelation;
  /**
   * Opaque provider payload summary for evidence only. Not Orchestra truth.
   */
  rawSummary?: Record<string, unknown>;
}

export function isNormalizedEventType(value: unknown): value is NormalizedEventType {
  return typeof value === "string" && (NORMALIZED_EVENT_TYPES as readonly string[]).includes(value);
}
