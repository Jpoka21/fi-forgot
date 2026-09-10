import { buildConciergeWorkspace } from "../brain/product/buildConciergeWorkspace.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { execFileSync } from "node:child_process";

function execution(recipientId: string, outcome: "recommend_action" | "wait"): BrainExecutionResult {
  const sourceRuleId = outcome === "wait" ? "wait" : "inactivity";
  const confidence = outcome === "wait" ? Number.NaN : 71;
  return {
    loadResult: { brainContextVersion: 1, relationshipId: recipientId, userId: "user-1", loadedAt: "2026-08-02T00:00:00.000Z", relationshipContext: {} as never },
    extraction: { availableSignals: [], contributorGroups: [] },
    decideResult: { decision: { outcome }, confidence, reasons: [], debugNotes: [] },
    actionPlan: { type: outcome, category: outcome === "wait" ? "none" : "follow_up", priority: outcome === "wait" ? "low" : "high", sourceRuleId, primaryReason: "test", reasons: [], confidence, debugNotes: [] },
    selectedFollowUpQuestion: null,
    normalized: {} as never,
    decisionContext: {} as never,
    ruleEvaluation: {} as never,
  };
}

const payload = await buildConciergeWorkspace({
  userId: "user-1",
  generatedAt: "2026-08-03T00:00:00.000Z",
  recipients: [
    ...Array.from({ length: 7 }, (_, index) => ({ recipientId: index === 0 ? "actionable" : `actionable-${index + 1}`, recipientName: `Action ${index + 1}` })),
    { recipientId: "quiet", recipientName: "Quinn" },
  ],
  runBrain: async (recipientId) => execution(recipientId, recipientId === "quiet" ? "wait" : "recommend_action"),
});

const wire = JSON.parse(JSON.stringify(payload));
if (wire.recommendations.length !== 6 || wire.insights.length !== 4) throw new Error("legacy projection caps changed from six recommendations and four insights");
if (wire.recommendations[0].id !== "actionable:inactivity" || wire.insights[0].id !== "actionable:inactivity:insight") throw new Error("legacy projection identity changed");
if (wire.opportunities.filter((item: { presentation: { recommendationEligible: boolean } }) => item.presentation.recommendationEligible).length !== 3) throw new Error("server presentation policy did not retain exactly three recommendation slots");
const actionable = wire.opportunities.find((item: { id: string }) => item.id === "actionable:inactivity");
const restrained = wire.opportunities.find((item: { id: string }) => item.id === "quiet:wait");
if (!actionable?.recommendation || actionable.confidence.status !== "known" || actionable.confidence.value !== 71) throw new Error("actionable Opportunity did not survive workspace serialization and mapping");
if (!restrained?.restraint.restrained || restrained.recommendation !== null || restrained.relationshipId !== null) throw new Error("restrained Opportunity did not survive workspace serialization and mapping");
if (wire.generatedAt === restrained.timing.observedAt || execution("quiet", "wait").loadResult.loadedAt === restrained.timing.observedAt) throw new Error("generated/load time reused as observation time");
execFileSync(process.execPath, [
  "scripts/node_modules/tsx/dist/cli.mjs",
  "--tsconfig",
  "artifacts/fi-forgot/tsconfig.json",
  "artifacts/fi-forgot/src/__tests__/relationship-opportunity-serialized-consumer.test.ts",
], {
  cwd: process.cwd(),
  env: { ...process.env, RELATIONSHIP_OPPORTUNITY_SERIALIZED_PAYLOAD: JSON.stringify(wire) },
  stdio: "inherit",
});
console.log("relationship opportunity workspace serialization integration passed");
