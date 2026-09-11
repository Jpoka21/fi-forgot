import { buildConciergeWorkspace } from "../brain/product/buildConciergeWorkspace.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { execFileSync } from "node:child_process";
import type { OpportunityTemporalHistoryRepository, OpportunityTimingChange, RetainedOpportunityRecord } from "../brain/temporal/index.js";

function execution(recipientId: string, birthday: unknown, identity?: { active: boolean; archived: boolean }, sourceRuleId = "birthday"): BrainExecutionResult {
  return {
    loadResult: { brainContextVersion: 1, relationshipId: recipientId, userId: "u", loadedAt: "2026-01-01T00:00:00.000Z", relationshipContext: (identity ? { identity } : {}) as never },
    extraction: { availableSignals: [
      { source: "event_timing", label: sourceRuleId, value: birthday },
      ...(sourceRuleId === "fresh_update" ? [{ source: "event_timing", label: "birthday", value: "01-20" }] : []),
    ], contributorGroups: [] },
    decideResult: { decision: { outcome: "prepare_card" }, confidence: 60, reasons: [], debugNotes: [] },
    actionPlan: { type: "prepare_card", category: "event", priority: "high", sourceRuleId, primaryReason: "test", reasons: [], confidence: 60, debugNotes: [] } as never,
    selectedFollowUpQuestion: null, normalized: {} as never, decisionContext: {} as never, ruleEvaluation: {} as never,
  };
}

const persisted = new Map<string, OpportunityTimingChange[]>();
const snapshots = new Map<string, RetainedOpportunityRecord["opportunity"]>();
const repository: OpportunityTemporalHistoryRepository = {
  async listRetained({ userId, recipientIds }) {
    return [...snapshots].filter(([, opportunity]) => recipientIds.includes(opportunity.recipient.id)).map(([key, opportunity]) => ({ opportunity, history: [...(persisted.get(key) ?? [])] })).filter((record) => record.opportunity.id && [...snapshots.keys()].some((key) => key.startsWith(`${userId}:`) && snapshots.get(key) === record.opportunity));
  },
  async loadHistory({ userId, opportunityId }) {
    return [...(persisted.get(`${userId}:${opportunityId}`) ?? [])];
  },
  async appendChange({ userId, opportunityId, change, opportunity }) {
    const key = `${userId}:${opportunityId}`;
    const history = persisted.get(key) ?? [];
    if (!history.some((item) => item.changeId === change.changeId)) persisted.set(key, [...history, change]);
    snapshots.set(key, JSON.parse(JSON.stringify(opportunity)));
  },
};

const dates: Record<string, unknown> = { due: "01-20", early: "04-01", bad: "02-30", due2: "01-21", due3: "01-22", due4: "01-23" };
const payload = await buildConciergeWorkspace({
  userId: "u", generatedAt: "2026-01-01T00:00:00.000Z",
  recipients: Object.keys(dates).map((recipientId) => ({ recipientId, recipientName: recipientId })),
  runBrain: async (recipientId) => execution(recipientId, dates[recipientId]),
  temporalHistoryRepository: repository,
});
const wire = JSON.parse(JSON.stringify(payload));
const early = wire.opportunities.find((item: { recipient: { id: string } }) => item.recipient.id === "early");
const bad = wire.opportunities.find((item: { recipient: { id: string } }) => item.recipient.id === "bad");
if (early.timing.temporal.state !== "premature" || early.recommendation !== null || !early.restraint.restrained) throw new Error("premature Opportunity was not retained silently");
if (bad.timing.temporal.state !== "unknown" || bad.timing.temporal.effectiveDate !== null || bad.recommendation !== null) throw new Error("malformed date gained timing or recommendation");
if (wire.opportunities.filter((item: { presentation: { recommendationEligible: boolean } }) => item.presentation.recommendationEligible).length > 3) throw new Error("presentation cap changed");
if (wire.recommendations.length !== 4) throw new Error("legacy projection did not retain eligible compatibility members");
const due = wire.opportunities.find((item: { recipient: { id: string } }) => item.recipient.id === "due");
if (due.timing.temporal.evidence.sourceVersion !== null || due.confidence.value !== 60 || due.timing.observedAt !== null) throw new Error("provenance/confidence/null semantics lost");
if (due.provenance.evidence.some((item: { sourceVersion: unknown }) => item.sourceVersion !== null)) throw new Error("context schema version fabricated an evidence revision");
if ((persisted.get("u:due:birthday")?.length ?? 0) !== 1) throw new Error("production builder did not durably append timing history");

