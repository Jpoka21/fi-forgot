import type { NormalizedExecutionEvent } from "./events.js";

export const VERIFIER_REQUIREMENT_OUTCOMES = [
  "requirement_satisfied",
  "requirement_failed",
  "requirement_not_evaluated",
  "evidence_insufficient",
] as const;

export type VerifierRequirementOutcome = (typeof VERIFIER_REQUIREMENT_OUTCOMES)[number];

export const STRUCTURED_FINDING_SCHEMA_VERSION = 1 as const;

export interface ParsedStructuredFindingEvent {
  requirementId: string;
  outcome: VerifierRequirementOutcome;
  reasonCode: string;
  evidenceReferences: string[];
  eventTimestamp: string;
}

export function parseStructuredFindingEvent(
  event: NormalizedExecutionEvent,
): ParsedStructuredFindingEvent | null {
  if (event.type !== "verification_finding") return null;
  const summary = event.rawSummary;
  if (!summary || summary.orchestraStructuredFinding !== true) return null;
  if (summary.schemaVersion !== STRUCTURED_FINDING_SCHEMA_VERSION) return null;
  if (typeof summary.requirementId !== "string" || !summary.requirementId.trim()) return null;
  if (
    typeof summary.outcome !== "string" ||
    !(VERIFIER_REQUIREMENT_OUTCOMES as readonly string[]).includes(summary.outcome)
  ) {
    return null;
  }
  if (typeof summary.reasonCode !== "string" || !summary.reasonCode.trim()) return null;
  const evidenceReferences = Array.isArray(summary.evidenceReferences)
    ? summary.evidenceReferences.filter((item): item is string => typeof item === "string")
    : [];
  return {
    requirementId: summary.requirementId.trim(),
    outcome: summary.outcome as VerifierRequirementOutcome,
    reasonCode: summary.reasonCode.trim(),
    evidenceReferences,
    eventTimestamp: event.timestamp,
  };
}

export function structuredFindingEvent(input: {
  requirementId: string;
  outcome: VerifierRequirementOutcome;
  reasonCode: string;
  evidenceReferences?: string[];
  timestamp?: string;
}): NormalizedExecutionEvent {
  return {
    type: "verification_finding",
    timestamp: input.timestamp ?? new Date().toISOString(),
    rawSummary: {
      orchestraStructuredFinding: true,
      schemaVersion: STRUCTURED_FINDING_SCHEMA_VERSION,
      requirementId: input.requirementId,
      outcome: input.outcome,
      reasonCode: input.reasonCode,
      evidenceReferences: input.evidenceReferences ?? [],
    },
  };
}
