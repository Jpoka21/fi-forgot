import { randomUUID } from "node:crypto";
import { sortKeys } from "../assignment.js";
import type { FrozenAssignment } from "../assignment.js";
import type { ExecutionResult } from "../result.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  DEFAULT_EVIDENCE_SOURCES,
  ENGINEERING_STORE_SCHEMA_VERSION,
  type ExecutionEvidence,
} from "./types.js";

export function classifyRequiredEvidence(
  result: ExecutionResult,
  required: string[],
  frozen?: FrozenAssignment,
): {
  present: string[];
  missing: string[];
} {
  const present: string[] = [];
  const missing: string[] = [];
  for (const item of required) {
    const key = item.toLowerCase();
    const ok =
      (key === "git" && Boolean(result.preRunGitEvidence && result.postRunGitEvidence)) ||
      (key === "hooks" &&
        (result.policyDenials.length > 0 || result.providerStatus !== "not_started")) ||
      (key === "filesystem" && Array.isArray(result.changedPaths)) ||
      (key === "events" && Array.isArray(result.normalizedEvents)) ||
      (key === "executor_execution_evidence" && frozen?.assignment.role === "verifier") ||
      ((key === "tests" || key === "test") &&
        result.normalizedEvents.some((event) => {
          const outcome = event.rawSummary?.testOutcome;
          return outcome === "pass" || outcome === "fail";
        }));
    if (ok) present.push(item);
    else missing.push(item);
  }
  return { present, missing };
}

export function buildExecutionEvidence(input: {
  frozen: FrozenAssignment;
  result: ExecutionResult;
  providerStarted: boolean;
  recordedAt?: string;
}): ExecutionEvidence {
  if (input.result.assignmentId !== input.frozen.assignment.assignmentId) {
    throw new Error("execution result assignmentId does not match frozen assignment");
  }
  if (input.result.assignmentHash !== input.frozen.assignmentHash) {
    throw new Error("execution result assignmentHash does not match frozen assignment");
  }
  const requiredEvidence = [...input.frozen.assignment.requiredEvidence];
  const classified = classifyRequiredEvidence(input.result, requiredEvidence, input.frozen);
  const withoutHash: Omit<ExecutionEvidence, "evidenceHash"> = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "execution_evidence",
    evidenceId: `ev-${randomUUID()}`,
    assignmentId: input.frozen.assignment.assignmentId,
    assignmentHash: input.frozen.assignmentHash,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    verificationPosture: "pending",
    providerStarted: input.providerStarted,
    sources: DEFAULT_EVIDENCE_SOURCES,
    requiredEvidence,
    requiredEvidencePresent: classified.present,
    requiredEvidenceMissing: classified.missing,
    result: input.result,
  };
  const evidenceHash = sha256Utf8(JSON.stringify(sortKeys(withoutHash)));
  return { ...withoutHash, evidenceHash };
}

export function validateEvidenceHash(evidence: ExecutionEvidence): void {
  const { evidenceHash, ...rest } = evidence;
  const expected = sha256Utf8(JSON.stringify(sortKeys(rest)));
  if (expected !== evidenceHash) {
    throw new Error("execution evidence hash mismatch; refusing to load fabricated or rewritten evidence");
  }
}
