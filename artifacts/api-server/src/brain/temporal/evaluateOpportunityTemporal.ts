import type {
  EvaluateOpportunityTemporalInput,
  OpportunityDecay,
  OpportunityTemporalState,
  OpportunityTimingChange,
  OpportunityTimingState,
  OpportunityTemporalSupport,
} from "./opportunityTemporalTypes";

const DAY_MS = 86_400_000;
export const OPPORTUNITY_PREPARATION_WINDOW_DAYS = 30 as const;

function parseIsoDate(value: unknown): { year: number; month: number; day: number; iso: string } | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day, iso: value };
}

function parseAnnualDate(value: unknown): { month: number; day: number; suppliedYear: number | null } | null {
  if (typeof value !== "string") return null;
  const monthDay = /^(\d{2})-(\d{2})$/.exec(value);
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const suppliedYear = full ? Number(full[1]) : null;
  const month = Number((full ?? monthDay)?.[full ? 2 : 1]);
  const day = Number((full ?? monthDay)?.[full ? 3 : 2]);
  if ((!full && !monthDay) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const validationYear = suppliedYear ?? 2000;
  const date = new Date(Date.UTC(validationYear, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { month, day, suppliedYear };
}

function parseEvaluation(value: string): Date | null {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function atUtcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function stateForDays(days: number, windowDays: number, recurring: boolean): OpportunityTimingState {
  if (days > windowDays + 14) return "premature";
  if (days > windowDays) return "approaching_relevance";
  if (days >= 0) return "valid_now";
  if (recurring) return "unknown";
  if (days >= -30) return "stale";
  return "expired";
}

function decayFor(state: OpportunityTimingState): OpportunityDecay {
  if (state === "valid_now") return "none";
  if (state === "approaching_relevance" || state === "premature") return "watch";
  if (state === "stale") return "diminished";
  if (state === "expired") return "exhausted";
  return "unknown";
}

function unknown(
  input: EvaluateOpportunityTemporalInput,
  reason: string,
  support: OpportunityTemporalSupport = "unknown",
): OpportunityTemporalState {
  const previous = input.previousHistory ?? [];
  const priorOccurrence = [...previous].reverse().find((item) => item.occurrenceCycleId !== null);
  const evidence = { ...input.evidence, dateLabel: input.dateLabel ?? null, dateValue: typeof input.dateValue === "string" ? input.dateValue : null };
  const prior = previous.at(-1);
  if (prior?.state === "unknown" && prior.reason === reason && JSON.stringify(prior.evidence) === JSON.stringify(evidence)) {
    return { persistence: "available", support, state: "unknown", family: input.family, effectiveDate: null, occurrenceCycleId: null, activatesAt: null, expiresAt: null, preparationWindow: null, decay: "unknown", recommendationEligible: false, restraintReason: reason, evidence, history: [...previous] };
  }
  const change: OpportunityTimingChange | null = parseEvaluation(input.evaluatedAt)
    ? {
        changeId: [
          input.evidence.source,
          input.evidence.sourceId ?? "unknown",
          input.evidence.sourceVersion ?? "unknown",
          "unknown",
          reason,
          prior?.changeId ?? "initial",
        ].join(":"),
        evaluatedAt: input.evaluatedAt,
        state: "unknown",
        occurrenceCycleId: priorOccurrence?.occurrenceCycleId ?? null,
        effectiveDate: priorOccurrence?.effectiveDate ?? null,
        reason,
        family: input.family,
        evidence,
      }
    : null;
  const history = change && !previous.some((item) => item.changeId === change.changeId)
    ? [...previous, change]
    : [...previous];
  return {
    persistence: "available", support, state: "unknown", family: input.family, effectiveDate: null, occurrenceCycleId: null,
    activatesAt: null, expiresAt: null, preparationWindow: null, decay: "unknown",
    recommendationEligible: false, restraintReason: reason,
    evidence,
    history,
  };
}

export function evaluateOpportunityTemporal(input: EvaluateOpportunityTemporalInput): OpportunityTemporalState {
  const evaluated = parseEvaluation(input.evaluatedAt);
  if (!evaluated) return unknown(input, "invalid_evaluation_time");
  if (input.evidenceStatus === "archived") return unknown(input, "source_archived", "archived");
  if (input.evidenceStatus === "withdrawn") return unknown(input, "source_withdrawn", "withdrawn");
  if (input.evidenceStatus === "invalidated") return unknown(input, "source_invalidated", "invalid");
  if (input.family === "unsupported") return unknown(input, "unsupported_temporal_family");
  const windowDays = input.preparationWindowDays ?? OPPORTUNITY_PREPARATION_WINDOW_DAYS;
  if (!Number.isInteger(windowDays) || windowDays < 0) return unknown(input, "invalid_policy_window");
  const today = atUtcDate(evaluated.getUTCFullYear(), evaluated.getUTCMonth() + 1, evaluated.getUTCDate());

  let effective: Date;
  let cycleId: string;
  if (input.family === "one_time") {
    const parsed = parseIsoDate(input.fixedOccurrenceDate ?? input.dateValue);
    if (!parsed) return unknown(input, "missing_or_invalid_supported_date", input.dateValue == null ? "unknown" : "invalid");
    effective = atUtcDate(parsed.year, parsed.month, parsed.day);
    cycleId = input.fixedOccurrenceCycleId ?? `one-time:${parsed.iso}`;
  } else {
    const parsed = parseAnnualDate(input.dateValue);
    if (!parsed) return unknown(input, "missing_or_invalid_supported_date", input.dateValue == null ? "unknown" : "invalid");
    let cycleYear = today.getUTCFullYear();
    effective = atUtcDate(cycleYear, parsed.month, parsed.day);
    while (
      effective.getUTCMonth() !== parsed.month - 1 ||
      effective.getUTCDate() !== parsed.day ||
      effective.getTime() < today.getTime()
    ) {
      cycleYear += 1;
      effective = atUtcDate(cycleYear, parsed.month, parsed.day);
    }
    cycleId = `annual:${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}:${cycleYear}`;
  }

  const days = Math.round((effective.getTime() - today.getTime()) / DAY_MS);
  const state = stateForDays(days, windowDays, input.family === "annual_recurring");
  const effectiveDate = isoDate(effective);
  const activatesAt = isoDate(new Date(effective.getTime() - windowDays * DAY_MS));
  const expiresAt = input.family === "one_time" ? isoDate(new Date(effective.getTime() + 30 * DAY_MS)) : effectiveDate;
  const recommendationEligible = state === "valid_now";
  const reason = recommendationEligible ? "within_policy_preparation_window" : `timing_${state}`;
  const evidence = { ...input.evidence, dateLabel: input.dateLabel ?? null, dateValue: input.dateValue as string };
  const previous = input.previousHistory ?? [];
  const prior = previous.at(-1);
  if (prior?.state === state && prior.effectiveDate === effectiveDate && prior.reason === reason && JSON.stringify(prior.evidence) === JSON.stringify(evidence)) {
    return { persistence: "available", support: "supported", state, family: input.family, effectiveDate, occurrenceCycleId: cycleId, activatesAt, expiresAt, preparationWindow: { source: "policy", days: windowDays, approachingLeadDays: 14, staleRetentionDays: 30 }, decay: decayFor(state), recommendationEligible, restraintReason: recommendationEligible ? null : reason, evidence, history: [...previous] };
  }
  const change: OpportunityTimingChange = {
    changeId: [input.evidence.source, input.evidence.sourceId ?? "unknown", input.evidence.sourceVersion ?? "unknown", cycleId, effectiveDate, state, prior?.changeId ?? "initial"].join(":"),
    evaluatedAt: input.evaluatedAt, state, occurrenceCycleId: cycleId, effectiveDate, reason,
    family: input.family,
    evidence,
  };
  const history = previous.some((item) => item.changeId === change.changeId) ? [...previous] : [...previous, change];
  return {
    persistence: "available", support: "supported", state, family: input.family, effectiveDate, occurrenceCycleId: cycleId, activatesAt, expiresAt,
    preparationWindow: { source: "policy", days: windowDays, approachingLeadDays: 14, staleRetentionDays: 30 }, decay: decayFor(state),
    recommendationEligible, restraintReason: recommendationEligible ? null : reason,
    evidence, history,
  };
}