const displacedPayload = await buildConciergeWorkspace({ userId: "u", generatedAt: "2026-03-01T00:00:00.000Z", recipients: [{ recipientId: "due", recipientName: "due" }], runBrain: async () => execution("due", null, undefined, "fresh_update"), temporalHistoryRepository: repository });
const displaced = displacedPayload.opportunities.find((item) => item.id === "due:birthday");
if (displaced?.timing.temporal?.family !== "one_time" || displaced.timing.temporal.state !== "expired" || displaced.timing.temporal.occurrenceCycleId !== "annual:01-20:2026" || displaced.recommendation !== null) throw new Error("displaced dated occurrence was not retained as an expired fixed cycle");
if (displaced.timing.temporal.evidence.dateValue !== "01-20") throw new Error("derived occurrence replaced the genuine source date");
const reloadedDisplaced = await buildConciergeWorkspace({ userId: "u", generatedAt: "2026-03-02T00:00:00.000Z", recipients: [{ recipientId: "due", recipientName: "due" }], runBrain: async () => execution("due", null, undefined, "fresh_update"), temporalHistoryRepository: repository });
const reloadedOccurrence = reloadedDisplaced.opportunities.find((item) => item.id === "due:birthday")!;
if (reloadedOccurrence.timing.temporal?.support !== "supported" || reloadedOccurrence.timing.temporal.state !== "expired" || reloadedOccurrence.timing.temporal.evidence.dateValue !== "01-20" || reloadedOccurrence.timing.temporal.history.length !== displaced.timing.temporal.history.length) throw new Error("reloading a retained occurrence changed its source or appended an unchanged transition");

const withdrawnPayload = await buildConciergeWorkspace({
  userId: "u", generatedAt: "2026-01-02T00:00:00.000Z",
  recipients: [{ recipientId: "due2", recipientName: "due2" }],
  runBrain: async () => execution("due2", null),
  temporalHistoryRepository: repository,
});
const withdrawn = withdrawnPayload.opportunities[0]!;
if (withdrawn.timing.temporal?.support !== "withdrawn" || withdrawn.timing.temporal.history.length !== 2 || withdrawn.timing.temporal.history.at(-1)?.reason !== "source_withdrawn" || withdrawn.recommendation !== null) throw new Error("production withdrawal was not retained and appended silently");

const archivedPayload = await buildConciergeWorkspace({
  userId: "u", generatedAt: "2026-01-03T00:00:00.000Z",
  recipients: [{ recipientId: "due3", recipientName: "due3" }],
  runBrain: async () => execution("due3", "01-22", { active: true, archived: true }),
  temporalHistoryRepository: repository,
});
const archived = archivedPayload.opportunities[0]!;
if (archived.timing.temporal?.support !== "archived" || archived.timing.temporal.history.length !== 2 || archived.timing.temporal.history.at(-1)?.reason !== "source_archived") throw new Error("production archive transition was not appended");
const invalidatedPayload = await buildConciergeWorkspace({
  userId: "u", generatedAt: "2026-01-04T00:00:00.000Z",
  recipients: [{ recipientId: "due4", recipientName: "due4" }],
  runBrain: async () => execution("due4", "01-23", { active: false, archived: false }),
  temporalHistoryRepository: repository,
});
const invalidated = invalidatedPayload.opportunities[0]!;
if (invalidated.timing.temporal?.support !== "invalid" || invalidated.timing.temporal.history.length !== 2 || invalidated.timing.temporal.history.at(-1)?.reason !== "source_invalidated") throw new Error("production invalidation transition was not appended");

execFileSync(process.execPath, ["scripts/node_modules/tsx/dist/cli.mjs", "--tsconfig", "artifacts/fi-forgot/tsconfig.json", "artifacts/fi-forgot/src/__tests__/relationship-opportunity-serialized-consumer.test.ts"], { cwd: process.cwd(), env: { ...process.env, RELATIONSHIP_OPPORTUNITY_SERIALIZED_PAYLOAD: JSON.stringify(wire) }, stdio: "inherit" });
console.log("opportunity temporal production integration passed");

