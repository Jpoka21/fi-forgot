import type { NormalizedExecutionEvent, NormalizedEventType } from "../../events.js";
import { CURSOR_PROVIDER_ID } from "../../provider-contract.js";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringField(record: Record<string, unknown> | null, key: string): string | undefined {
  const value = record?.[key];
  return typeof value === "string" ? value : undefined;
}

function numberField(record: Record<string, unknown> | null, key: string): number | undefined {
  const value = record?.[key];
  return typeof value === "number" ? value : undefined;
}

/**
 * Map useful Cursor SDK stream events into Orchestra's vendor-neutral event model.
 * Unknown provider events are wrapped, not dropped.
 */
export function normalizeCursorEvent(event: unknown, now = new Date().toISOString()): NormalizedExecutionEvent {
  const record = asRecord(event);
  const providerType = stringField(record, "type") ?? "unknown";
  const sessionId = stringField(record, "agent_id") ?? stringField(record, "agentId");
  const runId = stringField(record, "run_id") ?? stringField(record, "runId");
  const requestId = stringField(record, "request_id") ?? stringField(record, "requestId");
  const correlation = {
    providerId: CURSOR_PROVIDER_ID,
    sessionId,
    runId,
    requestId,
    toolUseId: stringField(record, "call_id") ?? stringField(record, "tool_use_id"),
    providerEventType: providerType,
  };

  let type: NormalizedEventType = "assistant_progress";
  let message: string | undefined;
  let toolName: string | undefined;
  let targetPath: string | null | undefined;
  let usage: NormalizedExecutionEvent["usage"];

  if (providerType === "system" || (providerType === "status" && stringField(record, "status") === "CREATING")) {
    type = "session_started";
    message = stringField(record, "message") ?? "cursor session started";
  } else if (providerType === "status" && stringField(record, "status") === "RUNNING") {
    type = "run_started";
    message = stringField(record, "message") ?? "cursor run started";
  } else if (providerType === "status" && stringField(record, "status") === "FINISHED") {
    type = "run_finished";
    message = stringField(record, "message") ?? "cursor run finished";
  } else if (
    providerType === "status" &&
    (stringField(record, "status") === "ERROR" || stringField(record, "status") === "EXPIRED")
  ) {
    type = "provider_error";
    message = stringField(record, "message") ?? "cursor provider error";
  } else if (providerType === "tool_call") {
    type = "tool_invocation";
    toolName = stringField(record, "name");
    const args = asRecord(record?.args);
    targetPath =
      stringField(args, "path") ??
      stringField(args, "file_path") ??
      stringField(args, "filePath") ??
      null;
    message = stringField(record, "status");
    if (stringField(record, "status") === "error") {
      type = "provider_error";
    }
  } else if (providerType === "usage") {
    type = "usage";
    const usageRecord = asRecord(record?.usage) ?? record;
    usage = {
      inputTokens: numberField(usageRecord, "inputTokens") ?? numberField(usageRecord, "input_tokens"),
      outputTokens: numberField(usageRecord, "outputTokens") ?? numberField(usageRecord, "output_tokens"),
    };
  } else if (providerType === "assistant" || providerType === "thinking" || providerType === "task") {
    type = "assistant_progress";
    message = providerType;
  } else if (providerType === "request") {
    type = "run_started";
    message = requestId;
  } else {
    type = "assistant_progress";
    message = `unmapped_cursor_event:${providerType}`;
  }

  return {
    type,
    timestamp: now,
    message,
    toolName,
    targetPath,
    usage,
    correlation,
    rawSummary: {
      providerType,
      status: record?.status ?? null,
      name: record?.name ?? null,
    },
  };
}
