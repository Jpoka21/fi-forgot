/**
 * Static dashboard action labels keyed by sourceRuleId.
 *
 * Server-provided CTA copy — not inferred by clients.
 */

const ACTION_LABEL_BY_RULE_ID: Record<string, string> = {
  birthday: "Prepare for birthday",
  anniversary: "Prepare for anniversary",
  valentines_day: "Prepare for Valentine's Day",
  inactivity: "Reconnect",
  fresh_update: "Add a fresh update",
  life_event_follow_up: "Follow up on life event",
  accomplishment_follow_up: "Follow up on accomplishment",
  memory_accumulation: "Add a memory",
  card_gap: "Review card channel",
};

const FALLBACK_ACTION_LABEL = "Open profile";

export function resolveDashboardBrainActionLabel(sourceRuleId: string): string {
  return ACTION_LABEL_BY_RULE_ID[sourceRuleId] ?? FALLBACK_ACTION_LABEL;
}

export const DASHBOARD_BRAIN_ACTION_LABEL_BY_RULE_ID = ACTION_LABEL_BY_RULE_ID;
