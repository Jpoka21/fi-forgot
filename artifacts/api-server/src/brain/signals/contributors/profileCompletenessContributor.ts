/**
 * Profile completeness signal contributor — placeholder.
 *
 * Future: emit signals from relationshipContext.profileCompleteness.
 * Phase 1 does not evaluate context.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export function contributeProfileCompletenessSignals(
  _context: RelationshipContextLoadResult,
): BrainSignal[] {
  return [];
}
