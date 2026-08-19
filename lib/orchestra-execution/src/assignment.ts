/**
 * Vendor-neutral Orchestra assignment model.
 * Cursor SDK types must never appear here.
 */

import type { StructuredObligation, VerificationRequirementRef } from "./verification-requirements.js";

export const ASSIGNMENT_ROLES = ["executor", "verifier"] as const;
export type AssignmentRole = (typeof ASSIGNMENT_ROLES)[number];

export const DEFAULT_PROHIBITED_COMMAND_CLASSES = [
  "git_push",
  "force_push",
  "destructive_git",
  "hook_tamper",
] as const;

export type ProhibitedCommandClass = (typeof DEFAULT_PROHIBITED_COMMAND_CLASSES)[number] | string;

export interface OrchestraAssignment {
  assignmentId: string;
  projectId: string;
  role: AssignmentRole;
  repositoryPath: string;
  branch: string;
  startingHead: string;
  assignmentText: string;
  allowedPaths: string[];
  protectedPaths: string[];
  prohibitedCommandClasses: ProhibitedCommandClass[];
  requireNoPush: boolean;
  /**
   * Recorded policy field only in this slice. The adapter never commits.
   */
  commitAuthorization: boolean;
  /**
   * Recorded policy field. Push is never executed by this adapter.
   */
  pushAuthorization: boolean;
  requiredEvidence: string[];
  /**
   * Governed obligations the executor must satisfy. Verifier semantic findings bind to these ids.
   */
  structuredObligations?: StructuredObligation[];
  /**
   * Verifier-only structured requirement catalog for semantic adjudication.
   */
  verificationRequirements?: VerificationRequirementRef[];
  createdAt: string;
}

export interface AssignmentInput {
  assignmentId: string;
  projectId: string;
  role: AssignmentRole;
  repositoryPath: string;
  branch: string;
  startingHead: string;
  assignmentText: string;
  allowedPaths?: string[];
  protectedPaths?: string[];
  prohibitedCommandClasses?: ProhibitedCommandClass[];
  requireNoPush?: boolean;
  commitAuthorization?: boolean;
  pushAuthorization?: boolean;
  requiredEvidence?: string[];
  structuredObligations?: StructuredObligation[];
  verificationRequirements?: VerificationRequirementRef[];
  createdAt?: string;
}

export interface FrozenAssignment {
  readonly assignment: OrchestraAssignment;
  readonly assignmentHash: string;
  readonly canonicalJson: string;
}

function assertNonEmpty(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${name} is required`);
  }
  return trimmed;
}

function uniqueStrings(values: string[] | undefined): string[] {
  if (!values) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function isAssignmentRole(value: unknown): value is AssignmentRole {
  return value === "executor" || value === "verifier";
}

export function normalizeAssignment(input: AssignmentInput): OrchestraAssignment {
  if (!isAssignmentRole(input.role)) {
    throw new Error(`unsupported assignment role: ${String(input.role)}`);
  }
  const prohibited =
    input.prohibitedCommandClasses && input.prohibitedCommandClasses.length > 0
      ? uniqueStrings(input.prohibitedCommandClasses)
      : [...DEFAULT_PROHIBITED_COMMAND_CLASSES];
  return {
    assignmentId: assertNonEmpty("assignmentId", input.assignmentId),
    projectId: assertNonEmpty("projectId", input.projectId),
    role: input.role,
    repositoryPath: assertNonEmpty("repositoryPath", input.repositoryPath),
    branch: assertNonEmpty("branch", input.branch),
    startingHead: assertNonEmpty("startingHead", input.startingHead).toLowerCase(),
    assignmentText: assertNonEmpty("assignmentText", input.assignmentText),
    allowedPaths: uniqueStrings(input.allowedPaths),
    protectedPaths: uniqueStrings(input.protectedPaths),
    prohibitedCommandClasses: prohibited,
    requireNoPush: input.requireNoPush !== false,
    commitAuthorization: input.commitAuthorization === true,
    pushAuthorization: input.pushAuthorization === true,
    requiredEvidence: uniqueStrings(input.requiredEvidence),
    ...(input.structuredObligations && input.structuredObligations.length > 0
      ? {
          structuredObligations: input.structuredObligations.map((row) => ({
            obligationId: assertNonEmpty("obligationId", row.obligationId),
            summary: assertNonEmpty("summary", row.summary),
          })),
        }
      : {}),
    ...(input.verificationRequirements && input.verificationRequirements.length > 0
      ? { verificationRequirements: input.verificationRequirements }
      : {}),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

export function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      sorted[key] = sortKeys(record[key]);
    }
    return sorted;
  }
  return value;
}

export function canonicalizeAssignment(assignment: OrchestraAssignment): string {
  return JSON.stringify(sortKeys(assignment));
}
