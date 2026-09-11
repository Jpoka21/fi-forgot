import { evaluateOpportunityTemporal } from "../brain/temporal/evaluateOpportunityTemporal.js";

const evidence = { source: "event_timing", sourceId: "recipient-1", sourceVersion: "context:7", evidenceId: "answer-4" };
const evaluate = (family: "one_time" | "annual_recurring" | "unsupported", dateValue: unknown, evaluatedAt = "2026-01-01T12:00:00.000Z") =>
  evaluateOpportunityTemporal({ family, dateValue, dateLabel: "occasion", evaluatedAt, evidence });

const states = [
  evaluate("one_time", "2026-01-15").state,
  evaluate("one_time", "2026-03-15").state,
  evaluate("one_time", "2026-02-05").state,
  evaluate("one_time", "2025-12-20").state,
  evaluate("one_time", "2025-10-01").state,
  evaluate("unsupported", "2026-01-01").state,
];
const expected = ["valid_now", "premature", "approaching_relevance", "stale", "expired", "unknown"];
if (JSON.stringify(states) !== JSON.stringify(expected)) throw new Error(`timing states differ: ${states}`);

for (const invalid of [null, "", "2026-2-01", "2026-02-30", "02-30", "text"]) {
  if (evaluate("one_time", invalid).state !== "unknown") throw new Error(`accepted invalid date ${String(invalid)}`);
}

const oneTime = evaluate("one_time", "2025-01-01");
if (oneTime.occurrenceCycleId !== "one-time:2025-01-01" || oneTime.state !== "expired") throw new Error("one-time occurrence was rewritten");
const recurring = evaluate("annual_recurring", "03-10", "2026-03-11T00:00:00.000Z");
if (recurring.occurrenceCycleId !== "annual:03-10:2027" || recurring.effectiveDate !== "2027-03-10") throw new Error("justified annual cycle did not advance");
if (recurring.preparationWindow?.source !== "policy") throw new Error("preparation policy mislabeled as evidence");
if (oneTime.decay !== "exhausted" || evaluate("one_time", "2025-12-20").decay !== "diminished") throw new Error("qualitative decay changed");

const first = evaluate("one_time", "2026-01-15");
const changed = evaluateOpportunityTemporal({ family: "one_time", dateValue: "2026-02-15", dateLabel: "occasion", evaluatedAt: "2026-01-02T00:00:00.000Z", evidence, previousHistory: first.history });
if (changed.history.length !== 2 || changed.history[0]?.effectiveDate !== "2026-01-15") throw new Error("timing history was overwritten");
const withdrawn = evaluateOpportunityTemporal({ family: "one_time", dateValue: null, dateLabel: "occasion", evaluatedAt: "2026-01-03T00:00:00.000Z", evidence, previousHistory: changed.history, evidenceStatus: "withdrawn" });
const archived = evaluateOpportunityTemporal({ family: "one_time", dateValue: null, dateLabel: "occasion", evaluatedAt: "2026-01-04T00:00:00.000Z", evidence, previousHistory: withdrawn.history, evidenceStatus: "archived" });
const invalidated = evaluateOpportunityTemporal({ family: "one_time", dateValue: null, dateLabel: "occasion", evaluatedAt: "2026-01-05T00:00:00.000Z", evidence, previousHistory: archived.history, evidenceStatus: "invalidated" });
if (withdrawn.history.length !== 3 || withdrawn.history.at(-1)?.reason !== "source_withdrawn" || withdrawn.support !== "withdrawn") throw new Error("withdrawal transition was not appended");
if (archived.history.length !== 4 || archived.history.at(-1)?.reason !== "source_archived" || archived.support !== "archived") throw new Error("archive transition was not appended");
if (invalidated.history.length !== 5 || invalidated.history.at(-1)?.reason !== "source_invalidated" || invalidated.support !== "invalid") throw new Error("invalidation transition was not appended");
console.log("opportunity temporal lifecycle unit tests passed");
