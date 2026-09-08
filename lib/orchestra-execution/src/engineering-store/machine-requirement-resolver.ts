import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { VerificationRequirementRef } from "../verification-requirements.js";
import type { ExecutionEvidence, FrozenAssignmentRecord, VerifierRequirementOutcome } from "./types.js";

function pushKnown(result: ExecutionEvidence["result"]): boolean {
  return result.pushKnown || result.pushIndependentlyEvidenced;
}

function commitKnown(result: ExecutionEvidence["result"]): boolean {
  return result.commitKnown || result.commitOccurred;
}

function isBaselineMismatch(result: ExecutionEvidence["result"]): boolean {
  return (
    result.unexpectedChanges.includes("starting_head_mismatch") ||
    result.unexpectedChanges.includes("branch_mismatch")
  );
}

function isScopeViolation(result: ExecutionEvidence["result"]): boolean {
  if (result.unexpectedChanges.length === 0) return false;
  return result.unexpectedChanges.some(
    (item) => item !== "starting_head_mismatch" && item !== "branch_mismatch",
  );
}

/**
 * Derive authoritative MACHINE_RESOLVABLE outcomes from trusted Orchestra evidence only.
 * Provider proposals are never consulted.
 */
export function resolveMachineRequirement(input: {
  requirement: VerificationRequirementRef;
  executorRecord: FrozenAssignmentRecord;
  executorEvidence: ExecutionEvidence;
  verifierRecord?: FrozenAssignmentRecord;
  verifierEvidence?: ExecutionEvidence;
}): { outcome: VerifierRequirementOutcome; reasonCode: string; evidenceReferences: string[] } {
  const assignment = input.executorRecord.frozen.assignment;
  const result = input.executorEvidence.result;
  const refs = [
    `orchestra:executor_evidence:${input.executorEvidence.evidenceId}`,
    `orchestra:assignment:frozen:${assignment.assignmentId}`,
  ];

  switch (input.requirement.requirementKind) {
    case "repository_identity": {
      if (!result.postRunGitEvidence?.head || !result.postRunGitEvidence.branch) {
        return { outcome: "evidence_insufficient", reasonCode: "unknown_repository_identity", evidenceReferences: refs };
      }
      if (
        result.postRunGitEvidence.branch !== assignment.branch ||
        result.unexpectedChanges.includes("branch_mismatch")
      ) {
        return { outcome: "requirement_failed", reasonCode: "repository_identity_mismatch", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "repository_identity_matched", evidenceReferences: refs };
    }
    case "repository_scope": {
      if (isScopeViolation(result)) {
        return { outcome: "requirement_failed", reasonCode: "scope_violation", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "scope_clean", evidenceReferences: refs };
    }
    case "protected_paths": {
      if (result.protectedPathMutationOccurred) {
        return { outcome: "requirement_failed", reasonCode: "protected_path_mutation", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "protected_paths_intact", evidenceReferences: refs };
    }
    case "git_posture": {
      if (!result.postRunGitEvidence) {
        return { outcome: "evidence_insufficient", reasonCode: "unknown_git_posture", evidenceReferences: refs };
      }
      if (assignment.requireNoPush && !pushKnown(result)) {
        return { outcome: "evidence_insufficient", reasonCode: "unknown_push_evidence", evidenceReferences: refs };
      }
      if (!assignment.commitAuthorization && !commitKnown(result)) {
        return { outcome: "evidence_insufficient", reasonCode: "unknown_commit_evidence", evidenceReferences: refs };
      }
      if (result.commitOccurred && assignment.commitAuthorization !== true) {
        return { outcome: "requirement_failed", reasonCode: "unauthorized_commit", evidenceReferences: refs };
      }
      if (result.pushIndependentlyEvidenced && assignment.requireNoPush) {
        return { outcome: "requirement_failed", reasonCode: "unauthorized_push", evidenceReferences: refs };
      }
      if (isBaselineMismatch(result)) {
        return { outcome: "requirement_failed", reasonCode: "git_baseline_mismatch", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "git_posture_clean", evidenceReferences: refs };
    }
    case "executor_evidence_linkage": {
      if (
        input.executorEvidence.assignmentId !== assignment.assignmentId ||
        input.executorEvidence.assignmentHash !== input.executorRecord.frozen.assignmentHash
      ) {
        return { outcome: "requirement_failed", reasonCode: "executor_evidence_linkage_broken", evidenceReferences: refs };
      }
      return { outcome: "requirement_satisfied", reasonCode: "executor_evidence_linked", evidenceReferences: refs };
    }
    case "required_evidence": {
      const missing = input.executorEvidence.requiredEvidenceMissing;
      if (missing.length > 0) {
        const deferredCommands = missing.map((item) => {
          const separator = item.indexOf(":");
          const key = item.toLowerCase();
          if (key === "test") return "npm test";
          if (!key.startsWith("test:") || separator < 0) return null;
          return item.slice(separator + 1).trim() || null;
        });
        const verifierRequirements = input.verifierRecord?.frozen.assignment.verificationRequirements ?? [];
        const commandRequirements = verifierRequirements.filter(
          (row) => row.requirementKind === "required_tests" && row.commandRequirement,
        );
        const exactCorrespondence =
          deferredCommands.every((command): command is string => command !== null) &&
          commandRequirements.length === deferredCommands.length &&
          deferredCommands.every((command) =>
            commandRequirements.filter((row) => row.commandRequirement!.command === command).length === 1,
          );
        if (exactCorrespondence) {
          const commandOutcomes = commandRequirements.map((requirement) =>
            resolveMachineRequirement({ ...input, requirement }),
          );
          if (commandOutcomes.every((finding) => finding.outcome === "requirement_satisfied")) {
            return {
              outcome: "requirement_satisfied",
              reasonCode: "required_evidence_present",
              evidenceReferences: [...refs, ...new Set(commandOutcomes.flatMap((finding) => finding.evidenceReferences))],
            };
          }
        }
        return {
          outcome: "evidence_insufficient",
          reasonCode: "required_evidence_missing",
          evidenceReferences: refs,
        };
      }
      return { outcome: "requirement_satisfied", reasonCode: "required_evidence_present", evidenceReferences: refs };
    }
    case "required_tests": {
      const expected = input.requirement.commandRequirement;
      const verifier = input.verifierRecord;
      const verifierEvidence = input.verifierEvidence;
      if (!expected || !verifier || !verifierEvidence) {
        return { outcome: "evidence_insufficient", reasonCode: "trusted_test_evidence_unavailable", evidenceReferences: refs };
      }
      const expectedSet = (verifier.frozen.assignment.verificationRequirements ?? [])
        .flatMap((row) => row.commandRequirement ? [row.commandRequirement] : []);
      if (expectedSet.length === 0 || new Set(expectedSet.map((row) => row.checkId)).size !== expectedSet.length) {
        return { outcome: "requirement_failed", reasonCode: "test_command_check_ids_invalid", evidenceReferences: refs };
      }
      if (expectedSet.some((row) =>
        row.verifierAssignmentId !== verifier.frozen.assignment.assignmentId ||
        row.executorAssignmentId !== assignment.assignmentId ||
        row.executorExecutionEvidenceId !== input.executorEvidence.evidenceId) ||
        verifier.relationship.verifiesAssignmentId !== assignment.assignmentId ||
        verifier.relationship.verifiesExecutionEvidenceId !== input.executorEvidence.evidenceId
      ) {
        return { outcome: "requirement_failed", reasonCode: "test_command_relationship_mismatch", evidenceReferences: refs };
      }
      if (expectedSet.some((row) => row.repositoryPath !== assignment.repositoryPath) || verifier.frozen.assignment.repositoryPath !== assignment.repositoryPath) {
        return { outcome: "requirement_failed", reasonCode: "repository_identity_mismatch", evidenceReferences: refs };
      }
      if (expectedSet.some((row) => row.startingHead !== assignment.startingHead || verifier.frozen.assignment.startingHead !== row.startingHead)) {
        return { outcome: "requirement_failed", reasonCode: "git_baseline_mismatch", evidenceReferences: refs };
      }
      const commandEvents = verifierEvidence.result.normalizedEvents.filter((event) => event.commandExecution);
      if (commandEvents.length === 0) {
        return { outcome: "evidence_insufficient", reasonCode: "trusted_test_evidence_unavailable", evidenceReferences: refs };
      }
      const knownIds = new Set(expectedSet.map((row) => row.checkId));
      if (expectedSet.length > 1 && commandEvents.some((event) => {
        const ids = event.commandExecution!.requiredCheckIds;
        return ids !== undefined && (ids.length !== 1 || !knownIds.has(ids[0]!));
      })) {
        return { outcome: "requirement_failed", reasonCode: "test_command_check_id_mismatch", evidenceReferences: refs };
      }
      const relevant = commandEvents.filter((event) => event.commandExecution!.requiredCheckIds?.[0] === expected.checkId);
      if (relevant.length === 0) {
        return { outcome: "evidence_insufficient", reasonCode: "required_test_command_missing", evidenceReferences: refs };
      }
      if (commandEvents.some((event) => event.commandExecution!.phase === "completed") &&
          !commandEvents.some((event) => event.commandExecution!.phase === "completed" && event.commandExecution!.requiredCheckIds?.includes(expected.checkId))) {
        return { outcome: "evidence_insufficient", reasonCode: "required_test_command_missing", evidenceReferences: refs };
      }
      const starts = relevant.filter((event) => event.commandExecution!.phase === "started");
      const completions = relevant.filter((event) => event.commandExecution!.phase === "completed");
      if (starts.length === 0) return { outcome: "evidence_insufficient", reasonCode: "test_command_start_missing", evidenceReferences: refs };
      if (completions.length === 0) return { outcome: "evidence_insufficient", reasonCode: "test_command_completion_missing", evidenceReferences: refs };
      if (starts.length !== 1 || completions.length !== 1) {
        return { outcome: "requirement_failed", reasonCode: "test_command_duplicate_satisfaction", evidenceReferences: refs };
      }
      const start = starts[0]!;
      const completion = completions.find((event) => event.commandExecution!.commandId === start.commandExecution!.commandId);
      if (!completion || !start.correlation?.toolUseId || start.correlation.toolUseId !== completion.correlation?.toolUseId ||
          start.correlation.runId !== completion.correlation?.runId || start.correlation.sessionId !== completion.correlation?.sessionId ||
          start.correlation.runId !== verifierEvidence.result.runId || start.correlation.sessionId !== verifierEvidence.result.providerSessionId) {
        return { outcome: "evidence_insufficient", reasonCode: "test_command_correlation_malformed", evidenceReferences: refs };
      }
      for (const event of [start, completion]) {
        const row = event.commandExecution!;
        if (row.requiredCheckIds?.length !== 1 || row.requiredCheckIds[0] !== expected.checkId ||
            row.command !== expected.command || row.verifierAssignmentId !== expected.verifierAssignmentId || row.executorAssignmentId !== expected.executorAssignmentId ||
            row.executorExecutionEvidenceId !== expected.executorExecutionEvidenceId || row.repositoryPath !== expected.repositoryPath ||
            row.startingHead !== expected.startingHead || row.workingDirectory !== expected.workingDirectory ||
            JSON.stringify(row.invocation) !== JSON.stringify(expected.invocation)) {
          return { outcome: "requirement_failed", reasonCode: "test_command_binding_mismatch", evidenceReferences: refs };
        }
        if (JSON.stringify(row.candidatePaths) !== JSON.stringify(expected.candidatePaths) ||
            JSON.stringify(row.candidateContentSha256) !== JSON.stringify(expected.candidateContentSha256)) {
          return { outcome: "requirement_failed", reasonCode: "candidate_drift_before_verifier_execution", evidenceReferences: refs };
        }
      }
      const completed = completion.commandExecution!;
      if (completed.status !== expected.expectedStatus || completed.exitCode !== expected.expectedExitCode) {
        return { outcome: "requirement_failed", reasonCode: "test_command_exit_nonzero", evidenceReferences: refs };
      }
      for (const path of expected.candidatePaths) {
        let actual: string | null = null;
        try { actual = createHash("sha256").update(readFileSync(join(expected.repositoryPath, path))).digest("hex"); } catch { /* missing */ }
        if (actual !== expected.candidateContentSha256[path]) {
          return { outcome: "requirement_failed", reasonCode: "candidate_drift_before_adjudication", evidenceReferences: refs };
        }
      }
      const startOrder = commandEvents
        .filter((event) => event.commandExecution!.phase === "started" && event.commandExecution!.requiredCheckIds?.length === 1)
        .map((event) => event.commandExecution!.requiredCheckIds![0]);
      const expectedOrder = expectedSet.map((row) => row.checkId);
      if (JSON.stringify(startOrder) !== JSON.stringify(expectedOrder)) {
        return { outcome: "requirement_failed", reasonCode: "test_command_check_order_mismatch", evidenceReferences: refs };
      }
      for (const required of expectedSet) {
        const events = commandEvents.filter((event) => event.commandExecution!.requiredCheckIds?.[0] === required.checkId);
        if (events.filter((event) => event.commandExecution!.phase === "started").length !== 1 ||
            events.filter((event) => event.commandExecution!.phase === "completed").length !== 1) {
          return { outcome: "evidence_insufficient", reasonCode: "required_test_command_missing", evidenceReferences: refs };
        }
      }
      return { outcome: "requirement_satisfied", reasonCode: "trusted_test_command_evidence_satisfied", evidenceReferences: [...refs, `orchestra:verifier_evidence:${verifierEvidence.evidenceId}`] };
    }
    default:
      return { outcome: "requirement_not_evaluated", reasonCode: "not_machine_resolvable", evidenceReferences: refs };
  }
}
