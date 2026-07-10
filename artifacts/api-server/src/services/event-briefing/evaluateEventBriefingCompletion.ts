/**
 * Briefing completion projector — owned by the briefing domain, not Brain rules.
 *
 * Completion policy (v1): a saved event briefing exists for the canonical event
 * label and preparation cycle year when at least one non-empty saved answer row
 * is present in BriefingSummary.byEvent.
 *
 * Storage validation in POST /personal/briefings skips empty answers
 * (`if (!a.answer?.trim()) continue`), so persisted rows always contain trimmed
 * text. Completion mirrors that guarantee defensively.
 */

import type { BrainEventId } from "../../brain/events/brainEventCatalogTypes";
import type { BriefingSummary } from "../recipient-context";

export interface EventBriefingCompletionResult {
  complete: boolean;
}

export function briefingEventCycleKey(
  briefingEventLabel: string,
  cycleYear: number,
): string {
  return `${briefingEventLabel}_${cycleYear}`;
}

function hasSubstantiveSavedAnswer(
  answers: readonly { answer: string }[],
): boolean {
  return answers.some((entry) => entry.answer.trim().length > 0);
}

export function evaluateEventBriefingCompletion(input: {
  eventId: BrainEventId;
  briefingEventLabel: string;
  cycleYear: number;
  briefingSummary: BriefingSummary;
}): EventBriefingCompletionResult {
  void input.eventId;

  const key = briefingEventCycleKey(input.briefingEventLabel, input.cycleYear);
  const answers = input.briefingSummary.byEvent[key] ?? [];
  return { complete: hasSubstantiveSavedAnswer(answers) };
}
