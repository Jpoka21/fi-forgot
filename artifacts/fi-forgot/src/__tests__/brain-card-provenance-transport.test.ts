/**
 * Brain card provenance transport tests (Step 6f.2 / 6f.2A).
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/brain-card-provenance-transport.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { DashboardBrainOpportunity } from "../app/dashboard-brain/dashboardBrainOpportunitiesTypes.js";
import { mapDashboardOpportunityViewModel } from "../app/dashboard-brain/mapDashboardOpportunityViewModel.js";
import { mapNotificationViewModel } from "../app/notifications-brain/mapNotificationViewModel.js";
import type { NotificationItem } from "../app/notifications-brain/notificationsTypes.js";
import {
  BRAIN_SOURCE_RULE_ID_QUERY_PARAM,
  buildBrainCardBriefingHref,
  buildPersonalCardCreateRequestBody,
  parseSourceRuleIdFromOpportunityId,
  readBrainSourceRuleIdFromSearch,
  resolveBrainCardActionHrefFromAuthority,
  stripBrainSourceRuleIdFromSearch,
} from "../app/brain-cards/brainCardProvenance.js";
import type { CardOrder } from "../lib/data.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = join(TEST_DIR, "..");

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

const SAMPLE_CARD: CardOrder = {
  id: "card-1",
  recipientId: "recipient-42",
  recipientName: "Alice",
  holiday: "Birthday",
  dueDate: "",
  status: "Ready for approval",
  approvedMessage: "Happy birthday!",
  deliveryPreference: "Mail it to me",
};

section("authoritative card action — prepare_card builds briefing href with provenance");
{
  const href = resolveBrainCardActionHrefFromAuthority({
    brainAuthorizesCardPreparation: true,
    recipientId: "recipient-42",
    sourceRuleId: "birthday",
    briefingEvent: "Birthday",
    fallbackHref: "/relationship/recipient-42",
  });
  expectTrue("links to briefing", href.startsWith("/briefings/recipient-42/Birthday?"));
  expectTrue("includes brainSourceRuleId query", href.includes("brainSourceRuleId=birthday"));
}

section("authoritative card action — ask_question keeps profile href");
{
  const href = resolveBrainCardActionHrefFromAuthority({
    brainAuthorizesCardPreparation: false,
    recipientId: "recipient-42",
    sourceRuleId: "birthday",
    briefingEvent: "Birthday",
    fallbackHref: "/relationship/recipient-42",
  });
  expect("profile href preserved", href, "/relationship/recipient-42");
}

section("authoritative card action — no frontend rule allowlist");
{
  const moduleSource = readFileSync(join(SRC_ROOT, "app/brain-cards/brainCardProvenance.ts"), "utf8");
  expectTrue("no birthday rule allowlist", !moduleSource.includes("BRAIN_CARD_PREPARATION_RULE_IDS"));
  expectTrue("no isBrainCardPreparationRuleId", !moduleSource.includes("isBrainCardPreparationRuleId"));
  expectTrue("no BRIEFING_EVENT_BY_RULE_ID", !moduleSource.includes("BRIEFING_EVENT_BY_RULE_ID"));
}

section("dashboard mapper — does not infer card routing from sourceRuleId");
{
  const opportunity: DashboardBrainOpportunity = {
    recipientId: "recipient-42",
    recipientName: "Alice",
    sourceRuleId: "birthday",
    outcome: "ask_question",
    priority: "high",
    title: "Birthday preparation",
    explanation: "Inside preparation window.",
    profileHref: "/relationship/recipient-42",
    actionLabel: "Prepare for birthday",
    rank: 1,
  };
  const viewModel = mapDashboardOpportunityViewModel(opportunity);
  expect("uses server profileHref", viewModel.href, "/relationship/recipient-42");
  expectTrue("no sourceRuleId field on view model", !("sourceRuleId" in viewModel));
}

section("notification mapper — does not infer card routing from sourceRuleId");
{
  const item: NotificationItem = {
    id: "recipient-42:birthday",
    recipientId: "recipient-42",
    recipientName: "Alice",
    title: "Birthday preparation",
    body: "Inside preparation window.",
    href: "/relationship/recipient-42",
    actionLabel: "Prepare for birthday",
    priority: "high",
    createdAt: "2026-07-09T12:00:00.000Z",
    source: "brain",
  };
  const viewModel = mapNotificationViewModel(item);
  expect("uses server href", viewModel.href, "/relationship/recipient-42");
}

section("first card create POST — top-level brainSourceRuleId separate from card");
{
  const body = buildPersonalCardCreateRequestBody(SAMPLE_CARD, { brainSourceRuleId: "birthday" });
  expect("includes top-level provenance", body.brainSourceRuleId, "birthday");
  expect("card id preserved", body.id, "card-1");
}

section("manual card create — no provenance when omitted");
{
  const body = buildPersonalCardCreateRequestBody(SAMPLE_CARD);
  expectTrue("no brainSourceRuleId key", !("brainSourceRuleId" in body));
}

section("updateCard — omits provenance on later updates");
{
  const updateSource = readFileSync(join(SRC_ROOT, "lib/data.ts"), "utf8");
  const updateCardBlock = updateSource.match(/export function updateCard[\s\S]*?^}/m)?.[0] ?? "";
  expectTrue("updateCard posts card only", updateCardBlock.includes("JSON.stringify(card)"));
  expectTrue("updateCard has no brainSourceRuleId", !updateCardBlock.includes("brainSourceRuleId"));
}

section("briefing query param — read and strip temporary provenance");
{
  expect(
    "reads birthday",
    readBrainSourceRuleIdFromSearch("?brainSourceRuleId=birthday&rewrite=1"),
    "birthday",
  );
  expect(
    "strip preserves rewrite",
    stripBrainSourceRuleIdFromSearch("?brainSourceRuleId=birthday&rewrite=1"),
    "?rewrite=1",
  );
  expect(
    "strip all when only provenance",
    stripBrainSourceRuleIdFromSearch(`?${BRAIN_SOURCE_RULE_ID_QUERY_PARAM}=birthday`),
    "",
  );
}

section("briefing page — consumes provenance once on create");
{
  const briefingSource = readFileSync(join(SRC_ROOT, "pages/briefing.tsx"), "utf8");
  expectTrue("reads provenance from search", briefingSource.includes("readBrainSourceRuleIdFromSearch"));
  expectTrue("passes to saveCard", briefingSource.includes("saveCard(newCard, brainSourceRuleId"));
  expectTrue("clears after consume", briefingSource.includes("stripBrainSourceRuleIdFromSearch"));
  expectTrue("skips rewrite", briefingSource.includes("if (isRewrite)"));
}

section("buildBrainCardBriefingHref — event supplied by Brain, not inferred");
{
  const href = buildBrainCardBriefingHref({
    recipientId: "r-1",
    sourceRuleId: "birthday",
    event: "Birthday",
  });
  expectTrue("briefing path", href.includes("/briefings/r-1/Birthday?"));
  expectTrue("provenance query", href.includes("brainSourceRuleId=birthday"));
}

section("parseSourceRuleIdFromOpportunityId");
{
  expect("parses rule id", parseSourceRuleIdFromOpportunityId("recipient-42:birthday"), "birthday");
}

section("architecture — no token, link table, or execution id transport");
{
  const moduleSource = readFileSync(join(SRC_ROOT, "app/brain-cards/brainCardProvenance.ts"), "utf8");
  for (const token of [
    "buildOpportunityKey",
    "brainActionToken",
    "brainContextToken",
    "BrainExecutionId",
    "brain_card_opportunity_links",
    "sessionStorage",
    "executeBrain",
    "planAttentionOrder",
  ]) {
    expectTrue(`module has no ${token}`, !moduleSource.includes(token));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
