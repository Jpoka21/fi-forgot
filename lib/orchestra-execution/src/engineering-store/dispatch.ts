import { collectGitEvidence } from "../git-evidence.js";
import type { GovernedVerifierExecutionCapability } from "../governed-verifier-capability.js";
import { isGovernedVerifierExecutionCapability } from "../governed-verifier-capability.js";
import type { ExecutionProvider } from "../provider-contract.js";
import { synthesizeExecutionResult, type ExecutionResult } from "../result.js";
import { runBoundedAssignment } from "../run-assignment.js";
import { buildExecutionEvidence } from "./evidence.js";
import { FileEngineeringStore } from "./store.js";
import { ENGINEERING_STORE_SCHEMA_VERSION, type ExecutionEvidence, type FrozenAssignmentRecord } from "./types.js";
import { cleanupIsolatedWorkspacePath } from "../isolated-workspace.js";

export interface DispatchFrozenAssignmentInput {
  store: FileEngineeringStore;
  provider: ExecutionProvider;
  assignmentId: string;
  projectHooks?: boolean;
  /**
   * Internal only. Set by dispatchGovernedVerifierAssignment after full eligibility validation.
   */
  governedVerifierCapability?: GovernedVerifierExecutionCapability;
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
  if (frozen.assignment.role === "verifier") {
    if (
      !isGovernedVerifierExecutionCapability(
        input.governedVerifierCapability,
        frozen.assignment.assignmentId,
        frozen.assignmentHash,
      )
    ) {
      throw new Error(
        "verifier assignments must be dispatched through dispatchGovernedVerifierAssignment",
      );
    }
  }
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
    const mismatch = await runBoundedAssignment(input.provider, frozen, {
      projectHooks: false,
      governedVerifierCapability: input.governedVerifierCapability,
    });
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
      deferIsolationCleanup: true,
      governedVerifierCapability: input.governedVerifierCapability,
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
    if (result.isolationEvidence?.cleanupStatus === "pending") {
      const cleaned = cleanupIsolatedWorkspacePath(result.isolationEvidence.workspacePath);
      if (!cleaned) {
        input.store.persistCrashReceipt({
          schemaVersion: ENGINEERING_STORE_SCHEMA_VERSION,
          recordKind: "crash_receipt",
          timestamp: new Date().toISOString(),
          assignmentId: frozen.assignment.assignmentId,
          assignmentHash: frozen.assignmentHash,
          providerSessionId: result.providerSessionId,
          runId: result.runId,
          reason: "isolated workspace cleanup failed after execution evidence persistence",
        });
      }
    }
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
      }${result.isolationEvidence ? `; isolated workspace preserved at ${result.isolationEvidence.workspacePath}` : ""}`,
    });
    throw error;
  }
}
