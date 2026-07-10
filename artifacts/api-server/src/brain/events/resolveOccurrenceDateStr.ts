/**
 * Resolves the catalog occurrence date string used for cycle derivation.
 */

import type { RelationshipContext } from "../types";
import type { BrainEventDefinition } from "./brainEventCatalogTypes";

export function resolveOccurrenceDateStr(
  definition: BrainEventDefinition,
  relationshipContext: RelationshipContext,
): string | null {
  if (definition.timing.kind === "recipient_date") {
    return definition.timing.field === "birthday"
      ? relationshipContext.relationship?.birthday ?? null
      : relationshipContext.relationship?.anniversary ?? null;
  }

  return definition.timing.monthDay;
}
