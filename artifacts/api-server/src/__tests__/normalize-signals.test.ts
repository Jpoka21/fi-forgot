/**
 * Unit tests for brain/normalization/normalizeSignals.
 *
 * Pure module — no database, no orchestrator. Run with:
 *   npx tsx artifacts/api-server/src/__tests__/normalize-signals.test.ts
 */

import { normalizeSignals } from "../brain/normalization/index.js";
import type { BrainSignal } from "../brain/types.js";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expect(label: string, actual: unknown, expected: unknown): void {
  const ok =
    typeof expected === "object" && expected !== null
      ? JSON.stringify(actual) === JSON.stringify(expected)
      : actual === expected;
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      received: ${JSON.stringify(actual)}`);
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

function signal(source: string, label: string, value: unknown): BrainSignal {
  return { source, label, value };
}

section("empty signals → conservative defaults");
{
  const state = normalizeSignals([]);
  expect("identity empty", state.identity, "empty");
  expect("freshness unknown", state.freshness, "unknown");
  expect("history none", state.history, "none");
  expect("writing none", state.writing, "none");
  expect("engagement none", state.engagement, "none");
  expect("momentum new", state.momentum, "new");
  expect("signalCount 0", state.derivedFrom.signalCount, 0);
  expect("sourcesPresent []", state.derivedFrom.sourcesPresent, []);
}

section("pass-through: momentum / timeline / freshness");
{
  const signals: BrainSignal[] = [
    signal("relationship_momentum", "momentum_state", "active"),
    signal("relationship_timeline", "timeline_depth", "rich"),
    signal("conversation_freshness", "freshness_state", "current"),
  ];
  const state = normalizeSignals(signals);
  expect("momentum active", state.momentum, "active");
  expect("history rich", state.history, "rich");
  expect("freshness current", state.freshness, "current");
  expect("signalCount 3", state.derivedFrom.signalCount, 3);
  expect(
    "sourcesPresent",
    state.derivedFrom.sourcesPresent.sort(),
    [
      "conversation_freshness",
      "relationship_momentum",
      "relationship_timeline",
    ].sort(),
  );
}

section("identity — conservative min of score and depth");
{
  const thin = normalizeSignals([
    signal("profile_completeness", "score", 80),
    signal("memory_inventory", "personalization_depth", "light"),
  ]);
  expect("high score + light depth → thin", thin.identity, "thin");

  const established = normalizeSignals([
    signal("profile_completeness", "score", 90),
    signal("memory_inventory", "personalization_depth", "rich"),
  ]);
  expect("high score + rich depth → established", established.identity, "established");

  const empty = normalizeSignals([
    signal("profile_completeness", "score", 0),
    signal("memory_inventory", "personalization_depth", "none"),
  ]);
  expect("score 0 + none → empty", empty.identity, "empty");
}

section("writing — writing_depth mapping");
{
  expect(
    "none → none",
    normalizeSignals([signal("writing_history", "writing_depth", "none")]).writing,
    "none",
  );
  expect(
    "light → low",
    normalizeSignals([signal("writing_history", "writing_depth", "light")]).writing,
    "low",
  );
  expect(
    "moderate → moderate",
    normalizeSignals([signal("writing_history", "writing_depth", "moderate")]).writing,
    "moderate",
  );
  expect(
    "rich → high",
    normalizeSignals([signal("writing_history", "writing_depth", "rich")]).writing,
    "high",
  );
}

section("engagement — independent channel scoring");
{
  const none = normalizeSignals([
    signal("conversation_freshness", "briefing_answer_count", 0),
    signal("conversation_freshness", "follow_up_count", 0),
    signal("conversation_freshness", "recent_update_count", 0),
    signal("relationship_momentum", "engagement_activity_count", 0),
  ]);
  expect("no channels → none", none.engagement, "none");

  const low = normalizeSignals([
    signal("conversation_freshness", "briefing_answer_count", 2),
  ]);
  expect("one channel → low", low.engagement, "low");

  const high = normalizeSignals([
    signal("conversation_freshness", "briefing_answer_count", 1),
    signal("conversation_freshness", "follow_up_count", 1),
    signal("conversation_freshness", "recent_update_count", 1),
    signal("relationship_momentum", "engagement_activity_count", 5),
  ]);
  expect("four channels → high", high.engagement, "high");
}

section("dimensions are independent");
{
  const state = normalizeSignals([
    signal("relationship_momentum", "momentum_state", "dormant"),
    signal("conversation_freshness", "freshness_state", "current"),
    signal("writing_history", "writing_depth", "none"),
    signal("relationship_timeline", "timeline_depth", "rich"),
  ]);
  expect("momentum dormant despite current freshness", state.momentum, "dormant");
  expect("freshness current despite no writing", state.freshness, "current");
  expect("writing none despite rich history", state.writing, "none");
  expect("history rich despite no writing", state.history, "rich");
}

section("freshness fallback to memory_freshness age category");
{
  const state = normalizeSignals([
    signal("memory_freshness", "most_recent_update_age_category", "older"),
  ]);
  expect("older → stale", state.freshness, "stale");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
