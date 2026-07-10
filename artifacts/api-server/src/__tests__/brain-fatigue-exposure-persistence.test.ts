/**
 * Exposure persistence tests (Step 5d).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-fatigue-exposure-persistence.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertValidExposureOpportunityIdentity,
  buildExposureOpportunityKey,
  createInMemoryExposureEventRepository,
  materializeExposureSnapshot,
  type ExposureEvent,
} from "../brain/fatigue/exposure/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");
const EXPOSURE_ROOT = join(BRAIN_ROOT, "fatigue", "exposure");

const LOADED_AT = "2026-07-10T14:00:00.000Z";

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

function expectThrows(label: string, fn: () => void): void {
  try {
    fn();
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log("      expected throw");
  } catch {
    passed++;
    console.log(`  ✓ ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

function event(
  overrides: Partial<ExposureEvent> & Pick<ExposureEvent, "opportunityKey" | "eventType" | "occurredAt">,
): ExposureEvent {
  const [recipientId, sourceRuleId] = overrides.opportunityKey.split(":");
  return {
    recipientId: recipientId ?? "recipient-1",
    sourceRuleId: sourceRuleId ?? "birthday",
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
  section("materializeExposureSnapshot — empty events");
  {
    const snapshot = materializeExposureSnapshot([], LOADED_AT);
    expect("loadedAt", snapshot.loadedAt, LOADED_AT);
    expect("byOpportunityKey empty", snapshot.byOpportunityKey, {});
  }

  section("materializeExposureSnapshot — event aggregation");
  {
    const key = buildExposureOpportunityKey("alice", "birthday");
    const snapshot = materializeExposureSnapshot(
      [
        event({ opportunityKey: key, eventType: "surfaced", occurredAt: "2026-07-09T10:00:00.000Z" }),
        event({ opportunityKey: key, eventType: "surfaced", occurredAt: "2026-07-10T09:00:00.000Z" }),
        event({ opportunityKey: key, eventType: "dismissed", occurredAt: "2026-07-10T11:00:00.000Z" }),
        event({ opportunityKey: key, eventType: "completed", occurredAt: "2026-07-10T12:00:00.000Z" }),
      ],
      LOADED_AT,
    );

    const record = snapshot.byOpportunityKey[key];
    expectTrue("record exists", Boolean(record));
    expect("recipientId", record?.recipientId, "alice");
    expect("sourceRuleId", record?.sourceRuleId, "birthday");
    expect("lastSurfacedAt", record?.lastSurfacedAt, "2026-07-10T09:00:00.000Z");
    expect("lastDismissedAt", record?.lastDismissedAt, "2026-07-10T11:00:00.000Z");
    expect("lastCompletedAt", record?.lastCompletedAt, "2026-07-10T12:00:00.000Z");
    expect("surfacedCount", record?.surfacedCount, 2);
    expect("dismissedCount", record?.dismissedCount, 1);
  }

  section("materializeExposureSnapshot — multiple opportunity keys");
  {
    const keyA = buildExposureOpportunityKey("a", "birthday");
    const keyB = buildExposureOpportunityKey("b", "fresh_update");
    const snapshot = materializeExposureSnapshot(
      [
        event({ opportunityKey: keyA, eventType: "surfaced", occurredAt: "2026-07-09T10:00:00.000Z" }),
        event({ opportunityKey: keyB, eventType: "dismissed", occurredAt: "2026-07-09T11:00:00.000Z" }),
      ],
      LOADED_AT,
    );

    expectTrue("key A present", keyA in snapshot.byOpportunityKey);
    expectTrue("key B present", keyB in snapshot.byOpportunityKey);
    expect("key A surfacedCount", snapshot.byOpportunityKey[keyA]?.surfacedCount, 1);
    expect("key B dismissedCount", snapshot.byOpportunityKey[keyB]?.dismissedCount, 1);
  }

  section("identity validation");
  {
    const key = buildExposureOpportunityKey("alice", "birthday");

    expectThrows("rejects mismatched opportunityKey", () => {
      assertValidExposureOpportunityIdentity({
        opportunityKey: "wrong:key",
        recipientId: "alice",
        sourceRuleId: "birthday",
      });
    });

    assertValidExposureOpportunityIdentity({
      opportunityKey: key,
      recipientId: "alice",
      sourceRuleId: "birthday",
    });
    expectTrue("accepts matching identity", true);
  }

  section("in-memory repository — append only and user isolation");
  {
    const repo = createInMemoryExposureEventRepository();
    const key = buildExposureOpportunityKey("alice", "birthday");

    await repo.insertExposureEvent({
      userId: "user-a",
      opportunityKey: key,
      recipientId: "alice",
      sourceRuleId: "birthday",
      eventType: "surfaced",
      occurredAt: "2026-07-09T10:00:00.000Z",
    });

    await repo.insertExposureEvent({
      userId: "user-b",
      opportunityKey: buildExposureOpportunityKey("bob", "fresh_update"),
      recipientId: "bob",
      sourceRuleId: "fresh_update",
      eventType: "dismissed",
      occurredAt: "2026-07-09T11:00:00.000Z",
    });

    const userAEvents = await repo.listExposureEventsForUser("user-a");
    const userBEvents = await repo.listExposureEventsForUser("user-b");

    expect("user-a event count", userAEvents.length, 1);
    expect("user-b event count", userBEvents.length, 1);
    expect("user-a event type", userAEvents[0]?.eventType, "surfaced");
    expect("user-b event type", userBEvents[0]?.eventType, "dismissed");
    expectTrue("user-a cannot see user-b events", userAEvents.every((item) => item.recipientId === "alice"));
  }

  section("in-memory repository — since filter");
  {
    const repo = createInMemoryExposureEventRepository();
    const key = buildExposureOpportunityKey("alice", "birthday");

    await repo.insertExposureEvent({
      userId: "user-1",
      opportunityKey: key,
      recipientId: "alice",
      sourceRuleId: "birthday",
      eventType: "surfaced",
      occurredAt: "2026-07-08T10:00:00.000Z",
    });

    await repo.insertExposureEvent({
      userId: "user-1",
      opportunityKey: key,
      recipientId: "alice",
      sourceRuleId: "birthday",
      eventType: "surfaced",
      occurredAt: "2026-07-10T10:00:00.000Z",
    });

    const filtered = await repo.listExposureEventsForUser("user-1", {
      since: "2026-07-09T00:00:00.000Z",
    });

    expect("filtered count", filtered.length, 1);
    expect("filtered occurredAt", filtered[0]?.occurredAt, "2026-07-10T10:00:00.000Z");
  }

  section("repository append preserves prior events");
  {
    const repo = createInMemoryExposureEventRepository();
    const key = buildExposureOpportunityKey("alice", "birthday");

    await repo.insertExposureEvent({
      userId: "user-1",
      opportunityKey: key,
      recipientId: "alice",
      sourceRuleId: "birthday",
      eventType: "surfaced",
      occurredAt: "2026-07-08T10:00:00.000Z",
    });

    await repo.insertExposureEvent({
      userId: "user-1",
      opportunityKey: key,
      recipientId: "alice",
      sourceRuleId: "birthday",
      eventType: "dismissed",
      occurredAt: "2026-07-09T10:00:00.000Z",
    });

    const events = await repo.listExposureEventsForUser("user-1");
    expect("append-only count", events.length, 2);
    expect("first event preserved", events[0]?.eventType, "surfaced");
    expect("second event appended", events[1]?.eventType, "dismissed");
  }

  section("architecture — persistence module remains product agnostic");
  {
    const source = listTypeScriptSources(EXPOSURE_ROOT);

    for (const token of [
      "Dashboard",
      "Notifications",
      "Concierge",
      "requestingSurface",
      "FatigueSurface",
      "fatigueScore",
      '"read"',
      '"deferred"',
    ]) {
      expectTrue(`exposure source has no ${token}`, !source.includes(token));
    }
  }

  section("architecture — product builders do not own exposure recording");
  {
    const builders = [
      "product/buildDashboardBrainOpportunities.ts",
      "product/buildNotifications.ts",
      "product/buildConciergeWorkspace.ts",
    ];

    for (const builderPath of builders) {
      const source = readFileSync(join(BRAIN_ROOT, builderPath), "utf8");
      expectTrue(`${builderPath} uses orchestrateProductBrainFatigue`, source.includes("orchestrateProductBrainFatigue"));
      expectTrue(`${builderPath} does not import recordExposureEvent`, !source.includes("recordExposureEvent"));
      expectTrue(`${builderPath} does not import recordSurfacedOpportunities`, !source.includes("recordSurfacedOpportunities"));
      expectTrue(`${builderPath} does not import applyFatigue`, !source.includes("applyFatigue"));
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
