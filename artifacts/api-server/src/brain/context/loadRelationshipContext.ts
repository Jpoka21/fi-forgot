/**
 * Relationship Context Engine — read layer.
 *
 * Wraps the existing assembleRecipientContext() service. Loads recipient
 * identity, profile, memories, question history, fresh updates, follow-up
 * answers, card history, and profile completeness without writing data or
 * making decisions.
 */

import { assembleRecipientContext } from "../../services/recipient-context";
import {
  BRAIN_CONTEXT_VERSION,
  type RelationshipContextLoadResult,
} from "../types";

export async function loadRelationshipContext(
  recipientId: string,
  userId: string,
  assemble: typeof assembleRecipientContext = assembleRecipientContext,
): Promise<RelationshipContextLoadResult> {
  const relationshipContext = await assemble(recipientId, userId);

  return {
    brainContextVersion: BRAIN_CONTEXT_VERSION,
    recipientId,
    relationshipId: null,
    userId,
    loadedAt: new Date().toISOString(),
    relationshipContext,
  };
}
