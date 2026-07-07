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
): Promise<RelationshipContextLoadResult> {
  const relationshipContext = await assembleRecipientContext(recipientId, userId);

  return {
    brainContextVersion: BRAIN_CONTEXT_VERSION,
    relationshipId: recipientId,
    userId,
    loadedAt: new Date().toISOString(),
    relationshipContext,
  };
}
