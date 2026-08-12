/**
 * EGWG — Enumerated Governed Withholding Grounds (FI-DSN-STD-014-R39–R40).
 */

import { OrchestraConstitutionalError } from "./errors.js";
import type { ApprovalWithholdingGroundFamily } from "./domain3-types.js";

export const MANDATORY_APPROVAL_WITHHOLDING_GROUND_FAMILIES: readonly ApprovalWithholdingGroundFamily[] =
  Object.freeze([
    "bound_governing_prerequisites_not_satisfied",
    "authority_or_provenance_defects",
    "unresolved_production_program_or_obligation_conflicts",
  ]);

export function isMandatoryApprovalWithholdingGroundFamily(
  value: unknown,
): value is ApprovalWithholdingGroundFamily {
  return (
    typeof value === "string" &&
    (MANDATORY_APPROVAL_WITHHOLDING_GROUND_FAMILIES as readonly string[]).includes(value)
  );
}

export function assertApprovalWithholdingGroundFamily(
  groundFamily: unknown,
  additionalGoverningSourceId?: string | null,
): asserts groundFamily is ApprovalWithholdingGroundFamily {
  if (!isMandatoryApprovalWithholdingGroundFamily(groundFamily)) {
    const extension = additionalGoverningSourceId?.trim();
    if (!extension) {
      throw new OrchestraConstitutionalError(
        "Approval withholding requires a mandatory EGWG ground family or an additional ground traceable to authoritative frozen governance",
        "invalid_approval_authority",
        ["FI-DSN-STD-014-R39", "FI-DSN-STD-014-R40"],
      );
    }
    // R40: additional grounds only with documented frozen governing source.
    // Machine family must still be one of the mandatory families for this runtime;
    // arbitrary fourth families without frozen catalog entry are rejected.
    throw new OrchestraConstitutionalError(
      "Additional Approval withholding grounds beyond mandatory EGWG families are not established in the frozen G6 runtime catalog",
      "invalid_approval_authority",
      ["FI-DSN-STD-014-R40"],
    );
  }
}
