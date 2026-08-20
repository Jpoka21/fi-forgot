import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, normalize, relative, sep } from "node:path";
import type { FrozenAcceptanceCheckSpec } from "../verification-requirements.js";
import type { ExecutionEvidence, FrozenAssignmentRecord } from "./types.js";

export interface AcceptanceCheckEvaluation {
  outcome: "requirement_satisfied" | "requirement_failed" | "evidence_insufficient";
  reasonCode: string;
  observed: Record<string, string | boolean | number | null>;
  outputDigest: string | null;
}

function assertSafeRelativePath(repositoryPath: string, relativePath: string): string {
  const cleaned = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!cleaned || cleaned.includes("..") || isAbsolute(cleaned)) {
    throw new Error("acceptance check path refused");
  }
  const full = normalize(join(repositoryPath, cleaned));
  const root = normalize(repositoryPath);
  const rel = relative(root, full);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error("acceptance check path escaped repository");
  }
  // Windows: ensure same drive
  if (full.split(sep)[0] !== root.split(sep)[0] && /^[A-Za-z]:/.test(full)) {
    if (!full.toLowerCase().startsWith(root.toLowerCase())) {
      throw new Error("acceptance check path escaped repository");
    }
  }
  return full;
}

function digestUtf8(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/**
 * Evaluate a frozen acceptance check via Orchestra-controlled machinery.
 * Provider proposals are never consulted.
 */
export function evaluateFrozenAcceptanceCheck(input: {
  spec: FrozenAcceptanceCheckSpec;
  executorRecord: FrozenAssignmentRecord;
  executorEvidence: ExecutionEvidence;
}): AcceptanceCheckEvaluation {
  const assignment = input.executorRecord.frozen.assignment;
  const result = input.executorEvidence.result;
  const spec = input.spec;

  if (spec.checkKind === "executor_changed_paths_includes") {
    const path = String(spec.parameters.path ?? "");
    if (!path) {
      return { outcome: "evidence_insufficient", reasonCode: "acceptance_parameters_incomplete", observed: {}, outputDigest: null };
    }
    const present = result.changedPaths.map((row) => row.replace(/\\/g, "/")).includes(path.replace(/\\/g, "/"));
    const expected = Boolean(spec.expectedResult.contains ?? true);
    if (present === expected) {
      return {
        outcome: "requirement_satisfied",
        reasonCode: "acceptance_changed_paths_matched",
        observed: { path, present },
        outputDigest: digestUtf8(JSON.stringify(result.changedPaths.slice().sort())),
      };
    }
    return {
      outcome: "requirement_failed",
      reasonCode: "acceptance_changed_paths_mismatch",
      observed: { path, present },
      outputDigest: digestUtf8(JSON.stringify(result.changedPaths.slice().sort())),
    };
  }

  if (spec.checkKind === "executor_protected_mutation_absent") {
    const expectedAbsent = Boolean(spec.expectedResult.absent ?? true);
    const absent = !result.protectedPathMutationOccurred;
    if (absent === expectedAbsent) {
      return {
        outcome: "requirement_satisfied",
        reasonCode: "acceptance_protected_mutation_absent",
        observed: { protectedPathMutationOccurred: result.protectedPathMutationOccurred },
        outputDigest: null,
      };
    }
    return {
      outcome: "requirement_failed",
      reasonCode: "acceptance_protected_mutation_present",
      observed: { protectedPathMutationOccurred: result.protectedPathMutationOccurred },
      outputDigest: null,
    };
  }

  if (spec.checkKind === "filesystem_contains" || spec.checkKind === "filesystem_not_contains") {
    const relativePath = String(spec.parameters.path ?? "");
    const substring = String(spec.parameters.substring ?? "");
    if (!relativePath || !substring) {
      return { outcome: "evidence_insufficient", reasonCode: "acceptance_parameters_incomplete", observed: {}, outputDigest: null };
    }
    let fullPath: string;
    try {
      fullPath = assertSafeRelativePath(assignment.repositoryPath, relativePath);
    } catch {
      return { outcome: "evidence_insufficient", reasonCode: "acceptance_path_refused", observed: {}, outputDigest: null };
    }
    if (!existsSync(fullPath)) {
      return {
        outcome: "evidence_insufficient",
        reasonCode: "acceptance_file_missing",
        observed: { path: relativePath, exists: false },
        outputDigest: null,
      };
    }
    const content = readFileSync(fullPath, "utf8");
    const contains = content.includes(substring);
    const digest = digestUtf8(content);
    if (spec.checkKind === "filesystem_contains") {
      const expected = Boolean(spec.expectedResult.contains ?? true);
      if (contains === expected) {
        return {
          outcome: "requirement_satisfied",
          reasonCode: "acceptance_filesystem_contains_matched",
          observed: { path: relativePath, contains },
          outputDigest: digest,
        };
      }
      return {
        outcome: "requirement_failed",
        reasonCode: "acceptance_filesystem_contains_mismatch",
        observed: { path: relativePath, contains },
        outputDigest: digest,
      };
    }
    const expectedAbsent = Boolean(spec.expectedResult.contains === false || spec.expectedResult.absent === true);
    if ((!contains) === expectedAbsent || (contains === false && expectedAbsent)) {
      if (!contains) {
        return {
          outcome: "requirement_satisfied",
          reasonCode: "acceptance_filesystem_not_contains_matched",
          observed: { path: relativePath, contains },
          outputDigest: digest,
        };
      }
    }
    if (!contains) {
      return {
        outcome: "requirement_satisfied",
        reasonCode: "acceptance_filesystem_not_contains_matched",
        observed: { path: relativePath, contains },
        outputDigest: digest,
      };
    }
    return {
      outcome: "requirement_failed",
      reasonCode: "acceptance_filesystem_not_contains_mismatch",
      observed: { path: relativePath, contains },
      outputDigest: digest,
    };
  }

  return {
    outcome: "evidence_insufficient",
    reasonCode: "acceptance_check_kind_unsupported",
    observed: {},
    outputDigest: null,
  };
}
