import { normalizeCursorEvent } from "../providers/cursor/normalize-events.js";
import { expect, section } from "./harness.js";

export function runEventNormalizationTests(): void {
  section("Cursor event normalization");
  expect(
    "system -> session_started",
    normalizeCursorEvent({ type: "system", agent_id: "a", run_id: "r" }).type,
    "session_started",
  );
  expect(
    "status running -> run_started",
    normalizeCursorEvent({ type: "status", status: "RUNNING", agent_id: "a", run_id: "r" }).type,
    "run_started",
  );
  expect(
    "assistant -> assistant_progress",
    normalizeCursorEvent({ type: "assistant", agent_id: "a", run_id: "r" }).type,
    "assistant_progress",
  );
  expect(
    "tool_call -> tool_invocation",
    normalizeCursorEvent({
      type: "tool_call",
      name: "edit",
      call_id: "t1",
      args: { path: "allowed.txt" },
      agent_id: "a",
      run_id: "r",
    }).type,
    "tool_invocation",
  );
  expect(
    "tool path preserved as metadata",
    normalizeCursorEvent({
      type: "tool_call",
      name: "edit",
      args: { path: "allowed.txt" },
    }).targetPath,
    "allowed.txt",
  );
  expect(
    "status error -> provider_error",
    normalizeCursorEvent({ type: "status", status: "ERROR", message: "boom" }).type,
    "provider_error",
  );
  expect(
    "status finished -> run_finished",
    normalizeCursorEvent({ type: "status", status: "FINISHED" }).type,
    "run_finished",
  );
  expect(
    "usage -> usage",
    normalizeCursorEvent({ type: "usage", usage: { inputTokens: 3, outputTokens: 4 } }).type,
    "usage",
  );
  expect(
    "unknown event wrapped",
    normalizeCursorEvent({ type: "mystery", agent_id: "a" }).message,
    "unmapped_cursor_event:mystery",
  );
  expect(
    "cursor ids stay in correlation only",
    normalizeCursorEvent({ type: "tool_call", agent_id: "agent-1", run_id: "run-1", call_id: "tool-1" })
      .correlation?.sessionId,
    "agent-1",
  );
}
