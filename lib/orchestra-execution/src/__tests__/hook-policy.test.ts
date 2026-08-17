import { decideHookPolicy, detectProhibitedCommand } from "../hooks/policy-decision.js";
import { parseHookPayload, decodeHookStdin } from "../hooks/parse-payload.js";
import { expect, expectTrue, section } from "./harness.js";

const policy = {
  assignmentId: "hook-tests",
  protectedPaths: ["protected.txt"],
  repositoryPath: "C:/tmp/fixture",
  requireNoPush: true,
  denyDestructiveGit: true,
  denyHookTamper: true,
};

export function runHookDecisionTests(): void {
  section("protected path hook projection / decisions");
  expect(
    "allowed write",
    decideHookPolicy(
      { hook_event_name: "preToolUse", tool_name: "Write", tool_input: { path: "allowed.txt" } },
      policy,
    ).reason,
    "write_not_protected",
  );
  expect(
    "protected direct write denial",
    decideHookPolicy(
      { hook_event_name: "preToolUse", tool_name: "edit", tool_input: { path: "protected.txt" } },
      policy,
    ).reason,
    "protected_path_write_denied",
  );
  expect(
    "protected shell write denial",
    decideHookPolicy(
      {
        hook_event_name: "preToolUse",
        tool_name: "Shell",
        tool_input: { command: 'echo ADAPTER_BLOCKED_TEST >> "protected.txt"' },
      },
      policy,
    ).reason,
    "protected_path_shell_denied",
  );
  expect(
    "read allowed",
    decideHookPolicy(
      { hook_event_name: "preToolUse", tool_name: "Read", tool_input: { path: "protected.txt" } },
      policy,
    ).permission,
    "allow",
  );
  expect(
    "fail-closed missing write path",
    decideHookPolicy({ hook_event_name: "preToolUse", tool_name: "Write", tool_input: {} }, policy)
      .reason,
    "fail_closed_unparseable_write_path",
  );
  expect(
    "fail-closed targeted ambiguity",
    decideHookPolicy(
      { hook_event_name: "preToolUse", tool_name: "unknownTool", tool_input: { note: "touch protected.txt" } },
      policy,
    ).reason,
    "fail_closed_ambiguous_protected_operation",
  );
  expect(
    "git push denied",
    detectProhibitedCommand("git push origin fixture-main", policy)?.reason,
    "git_push_denied",
  );
  expect(
    "force push denied",
    detectProhibitedCommand("git push --force", policy)?.reason,
    "git_push_denied",
  );
  expect(
    "destructive git denied",
    detectProhibitedCommand("git reset --hard HEAD~1", policy)?.reason,
    "destructive_git_denied",
  );
  expect(
    "hook tamper denied",
    detectProhibitedCommand("Remove-Item .cursor/hooks.json", policy)?.reason,
    "hook_tamper_denied",
  );
}

export function runHookParserTests(): void {
  section("hook parser");
  expect("plain json", parseHookPayload('{"tool_name":"Write"}').tool_name, "Write");
  expect(
    "extracts json object from surrounding text",
    parseHookPayload('noise {"tool_name":"edit"} trailing').tool_name,
    "edit",
  );
  const utf16 = Buffer.from("\uFEFF{" + '"tool_name":"Read"' + "}", "utf16le");
  const decoded = decodeHookStdin(utf16);
  expectTrue("utf16 decode produces json text", decoded.includes("Read"));
  let threw = false;
  try {
    parseHookPayload("not-json");
  } catch {
    threw = true;
  }
  expectTrue("malformed hook input throws", threw);
}
