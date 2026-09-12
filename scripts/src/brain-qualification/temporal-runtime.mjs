// GENERATED qualification-only bundle. Regenerate with node scripts/src/brain-qualification/build-temporal-runtime.mjs
// Production source SHA256: {"artifacts/api-server/src/brain/temporal/evaluateOpportunityTemporal.ts":"f2be4bac4674626929df2f36e8d17f78fa84c3ecb8188396fd64637873da15f6","artifacts/api-server/src/brain/temporal/index.ts":"16000dcd941a136fd3247a1ebae1b665fa12d9012f1bb11e6e8e036f1203c9bc","artifacts/api-server/src/brain/temporal/opportunityTemporalRepository.ts":"abefeaf1375cbcca43e7f5c1a97fb8d69a83a2a782a00cad75fed50fff6bc38d"}
// artifacts/api-server/src/brain/temporal/evaluateOpportunityTemporal.ts
var DAY_MS = 864e5;
function sameEvidence(a, b) {
  return a.source === b.source && a.sourceId === b.sourceId && a.sourceVersion === b.sourceVersion && a.evidenceId === b.evidenceId && a.dateLabel === b.dateLabel && a.dateValue === b.dateValue;
}
var OPPORTUNITY_PREPARATION_WINDOW_DAYS = 30;
function parseIsoDate(value) {
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
function parseAnnualDate(value) {
  if (typeof value !== "string") return null;
  const monthDay = /^(\d{2})-(\d{2})$/.exec(value);
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const suppliedYear = full ? Number(full[1]) : null;
  const month = Number((full ?? monthDay)?.[full ? 2 : 1]);
  const day = Number((full ?? monthDay)?.[full ? 3 : 2]);
  if (!full && !monthDay || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const validationYear = suppliedYear ?? 2e3;
  const date = new Date(Date.UTC(validationYear, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { month, day, suppliedYear };
}
function parseEvaluation(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}
function isoDate(date) {
  return date.toISOString().slice(0, 10);
}
function atUtcDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day));
}
function stateForDays(days, windowDays, recurring) {
  if (days > windowDays + 14) return "premature";
  if (days > windowDays) return "approaching_relevance";
  if (days >= 0) return "valid_now";
  if (recurring) return "unknown";
  if (days >= -30) return "stale";
  return "expired";
}
function decayFor(state) {
  if (state === "valid_now") return "none";
  if (state === "approaching_relevance" || state === "premature") return "watch";
  if (state === "stale") return "diminished";
  if (state === "expired") return "exhausted";
  return "unknown";
}
function unknown(input, reason, support = "unknown") {
  const previous = input.previousHistory ?? [];
  const priorOccurrence = [...previous].reverse().find((item) => item.occurrenceCycleId !== null);
  const evidence = { ...input.evidence, dateLabel: input.dateLabel ?? null, dateValue: typeof input.dateValue === "string" ? input.dateValue : null };
  const prior = previous.at(-1);
  if (prior?.state === "unknown" && prior.reason === reason && sameEvidence(prior.evidence, evidence)) {
    return { persistence: "available", support, state: "unknown", family: input.family, effectiveDate: null, occurrenceCycleId: null, activatesAt: null, expiresAt: null, preparationWindow: null, decay: "unknown", recommendationEligible: false, restraintReason: reason, evidence, history: [...previous] };
  }
  const change = parseEvaluation(input.evaluatedAt) ? {
    changeId: [
      input.evidence.source,
      input.evidence.sourceId ?? "unknown",
      input.evidence.sourceVersion ?? "unknown",
      "unknown",
      reason,
      prior?.changeId ?? "initial"
    ].join(":"),
    evaluatedAt: input.evaluatedAt,
    state: "unknown",
    occurrenceCycleId: priorOccurrence?.occurrenceCycleId ?? null,
    effectiveDate: priorOccurrence?.effectiveDate ?? null,
    reason,
    family: input.family,
    evidence
  } : null;
  const history = change && !previous.some((item) => item.changeId === change.changeId) ? [...previous, change] : [...previous];
  return {
    persistence: "available",
    support,
    state: "unknown",
    family: input.family,
    effectiveDate: null,
    occurrenceCycleId: null,
    activatesAt: null,
    expiresAt: null,
    preparationWindow: null,
    decay: "unknown",
    recommendationEligible: false,
    restraintReason: reason,
    evidence,
    history
  };
}
function evaluateOpportunityTemporal(input) {
  const evaluated = parseEvaluation(input.evaluatedAt);
  if (!evaluated) return unknown(input, "invalid_evaluation_time");
  if (input.evidenceStatus === "archived") return unknown(input, "source_archived", "archived");
  if (input.evidenceStatus === "withdrawn") return unknown(input, "source_withdrawn", "withdrawn");
  if (input.evidenceStatus === "invalidated") return unknown(input, "source_invalidated", "invalid");
  if (input.family === "unsupported") return unknown(input, "unsupported_temporal_family");
  const windowDays = input.preparationWindowDays ?? OPPORTUNITY_PREPARATION_WINDOW_DAYS;
  if (!Number.isInteger(windowDays) || windowDays < 0) return unknown(input, "invalid_policy_window");
  const today = atUtcDate(evaluated.getUTCFullYear(), evaluated.getUTCMonth() + 1, evaluated.getUTCDate());
  let effective;
  let cycleId;
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
    while (effective.getUTCMonth() !== parsed.month - 1 || effective.getUTCDate() !== parsed.day || effective.getTime() < today.getTime()) {
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
  const evidence = { ...input.evidence, dateLabel: input.dateLabel ?? null, dateValue: input.dateValue };
  const previous = input.previousHistory ?? [];
  const prior = previous.at(-1);
  if (prior?.state === state && prior.effectiveDate === effectiveDate && prior.reason === reason && sameEvidence(prior.evidence, evidence)) {
    return { persistence: "available", support: "supported", state, family: input.family, effectiveDate, occurrenceCycleId: cycleId, activatesAt, expiresAt, preparationWindow: { source: "policy", days: windowDays, approachingLeadDays: 14, staleRetentionDays: 30 }, decay: decayFor(state), recommendationEligible, restraintReason: recommendationEligible ? null : reason, evidence, history: [...previous] };
  }
  const change = {
    changeId: [input.evidence.source, input.evidence.sourceId ?? "unknown", input.evidence.sourceVersion ?? "unknown", cycleId, effectiveDate, state, prior?.changeId ?? "initial"].join(":"),
    evaluatedAt: input.evaluatedAt,
    state,
    occurrenceCycleId: cycleId,
    effectiveDate,
    reason,
    family: input.family,
    evidence
  };
  const history = previous.some((item) => item.changeId === change.changeId) ? [...previous] : [...previous, change];
  return {
    persistence: "available",
    support: "supported",
    state,
    family: input.family,
    effectiveDate,
    occurrenceCycleId: cycleId,
    activatesAt,
    expiresAt,
    preparationWindow: { source: "policy", days: windowDays, approachingLeadDays: 14, staleRetentionDays: 30 },
    decay: decayFor(state),
    recommendationEligible,
    restraintReason: recommendationEligible ? null : reason,
    evidence,
    history
  };
}

// artifacts/api-server/src/brain/temporal/opportunityTemporalRepository.ts
import { createHash } from "node:crypto";
async function loadDb() {
  const [{ db }, { opportunityTemporalHistoryTable }] = await Promise.all([
    import("@workspace/db"),
    import("@workspace/db/schema")
  ]);
  return { db, opportunityTemporalHistoryTable };
}
function createPgOpportunityTemporalHistoryRepository(database = loadDb) {
  return {
    async listRetained({ userId, recipientIds }) {
      if (recipientIds.length === 0) return [];
      const { and, asc, eq, inArray } = await import("drizzle-orm");
      const { db, opportunityTemporalHistoryTable } = await database();
      const rows = await db.select().from(opportunityTemporalHistoryTable).where(and(
        eq(opportunityTemporalHistoryTable.userId, userId),
        inArray(opportunityTemporalHistoryTable.recipientId, recipientIds)
      )).orderBy(asc(opportunityTemporalHistoryTable.evaluatedAt), asc(opportunityTemporalHistoryTable.createdAt));
      const grouped = /* @__PURE__ */ new Map();
      for (const row of rows) {
        const stored = row.evidence;
        if (!stored.opportunity) continue;
        const change = { changeId: row.changeKey, evaluatedAt: row.evaluatedAt.toISOString(), state: row.state, occurrenceCycleId: row.occurrenceCycleId, effectiveDate: row.effectiveDate, reason: row.reason, family: stored.family ?? "unsupported", evidence: stored.snapshot };
        const current = grouped.get(row.opportunityId) ?? { opportunity: stored.opportunity, history: [] };
        current.opportunity = stored.opportunity;
        current.history.push(change);
        grouped.set(row.opportunityId, current);
      }
      return [...grouped.values()];
    },
    async loadHistory({ userId, opportunityId }) {
      const { and, asc, eq } = await import("drizzle-orm");
      const { db, opportunityTemporalHistoryTable } = await database();
      const rows = await db.select({
        changeId: opportunityTemporalHistoryTable.changeKey,
        evaluatedAt: opportunityTemporalHistoryTable.evaluatedAt,
        state: opportunityTemporalHistoryTable.state,
        occurrenceCycleId: opportunityTemporalHistoryTable.occurrenceCycleId,
        effectiveDate: opportunityTemporalHistoryTable.effectiveDate,
        reason: opportunityTemporalHistoryTable.reason,
        evidence: opportunityTemporalHistoryTable.evidence
      }).from(opportunityTemporalHistoryTable).where(and(
        eq(opportunityTemporalHistoryTable.userId, userId),
        eq(opportunityTemporalHistoryTable.opportunityId, opportunityId)
      )).orderBy(asc(opportunityTemporalHistoryTable.evaluatedAt), asc(opportunityTemporalHistoryTable.createdAt));
      return rows.map((row) => ({
        ...row,
        evaluatedAt: row.evaluatedAt.toISOString(),
        state: row.state,
        family: row.evidence.family ?? "unsupported",
        evidence: row.evidence.snapshot ?? row.evidence
      }));
    },
    async appendChange({ userId, opportunityId, change, evidence, opportunity }) {
      const { db, opportunityTemporalHistoryTable } = await database();
      const temporalEvidence = evidence;
      await db.insert(opportunityTemporalHistoryTable).values({
        id: createHash("sha256").update(JSON.stringify([userId, opportunityId, change.changeId])).digest("hex"),
        changeKey: change.changeId,
        userId,
        opportunityId,
        recipientId: opportunity.recipient.id,
        source: temporalEvidence.source,
        sourceId: temporalEvidence.sourceId,
        sourceVersion: temporalEvidence.sourceVersion,
        occurrenceCycleId: change.occurrenceCycleId,
        state: change.state,
        effectiveDate: change.effectiveDate,
        reason: change.reason,
        evidence: { family: change.family, snapshot: evidence, opportunity: { ...opportunity, timing: { ...opportunity.timing, temporal: opportunity.timing.temporal ? { ...opportunity.timing.temporal, history: [] } : void 0 } } },
        evaluatedAt: new Date(change.evaluatedAt)
      }).onConflictDoNothing({ target: opportunityTemporalHistoryTable.id });
    }
  };
}

// qualification-temporal-entry.mjs
function createPgOpportunityTemporalHistoryRepository2(database) {
  if (typeof database !== "function") throw Error("FAIL_CLOSED: explicit qualification database injection required");
  return createPgOpportunityTemporalHistoryRepository(database);
}
export {
  createPgOpportunityTemporalHistoryRepository2 as createPgOpportunityTemporalHistoryRepository,
  evaluateOpportunityTemporal
};
