import { createAssignment } from "../assignment-hash.js";
import type { FrozenAssignment } from "../assignment.js";
import type {
  GovernedContinuationTargetRecord,
  PostDecisionActionRecord,
} from "./types.js";

export function continuationAssignmentId(postDecisionActionId: string): string {
  return `cont-${postDecisionActionId}`;
}

function isSubsetPaths(candidate: string[], allowed: string[]): boolean {
  const set = new Set(allowed.map((p) => p.replace(/\\/g, "/")));
  return candidate.every((p) => set.has(p.replace(/\\/g, "/")));
}

function includesAllPaths(candidate: string[], required: string[]): boolean {
  const set = new Set(candidate.map((p) => p.replace(/\\/g, "/")));
  return required.every((p) => set.has(p.replace(/\\/g, "/")));
}

/**
 * Build a bounded continuation executor assignment from an authoritative governed target.
 * Never invents requirements; never grants commit/push; never weakens requireNoPush.
 */
export function buildContinuationAssignmentFromTarget(input: {
  action: PostDecisionActionRecord;
  target: GovernedContinuationTargetRecord;
}): FrozenAssignment {
  const { action, target } = input;
  if (action.preparedAction !== "PREPARE_CONTINUATION") {
    throw new Error("continuation assignment requires PREPARE_CONTINUATION");
  }
  if (!action.startingBranch || !action.startingHead) {
    throw new Error("continuation assignment requires starting branch and HEAD");
  }
  if (target.verificationDecisionId !== action.verificationDecisionId) {
    throw new Error("continuation target decision mismatch");
  }
  if (target.predecessorExecutorAssignmentId !== action.executorAssignmentId) {
    throw new Error("continuation target predecessor mismatch");
  }
  if (
    target.predecessorExecutorExecutionEvidenceId !== action.executorExecutionEvidenceId
  ) {
    throw new Error("continuation target predecessor evidence mismatch");
  }
  if (target.branch !== action.startingBranch) {
    throw new Error("continuation target branch mismatch");
  }
  if (target.baselineHead.toLowerCase() !== action.startingHead.toLowerCase()) {
    throw new Error("continuation target baseline HEAD mismatch");
  }
  if (target.requireNoPush !== true) {
    throw new Error("continuation target must requireNoPush");
  }
  if (target.commitAuthorization !== false || target.pushAuthorization !== false) {
    throw new Error("continuation target must not grant commit or push");
  }

  // Assignment paths are exactly the governed target paths (already validated at registration
  // against the predecessor). Re-check immutability before freeze.
  const allowedPaths = [...target.allowedPaths];
  const protectedPaths = [...target.protectedPaths];
  if (allowedPaths.length !== target.allowedPaths.length) {
    throw new Error("continuation allowedPaths would broaden target scope");
  }
  if (!isSubsetPaths(allowedPaths, target.allowedPaths)) {
    throw new Error("continuation allowedPaths would broaden target scope");
  }
  if (!includesAllPaths(protectedPaths, target.protectedPaths)) {
    throw new Error("continuation protectedPaths would weaken target protections");
  }

  const lines = [
    "Orchestra governed continuation assignment.",
    `Continuation target: ${target.continuationTargetId}`,
    `Predecessor executor: ${target.predecessorExecutorAssignmentId}`,
    `Verification decision: ${target.verificationDecisionId}`,
    `Post-decision action: ${action.postDecisionActionId}`,
    "",
    target.assignmentText,
    "",
    "Do not invent additional requirements.",
    "Do not broaden allowed paths, weaken protected paths, commit, or push.",
  ];

  return createAssignment({
    assignmentId: continuationAssignmentId(action.postDecisionActionId),
    projectId: target.projectId,
    role: "executor",
    repositoryPath: target.repositoryPath,
    branch: target.branch,
    startingHead: target.baselineHead,
    assignmentText: lines.join("\n"),
    allowedPaths,
    protectedPaths,
    prohibitedCommandClasses: [...target.prohibitedCommandClasses],
    requireNoPush: true,
    commitAuthorization: false,
    pushAuthorization: false,
    requiredEvidence: [...target.requiredEvidence],
    structuredObligations: target.structuredObligations.map((row) => ({
      obligationId: row.obligationId,
      summary: row.summary,
      ...(row.verificationMode === "MACHINE_EVIDENCE" ||
      row.verificationMode === "ACCEPTANCE_CHECK" ||
      row.verificationMode === "HUMAN_JUDGMENT_REQUIRED"
        ? { verificationMode: row.verificationMode }
        : {}),
    })),
    createdAt: action.preparedAt,
  });
}
