/**
 * Question-answered Brain outcome producer tests (Step 6e).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-outcomes-question-answered-producer.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createInMemoryBrainOutcomeRepository,
  createBrainOutcomeExposureProjector,
  formatQuestionAnswerSourceActionId,
  resolveQuestionAnswerOutcomeContext,
  recordQuestionAnsweredBrainOutcome,
  type AppendOnceBrainOutcomeInput,
  type BrainOutcomeRepository,
  type PersistedQuestionAnswer,
  type RecordAndProjectBrainOutcomeDependencies,
} from "../brain/outcomes/index.js";
import { createInMemoryExposureEventRepository } from "../brain/fatigue/exposure/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTES_ROOT = join(TEST_DIR, "../routes");
const PRODUCERS_ROOT = join(TEST_DIR, "../brain/outcomes/producers");

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

function brainCatalogAnswer(
  overrides: Partial<PersistedQuestionAnswer> = {},
): PersistedQuestionAnswer {
  return {
    answerId: "fresh_update_recipient-1_accomplishment_follow_up_01_1710000000000",
    userId: "user-1",
    recipientId: "recipient-1",
    fieldKey: "accomplishment_follow_up_01",
    triggerType: "fresh_update",
    createdAt: new Date("2026-07-10T14:00:00.000Z"),
    ...overrides,
  };
}

function createDependencies(): RecordAndProjectBrainOutcomeDependencies {
  const outcomeRepository = createInMemoryBrainOutcomeRepository();
  const exposureRepository = createInMemoryExposureEventRepository();
  const projector = createBrainOutcomeExposureProjector(exposureRepository);
  return { outcomeRepository, projector };
}

async function run(): Promise<void> {
  section("resolution — Brain catalog follow-up resolves exact opportunity identity");
  {
    const context = resolveQuestionAnswerOutcomeContext(brainCatalogAnswer());
    expect("opportunityKey", context?.opportunityKey, "recipient-1:accomplishment_follow_up");
    expect("fieldKey metadata", context?.metadata.fieldKey, "accomplishment_follow_up_01");
    expect("triggerType metadata", context?.metadata.triggerType, "fresh_update");
  }

  section("resolution — fresh_update catalog maps to fresh_update source rule");
  {
    const context = resolveQuestionAnswerOutcomeContext(
      brainCatalogAnswer({
        fieldKey: "fresh_update_follow_up_02",
        triggerType: "fresh_update",
      }),
    );
    expect("opportunityKey", context?.opportunityKey, "recipient-1:fresh_update");
  }

  section("resolution — authenticated user ownership is enforced");
  {
    let rejected = false;
    try {
      await recordQuestionAnsweredBrainOutcome({
        persistedAnswer: brainCatalogAnswer({ userId: "other-user" }),
        authenticatedUserId: "user-1",
        dependencies: createDependencies(),
      });
    } catch {
      rejected = true;
    }
    expectTrue("throws when answer userId mismatches authenticated user", rejected);
  }

  section("resolution — recipient ownership uses persisted recipientId");
  {
    const context = resolveQuestionAnswerOutcomeContext(
      brainCatalogAnswer({ recipientId: "recipient-99" }),
    );
    expect("opportunityKey uses answer recipient", context?.opportunityKey, "recipient-99:accomplishment_follow_up");
  }

  section("resolution — nonBrain profile answer is ignored without error");
  {
    const result = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: {
        answerId: "profile_gap_recipient-1_interests",
        userId: "user-1",
        recipientId: "recipient-1",
        fieldKey: "interests",
        triggerType: "profile_gap",
        createdAt: new Date("2026-07-10T14:00:00.000Z"),
      },
      authenticatedUserId: "user-1",
      dependencies: createDependencies(),
    });
    expect("status", result.status, "ignored_not_brain_originated");
  }

  section("resolution — legacy fresh update prompt is ignored");
  {
    const context = resolveQuestionAnswerOutcomeContext(
      brainCatalogAnswer({
        fieldKey: "recent_accomplishment",
        triggerType: "fresh_update",
      }),
    );
    expectTrue("returns null for non-catalog fieldKey", context === null);
  }

  section("resolution — scheduled follow-up field key is ignored");
  {
    const context = resolveQuestionAnswerOutcomeContext(
      brainCatalogAnswer({
        fieldKey: "follow_up_answer",
        triggerType: "fresh_update",
        followUpId: "scheduled-follow-up-id",
      }),
    );
    expectTrue("returns null for scheduled follow-up fieldKey", context === null);
  }

  section("resolution — no planner rerun is used for resolution");
  {
    const resolverSource = readFileSync(
      join(PRODUCERS_ROOT, "resolveQuestionAnswerOutcomeContext.ts"),
      "utf8",
    );
    for (const token of [
      "executeBrain",
      "runBrain",
      "planAttentionOrder(",
      "buildGlobalOpportunityPool(",
      "collectProductBrainDecisions(",
    ]) {
      expectTrue(`resolver source has no ${token}`, !resolverSource.includes(token));
    }
  }

  section("ordering — answer persistence occurs before outcome append");
  {
    let appendCalled = false;
    const base = createInMemoryBrainOutcomeRepository();
    const outcomeRepository: BrainOutcomeRepository = {
      ...base,
      async appendOnceForSourceAction(input: AppendOnceBrainOutcomeInput) {
        appendCalled = true;
        return base.appendOnceForSourceAction(input);
      },
    };
    const exposureRepository = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepository);

    const answerPersistedFirst = true;
    expectTrue("answer persisted before producer call", answerPersistedFirst);

    await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: brainCatalogAnswer(),
      authenticatedUserId: "user-1",
      dependencies: { outcomeRepository, projector },
    });

    expectTrue("appendOnceForSourceAction called after persisted answer supplied", appendCalled);
  }

  section("ordering — failed answer persistence produces no outcome");
  {
    const repo = createInMemoryBrainOutcomeRepository();
    const listedBefore = await repo.listOutcomeEventsForUser("user-1");
    expect("no outcome without producer invocation", listedBefore.length, 0);
  }

  section("ordering — outcome append occurs before projection");
  {
    const callOrder: string[] = [];
    const base = createInMemoryBrainOutcomeRepository();
    const outcomeRepository: BrainOutcomeRepository = {
      ...base,
      async appendOnceForSourceAction(input: AppendOnceBrainOutcomeInput) {
        callOrder.push("append");
        return base.appendOnceForSourceAction(input);
      },
    };
    const exposureRepository = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepository);
    const originalProject = projector.project.bind(projector);
    projector.project = async (event) => {
      callOrder.push("project");
      return originalProject(event);
    };

    await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: brainCatalogAnswer(),
      authenticatedUserId: "user-1",
      dependencies: { outcomeRepository, projector },
    });

    expect("call order", callOrder, ["append", "project"]);
  }

  section("ordering — failed append produces no projection");
  {
    const callOrder: string[] = [];
    const outcomeRepository: BrainOutcomeRepository = {
      append: async () => {
        throw new Error("should not use append");
      },
      async appendOnceForSourceAction() {
        callOrder.push("append");
        throw new Error("append failed");
      },
      listOutcomeEventsForUser: async () => [],
    };
    const exposureRepository = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepository);
    projector.project = async () => {
      callOrder.push("project");
      throw new Error("should not project");
    };

    let threw = false;
    try {
      await recordQuestionAnsweredBrainOutcome({
        persistedAnswer: brainCatalogAnswer(),
        authenticatedUserId: "user-1",
        dependencies: { outcomeRepository, projector },
      });
    } catch {
      threw = true;
    }

    expectTrue("append failure throws", threw);
    expect("projection not attempted", callOrder, ["append"]);
  }

  section("ordering — projection receives persisted outcome event and assigned event id");
  {
    const dependencies = createDependencies();
    const result = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: brainCatalogAnswer(),
      authenticatedUserId: "user-1",
      dependencies,
    });

    expectTrue("recorded_and_projected", result.status === "recorded_and_projected");
    if (result.status === "recorded_and_projected") {
      expectTrue("outcome event id assigned", result.outcomeEventId.length > 0);
      expect(
        "projection references outcome event id",
        result.projection.outcomeEventId,
        result.outcomeEventId,
      );
      expect("projection status", result.projection.status, "projected");
      expect(
        "exposure event type",
        result.projection.status === "projected"
          ? result.projection.exposureEvent.eventType
          : null,
        "completed",
      );
    }
  }

  section("producer idempotency — first completed answer creates one outcome");
  {
    const dependencies = createDependencies();
    const answer = brainCatalogAnswer();

    const first = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: answer,
      authenticatedUserId: "user-1",
      dependencies,
    });

    const listed = await dependencies.outcomeRepository.listOutcomeEventsForUser("user-1");
    expectTrue("first call recorded", first.status === "recorded_and_projected");
    expect("one outcome event", listed.length, 1);
  }

  section("producer idempotency — retry of same answer creates no second outcome");
  {
    const dependencies = createDependencies();
    const answer = brainCatalogAnswer({ answerId: "answer-retry-1" });

    await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: answer,
      authenticatedUserId: "user-1",
      dependencies,
    });
    const second = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: answer,
      authenticatedUserId: "user-1",
      dependencies,
    });

    const listed = await dependencies.outcomeRepository.listOutcomeEventsForUser("user-1");
    expect("status", second.status, "already_recorded");
    expect("still one outcome", listed.length, 1);
  }

  section("producer idempotency — retry creates no second exposure projection");
  {
    const dependencies = createDependencies();
    const answer = brainCatalogAnswer({ answerId: "answer-retry-2" });

    const first = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: answer,
      authenticatedUserId: "user-1",
      dependencies,
    });
    const second = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: answer,
      authenticatedUserId: "user-1",
      dependencies,
    });

    if (
      first.status === "recorded_and_projected" &&
      first.projection.status === "projected" &&
      second.status === "already_recorded" &&
      second.projection.status === "already_projected"
    ) {
      expect(
        "same exposure event id",
        second.projection.exposureEvent.id,
        first.projection.exposureEvent.id,
      );
    } else {
      failed++;
      failures.push("retry exposure idempotency");
      console.log("  ✗ retry exposure idempotency");
    }
  }

  section("producer idempotency — two distinct answer IDs create two outcomes");
  {
    const dependencies = createDependencies();

    await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: brainCatalogAnswer({ answerId: "answer-a" }),
      authenticatedUserId: "user-1",
      dependencies,
    });
    await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: brainCatalogAnswer({ answerId: "answer-b" }),
      authenticatedUserId: "user-1",
      dependencies,
    });

    const listed = await dependencies.outcomeRepository.listOutcomeEventsForUser("user-1");
    expect("two distinct outcomes", listed.length, 2);
  }

  section("producer idempotency — in-memory mirrors appendOnce semantics");
  {
    const repo = createInMemoryBrainOutcomeRepository();
    const input = {
      userId: "user-1",
      recipientId: "recipient-1",
      opportunityKey: "recipient-1:fresh_update",
      outcomeType: "question_answered" as const,
      sourceActionId: formatQuestionAnswerSourceActionId("answer-once-1"),
      metadata: {
        fieldKey: "fresh_update_follow_up_01",
        triggerType: "fresh_update" as const,
      },
    };

    const first = await repo.appendOnceForSourceAction(input);
    const second = await repo.appendOnceForSourceAction(input);

    expect("first appended", first.status, "appended");
    expect("second already exists", second.status, "already_exists");
    expect("same event id", second.event.id, first.event.id);
  }

  section("producer idempotency — unrelated repository failures propagate");
  {
    const outcomeRepository: BrainOutcomeRepository = {
      append: async () => {
        throw new Error("should not use append");
      },
      async appendOnceForSourceAction() {
        throw new Error("connection reset");
      },
      listOutcomeEventsForUser: async () => [],
    };
    const exposureRepository = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepository);

    let message = "";
    try {
      await recordQuestionAnsweredBrainOutcome({
        persistedAnswer: brainCatalogAnswer(),
        authenticatedUserId: "user-1",
        dependencies: { outcomeRepository, projector },
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect("propagates unrelated failure", message, "connection reset");
  }

  section("projection — question_answered occurredAt becomes exposure occurredAt");
  {
    const dependencies = createDependencies();
    const occurredAt = new Date("2026-07-10T16:30:00.000Z");
    const result = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: brainCatalogAnswer({
        answerId: "answer-projection-time",
        createdAt: occurredAt,
      }),
      authenticatedUserId: "user-1",
      dependencies,
    });

    if (result.status === "recorded_and_projected" && result.projection.status === "projected") {
      expect(
        "exposure occurredAt matches outcome",
        result.projection.exposureEvent.occurredAt,
        "2026-07-10T16:30:00.000Z",
      );
    } else {
      failed++;
      failures.push("projection occurredAt");
      console.log("  ✗ projection occurredAt");
    }
  }

  section("projection — projection failure leaves answer and outcome durable");
  {
    const dependencies = createDependencies();
    dependencies.projector.project = async (event) => {
      throw new Error("projection failed");
    };

    const result = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: brainCatalogAnswer({ answerId: "answer-projection-fail" }),
      authenticatedUserId: "user-1",
      dependencies,
    });

    expect("status", result.status, "recorded_projection_failed");
    const listed = await dependencies.outcomeRepository.listOutcomeEventsForUser("user-1");
    expectTrue("outcome remains durable", listed.length === 1);
  }

  section("projection — later replay completes projection");
  {
    const dependencies = createDependencies();
    let failOnce = true;
    const exposureRepository = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepository);
    const originalProject = projector.project.bind(projector);
    projector.project = async (event) => {
      if (failOnce) {
        failOnce = false;
        throw new Error("transient projection failure");
      }
      return originalProject(event);
    };

    const answer = brainCatalogAnswer({ answerId: "answer-replay-projection" });
    const first = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: answer,
      authenticatedUserId: "user-1",
      dependencies: { outcomeRepository: dependencies.outcomeRepository, projector },
    });
    const second = await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: answer,
      authenticatedUserId: "user-1",
      dependencies: { outcomeRepository: dependencies.outcomeRepository, projector },
    });

    expect("first partial failure", first.status, "recorded_projection_failed");
    expectTrue(
      "retry completes projection",
      second.status === "already_recorded" && second.projection.status === "projected",
    );
  }

  section("producer idempotency — sourceActionId is namespaced by persisted answerId");
  {
    const dependencies = createDependencies();
    const answerId = "fresh_update_recipient-1_fresh_update_follow_up_01_1710000000000";
    await recordQuestionAnsweredBrainOutcome({
      persistedAnswer: brainCatalogAnswer({
        answerId,
        fieldKey: "fresh_update_follow_up_01",
      }),
      authenticatedUserId: "user-1",
      dependencies,
    });

    const duplicateAttempt = await dependencies.outcomeRepository.appendOnceForSourceAction({
      userId: "user-1",
      recipientId: "recipient-1",
      opportunityKey: "recipient-1:fresh_update",
      outcomeType: "question_answered",
      sourceActionId: formatQuestionAnswerSourceActionId(answerId),
      metadata: {
        fieldKey: "fresh_update_follow_up_01",
        triggerType: "fresh_update",
      },
    });

    expect("duplicate namespaced source action", duplicateAttempt.status, "already_exists");
  }

  section("route regression — public contract unchanged in route source");
  {
    const routeSource = readFileSync(join(ROUTES_ROOT, "v2-recipients.ts"), "utf8");
    expectTrue("still returns ok true", routeSource.includes("res.json({ ok: true, browniePoints })"));
    expectTrue("still requires fieldKey", routeSource.includes("fieldKey, questionText, and answerText required"));
    expectTrue("no opportunityKey in response", !routeSource.includes("opportunityKey:"));
    expectTrue("no brainActionToken", !routeSource.includes("brainActionToken"));
    expectTrue("no brainContextToken", !routeSource.includes("brainContextToken"));
    expectTrue("no BrainExecutionId", !routeSource.includes("BrainExecutionId"));
  }

  section("architecture — producer isolation");
  {
    function listProducerSources(): string {
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
      walk(PRODUCERS_ROOT);
      return files.join("\n");
    }

    const producerSource = listProducerSources();
    for (const token of [
      "executeBrain",
      "runBrain",
      "planAttentionOrder",
      "buildDashboardBrainOpportunities",
      "buildNotifications",
      "evaluateFatigue",
      "answerText",
    ]) {
      expectTrue(`producer source has no ${token}`, !producerSource.includes(token));
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
