import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { HookDecisionRecord } from "./policy-decision.js";

export function readHookInvocations(repositoryPath: string): HookDecisionRecord[] {
  const logPath = join(repositoryPath, ".cursor", "hooks", "invocations.ndjson");
  if (!existsSync(logPath)) return [];
  const text = readFileSync(logPath, "utf8");
  const records: HookDecisionRecord[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line) as Partial<HookDecisionRecord>;
      if (!parsed.reason || !parsed.permission) continue;
      records.push({
        timestamp: String(parsed.timestamp ?? ""),
        assignmentId: String(parsed.assignmentId ?? ""),
        providerSessionId: parsed.providerSessionId ?? null,
        runId: parsed.runId ?? null,
        toolUseId: parsed.toolUseId ?? null,
        hookEvent: String(parsed.hookEvent ?? ""),
        toolName: String(parsed.toolName ?? ""),
        targetPath: parsed.targetPath ?? null,
        permission: parsed.permission === "deny" ? "deny" : "allow",
        reason: String(parsed.reason),
      });
    } catch {
      // Skip malformed evidence lines rather than fabricating records.
    }
  }
  return records;
}

export function correlateHookDenials(
  records: HookDecisionRecord[],
  extras: { assignmentId: string; sessionId?: string | null; runId?: string | null },
): HookDecisionRecord[] {
  return records
    .filter((record) => record.permission === "deny")
    .map((record) => ({
      ...record,
      assignmentId: record.assignmentId || extras.assignmentId,
      providerSessionId: record.providerSessionId ?? extras.sessionId ?? null,
      runId: record.runId ?? extras.runId ?? null,
    }));
}
