/**
 * Shared calendar event rule evaluation — consumes normalized EventPreparationFacts.
 *
 * Rules read preparation state through targetEventId only. Raw briefing answers,
 * card rows, and persistence statuses remain outside the rule layer.
 */

import type { BrainEventId } from "../../events/brainEventCatalogTypes";
import type { EventCardCycleStatus, EventPreparationFacts } from "../../events/eventPreparationTypes";
import type { BrainDecisionOutcome } from "../../types";
import type { DecisionContext } from "../decisionContextTypes";
import type { RuleEvaluationTrace } from "./internal/ruleEvaluationTrace";
import type { RuleCandidate } from "./types";

export interface CalendarEventRuleConfig {
  ruleId: string;
  targetEventId: BrainEventId;
  priority: number;
  confidence: number;
  debugLabel: string;
}

export function cardCycleStatusPermitsPreparation(
  status: EventCardCycleStatus,
): boolean {
  return status === "none";
}

function buildCandidate(
  config: CalendarEventRuleConfig,
  outcome: Extract<BrainDecisionOutcome, "ask_question" | "prepare_card">,
  reason: string,
  facts: EventPreparationFacts,
): RuleCandidate {
  return {
    ruleId: config.ruleId,
    priority: config.priority,
    confidence: config.confidence,
    decision: { outcome },
    reasons: [reason],
    debugNotes: [
      `${config.debugLabel} matched`,
      `targetEventId: ${config.targetEventId}`,
      `outcome: ${outcome}`,
      `cycleYear: ${facts.cycleYear}`,
      `briefingComplete: ${facts.briefingComplete}`,
      `cardCycleStatus: ${facts.cardCycleStatus}`,
    ],
  };
}

export function evaluateCalendarEventRule(
  context: DecisionContext,
  config: CalendarEventRuleConfig,
  trace?: RuleEvaluationTrace,
): RuleCandidate | null {
  const facts = context.eventPreparation.byEventId[config.targetEventId];

  if (!facts) {
    trace?.recordNoMatch({
      reasons: ["event_not_applicable"],
      debugNotes: [
        `targetEventId: ${config.targetEventId}`,
        "no event preparation facts",
      ],
    });
    return null;
  }

  if (!facts.withinPreparationWindow) {
    trace?.recordNoMatch({
      reasons: ["outside_preparation_window"],
      debugNotes: [
        `targetEventId: ${config.targetEventId}`,
        `daysUntilEvent: ${facts.daysUntilEvent}`,
        `withinPreparationWindow: ${facts.withinPreparationWindow}`,
      ],
    });
    return null;
  }

  if (!facts.briefingComplete) {
    return buildCandidate(
      config,
      "ask_question",
      "event_briefing_incomplete",
      facts,
    );
  }

  if (cardCycleStatusPermitsPreparation(facts.cardCycleStatus)) {
    return buildCandidate(
      config,
      "prepare_card",
      "event_ready_for_card_preparation",
      facts,
    );
  }

  trace?.recordNoMatch({
    reasons: ["blocking_card_cycle_status"],
    debugNotes: [
      `targetEventId: ${config.targetEventId}`,
      `cardCycleStatus: ${facts.cardCycleStatus}`,
    ],
  });
  return null;
}
