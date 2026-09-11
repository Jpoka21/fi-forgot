import type { OpportunityFollowThroughEvent } from "./conciergeWorkspaceTypes";

/** Older/fixture workspace controllers may not carry this newly added history yet. */
export function currentOpportunityFollowThrough(history: OpportunityFollowThroughEvent[] | undefined = []) {
  const latest = new Map<string, OpportunityFollowThroughEvent>();
  for (const event of history) {
    if (!latest.has(event.lineageId) || latest.get(event.lineageId)!.version < event.version) {
      latest.set(event.lineageId, event);
    }
  }
  return [...latest.values()].filter(event => event.active && event.action === "set");
}
