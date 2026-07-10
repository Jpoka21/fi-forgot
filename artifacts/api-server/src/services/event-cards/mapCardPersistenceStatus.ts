/**
 * Maps persisted product card statuses to normalized EventCardCycleStatus values.
 *
 * Persisted status → normalized status:
 * - (no card)                    → none
 * - "draft"                      → in_progress
 * - "Needs profile"              → in_progress
 * - "Card being drafted"         → in_progress
 * - "Rejected"                   → in_progress (rejection is nonterminal; not completed delivery)
 * - "Ready for approval"         → ready_for_approval
 * - "Approved"                   → approved
 * - "Mailed to me"               → mailed
 * - "Mailed to her"              → mailed
 * - "Delivered"                  → terminal
 * - "Given"                      → terminal
 * - unknown / unrecognized       → in_progress (conservative; does not imply completion)
 */

import type { EventCardCycleStatus } from "../../brain/events/eventPreparationTypes";

const NORMALIZED_STATUS_RANK: Record<EventCardCycleStatus, number> = {
  none: 0,
  in_progress: 1,
  ready_for_approval: 2,
  approved: 3,
  mailed: 4,
  terminal: 5,
};

export function normalizedCardCycleStatusRank(status: EventCardCycleStatus): number {
  return NORMALIZED_STATUS_RANK[status];
}

export function mapCardPersistenceStatus(status: string): EventCardCycleStatus {
  switch (status.trim()) {
    case "draft":
    case "Needs profile":
    case "Card being drafted":
    case "Rejected":
      return "in_progress";
    case "Ready for approval":
      return "ready_for_approval";
    case "Approved":
      return "approved";
    case "Mailed to me":
    case "Mailed to her":
      return "mailed";
    case "Delivered":
    case "Given":
      return "terminal";
    default:
      return "in_progress";
  }
}
