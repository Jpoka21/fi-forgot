/**
 * Brain outcome → exposure projection tests (Step 6d).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-outcomes-projection.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createInMemoryBrainOutcomeRepository,
  createBrainOutcomeExposureProjector,
  mapBrainOutcomeToExposure,
  projectBrainOutcomeEvents,
  recordAndProjectBrainOutcome,
  type BrainOutcomeEvent,
  type RecordBrainOutcomeInput,
} from "../brain/outcomes/index.js";
import {
  createInMemoryExposureEventRepository,
  materializeExposureSnapshot,
} from "../brain/fatigue/exposure/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");
const OUTCOMES_ROOT = join(BRAIN_ROOT, "outcomes");
const PROJECTION_ROOT = join(OUTCOMES_ROOT, "projection");

const LOADED_AT = "2026-07-10T15:00:00.000Z";

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

function expectTrue(label: string, condition: boolean): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

function outcomeEvent(
  overrides: Partial<BrainOutcomeEvent> & Pick<BrainOutcomeEvent, "id" | "outcomeType">,
): BrainOutcomeEvent {
  return {
    userId: "user-1",
    recipientId: "recipient-1",
    opportunityKey: "recipient-1:fresh_update",
    occurredAt: "2026-07-10T14:00:00.000Z",
    ...overrides,
  };
}

function listTypeScriptSources(root: string): string {
  const files: string[] = [];

  function walk(directory: string): void {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.endsWith(".ts")) {
        files.push(readFileSync(fullPath, "utf8"));
      }
    }
  }

  walk(root);
  return files.join("\n");
}

async function run(): Promise<void> {
  section("mapping — question_answered maps to completed");
  {
    const event = outcomeEvent({ id: "outcome-1", outcomeType: "question_answered" });
    const mapped = mapBrainOutcomeToExposure(event);
    expect("eventType", mapped?.eventType, "completed");
    expect("sourceOutcomeEventId", mapped?.sourceOutcomeEventId, "outcome-1");
    expect("occurredAt", mapped?.occurredAt, "2026-07-10T14:00:00.000Z");
    expect("userId", mapped?.userId, "user-1");
    expect("recipientId", mapped?.recipientId, "recipient-1");
    expect("opportunityKey", mapped?.opportunityKey, "recipient-1:fresh_update");
    expect("sourceRuleId", mapped?.sourceRuleId, "fresh_update");
  }

  section("mapping — card_sent maps to completed");
  {
    const event = outcomeEvent({
      id: "outcome-2",
      outcomeType: "card_sent",
      opportunityKey: "recipient-1:birthday",
    });
    const mapped = mapBrainOutcomeToExposure(event);
    expect("eventType", mapped?.eventType, "completed");
    expect("sourceRuleId", mapped?.sourceRuleId, "birthday");
  }

  section("mapping — opportunity_dismissed maps to dismissed");
  {
    const event = outcomeEvent({ id: "outcome-3", outcomeType: "opportunity_dismissed" });
    const mapped = mapBrainOutcomeToExposure(event);
    expect("eventType", mapped?.eventType, "dismissed");
  }

  section("mapping — card_created and card_approved are ignored");
  {
    expectTrue(
      "card_created returns null",
      mapBrainOutcomeToExposure(outcomeEvent({ id: "a", outcomeType: "card_created" })) === null,
    );
    expectTrue(
      "card_approved returns null",
      mapBrainOutcomeToExposure(outcomeEvent({ id: "b", outcomeType: "card_approved" })) === null,
    );
  }

  section("mapping — does not mutate input");
  {
    const event = outcomeEvent({ id: "outcome-4", outcomeType: "question_answered" });
    const snapshot = structuredClone(event);
    mapBrainOutcomeToExposure(event);
    expect("event unchanged", event, snapshot);
  }

  section("idempotency — first projection appends one exposure event");
  {
    const exposureRepo = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepo);
    const event = outcomeEvent({ id: "outcome-5", outcomeType: "question_answered" });

    const result = await projector.project(event);
    const listed = await exposureRepo.listExposureEventsForUser("user-1");

    expect("status", result.status, "projected");
    expect("exposure count", listed.length, 1);
    expect("sourceOutcomeEventId", listed[0]?.sourceOutcomeEventId, "outcome-5");
    expect("exposure occurredAt uses outcome time", listed[0]?.occurredAt, event.occurredAt);
  }

  section("idempotency — repeated projection is already_projected");
  {
    const exposureRepo = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepo);
    const event = outcomeEvent({ id: "outcome-6", outcomeType: "card_sent" });

    const first = await projector.project(event);
    const second = await projector.project(event);
    const listed = await exposureRepo.listExposureEventsForUser("user-1");

    expect("first status", first.status, "projected");
    expect("second status", second.status, "already_projected");
    expect("exposure count unchanged", listed.length, 1);
    if (first.status === "projected" && second.status === "already_projected") {
      expect("same exposure id", second.exposureEvent.id, first.exposureEvent.id);
    }
  }

  section("idempotency — distinct outcome IDs create distinct exposure events");
  {
    const exposureRepo = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepo);
    const key = "recipient-1:birthday";

    await projector.project(
      outcomeEvent({ id: "outcome-7a", outcomeType: "question_answered", opportunityKey: key }),
    );
    await projector.project(
      outcomeEvent({ id: "outcome-7b", outcomeType: "card_sent", opportunityKey: key }),
    );

    const listed = await exposureRepo.listExposureEventsForUser("user-1");
    expect("two exposure events", listed.length, 2);
    expectTrue(
      "distinct sourceOutcomeEventId values",
      new Set(listed.map((item) => item.sourceOutcomeEventId)).size === 2,
    );
  }

  section("ignored outcomes return non_projecting_outcome");
  {
    const exposureRepo = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepo);
    const result = await projector.project(outcomeEvent({ id: "outcome-8", outcomeType: "card_created" }));

    expect("status", result.status, "ignored");
    if (result.status === "ignored") {
      expect("reason", result.reason, "non_projecting_outcome");
    }
    const listed = await exposureRepo.listExposureEventsForUser("user-1");
    expect("no exposure writes", listed.length, 0);
  }

  section("replay — persisted outcome from repository projects identically");
  {
    const outcomeRepo = createInMemoryBrainOutcomeRepository();
    const exposureRepo = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepo);

    const persisted = await outcomeRepo.append({
      userId: "user-1",
      recipientId: "recipient-1",
      opportunityKey: "recipient-1:fresh_update",
      outcomeType: "question_answered",
      occurredAt: new Date("2026-07-10T14:00:00.000Z"),
    });

    const loaded = (await outcomeRepo.listOutcomeEventsForUser("user-1"))[0];
    expectTrue("loaded event exists", Boolean(loaded));

    const fromAppend = await projector.project(persisted);
    const fromLoaded = await projector.project(loaded!);
    const secondPass = await projector.project(loaded!);

    expect("fromAppend status", fromAppend.status, "projected");
    expect("fromLoaded status", fromLoaded.status, "already_projected");
    expect("secondPass status", secondPass.status, "already_projected");
  }

  section("recordAndProjectBrainOutcome — append then project");
  {
    const outcomeRepo = createInMemoryBrainOutcomeRepository();
    const exposureRepo = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepo);

    const input: RecordBrainOutcomeInput = {
      userId: "user-1",
      recipientId: "recipient-1",
      opportunityKey: "recipient-1:birthday",
      outcomeType: "card_sent",
      occurredAt: new Date("2026-07-10T16:00:00.000Z"),
      metadata: { cardId: "card-1", cardStatus: "Mailed to me" },
    };

    const result = await recordAndProjectBrainOutcome(input, {
      outcomeRepository: outcomeRepo,
      projector,
    });

    expect("projection status", result.projection.status, "projected");
    expect("outcome id assigned", typeof result.outcome.id, "string");
    const outcomes = await outcomeRepo.listOutcomeEventsForUser("user-1");
    const exposures = await exposureRepo.listExposureEventsForUser("user-1");
    expect("one outcome persisted", outcomes.length, 1);
    expect("one exposure projected", exposures.length, 1);
  }

  section("recordAndProjectBrainOutcome — outcome append failure prevents projection");
  {
    const exposureRepo = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepo);
    const failingRepo = {
      append: async () => {
        throw new Error("outcome append failed");
      },
      appendOnceForSourceAction: async () => {
        throw new Error("outcome append failed");
      },
      listOutcomeEventsForUser: async () => [],
    };

    let threw = false;
    try {
      await recordAndProjectBrainOutcome(
        {
          userId: "user-1",
          recipientId: "recipient-1",
          opportunityKey: "recipient-1:birthday",
          outcomeType: "card_sent",
        },
        { outcomeRepository: failingRepo, projector },
      );
    } catch {
      threw = true;
    }

    expectTrue("append failure propagates", threw);
    const exposures = await exposureRepo.listExposureEventsForUser("user-1");
    expect("no exposure on failed append", exposures.length, 0);
  }

  section("recordAndProjectBrainOutcome — projection failure leaves outcome persisted");
  {
    const outcomeRepo = createInMemoryBrainOutcomeRepository();
    const failingExposureRepo = {
      appendExposureEvent: async () => {
        throw new Error("exposure append failed");
      },
      insertExposureEvent: async () => {},
      listExposureEventsForUser: async () => [],
    };
    const projector = createBrainOutcomeExposureProjector(failingExposureRepo);

    let threw = false;
    try {
      await recordAndProjectBrainOutcome(
        {
          userId: "user-1",
          recipientId: "recipient-1",
          opportunityKey: "recipient-1:birthday",
          outcomeType: "question_answered",
        },
        { outcomeRepository: outcomeRepo, projector },
      );
    } catch {
      threw = true;
    }

    expectTrue("projection failure propagates", threw);
    const outcomes = await outcomeRepo.listOutcomeEventsForUser("user-1");
    expect("outcome remains persisted", outcomes.length, 1);
  }

  section("exposure materialization — projected completed and dismissed events");
  {
    const exposureRepo = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepo);
    const key = "recipient-1:birthday";

    await projector.project(
      outcomeEvent({
        id: "outcome-9",
        outcomeType: "question_answered",
        opportunityKey: key,
        occurredAt: "2026-07-09T10:00:00.000Z",
      }),
    );
    await projector.project(
      outcomeEvent({
        id: "outcome-10",
        outcomeType: "opportunity_dismissed",
        opportunityKey: key,
        occurredAt: "2026-07-10T11:00:00.000Z",
      }),
    );

    const events = await exposureRepo.listExposureEventsForUser("user-1");
    const snapshot = materializeExposureSnapshot(events, LOADED_AT);
    const record = snapshot.byOpportunityKey[key];

    expect("lastCompletedAt", record?.lastCompletedAt, "2026-07-09T10:00:00.000Z");
    expect("lastDismissedAt", record?.lastDismissedAt, "2026-07-10T11:00:00.000Z");
  }

  section("projectBrainOutcomeEvents preserves deterministic order");
  {
    const exposureRepo = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepo);
    const events = [
      outcomeEvent({ id: "batch-1", outcomeType: "card_created" }),
      outcomeEvent({ id: "batch-2", outcomeType: "question_answered" }),
      outcomeEvent({ id: "batch-3", outcomeType: "card_approved" }),
    ];

    const results = await projectBrainOutcomeEvents(events, projector);
    expect("result count", results.length, 3);
    expect("first ignored", results[0]?.status, "ignored");
    expect("second projected", results[1]?.status, "projected");
    expect("third ignored", results[2]?.status, "ignored");
  }

  section("architecture — projection does not import routes, builders, planner, or fatigue rules");
  {
    const projectionSource = listTypeScriptSources(PROJECTION_ROOT);

    for (const token of [
      "express",
      "buildDashboardBrainOpportunities",
      "buildNotifications",
      "buildConciergeWorkspace",
      "planAttentionOrder",
      "applyFatigue",
      "recentlySurfacedRule",
      "recordSurfacedOpportunities",
      "fi-forgot",
      "BrainExecutionId:",
      "brainActionToken",
    ]) {
      expectTrue(`projection source has no ${token}`, !projectionSource.includes(token));
    }

    expectTrue(
      "projection uses exposure repository contract",
      projectionSource.includes("ExposureEventRepository"),
    );
  }

  section("architecture — non-projection outcome files do not write exposure directly");
  {
    const nonProjectionFiles = readdirSync(OUTCOMES_ROOT)
      .filter((entry) => entry.endsWith(".ts"))
      .map((entry) => readFileSync(join(OUTCOMES_ROOT, entry), "utf8"))
      .join("\n");

    for (const token of ["appendExposureEvent", "insertExposureEvent", "recordSurfacedOpportunities"]) {
      expectTrue(`non-projection outcomes has no ${token}`, !nonProjectionFiles.includes(token));
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("Failures:", failures.join(", "));
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
