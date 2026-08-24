import { sortKeys } from "../assignment.js";
import { sha256Utf8 } from "./atomic-write.js";
import {
  ENGINEERING_STORE_SCHEMA_VERSION,
  GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE,
  GOVERNED_CONTINUATION_SEQUENCE_FULFILLMENT_SOURCE,
  GOVERNED_CONTINUATION_TARGET_LIFECYCLE_SOURCE,
  GOVERNED_CONTINUATION_TARGET_AUTHORITY_SOURCES,
  GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE,
  GOVERNED_CONTINUATION_TARGET_SOURCE,
  type GovernedContinuationSequenceConfigRecord,
  type GovernedContinuationSequenceEntry,
  type GovernedContinuationSequenceFulfillmentRecord,
  type GovernedContinuationTargetAuthoritySource,
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

function isAuthoritySource(
  value: string,
): value is GovernedContinuationTargetAuthoritySource {
  return (GOVERNED_CONTINUATION_TARGET_AUTHORITY_SOURCES as readonly string[]).includes(
    value,
  );
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
  authoritySource?: GovernedContinuationTargetAuthoritySource;
  sequenceId?: string | null;
  sequenceConfigHash?: string | null;
  sequenceEntryKey?: string | null;
  sequenceEntryHash?: string | null;
}): GovernedContinuationTargetRecord {
  const targetKey = input.targetKey.trim();
  if (!targetKey) throw new Error("targetKey is required");
  if (!Number.isInteger(input.orderingKey) || input.orderingKey < 0) {
    throw new Error("orderingKey must be a non-negative integer");
  }
  const authoritySource = input.authoritySource ?? GOVERNED_CONTINUATION_TARGET_SOURCE;
  const sequenceId = input.sequenceId ?? null;
  const sequenceConfigHash = input.sequenceConfigHash ?? null;
  const sequenceEntryKey = input.sequenceEntryKey ?? null;
  const sequenceEntryHash = input.sequenceEntryHash ?? null;
  if (authoritySource === GOVERNED_CONTINUATION_TARGET_SOURCE) {
    if (sequenceId || sequenceConfigHash || sequenceEntryKey || sequenceEntryHash) {
      throw new Error("manual registration must not bind sequence fields");
    }
  } else if (authoritySource === GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE) {
    if (!sequenceId || !sequenceConfigHash || !sequenceEntryKey || !sequenceEntryHash) {
      throw new Error("sequence-materialized targets require complete sequence bindings");
    }
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
    sequenceId,
    sequenceConfigHash,
    sequenceEntryKey,
    sequenceEntryHash,
    authoritySource,
    registeredAt: input.registeredAt ?? new Date().toISOString(),
    source: authoritySource,
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
  if (!isAuthoritySource(record.source) || record.source !== record.authoritySource) {
    return false;
  }
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
  if (record.authoritySource === GOVERNED_CONTINUATION_TARGET_SOURCE) {
    if (
      record.sequenceId !== null ||
      record.sequenceConfigHash !== null ||
      record.sequenceEntryKey !== null ||
      record.sequenceEntryHash !== null
    ) {
      return false;
    }
  } else if (record.authoritySource === GOVERNED_CONTINUATION_TARGET_SEQUENCE_SOURCE) {
    if (
      !record.sequenceId ||
      !record.sequenceConfigHash ||
      !record.sequenceEntryKey ||
      !record.sequenceEntryHash
    ) {
      return false;
    }
  } else {
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

function uniquePathsEntry(values: string[]): string[] {
  return uniquePaths(values);
}

export type SequenceEntryBody = Omit<GovernedContinuationSequenceEntry, "entryHash">;

export function hashSequenceEntry(body: SequenceEntryBody): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildSequenceEntry(input: {
  entryKey: string;
  orderingKey: number;
  predecessorEntryKey: string | null;
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
}): GovernedContinuationSequenceEntry {
  const entryKey = input.entryKey.trim();
  if (!entryKey) throw new Error("entryKey is required");
  if (!Number.isInteger(input.orderingKey) || input.orderingKey < 0) {
    throw new Error("orderingKey must be a non-negative integer");
  }
  const body: SequenceEntryBody = {
    entryKey,
    orderingKey: input.orderingKey,
    predecessorEntryKey: input.predecessorEntryKey,
    assignmentText: input.assignmentText.trim(),
    allowedPaths: uniquePathsEntry(input.allowedPaths),
    protectedPaths: uniquePathsEntry(input.protectedPaths),
    prohibitedCommandClasses: [...input.prohibitedCommandClasses],
    requiredEvidence: [...input.requiredEvidence],
    structuredObligations: (input.structuredObligations ?? []).map((row) => ({
      obligationId: row.obligationId.trim(),
      summary: row.summary.trim(),
      ...(row.verificationMode ? { verificationMode: row.verificationMode } : {}),
    })),
  };
  if (!body.assignmentText) throw new Error("assignmentText is required");
  return { ...body, entryHash: hashSequenceEntry(body) };
}

export function validateSequenceEntry(entry: GovernedContinuationSequenceEntry): boolean {
  const { entryHash, ...body } = entry;
  return hashSequenceEntry(body) === entryHash;
}

export type SequenceConfigBody = Omit<GovernedContinuationSequenceConfigRecord, "configHash">;

export function governedContinuationSequenceId(
  projectId: string,
  sequenceKey: string,
): string {
  return `gcs-${projectId.trim()}-${sequenceKey.trim()}`;
}

export function hashSequenceConfig(body: SequenceConfigBody): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildGovernedContinuationSequenceConfig(input: {
  projectId: string;
  sequenceKey: string;
  configurationVersion: number;
  repositoryPath: string;
  branch: string;
  entries: Array<{
    entryKey: string;
    orderingKey: number;
    predecessorEntryKey: string | null;
    assignmentText: string;
    allowedPaths: string[];
    protectedPaths: string[];
    prohibitedCommandClasses: string[];
    requiredEvidence?: string[];
    structuredObligations?: Array<{
      obligationId: string;
      summary: string;
      verificationMode?: string;
    }>;
  }>;
  registeredAt?: string;
}): GovernedContinuationSequenceConfigRecord {
  const projectId = input.projectId.trim();
  const sequenceKey = input.sequenceKey.trim();
  if (!projectId || !sequenceKey) throw new Error("projectId and sequenceKey are required");
  if (!Number.isInteger(input.configurationVersion) || input.configurationVersion < 1) {
    throw new Error("configurationVersion must be a positive integer");
  }
  if (input.entries.length === 0) throw new Error("sequence requires at least one entry");

  const entries = input.entries.map((row) =>
    buildSequenceEntry({
      ...row,
      requiredEvidence: row.requiredEvidence ?? ["git", "hooks", "filesystem"],
    }),
  );
  const keys = new Set<string>();
  const orderings = new Set<number>();
  let bootstrapCount = 0;
  for (const entry of entries) {
    if (keys.has(entry.entryKey)) throw new Error(`duplicate entryKey ${entry.entryKey}`);
    keys.add(entry.entryKey);
    if (orderings.has(entry.orderingKey)) {
      throw new Error(`duplicate orderingKey ${entry.orderingKey}`);
    }
    orderings.add(entry.orderingKey);
    if (entry.predecessorEntryKey === null) bootstrapCount += 1;
    else if (!keys.has(entry.predecessorEntryKey) && !input.entries.some((e) => e.entryKey === entry.predecessorEntryKey)) {
      // predecessor may appear later in input list — check full set after
    }
  }
  if (bootstrapCount !== 1) {
    throw new Error("sequence must contain exactly one bootstrap entry (predecessorEntryKey null)");
  }
  for (const entry of entries) {
    if (entry.predecessorEntryKey !== null && !keys.has(entry.predecessorEntryKey)) {
      throw new Error(`unknown predecessorEntryKey ${entry.predecessorEntryKey}`);
    }
    if (entry.predecessorEntryKey === entry.entryKey) {
      throw new Error("entry cannot precede itself");
    }
  }

  const body: SequenceConfigBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "governed_continuation_sequence_config",
    sequenceId: governedContinuationSequenceId(projectId, sequenceKey),
    projectId,
    configurationVersion: input.configurationVersion,
    repositoryPath: input.repositoryPath.trim(),
    branch: input.branch.trim(),
    entries,
    authoritySource: GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE,
    registeredAt: input.registeredAt ?? new Date().toISOString(),
    source: GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE,
    recordVersion: 1,
  };
  if (!body.repositoryPath || !body.branch) {
    throw new Error("repositoryPath and branch are required");
  }
  return { ...body, configHash: hashSequenceConfig(body) };
}

export function validateGovernedContinuationSequenceConfig(
  record: GovernedContinuationSequenceConfigRecord,
): boolean {
  if (record.recordKind !== "governed_continuation_sequence_config") return false;
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (record.source !== GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE) return false;
  if (record.authoritySource !== GOVERNED_CONTINUATION_SEQUENCE_AUTHORITY_SOURCE) return false;
  if (record.recordVersion !== 1) return false;
  if (!Array.isArray(record.entries) || record.entries.length === 0) return false;
  if (!record.entries.every(validateSequenceEntry)) return false;
  const bootstraps = record.entries.filter((e) => e.predecessorEntryKey === null);
  if (bootstraps.length !== 1) return false;
  const { configHash, ...body } = record;
  return hashSequenceConfig(body) === configHash;
}

export type FulfillmentBody = Omit<
  GovernedContinuationSequenceFulfillmentRecord,
  "fulfillmentHash"
>;

export function hashSequenceFulfillment(body: FulfillmentBody): string {
  return sha256Utf8(JSON.stringify(sortKeys(body)));
}

export function buildSequenceFulfillmentRecord(input: {
  sequenceId: string;
  sequenceConfigHash: string;
  entryKey: string;
  entryHash: string;
  verificationDecisionId: string;
  executorAssignmentId: string;
  executorExecutionEvidenceId: string;
  fulfilledAt?: string;
}): GovernedContinuationSequenceFulfillmentRecord {
  const fulfilledAt = input.fulfilledAt ?? new Date().toISOString();
  const fulfillmentId = `gcsf-${input.sequenceId}-${input.entryKey}-${sha256Utf8(
    `${input.verificationDecisionId}:${input.sequenceConfigHash}`,
  ).slice(0, 16)}`;
  const body: FulfillmentBody = {
    schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
    recordKind: "governed_continuation_sequence_fulfillment",
    fulfillmentId,
    sequenceId: input.sequenceId,
    sequenceConfigHash: input.sequenceConfigHash,
    entryKey: input.entryKey,
    entryHash: input.entryHash,
    verificationDecisionId: input.verificationDecisionId,
    executorAssignmentId: input.executorAssignmentId,
    executorExecutionEvidenceId: input.executorExecutionEvidenceId,
    fulfilledAt,
    source: GOVERNED_CONTINUATION_SEQUENCE_FULFILLMENT_SOURCE,
    recordVersion: 1,
  };
  return { ...body, fulfillmentHash: hashSequenceFulfillment(body) };
}

export function validateSequenceFulfillment(
  record: GovernedContinuationSequenceFulfillmentRecord,
): boolean {
  if (record.recordKind !== "governed_continuation_sequence_fulfillment") return false;
  if (record.schemaVersion !== ENGINEERING_STORE_SCHEMA_VERSION) return false;
  if (record.source !== GOVERNED_CONTINUATION_SEQUENCE_FULFILLMENT_SOURCE) return false;
  if (record.recordVersion !== 1) return false;
  const { fulfillmentHash, ...body } = record;
  return hashSequenceFulfillment(body) === fulfillmentHash;
}

/**
 * Authoritative fulfillment identity: first valid record per (sequenceId, entryKey).
 * Later identical fulfillmentHash lines are idempotent (ignored, first retained).
 * Later conflicting records are non-authoritative (ignored).
 * Invalid hashes are skipped and never become authority.
 * Append order must not replace an established fulfillment identity.
 */
export function selectAuthoritativeSequenceFulfillments(
  rows: readonly GovernedContinuationSequenceFulfillmentRecord[],
): GovernedContinuationSequenceFulfillmentRecord[] {
  const byEntry = new Map<string, GovernedContinuationSequenceFulfillmentRecord>();
  const out: GovernedContinuationSequenceFulfillmentRecord[] = [];
  for (const row of rows) {
    if (!validateSequenceFulfillment(row)) continue;
    const key = `${row.sequenceId}\u0000${row.entryKey}`;
    const prior = byEntry.get(key);
    if (!prior) {
      byEntry.set(key, row);
      out.push(row);
      continue;
    }
    // Identical duplicate — keep first; do not replace.
    if (prior.fulfillmentHash === row.fulfillmentHash) continue;
    // Conflicting later record — non-authoritative; ignore.
    continue;
  }
  return out;
}
