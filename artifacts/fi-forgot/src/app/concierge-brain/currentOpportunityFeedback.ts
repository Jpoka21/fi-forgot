import type { OpportunityFeedbackEvent } from "./conciergeWorkspaceTypes";

export function currentOpportunityFeedback(history: OpportunityFeedbackEvent[]) {
  const latest = new Map<string, OpportunityFeedbackEvent>();
  for (const event of history) if (!latest.has(event.lineageId) || latest.get(event.lineageId)!.version < event.version) latest.set(event.lineageId, event);
  return [...latest.values()].filter(event => event.action === "set" && event.active);
}
