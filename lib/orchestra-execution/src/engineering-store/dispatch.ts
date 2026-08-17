import { collectGitEvidence } from "../git-evidence.js";
import type { ExecutionProvider } from "../provider-contract.js";
import { synthesizeExecutionResult, type ExecutionResult } from "../result.js";
import { runBoundedAssignment } from "../run-assignment.js";
import { buildExecutionEvidence } from "./evidence.js";
import { FileEngineeringStore } from "./store.js";
import { ENGINEERING_STORE_SCHEMA_VERSION, type ExecutionEvidence, type FrozenAssignmentRecord } from "./types.js";

export interface DispatchFrozenAssignmentInput {
  store: FileEngineeringStore;
  provider: ExecutionProvider;
  assignmentId: string;
  projectHooks?: boolean;
}

export interface DispatchFrozenAssignmentOutput {
  assignmentRecord: FrozenAssignmentRecord;
  evidence: ExecutionEvidence;
  result: ExecutionResult;
}

/**
 * Governed handoff: reload and validate the persisted FrozenAssignment, then dispatch
 * that exact record. In-memory objects are not the source of authority.
 */
export async function dispatchFrozenAssignment(
  input: DispatchFrozenAssignmentInput,
): Promise<DispatchFrozenAssignmentOutput> {
  const assignmentRecord = input.store.loadAssignmentRecord(input.assignmentId);
  const frozen = assignmentRecord.frozen;
  if (input.store.loadLatestExecutionEvidence(input.assignmentId)) {
    throw new Error(
      `assignment ${input.assignmentId} already has execution evidence; refusing to dispatch again`,
    );
  }
  const current = input.store.getCurrentState(input.assignmentId);
  if (current.crashReceipts.length > 0) {
    throw new Error(
      `assignment ${input.assignmentId} has a crash receipt; refusing to claim the prior provider run never happened`,
    );
  }
  const status = current.status;
  if (status !== "frozen") {
    throw new Error(`assignment ${input.assignmentId} is not frozen; refusing dispatch from status ${status}`);
  }

  const pre = await collectGitEvidence(frozen.assignment.repositoryPath);
  if (!pre.head || !pre.branch) {
    const emptyResult = synthesizeExecutionResult({
      frozen,
      providerId: input.provider.providerId,
      providerSessionId: null,
      runId: null,
      providerStatus: "not_started",
      normalizedEvents: [],
      providerFinalResultText: null,
      preRunGitEvidence: pre,
      postRunGitEvidence: pre,
      policyDenials: [],
      changedPaths: [],
      protectedPathMutationOccurred: false,
      branchChanged: false,
      headChanged: false,
      commitOccurred: false,
      unexpectedChanges: ["evidence_incomplete"],
      evidenceIncomplete: true,
    });
    const evidence = input.store.persistExecutionEvidence(
      buildExecutionEvidence({ frozen, result: emptyResult, providerStarted: false }),
    );
    return { assignmentRecord, evidence, result: emptyResult };
  }
  if (
    pre.head !== frozen.assignment.startingHead.toLowerCase() ||
    pre.branch !== frozen.assignment.branch
  ) {
    const mismatch = await runBoundedAssignment(input.provider, frozen, { projectHooks: false });
    const evidence = input.store.persistExecutionEvidence(
      buildExecutionEvidence({ frozen, result: mismatch, providerStarted: false }),
    );
    return { assignmentRecord, evidence, result: mismatch };
  }

  input.store.recordDispatchStarted(frozen, "validated frozen assignment handed to execution provider");
  let result: ExecutionResult;
  try {
    result = await runBoundedAssignment(input.provider, frozen, {
      projectHooks: input.projectHooks,
    });
  } catch (error) {
    input.store.persistCrashReceipt({
      schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
      recordKind: "crash_receipt",
      timestamp: new Date().toISOString(),
      assignmentId: frozen.assignment.assignmentId,
      assignmentHash: frozen.assignmentHash,
      providerSessionId: null,
      runId: null,
      reason: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  const providerStarted = result.providerStatus !== "not_started";
  try {
    const evidence = input.store.persistExecutionEvidence(
      buildExecutionEvidence({ frozen, result, providerStarted }),
    );
    return { assignmentRecord, evidence, result };
  } catch (error) {
    input.store.persistCrashReceipt({
      schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
      recordKind: "crash_receipt",
      timestamp: new Date().toISOString(),
      assignmentId: frozen.assignment.assignmentId,
      assignmentHash: frozen.assignmentHash,
      providerSessionId: result.providerSessionId,
      runId: result.runId,
      reason: `execution evidence persistence failed after provider activity: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
    throw error;
  }
}
