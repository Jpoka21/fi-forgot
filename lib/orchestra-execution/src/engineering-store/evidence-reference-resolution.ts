import type { FrozenAssignment } from "../assignment.js";
import type { ExecutionEvidence, FrozenAssignmentRecord } from "./types.js";

export const EVIDENCE_REFERENCE_KINDS = [
  "executor_evidence",
  "verifier_evidence",
  "git_pre_run",
  "git_post_run",
  "frozen_assignment",
  "obligation",
  "required_evidence_item",
] as const;

export type EvidenceReferenceKind = (typeof EVIDENCE_REFERENCE_KINDS)[number];

export interface ResolvedEvidenceReference {
  raw: string;
  kind: EvidenceReferenceKind;
  targetId: string | null;
}

export function formatEvidenceReference(kind: EvidenceReferenceKind, targetId?: string): string {
  switch (kind) {
    case "executor_evidence":
      return `orchestra:executor_evidence:${targetId ?? ""}`;
    case "verifier_evidence":
      return `orchestra:verifier_evidence:${targetId ?? ""}`;
    case "git_pre_run":
      return "orchestra:git:pre_run";
    case "git_post_run":
      return "orchestra:git:post_run";
    case "frozen_assignment":
      return `orchestra:assignment:frozen:${targetId ?? ""}`;
    case "obligation":
      return `orchestra:obligation:${targetId ?? ""}`;
    case "required_evidence_item":
      return `orchestra:required_evidence:${targetId ?? ""}`;
  }
}

export function parseEvidenceReference(raw: string): { kind: EvidenceReferenceKind; targetId: string | null } | null {
  const value = raw.trim();
  if (!value.startsWith("orchestra:")) return null;
  const rest = value.slice("orchestra:".length);
  if (rest === "git:pre_run") return { kind: "git_pre_run", targetId: null };
  if (rest === "git:post_run") return { kind: "git_post_run", targetId: null };
  const executor = /^executor_evidence:(.+)$/.exec(rest);
  if (executor) return { kind: "executor_evidence", targetId: executor[1]! };
  const verifier = /^verifier_evidence:(.+)$/.exec(rest);
  if (verifier) return { kind: "verifier_evidence", targetId: verifier[1]! };
  const assignment = /^assignment:frozen:(.+)$/.exec(rest);
  if (assignment) return { kind: "frozen_assignment", targetId: assignment[1]! };
  const obligation = /^obligation:(.+)$/.exec(rest);
  if (obligation) return { kind: "obligation", targetId: obligation[1]! };
  const required = /^required_evidence:(.+)$/.exec(rest);
  if (required) return { kind: "required_evidence_item", targetId: required[1]! };
  return null;
}

export interface EvidenceResolutionContext {
  executorRecord: FrozenAssignmentRecord;
  executorEvidence: ExecutionEvidence;
  verifierEvidences: ExecutionEvidence[];
  proposingVerifierExecutionEvidenceId: string;
}

/**
 * Resolve proposal evidence references against trusted store objects.
 * Empty, malformed, prose-only, self-only, or cross-assignment refs do not support satisfaction.
 */
export function resolveEvidenceReferences(
  refs: string[],
  context: EvidenceResolutionContext,
): { resolved: ResolvedEvidenceReference[]; validForSemanticSatisfaction: boolean; reason: string | null } {
  if (!refs.length) {
    return { resolved: [], validForSemanticSatisfaction: false, reason: "empty_evidence_references" };
  }
  const resolved: ResolvedEvidenceReference[] = [];
  let hasNonSelfAuthoritative = false;
  for (const raw of refs) {
    const parsed = parseEvidenceReference(raw);
    if (!parsed) {
      return { resolved, validForSemanticSatisfaction: false, reason: "malformed_evidence_reference" };
    }
    if (parsed.kind === "executor_evidence") {
      if (parsed.targetId !== context.executorEvidence.evidenceId) {
        return { resolved, validForSemanticSatisfaction: false, reason: "cross_assignment_evidence_reference" };
      }
      resolved.push({ raw, kind: parsed.kind, targetId: parsed.targetId });
      hasNonSelfAuthoritative = true;
      continue;
    }
    if (parsed.kind === "verifier_evidence") {
      const match = context.verifierEvidences.find((row) => row.evidenceId === parsed.targetId);
      if (!match) {
        return { resolved, validForSemanticSatisfaction: false, reason: "nonexistent_evidence_reference" };
      }
      if (match.assignmentId === context.executorRecord.frozen.assignment.assignmentId) {
        return { resolved, validForSemanticSatisfaction: false, reason: "cross_assignment_evidence_reference" };
      }
      resolved.push({ raw, kind: parsed.kind, targetId: parsed.targetId });
      if (parsed.targetId !== context.proposingVerifierExecutionEvidenceId) {
        hasNonSelfAuthoritative = true;
      }
      continue;
    }
    if (parsed.kind === "git_pre_run") {
      if (!context.executorEvidence.result.preRunGitEvidence) {
        return { resolved, validForSemanticSatisfaction: false, reason: "nonexistent_evidence_reference" };
      }
      resolved.push({ raw, kind: parsed.kind, targetId: null });
      hasNonSelfAuthoritative = true;
      continue;
    }
    if (parsed.kind === "git_post_run") {
      if (!context.executorEvidence.result.postRunGitEvidence) {
        return { resolved, validForSemanticSatisfaction: false, reason: "nonexistent_evidence_reference" };
      }
      resolved.push({ raw, kind: parsed.kind, targetId: null });
      hasNonSelfAuthoritative = true;
      continue;
    }
    if (parsed.kind === "frozen_assignment") {
      if (parsed.targetId !== context.executorRecord.frozen.assignment.assignmentId) {
        return { resolved, validForSemanticSatisfaction: false, reason: "cross_assignment_evidence_reference" };
      }
      resolved.push({ raw, kind: parsed.kind, targetId: parsed.targetId });
      hasNonSelfAuthoritative = true;
      continue;
    }
    if (parsed.kind === "obligation") {
      const obligations = context.executorRecord.frozen.assignment.structuredObligations ?? [];
      if (!obligations.some((row) => row.obligationId === parsed.targetId)) {
        return { resolved, validForSemanticSatisfaction: false, reason: "nonexistent_evidence_reference" };
      }
      resolved.push({ raw, kind: parsed.kind, targetId: parsed.targetId });
      hasNonSelfAuthoritative = true;
      continue;
    }
    if (parsed.kind === "required_evidence_item") {
      if (!context.executorRecord.frozen.assignment.requiredEvidence.includes(parsed.targetId ?? "")) {
        return { resolved, validForSemanticSatisfaction: false, reason: "nonexistent_evidence_reference" };
      }
      resolved.push({ raw, kind: parsed.kind, targetId: parsed.targetId });
      hasNonSelfAuthoritative = true;
    }
  }
  if (!hasNonSelfAuthoritative) {
    return {
      resolved,
      validForSemanticSatisfaction: false,
      reason: "self_referential_evidence_only",
    };
  }
  return { resolved, validForSemanticSatisfaction: true, reason: null };
}

export function defaultSemanticEvidenceReferences(
  executor: FrozenAssignment,
  executorEvidenceId: string,
  obligationId?: string,
): string[] {
  const refs = [
    formatEvidenceReference("executor_evidence", executorEvidenceId),
    formatEvidenceReference("frozen_assignment", executor.assignment.assignmentId),
  ];
  if (obligationId) {
    refs.push(formatEvidenceReference("obligation", obligationId));
  }
  return refs;
}
