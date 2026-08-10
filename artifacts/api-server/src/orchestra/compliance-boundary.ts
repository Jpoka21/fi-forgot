import { createGovernanceTraceability } from "./authority.js";
import { OrchestraConstitutionalError } from "./errors.js";

/**
 * A bound upstream Compliance Boundary reference.
 * Consumed per FI-DSN-GOV-004 without restating upstream law — R22.
 */
export interface ComplianceBoundaryBinding {
  readonly sourceStandardId: string;
  readonly scopeDescription: string;
  readonly boundAt: string;
  readonly boundBy: string;
}

export interface UnresolvedConstraintRecord {
  readonly constraintId: string;
  readonly description: string;
  readonly identifiedAt: string;
  readonly identifiedBy: string;
  readonly sourceReference?: string;
}

const BOUNDARY_REQUIREMENTS = [
  "FI-DSN-STD-012-R21",
  "FI-DSN-STD-012-R22",
  "FI-DSN-STD-012-R23",
] as const;

export function bindComplianceBoundary(input: {
  sourceStandardId: string;
  scopeDescription: string;
  boundBy: string;
  boundAt?: string;
}): ComplianceBoundaryBinding {
  const sourceStandardId = input.sourceStandardId.trim();
  const scopeDescription = input.scopeDescription.trim();

  if (!sourceStandardId) {
    throw new OrchestraConstitutionalError(
      "Compliance Boundary source standard ID is required",
      "invalid_compliance_boundary",
      ["FI-DSN-STD-012-R22"],
    );
  }

  if (!scopeDescription) {
    throw new OrchestraConstitutionalError(
      "Compliance Boundary scope description is required",
      "invalid_compliance_boundary",
      ["FI-DSN-STD-012-R22"],
    );
  }

  return Object.freeze({
    sourceStandardId,
    scopeDescription,
    boundAt: input.boundAt ?? new Date().toISOString(),
    boundBy: input.boundBy,
  });
}

/** R23 — conflicting boundaries must be surfaced, not silently ignored. */
export function detectComplianceBoundaryConflicts(
  bindings: readonly ComplianceBoundaryBinding[],
): UnresolvedConstraintRecord[] {
  const bySource = new Map<string, ComplianceBoundaryBinding[]>();

  for (const binding of bindings) {
    const existing = bySource.get(binding.sourceStandardId) ?? [];
    existing.push(binding);
    bySource.set(binding.sourceStandardId, existing);
  }

  const conflicts: UnresolvedConstraintRecord[] = [];
  const now = new Date().toISOString();

  for (const [sourceStandardId, group] of bySource) {
    if (group.length <= 1) continue;

    const scopes = new Set(group.map((b) => b.scopeDescription));
    if (scopes.size > 1) {
      conflicts.push(
        Object.freeze({
          constraintId: `constraint-conflict-${sourceStandardId}`,
          description: `Conflicting Compliance Boundary scopes for ${sourceStandardId}`,
          identifiedAt: now,
          identifiedBy: "orchestra-compliance-boundary",
          sourceReference: sourceStandardId,
        }),
      );
    }
  }

  return conflicts;
}

/** R21 — bindings must exist before exploration-entry authorization. */
export function validateComplianceBoundariesForExplorationEntry(
  bindings: readonly ComplianceBoundaryBinding[],
): void {
  if (bindings.length === 0) {
    throw new OrchestraConstitutionalError(
      "Exploration-Entry Authorization requires bound Compliance Boundaries",
      "invalid_exploration_entry",
      ["FI-DSN-STD-012-R21", "FI-DSN-STD-012-R27"],
    );
  }
}

export const COMPLIANCE_BOUNDARY_TRACEABILITY = createGovernanceTraceability([
  ...BOUNDARY_REQUIREMENTS,
]);
