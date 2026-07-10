/**
 * Detects Brain card outcome transitions from persisted card status changes.
 */

import type { CardOutcomeTransitionType } from "./cardOutcomeTypes";

const MAILED_STATUSES = new Set(["Mailed to me", "Mailed to her"]);

function isMailedStatus(status: string): boolean {
  return MAILED_STATUSES.has(status);
}

export function detectCardOutcomeTransitions(input: {
  isInsert: boolean;
  previousStatus: string | null;
  newStatus: string;
}): CardOutcomeTransitionType[] {
  const transitions: CardOutcomeTransitionType[] = [];

  if (input.isInsert) {
    transitions.push("card_created");
  }

  if (input.newStatus === "Approved" && input.previousStatus !== "Approved") {
    transitions.push("card_approved");
  }

  if (isMailedStatus(input.newStatus) && !isMailedStatus(input.previousStatus ?? "")) {
    transitions.push("card_sent");
  }

  return transitions;
}
