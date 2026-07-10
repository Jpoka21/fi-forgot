/**
 * Unit tests for brain/events — preparation builder, cycle resolution, regression.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/event-preparation-context.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { anniversaryRule } from "../brain/decision/rules/anniversaryRule.js";
import { birthdayRule } from "../brain/decision/rules/birthdayRule.js";
import { valentinesDayRule } from "../brain/decision/rules/valentinesDayRule.js";
import { buildEventPreparationContext } from "../brain/events/buildEventPreparationContext.js";
import { resolveEventCycleYear } from "../brain/decision/eventTimingUtils.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import type { BriefingSummary, RecipientContext } from "../services/recipient-context.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";

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

function normalized(
  overrides: Partial<NormalizedRelationshipState> = {},
): NormalizedRelationshipState {
  const { derivedFrom: derivedOverride, ...rest } = overrides;
  return {
    identity: "empty",
    freshness: "unknown",
    history: "none",
    writing: "none",
    engagement: "none",
    momentum: "new",
    ...rest,
    derivedFrom: {
      signalCount: 0,
      sourcesPresent: [],
      ...derivedOverride,
    },
  };
}

function withBriefing(
  context: RecipientContext,
  briefingSummary: BriefingSummary,
): RecipientContext {
  return { ...context, briefingSummary };
}

function withCards(
  context: RecipientContext,
  cards: RecipientContext["writingHistory"]["cards"],
): RecipientContext {
  return {
    ...context,
    writingHistory: { cards },
  };
}

section("birthday facts are projected correctly");
{
  const relationshipContext = withBriefing(
    withCards(
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        birthday: "1988-07-08",
        previewDays: 14,
      }),
      [
        {
          id: "card-1",
          eventType: "Birthday",
          eventDate: "2026-07-08",
          dueDateFromData: null,
          storedEventYear: null,
          status: "Ready for approval",
          wasEdited: false,
          createdAt: "2026-06-20T00:00:00.000Z",
          daysAgo: 11,
          hasMessageFinal: true,
          hasMessageOriginal: true,
          messageWordCount: 40,
          archetype: null,
          generationVersion: "v1",
          approvedAt: null,
          rejectedAt: null,
          mailedAt: null,
        },
      ],
    ),
    {
      totalAnswers: 1,
      byEvent: {
        Birthday_2026: [
          {
            questionKey: "memory",
            question: "Memory?",
            answer: "Trip",
            eventType: "Birthday",
            eventYear: 2026,
          },
        ],
      },
      allAnswers: [],
    },
  );

  const preparation = buildEventPreparationContext({
    relationshipContext,
    referenceDate: new Date("2026-07-01T00:00:00.000Z"),
    preparationWindowDays: 14,
  });

  expect("birthday present", preparation.byEventId.birthday?.eventId, "birthday");
  expect("birthday cycleYear", preparation.byEventId.birthday?.cycleYear, 2026);
  expect("birthday daysUntilEvent", preparation.byEventId.birthday?.daysUntilEvent, 7);
  expect("birthday within window", preparation.byEventId.birthday?.withinPreparationWindow, true);
  expect("birthday briefingComplete", preparation.byEventId.birthday?.briefingComplete, true);
  expect("birthday cardCycleStatus", preparation.byEventId.birthday?.cardCycleStatus, "ready_for_approval");
}

section("anniversary facts are projected correctly");
{
  const relationshipContext = minimalRelationshipContext({
    generatedAt: "2026-07-01T00:00:00.000Z",
    anniversary: "2015-07-08",
    previewDays: 14,
  });

  const preparation = buildEventPreparationContext({
    relationshipContext,
    referenceDate: new Date("2026-07-01T00:00:00.000Z"),
    preparationWindowDays: 14,
  });

  expect("anniversary present", preparation.byEventId.anniversary?.eventId, "anniversary");
  expect("anniversary daysUntilEvent", preparation.byEventId.anniversary?.daysUntilEvent, 7);
  expect("anniversary within window", preparation.byEventId.anniversary?.withinPreparationWindow, true);
  expect("anniversary briefingComplete default false", preparation.byEventId.anniversary?.briefingComplete, false);
  expect("anniversary cardCycleStatus default none", preparation.byEventId.anniversary?.cardCycleStatus, "none");
}

section("Valentine's Day facts respect relationship constraints");
{
  const romantic = buildEventPreparationContext({
    relationshipContext: minimalRelationshipContext({
      generatedAt: "2026-02-01T00:00:00.000Z",
      relationshipType: "Wife",
      previewDays: 14,
    }),
    referenceDate: new Date("2026-02-01T00:00:00.000Z"),
    preparationWindowDays: 14,
  });
  expect("romantic valentines present", romantic.byEventId.valentines_day?.eventId, "valentines_day");
  expect("romantic valentines days away", romantic.byEventId.valentines_day?.daysUntilEvent, 13);

  const nonRomantic = buildEventPreparationContext({
    relationshipContext: minimalRelationshipContext({
      generatedAt: "2026-02-01T00:00:00.000Z",
      relationshipType: "Friend",
      previewDays: 14,
    }),
    referenceDate: new Date("2026-02-01T00:00:00.000Z"),
    preparationWindowDays: 14,
  });
  expect("non romantic valentines omitted", nonRomantic.byEventId.valentines_day, undefined);
}

section("cycleYear is correct across year boundaries");
{
  const decemberReference = new Date("2026-12-20T00:00:00.000Z");
  expect(
    "jan birthday rolls to next cycle year",
    resolveEventCycleYear("1988-01-05", decemberReference),
    2027,
  );
  expect(
    "december birthday stays in current cycle year",
    resolveEventCycleYear("1988-12-28", decemberReference),
    2026,
  );
  expect(
    "valentines after reference rolls to next year",
    resolveEventCycleYear("02-14", new Date("2026-12-20T00:00:00.000Z")),
    2027,
  );

  const preparation = buildEventPreparationContext({
    relationshipContext: minimalRelationshipContext({
      generatedAt: "2026-12-20T00:00:00.000Z",
      birthday: "1988-01-05",
      previewDays: 30,
    }),
    referenceDate: decemberReference,
    preparationWindowDays: 30,
  });
  expect("builder cycleYear at year boundary", preparation.byEventId.birthday?.cycleYear, 2027);
}

section("withinPreparationWindow matches existing scalar timing logic");
{
  const relationshipContext = minimalRelationshipContext({
    generatedAt: "2026-07-01T00:00:00.000Z",
    birthday: "1988-08-01",
    previewDays: 14,
  });
  const decisionContext = buildDecisionContext(normalized(), relationshipContext);
  expect(
    "scalar outside window",
    decisionContext.birthdayDaysAway != null &&
      decisionContext.preparationWindowDays != null &&
      decisionContext.birthdayDaysAway > decisionContext.preparationWindowDays,
    true,
  );
  expect(
    "preparation facts outside window",
    decisionContext.eventPreparation.byEventId.birthday?.withinPreparationWindow,
    false,
  );
}

section("byEventId is keyed by stable eventId not rule identity");
{
  const preparation = buildEventPreparationContext({
    relationshipContext: minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
    }),
    referenceDate: new Date("2026-07-01T00:00:00.000Z"),
    preparationWindowDays: 14,
  });
  expect("key is birthday eventId", preparation.byEventId.birthday?.eventId, "birthday");
  expect("no birthday_last_minute key", (preparation.byEventId as Record<string, unknown>)["birthday_last_minute"], undefined);
}

section("existing birthday rule still emits ask_question when briefing incomplete");
{
  const relationshipContext = minimalRelationshipContext({
    generatedAt: "2026-07-01T00:00:00.000Z",
    birthday: "1988-07-08",
    previewDays: 14,
  });
  const decisionContext = buildDecisionContext(normalized(), relationshipContext);
  expect("birthday rule outcome", birthdayRule.evaluate(decisionContext)?.decision.outcome, "ask_question");
}

section("existing anniversary rule still emits ask_question");
{
  const relationshipContext = minimalRelationshipContext({
    generatedAt: "2026-07-01T00:00:00.000Z",
    anniversary: "2015-07-08",
    previewDays: 14,
  });
  const decisionContext = buildDecisionContext(normalized(), relationshipContext);
  expect("anniversary rule outcome", anniversaryRule.evaluate(decisionContext)?.decision.outcome, "ask_question");
}

section("existing Valentine rule still emits ask_question");
{
  const relationshipContext = minimalRelationshipContext({
    generatedAt: "2026-02-01T00:00:00.000Z",
    relationshipType: "Wife",
    previewDays: 14,
  });
  const decisionContext = buildDecisionContext(normalized(), relationshipContext);
  expect("valentines rule outcome", valentinesDayRule.evaluate(decisionContext)?.decision.outcome, "ask_question");
}

section("no production rule reads eventPreparation property name directly in scalar paths");
{
  const rulesDir = join(dirname(fileURLToPath(import.meta.url)), "../brain/decision/rules");
  for (const ruleFile of ["birthdayRule.ts", "anniversaryRule.ts", "valentinesDayRule.ts"]) {
    const contents = readFileSync(join(rulesDir, ruleFile), "utf8");
    expect(`${ruleFile} uses shared calendar evaluator`, contents.includes("evaluateCalendarEventRule"), true);
  }
}

section("calendar rules emit ask_question when briefing is incomplete");
{
  const outcomes = [
    birthdayRule.evaluate(
      buildDecisionContext(
        normalized(),
        minimalRelationshipContext({
          generatedAt: "2026-07-01T00:00:00.000Z",
          birthday: "1988-07-08",
          previewDays: 14,
        }),
      ),
    )?.decision.outcome,
    anniversaryRule.evaluate(
      buildDecisionContext(
        normalized(),
        minimalRelationshipContext({
          generatedAt: "2026-07-01T00:00:00.000Z",
          anniversary: "2015-07-08",
          previewDays: 14,
        }),
      ),
    )?.decision.outcome,
    valentinesDayRule.evaluate(
      buildDecisionContext(
        normalized(),
        minimalRelationshipContext({
          generatedAt: "2026-02-01T00:00:00.000Z",
          relationshipType: "Wife",
          previewDays: 14,
        }),
      ),
    )?.decision.outcome,
  ];
  expect("incomplete briefing stays ask_question", outcomes.every((outcome) => outcome === "ask_question"), true);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
