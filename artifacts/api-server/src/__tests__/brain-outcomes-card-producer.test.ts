/**
 * Card Brain outcome producer tests (Step 6f.1).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-outcomes-card-producer.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { assertValidBrainSourceRuleIdForCardProvenance } from "../brain/cards/validateBrainSourceRuleId.js";
import { buildOpportunityKey } from "../brain/attention/buildOpportunityKey.js";
import {
  createInMemoryBrainOutcomeRepository,
  createBrainOutcomeExposureProjector,
  detectCardOutcomeTransitions,
  formatCardApprovedSourceActionId,
  formatCardCreatedSourceActionId,
  formatCardOutcomeSourceActionId,
  formatCardSentSourceActionId,
  mapBrainOutcomeToExposure,
  recordCardBrainOutcome,
  recordCardBrainOutcomes,
  resolveCardOutcomeContext,
  type AppendOnceBrainOutcomeInput,
  type BrainOutcomeRepository,
  type PersistedPersonalCard,
  type RecordAndProjectBrainOutcomeDependencies,
} from "../brain/outcomes/index.js";
import { createInMemoryExposureEventRepository } from "../brain/fatigue/exposure/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTES_ROOT = join(TEST_DIR, "../routes");
const PRODUCERS_ROOT = join(TEST_DIR, "../brain/outcomes/producers");
const CARDS_ROOT = join(TEST_DIR, "../brain/cards");

const VALID_BRAIN_SOURCE_RULE_ID = "birthday";

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

function brainCard(overrides: Partial<PersistedPersonalCard> = {}): PersistedPersonalCard {
  return {
    id: "card-1",
    userId: "user-1",
    recipientId: "recipient-1",
    status: "Card being drafted",
    brainSourceRuleId: VALID_BRAIN_SOURCE_RULE_ID,
    occurredAt: new Date("2026-07-10T14:00:00.000Z"),
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
  section("provenance validation — registered rule id accepted");
  {
    let threw = false;
    try {
      assertValidBrainSourceRuleIdForCardProvenance(VALID_BRAIN_SOURCE_RULE_ID);
    } catch {
      threw = true;
    }
    expectTrue("birthday rule accepted", !threw);
  }

  section("provenance validation — invalid rule id rejected");
  {
    let message = "";
    try {
      assertValidBrainSourceRuleIdForCardProvenance("not_a_real_rule");
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expectTrue("rejects unknown rule", message.includes("not a registered Brain rule id"));
  }

  section("provenance validation — wait rejected");
  {
    let message = "";
    try {
      assertValidBrainSourceRuleIdForCardProvenance("wait");
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expectTrue("rejects wait", message.includes("wait"));
  }

  section("provenance validation — empty string rejected");
  {
    let threw = false;
    try {
      assertValidBrainSourceRuleIdForCardProvenance("   ");
    } catch {
      threw = true;
    }
    expectTrue("rejects empty", threw);
  }

  section("resolution — opportunity key rebuilt through canonical builder");
  {
    const context = resolveCardOutcomeContext(
      brainCard({ brainSourceRuleId: VALID_BRAIN_SOURCE_RULE_ID }),
    );
    expect(
      "opportunityKey",
      context?.opportunityKey,
      buildOpportunityKey("recipient-1", VALID_BRAIN_SOURCE_RULE_ID),
    );
    expect("metadata cardId only", context?.metadata, {
      cardId: "card-1",
      cardStatus: "Card being drafted",
    });
  }

  section("resolution — null provenance returns ignored without error");
  {
    const context = resolveCardOutcomeContext(brainCard({ brainSourceRuleId: null }));
    expectTrue("context is null", context === null);

    const result = await recordCardBrainOutcome({
      persistedCard: brainCard({ brainSourceRuleId: null }),
      outcomeType: "card_created",
      authenticatedUserId: "user-1",
      dependencies: createDependencies(),
    });
    expect("status", result.status, "ignored_not_brain_originated");
  }

  section("resolution — authenticated user ownership enforced");
  {
    let rejected = false;
    try {
      await recordCardBrainOutcome({
        persistedCard: brainCard({ userId: "other-user" }),
        outcomeType: "card_created",
        authenticatedUserId: "user-1",
        dependencies: createDependencies(),
      });
    } catch {
      rejected = true;
    }
    expectTrue("throws when card userId mismatches authenticated user", rejected);
  }

  section("transitions — insert detects card_created");
  {
    const transitions = detectCardOutcomeTransitions({
      isInsert: true,
      previousStatus: null,
      newStatus: "Card being drafted",
    });
    expect("transitions", transitions, ["card_created"]);
  }

  section("transitions — first Approved detects card_approved");
  {
    const transitions = detectCardOutcomeTransitions({
      isInsert: false,
      previousStatus: "Ready for approval",
      newStatus: "Approved",
    });
    expect("transitions", transitions, ["card_approved"]);
  }

  section("transitions — repeated Approved creates no second outcome type");
  {
    const transitions = detectCardOutcomeTransitions({
      isInsert: false,
      previousStatus: "Approved",
      newStatus: "Approved",
    });
    expect("transitions", transitions, []);
  }

  section("transitions — first mailed status detects card_sent");
  {
    for (const mailedStatus of ["Mailed to me", "Mailed to her"]) {
      const transitions = detectCardOutcomeTransitions({
        isInsert: false,
        previousStatus: "Approved",
        newStatus: mailedStatus,
      });
      expect(`${mailedStatus} transition`, transitions, ["card_sent"]);
    }
  }

  section("transitions — repeated mailed status creates no second card_sent");
  {
    const transitions = detectCardOutcomeTransitions({
      isInsert: false,
      previousStatus: "Mailed to me",
      newStatus: "Mailed to me",
    });
    expect("transitions", transitions, []);
  }

  section("transitions — Delivered and Given do not create card_sent");
  {
    for (const status of ["Delivered", "Given"]) {
      const transitions = detectCardOutcomeTransitions({
        isInsert: false,
        previousStatus: "Approved",
        newStatus: status,
      });
      expect(`${status} ignored`, transitions, []);
    }
  }

  section("transitions — Ready for approval and Needs profile ignored");
  {
    for (const status of ["Ready for approval", "Needs profile", "Card being drafted"]) {
      const transitions = detectCardOutcomeTransitions({
        isInsert: false,
        previousStatus: "Card being drafted",
        newStatus: status,
      });
      expect(`${status} ignored`, transitions, []);
    }
  }

  section("producer — insert with provenance records card_created");
  {
    const dependencies = createDependencies();
    const result = await recordCardBrainOutcomes({
      persistedCard: brainCard(),
      authenticatedUserId: "user-1",
      isInsert: true,
      previousStatus: null,
      dependencies,
    });

    expect("one result", result.results.length, 1);
    expect("card_created recorded", result.results[0]?.status, "recorded_and_projected");
    expect("outcome type", result.results[0]?.outcomeType, "card_created");

    const listed = await dependencies.outcomeRepository.listOutcomeEventsForUser("user-1");
    expect("one outcome stored", listed.length, 1);
    expect("stored outcome type", listed[0]?.outcomeType, "card_created");
  }

  section("producer idempotency — card_created source action namespace");
  {
    const dependencies = createDependencies();
    const card = brainCard({ id: "card-namespace-1" });

    await recordCardBrainOutcome({
      persistedCard: card,
      outcomeType: "card_created",
      authenticatedUserId: "user-1",
      dependencies,
    });
    const second = await recordCardBrainOutcome({
      persistedCard: card,
      outcomeType: "card_created",
      authenticatedUserId: "user-1",
      dependencies,
    });

    expect("second status", second.status, "already_recorded");
    expect(
      "source action id",
      formatCardCreatedSourceActionId("card-namespace-1"),
      "card_created:card-namespace-1",
    );

    const listed = await dependencies.outcomeRepository.listOutcomeEventsForUser("user-1");
    expect("still one card_created outcome", listed.filter((e) => e.outcomeType === "card_created").length, 1);
  }

  section("producer idempotency — card_approved and card_sent namespaces");
  {
    expect(
      "approved namespace",
      formatCardApprovedSourceActionId("card-2"),
      "card_approved:card-2",
    );
    expect("sent namespace", formatCardSentSourceActionId("card-2"), "card_sent:card-2");
    expect(
      "dispatcher namespace",
      formatCardOutcomeSourceActionId("card_sent", "card-2"),
      "card_sent:card-2",
    );
  }

  section("producer — approved transition records card_approved once");
  {
    const dependencies = createDependencies();
    const card = brainCard({ status: "Approved" });

    const first = await recordCardBrainOutcomes({
      persistedCard: card,
      authenticatedUserId: "user-1",
      isInsert: false,
      previousStatus: "Ready for approval",
      dependencies,
    });
    const second = await recordCardBrainOutcomes({
      persistedCard: card,
      authenticatedUserId: "user-1",
      isInsert: false,
      previousStatus: "Approved",
      dependencies,
    });

    expect("first transition", first.results.map((r) => r.outcomeType), ["card_approved"]);
    expect("second transition empty", second.results, []);

    await recordCardBrainOutcome({
      persistedCard: card,
      outcomeType: "card_approved",
      authenticatedUserId: "user-1",
      dependencies,
    });
    const retry = await recordCardBrainOutcome({
      persistedCard: card,
      outcomeType: "card_approved",
      authenticatedUserId: "user-1",
      dependencies,
    });
    expect("retry status", retry.status, "already_recorded");
  }

  section("producer — mailed transition records card_sent once");
  {
    const dependencies = createDependencies();
    const card = brainCard({ status: "Mailed to me" });

    const first = await recordCardBrainOutcomes({
      persistedCard: card,
      authenticatedUserId: "user-1",
      isInsert: false,
      previousStatus: "Approved",
      dependencies,
    });
    const second = await recordCardBrainOutcomes({
      persistedCard: card,
      authenticatedUserId: "user-1",
      isInsert: false,
      previousStatus: "Mailed to me",
      dependencies,
    });

    expect("first transition", first.results.map((r) => r.outcomeType), ["card_sent"]);
    expect("second transition empty", second.results, []);
  }

  section("projection — only card_sent maps to completed exposure");
  {
    const baseEvent = {
      id: "outcome-1",
      userId: "user-1",
      recipientId: "recipient-1",
      opportunityKey: "recipient-1:birthday",
      occurredAt: "2026-07-10T14:00:00.000Z",
      metadata: { cardId: "card-1", cardStatus: "Mailed to me" },
      sourceActionId: "card_sent:card-1",
      createdAt: "2026-07-10T14:00:00.000Z",
    };

    expect(
      "card_created ignored by mapper",
      mapBrainOutcomeToExposure({ ...baseEvent, outcomeType: "card_created" }),
      null,
    );
    expect(
      "card_approved ignored by mapper",
      mapBrainOutcomeToExposure({ ...baseEvent, outcomeType: "card_approved" }),
      null,
    );
    expect(
      "card_sent projects completed",
      mapBrainOutcomeToExposure({ ...baseEvent, outcomeType: "card_sent" })?.eventType,
      "completed",
    );
  }

  section("projection — card_sent producer projects completed exposure");
  {
    const dependencies = createDependencies();
    const result = await recordCardBrainOutcome({
      persistedCard: brainCard({ status: "Mailed to me" }),
      outcomeType: "card_sent",
      authenticatedUserId: "user-1",
      dependencies,
    });

    if (result.status === "recorded_and_projected" && result.projection.status === "projected") {
      expect("exposure event type", result.projection.exposureEvent.eventType, "completed");
    } else {
      failed++;
      failures.push("card_sent projection");
      console.log("  ✗ card_sent projection");
    }
  }

  section("projection — card_created and card_approved projection ignored");
  {
    const dependencies = createDependencies();
    for (const outcomeType of ["card_created", "card_approved"] as const) {
      const result = await recordCardBrainOutcome({
        persistedCard: brainCard({ id: `card-proj-${outcomeType}` }),
        outcomeType,
        authenticatedUserId: "user-1",
        dependencies,
      });
      if (result.status === "recorded_and_projected") {
        expect(`${outcomeType} projection status`, result.projection.status, "ignored");
      } else {
        failed++;
        failures.push(`${outcomeType} projection ignored`);
        console.log(`  ✗ ${outcomeType} projection ignored`);
      }
    }
  }

  section("failure semantics — projection failure leaves card outcome durable");
  {
    const dependencies = createDependencies();
    dependencies.projector.project = async () => {
      throw new Error("projection failed");
    };

    const result = await recordCardBrainOutcome({
      persistedCard: brainCard({ id: "card-projection-fail" }),
      outcomeType: "card_sent",
      authenticatedUserId: "user-1",
      dependencies,
    });

    expect("status", result.status, "recorded_projection_failed");
    const listed = await dependencies.outcomeRepository.listOutcomeEventsForUser("user-1");
    expectTrue("outcome remains durable", listed.length >= 1);
  }

  section("failure semantics — append failure propagates from producer");
  {
    const outcomeRepository: BrainOutcomeRepository = {
      append: async () => {
        throw new Error("should not use append");
      },
      async appendOnceForSourceAction() {
        throw new Error("append failed");
      },
      listOutcomeEventsForUser: async () => [],
    };
    const exposureRepository = createInMemoryExposureEventRepository();
    const projector = createBrainOutcomeExposureProjector(exposureRepository);

    let message = "";
    try {
      await recordCardBrainOutcome({
        persistedCard: brainCard({ id: "card-append-fail" }),
        outcomeType: "card_created",
        authenticatedUserId: "user-1",
        dependencies: { outcomeRepository, projector },
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect("append failure propagates", message, "append failed");
  }

  section("architecture — resolver has no planner, fatigue, or inference");
  {
    const resolverSource = readFileSync(join(PRODUCERS_ROOT, "resolveCardOutcomeContext.ts"), "utf8");
    for (const token of [
      "executeBrain",
      "runBrain",
      "planAttentionOrder(",
      "evaluateFatigue",
      "brainActionToken",
      "brainContextToken",
      "BrainExecutionId",
      "brain_card_opportunity_links",
      "holiday",
      "exposureSnapshot",
    ]) {
      expectTrue(`resolver source has no ${token}`, !resolverSource.includes(token));
    }
  }

  section("architecture — card producer sources stay isolated");
  {
    function listCardProducerSources(): string {
      const files = [
        "recordCardBrainOutcome.ts",
        "recordCardBrainOutcomes.ts",
        "resolveCardOutcomeContext.ts",
        "detectCardOutcomeTransitions.ts",
        "cardOutcomeTypes.ts",
      ];
      return files.map((file) => readFileSync(join(PRODUCERS_ROOT, file), "utf8")).join("\n");
    }

    const producerSource = listCardProducerSources();
    for (const token of [
      "executeBrain",
      "runBrain",
      "planAttentionOrder",
      "evaluateFatigue",
      "approvedMessage",
      "answerText",
      "brainActionToken",
      "brain_card_opportunity_links",
    ]) {
      expectTrue(`card producer source has no ${token}`, !producerSource.includes(token));
    }
  }

  section("route — optional top-level brainSourceRuleId accepted separately from card payload");
  {
    const routeSource = readFileSync(join(ROUTES_ROOT, "personal-history.ts"), "utf8");
    expectTrue("reads brainSourceRuleId from body", routeSource.includes("body.brainSourceRuleId"));
    expectTrue("strips brainSourceRuleId from stored card data", routeSource.includes("cardPayloadFromBody"));
    expectTrue("validates brain source rule id", routeSource.includes("assertValidBrainSourceRuleIdForCardProvenance"));
    expectTrue("builds opportunity key", routeSource.includes("buildOpportunityKey"));
    expectTrue("checks recipient ownership", routeSource.includes("recipientsTable"));
    expectTrue("write-once on insert values", routeSource.includes("brainSourceRuleId: brainSourceRuleIdForInsert"));
    const upsertSetMatch = routeSource.match(/onConflictDoUpdate\(\{[\s\S]*?set:\s*\{([\s\S]*?)\},/);
    expectTrue(
      "excluded from upsert set",
      upsertSetMatch !== null && !upsertSetMatch[1]!.includes("brainSourceRuleId"),
    );
    expectTrue("GET returns data only", routeSource.includes("rows.map(r => r.data)"));
    expectTrue(
      "GET handler does not expose brainSourceRuleId",
      /router\.get\("\/personal\/cards"[\s\S]*?res\.json\(\{ cards: rows\.map\(r => r\.data\) \}\)/.test(
        routeSource,
      ),
    );
    expectTrue("route success preserved on brain failure", routeSource.includes("brain card outcome append failed after card saved"));
    expectTrue("projection failure logged without undoing card", routeSource.includes("brain card outcome projection failed after card saved"));
    expectTrue("transition detection wired", routeSource.includes("recordCardBrainOutcomesForProduction"));
    expectTrue("selects existing row before upsert", routeSource.includes("existingRow"));
  }

  section("route — recipient ownership enforced for provenance");
  {
    const routeSource = readFileSync(join(ROUTES_ROOT, "personal-history.ts"), "utf8");
    expectTrue("404 when recipient missing", routeSource.includes('error: "Recipient not found"'));
    expectTrue("requires recipientId when provenance present", routeSource.includes("recipientId required when brainSourceRuleId is provided"));
  }

  section("schema — brain_source_rule_id column on personal_cards");
  {
    const schemaSource = readFileSync(
      join(TEST_DIR, "../../../../lib/db/src/schema/personal-cards.ts"),
      "utf8",
    );
    expectTrue("column defined", schemaSource.includes('brainSourceRuleId: text("brain_source_rule_id")'));
  }

  section("producer idempotency — in-memory mirrors appendOnce semantics");
  {
    const repo = createInMemoryBrainOutcomeRepository();
    const input: AppendOnceBrainOutcomeInput = {
      userId: "user-1",
      recipientId: "recipient-1",
      opportunityKey: "recipient-1:birthday",
      outcomeType: "card_sent",
      sourceActionId: formatCardSentSourceActionId("card-once-1"),
      metadata: { cardId: "card-once-1", cardStatus: "Mailed to me" },
    };

    const first = await repo.appendOnceForSourceAction(input);
    const second = await repo.appendOnceForSourceAction(input);

    expect("first appended", first.status, "appended");
    expect("second already exists", second.status, "already_exists");
    expect("same event id", second.event.id, first.event.id);
  }

  section("validation module — no holiday inference or exposure matching");
  {
    const validationSource = readFileSync(join(CARDS_ROOT, "validateBrainSourceRuleId.ts"), "utf8");
    for (const token of ["holiday", "exposure", "planner", "executeBrain"]) {
      expectTrue(`validation source has no ${token}`, !validationSource.includes(token));
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
