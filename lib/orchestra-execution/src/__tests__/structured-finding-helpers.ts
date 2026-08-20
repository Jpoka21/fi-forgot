import type { VerificationRequirementRef } from "../verification-requirements.js";
import { structuredFindingEvent } from "../structured-finding-event.js";
import type { NormalizedExecutionEvent } from "../events.js";
import type { VerifierRequirementOutcome } from "../engineering-store/types.js";
import { defaultSemanticEvidenceReferences } from "../engineering-store/evidence-reference-resolution.js";
import type { FrozenAssignment } from "../assignment.js";

export function structuredFindingEventsForRequirements(
  requirements: VerificationRequirementRef[],
  outcome: VerifierRequirementOutcome = "requirement_satisfied",
  reasonCode = "independent_inspection",
  evidenceReferences: string[] = [],
): NormalizedExecutionEvent[] {
  return requirements
    .filter((requirement) => requirement.requirementClass === "SEMANTIC_REVIEW_REQUIRED")
    .map((requirement) =>
      structuredFindingEvent({
        requirementId: requirement.requirementId,
        outcome,
        reasonCode: `${reasonCode}:${requirement.requirementId}`,
        evidenceReferences,
      }),
    );
}

export function allSemanticObligationsSatisfiedEvents(
  requirements: VerificationRequirementRef[],
  executor: FrozenAssignment,
  executorEvidenceId: string,
): NormalizedExecutionEvent[] {
  return requirements
    .filter((requirement) => requirement.requirementClass === "SEMANTIC_REVIEW_REQUIRED")
    .map((requirement) =>
      structuredFindingEvent({
        requirementId: requirement.requirementId,
        outcome: "requirement_satisfied",
        reasonCode: `independent_inspection:${requirement.requirementId}`,
        evidenceReferences: defaultSemanticEvidenceReferences(
          executor,
          executorEvidenceId,
          requirement.obligationId,
        ),
      }),
    );
}

export function allRequirementsSatisfiedEvents(
  requirements: VerificationRequirementRef[],
  evidenceReferences: string[] = [],
): NormalizedExecutionEvent[] {
  return structuredFindingEventsForRequirements(
    requirements,
    "requirement_satisfied",
    "independent_inspection",
    evidenceReferences,
  );
}