// Controlled relational fixture exercises the actual PostgreSQL adapter's scoped
// predicates, serialization and conflict key without claiming a live DB test.
const { createPgOpportunityTemporalHistoryRepository } = await import('../brain/temporal/opportunityTemporalRepository.js');
const { opportunityTemporalHistoryTable: temporalTable } = await import('../../../../lib/db/src/schema/opportunity-temporal.js');
const { PgDialect } = await import('drizzle-orm/pg-core');
const relationalRows: Array<Record<string, any>> = [];
const dialect = new PgDialect();
const fixtureDb = {
  select(selection?: Record<string, unknown>) {
    return { from() { return { where(predicate: any) { return { async orderBy() {
      const query = dialect.sqlToQuery(predicate);
      const [owner, ...ids] = query.params;
      const byRecipient = query.sql.includes('"recipient_id"');
      return relationalRows.filter(row => row.userId === owner && ids.includes(byRecipient ? row.recipientId : row.opportunityId)).map(row => selection ? { changeId: row.changeKey, evaluatedAt: row.evaluatedAt, state: row.state, occurrenceCycleId: row.occurrenceCycleId, effectiveDate: row.effectiveDate, reason: row.reason, evidence: row.evidence } : row);
    } }; } }; } };
  },
  insert() { return { values(row: Record<string, any>) { return { async onConflictDoNothing() { if (!relationalRows.some(prior => prior.id === row.id)) relationalRows.push({ ...row, createdAt: new Date() }); } }; } }; },
};
const actualAdapter = createPgOpportunityTemporalHistoryRepository(async () => ({ db: fixtureDb, opportunityTemporalHistoryTable: temporalTable }) as any);
const sameChange = displaced.timing.temporal.history.at(-1)!;
for (const [owner, recipient] of [['owner-A', 'recipient-A'], ['owner-A', 'recipient-B'], ['owner-B', 'recipient-A']]) {
  const snapshot = { ...displaced, id: `${recipient}:birthday`, recipient: { id: recipient!, name: recipient! } };
  await actualAdapter.appendChange({ userId: owner!, opportunityId: snapshot.id, change: sameChange, evidence: sameChange.evidence, opportunity: snapshot });
  await actualAdapter.appendChange({ userId: owner!, opportunityId: snapshot.id, change: sameChange, evidence: sameChange.evidence, opportunity: snapshot });
}
if (relationalRows.length !== 3) throw new Error('actual adapter lost scoped same-date history or duplicated unchanged writes');
const ownerA = await actualAdapter.listRetained({ userId: 'owner-A', recipientIds: ['recipient-A', 'recipient-B'] });
const ownerB = await actualAdapter.listRetained({ userId: 'owner-B', recipientIds: ['recipient-A', 'recipient-B'] });
if (ownerA.length !== 2 || ownerB.length !== 1 || ownerB[0]!.opportunity.recipient.id !== 'recipient-A') throw new Error('actual adapter crossed owner or recipient scope');
const scopedHistory = await actualAdapter.loadHistory({ userId: 'owner-B', opportunityId: 'recipient-A:birthday' });
if (scopedHistory.length !== 1 || scopedHistory[0]!.changeId !== sameChange.changeId || scopedHistory[0]!.evidence.dateValue !== '01-20') throw new Error('actual adapter did not round-trip immutable source evidence');
console.log('actual temporal repository adapter isolation and reload checks passed');

for (const failure of ['listRetained', 'loadHistory', 'appendChange'] as const) {
  let writes = 0;
  const failingRepository: OpportunityTemporalHistoryRepository = {
    async listRetained() { if (failure === 'listRetained') throw new Error('controlled listing failure'); return []; },
    async loadHistory() { if (failure === 'loadHistory') throw new Error('controlled history failure'); return []; },
    async appendChange() { writes++; if (failure === 'appendChange') throw new Error('controlled append failure'); },
  };
  const response = await buildConciergeWorkspace({ userId: 'failure-owner', recipients: [{ recipientId: 'failure-recipient', recipientName: 'Fixture' }], generatedAt: '2026-01-01T00:00:00Z', runBrain: async () => execution('failure-recipient', '01-20'), temporalHistoryRepository: failingRepository });
  const opportunity = response.opportunities[0]!;
  if (opportunity.timing.temporal?.persistence !== (failure === 'appendChange' ? 'failed' : 'unavailable') || opportunity.recommendation !== null || response.recommendations.length || response.insights.length || opportunity.presentation.recommendationEligible || opportunity.presentation.insightEligible) throw new Error('history failure falsely reported continuity or surfaced a timed Opportunity: ' + failure);
  if (failure !== 'appendChange' && writes !== 0) throw new Error('history failure appended from an unknown baseline');
}
console.log('production temporal persistence failure checks passed');
