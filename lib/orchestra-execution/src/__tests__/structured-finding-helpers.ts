import type { VerificationRequirementRef } from "../verification-requirements.js";
import { structuredFindingEvent } from "../structured-finding-event.js";
import type { NormalizedExecutionEvent } from "../events.js";
import type { VerifierRequirementOutcome } from "../engineering-store/types.js";

export function structuredFindingEventsForRequirements(
  requirements: VerificationRequirementRef[],
  outcome: VerifierRequirementOutcome = "requirement_satisfied",
  reasonCode = "independent_inspection",
): NormalizedExecutionEvent[] {
  return requirements.map((requirement) =>
    structuredFindingEvent({
      requirementId: requirement.requirementId,
      outcome,
      reasonCode: `${reasonCode}:${requirement.requirementId}`,
    }),
  );
}

export function allRequirementsSatisfiedEvents(
  requirements: VerificationRequirementRef[],
): NormalizedExecutionEvent[] {
  return structuredFindingEventsForRequirements(requirements, "requirement_satisfied");
}
