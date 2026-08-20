import { createAssignment } from "../assignment-hash.js";
import type { FrozenAssignment, OrchestraAssignment } from "../assignment.js";
import type { PostDecisionActionRecord, VerificationDecisionRecord } from "./types.js";

export function correctionAssignmentId(postDecisionActionId: string): string {
  return `corr-${postDecisionActionId}`;
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
 * Build a bounded correction executor assignment from authoritative PDA context.
 * Never broadens original scope, commit, or push authority.
 */
export function buildCorrectionAssignmentFromPreparedAction(input: {
  action: PostDecisionActionRecord;
  decision: VerificationDecisionRecord;
  originalExecutor: OrchestraAssignment;
}): FrozenAssignment {
  const action = input.action;
  const original = input.originalExecutor;
  if (action.preparedAction !== "PREPARE_CORRECTION") {
    throw new Error("correction assignment requires PREPARE_CORRECTION");
  }
  if (input.decision.decision !== "CORRECTION_REQUIRED") {
    throw new Error("correction assignment requires CORRECTION_REQUIRED decision");
  }
  if (!action.startingBranch || !action.startingHead) {
    throw new Error("correction assignment requires starting branch and HEAD");
  }

  const allowedPaths = [...action.allowedPaths];
  const protectedPaths = [...action.protectedPaths];
  if (!isSubsetPaths(allowedPaths, original.allowedPaths)) {
    throw new Error("correction allowedPaths would broaden original scope");
  }
  if (!includesAllPaths(protectedPaths, original.protectedPaths)) {
    throw new Error("correction protectedPaths would weaken original protections");
  }

  // Never broaden commit/push authority.
  const commitAuthorization = false;
  const pushAuthorization = false;
  const requireNoPush = true;

  const lines = [
    "Orchestra governed correction assignment.",
    `Corrects executor assignment: ${original.assignmentId}`,
    `Verification decision: ${input.decision.verificationDecisionId}`,
    `Post-decision action: ${action.postDecisionActionId}`,
    "",
    "Failed requirement IDs:",
    ...(action.failedRequirementIds.length > 0
      ? action.failedRequirementIds.map((id) => `- ${id}`)
      : ["- (none)"]),
    "",
    "Failed acceptance check IDs:",
    ...(action.acceptanceCheckIds.length > 0
      ? action.acceptanceCheckIds.map((id) => `- ${id}`)
      : ["- (none)"]),
    "",
    "Machine violation reason codes:",
    ...(action.machineViolationReasonCodes.length > 0
      ? action.machineViolationReasonCodes.map((id) => `- ${id}`)
      : ["- (none)"]),
    "",
    "Authoritative evidence locators:",
    `- executor_evidence:${action.executorExecutionEvidenceId}`,
    `- verification_decision:${action.verificationDecisionId}`,
    "",
    "Do not broaden allowed paths, weaken protected paths, commit, or push.",
    "Satisfy only the failed obligations listed above within original scope.",
  ];

  return createAssignment({
    assignmentId: correctionAssignmentId(action.postDecisionActionId),
    projectId: original.projectId,
    role: "executor",
    repositoryPath: original.repositoryPath,
    branch: action.startingBranch,
    startingHead: action.startingHead,
    assignmentText: lines.join("\n"),
    allowedPaths,
    protectedPaths,
    prohibitedCommandClasses: [...original.prohibitedCommandClasses],
    requireNoPush,
    commitAuthorization,
    pushAuthorization,
    requiredEvidence: [...original.requiredEvidence],
    structuredObligations: original.structuredObligations
      ? original.structuredObligations.filter((row) =>
          action.failedRequirementIds.includes(`req:obligation:${row.obligationId}`),
        )
      : undefined,
    createdAt: action.preparedAt,
  });
}
