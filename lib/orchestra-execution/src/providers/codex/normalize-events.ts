import type { NormalizedExecutionEvent, NormalizedEventType } from "../../events.js";
import { CODEX_PROVIDER_ID } from "../../provider-contract.js";
import { redactCodexText, type AppServerNotification } from "./app-server-transport.js";

export function asRecord(value: unknown): Record<string, unknown> | null {
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

export function codexNotificationTurnId(notification: AppServerNotification): string | undefined {
  const params = asRecord(notification.params);
  const turn = asRecord(params?.turn);
  return stringField(params, "turnId") ?? stringField(turn, "id");
}

export function codexNotificationThreadId(notification: AppServerNotification): string | undefined {
  const params = asRecord(notification.params);
  const thread = asRecord(params?.thread);
  return stringField(params, "threadId") ?? stringField(thread, "id");
}

export function normalizeCodexEvent(
  notification: AppServerNotification,
  fallback: { threadId?: string; turnId?: string } = {},
  now = new Date().toISOString(),
): NormalizedExecutionEvent {
  const params = asRecord(notification.params);
  const item = asRecord(params?.item);
  const turn = asRecord(params?.turn);
  const providerType = notification.method;
  const sessionId = codexNotificationThreadId(notification) ?? fallback.threadId;
  const runId = codexNotificationTurnId(notification) ?? fallback.turnId;
  const itemType = stringField(item, "type");
  const itemId = stringField(item, "id");
  let type: NormalizedEventType = "assistant_progress";
  let message: string | undefined;
  let toolName: string | undefined;
  let targetPath: string | null | undefined;
  let usage: NormalizedExecutionEvent["usage"];

  if (providerType === "thread/started") {
    type = "session_started";
    message = "codex thread started";
  } else if (providerType === "turn/started") {
    type = "run_started";
    message = "codex turn started";
  } else if (providerType === "turn/completed") {
    const status = stringField(turn, "status") ?? "completed";
    type = status === "failed" ? "provider_error" : "run_finished";
    message = status;
  } else if (providerType === "error" || providerType === "warning") {
    type = "provider_error";
    message = redactCodexText(stringField(params, "message") ?? stringField(params, "summary") ?? providerType);
  } else if (providerType === "thread/tokenUsage/updated") {
    type = "usage";
    const tokenUsage = asRecord(params?.tokenUsage);
    const total = asRecord(tokenUsage?.total) ?? tokenUsage;
    usage = {
      inputTokens: numberField(total, "inputTokens") ?? numberField(total, "input_tokens"),
      outputTokens: numberField(total, "outputTokens") ?? numberField(total, "output_tokens"),
    };
  } else if (providerType === "item/agentMessage/delta") {
    type = "assistant_progress";
    message = stringField(params, "delta") ?? "agent message delta";
  } else if (providerType === "item/started" || providerType === "item/completed") {
    if (itemType === "commandExecution" || itemType === "mcpToolCall" || itemType === "fileChange") {
      type = "tool_invocation";
      toolName = itemType;
      targetPath = stringField(item, "path") ?? null;
      message = providerType;
    } else if (itemType === "agentMessage") {
      type = "assistant_progress";
      message = stringField(item, "text") ?? providerType;
    } else {
      message = `${providerType}:${itemType ?? "unknown"}`;
    }
  } else {
    message = `unmapped_codex_event:${providerType}`;
  }

  if (message !== undefined) message = redactCodexText(message);

  return {
    type,
    timestamp: now,
    message,
    toolName,
    targetPath,
    usage,
    correlation: {
      providerId: CODEX_PROVIDER_ID,
      sessionId,
      runId,
      toolUseId: itemId,
      providerEventType: providerType,
    },
    rawSummary: {
      providerType,
      itemType: itemType ?? null,
      status: turn?.status ?? item?.status ?? null,
    },
  };
}
