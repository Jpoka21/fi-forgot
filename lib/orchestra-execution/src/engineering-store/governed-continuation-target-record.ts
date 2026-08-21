import { sortKeys } from "../assignment.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  GOVERNED_CONTINUATION_TARGET_LIFECYCLE_SOURCE,
  GOVERNED_CONTINUATION_TARGET_SOURCE,
  type GovernedContinuationTargetLifecycleRecord,
  type GovernedContinuationTargetRecord,
} from "./types.js";

export type GovernedContinuationTargetRecordBody = Omit<
  GovernedContinuationTargetRecord,
  "targetHash"
>;

export type GovernedContinuationTargetLifecycleRecordBody = Omit<
  GovernedContinuationTargetLifecycleRecord,
  "lifecycleHash"
>;

export function governedContinuationTargetId(
  verificationDecisionId: string,
  targetKey: string,
): string {
  return `gct-${verificationDecisionId}-${targetKey}`;
}

export function hashGovernedContinuationTarget(
  body: GovernedContinuationTargetRecordBody,
): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function hashGovernedContinuationTargetLifecycle(
  body: GovernedContinuationTargetLifecycleRecordBody,
): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

function uniquePaths(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim().replace(/\\/g, "/");
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function buildGovernedContinuationTargetRecord(input: {
  verificationDecisionId: string;
  targetKey: string;
  projectId: string;
  predecessorExecutorAssignmentId: string;
  predecessorExecutorExecutionEvidenceId: string;
  repositoryPath: string;
  branch: string;
  baselineHead: string;
  assignmentText: string;
  allowedPaths: string[];
  protectedPaths: string[];
  prohibitedCommandClasses: string[];
  requiredEvidence: string[];
  structuredObligations?: Array<{
    obligationId: string;
    summary: string;
    verificationMode?: string;
  }>;
  orderingKey: number;
  registeredAt?: string;
}): GovernedContinuationTargetRecord {
  const targetKey = input.targetKey.trim();
  if (!targetKey) throw new Error("targetKey is required");
  if (!Number.isInteger(input.orderingKey) || input.orderingKey < 0) {
    throw new Error("orderingKey must be a non-negative integer");
  }
  const body: GovernedContinuationTargetRecordBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "governed_continuation_target",
    continuationTargetId: governedContinuationTargetId(
      input.verificationDecisionId,
      targetKey,
    ),
    targetKey,
    projectId: input.projectId.trim(),
    verificationDecisionId: input.verificationDecisionId,
    predecessorExecutorAssignmentId: input.predecessorExecutorAssignmentId,
    predecessorExecutorExecutionEvidenceId: input.predecessorExecutorExecutionEvidenceId,
    repositoryPath: input.repositoryPath.trim(),
    branch: input.branch.trim(),
    baselineHead: input.baselineHead.trim().toLowerCase(),
    assignmentText: input.assignmentText.trim(),
    allowedPaths: uniquePaths(input.allowedPaths),
    protectedPaths: uniquePaths(input.protectedPaths),
    prohibitedCommandClasses: [...input.prohibitedCommandClasses],
    requireNoPush: true,
    commitAuthorization: false,
    pushAuthorization: false,
    requiredEvidence: [...input.requiredEvidence],
    structuredObligations: (input.structuredObligations ?? []).map((row) => ({
      obligationId: row.obligationId.trim(),
      summary: row.summary.trim(),
      ...(row.verificationMode ? { verificationMode: row.verificationMode } : {}),
    })),
    orderingKey: input.orderingKey,
    status: "eligible",
    authoritySource: GOVERNED_CONTINUATION_TARGET_SOURCE,
    registeredAt: input.registeredAt ?? new Date().toISOString(),
    source: GOVERNED_CONTINUATION_TARGET_SOURCE,
    recordVersion: 1,
  };
  if (!body.projectId) throw new Error("projectId is required");
  if (!body.repositoryPath) throw new Error("repositoryPath is required");
  if (!body.branch) throw new Error("branch is required");
  if (!body.baselineHead) throw new Error("baselineHead is required");
  if (!body.assignmentText) throw new Error("assignmentText is required");
  return {
    ...body,
    targetHash: hashGovernedContinuationTarget(body),
  };
}

export function validateGovernedContinuationTarget(
  record: GovernedContinuationTargetRecord,
): boolean {
  if (record.recordKind !== "governed_continuation_target") return false;
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (record.source !== GOVERNED_CONTINUATION_TARGET_SOURCE) return false;
  if (record.authoritySource !== GOVERNED_CONTINUATION_TARGET_SOURCE) return false;
  if (record.status !== "eligible") return false;
  if (record.requireNoPush !== true) return false;
  if (record.commitAuthorization !== false) return false;
  if (record.pushAuthorization !== false) return false;
  if (record.recordVersion !== 1) return false;
  if (
    record.continuationTargetId !==
    governedContinuationTargetId(record.verificationDecisionId, record.targetKey)
  ) {
    return false;
  }
  const { targetHash, ...body } = record;
  return hashGovernedContinuationTarget(body) === targetHash;
}

export function buildGovernedContinuationTargetLifecycleRecord(input: {
  continuationTargetId: string;
  targetHash: string;
  status: "consumed" | "superseded" | "blocked";
  postDecisionActionId?: string | null;
  generatedAssignmentId?: string | null;
  executionEvidenceId?: string | null;
  reasonCode: string;
  recordedAt?: string;
}): GovernedContinuationTargetLifecycleRecord {
  const recordedAt = input.recordedAt ?? new Date().toISOString();
  const lifecycleId = `gctl-${input.continuationTargetId}-${input.status}-${sha256Utf8(
    `${input.targetHash}:${recordedAt}:${input.reasonCode}`,
  ).slice(0, 16)}`;
  const body: GovernedContinuationTargetLifecycleRecordBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "governed_continuation_target_lifecycle",
    lifecycleId,
    continuationTargetId: input.continuationTargetId,
    targetHash: input.targetHash,
    status: input.status,
    postDecisionActionId: input.postDecisionActionId ?? null,
    generatedAssignmentId: input.generatedAssignmentId ?? null,
    executionEvidenceId: input.executionEvidenceId ?? null,
    reasonCode: input.reasonCode,
    recordedAt,
    source: GOVERNED_CONTINUATION_TARGET_LIFECYCLE_SOURCE,
    recordVersion: 1,
  };
  return {
    ...body,
    lifecycleHash: hashGovernedContinuationTargetLifecycle(body),
  };
}

export function validateGovernedContinuationTargetLifecycle(
  record: GovernedContinuationTargetLifecycleRecord,
): boolean {
  if (record.recordKind !== "governed_continuation_target_lifecycle") return false;
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (record.source !== GOVERNED_CONTINUATION_TARGET_LIFECYCLE_SOURCE) return false;
  if (record.recordVersion !== 1) return false;
  if (record.status === ("eligible" as string)) return false;
  const { lifecycleHash, ...body } = record;
  return hashGovernedContinuationTargetLifecycle(body) === lifecycleHash;
}
