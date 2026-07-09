/**
 * Unit tests for notification ViewModel mapping.
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/map-notification-view-model.test.ts
 */

import type { NotificationItem, NotificationsResponse } from "../app/notifications-brain/notificationsTypes.js";
import {
  mapNotificationViewModel,
  mapNotificationsViewModels,
} from "../app/notifications-brain/mapNotificationViewModel.js";

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

function section(name: string) {
  console.log(`\n${name}`);
}

const NOTIFICATION: NotificationItem = {
  id: "recipient-42:birthday",
  recipientId: "recipient-42",
  recipientName: "Alice Example",
  title: "Birthday preparation",
  body: "Their birthday is inside the preparation window.",
  href: "/relationship/recipient-42",
  actionLabel: "Prepare for birthday",
  priority: "high",
  createdAt: "2026-07-09T12:00:00.000Z",
  source: "brain",
};

const FORBIDDEN_VIEW_MODEL_FIELDS = [
  "confidence",
  "ruleEvaluation",
  "sourceRuleId",
  "outcome",
  "debug",
  "decision",
  "actionPlan",
  "display",
  "explanation",
  "rank",
  "spotlight",
  "opportunities",
] as const;

section("mapNotificationViewModel");
{
  const viewModel = mapNotificationViewModel(NOTIFICATION);

  expect("id from server", viewModel.id, "recipient-42:birthday");
  expect("recipientId", viewModel.recipientId, "recipient-42");
  expect("recipientName", viewModel.recipientName, "Alice Example");
  expect("title", viewModel.title, "Birthday preparation");
  expect("body", viewModel.body, NOTIFICATION.body);
  expect("href", viewModel.href, "/relationship/recipient-42");
  expect("priority", viewModel.priority, "high");
  expect("createdAt", viewModel.createdAt, "2026-07-09T12:00:00.000Z");
  expect("source", viewModel.source, "brain");
  expect("actionLabel from server", viewModel.actionLabel, "Prepare for birthday");
  expect("readState defaults to unread", viewModel.readState, "unread");

  for (const field of FORBIDDEN_VIEW_MODEL_FIELDS) {
    expectTrue(`no ${field} on view model`, !(field in viewModel));
  }
}

section("actionLabel is passed through verbatim");
{
  const customLabel: NotificationItem = {
    ...NOTIFICATION,
    id: "recipient-42:fresh_update",
    actionLabel: "Custom server label",
  };

  const viewModel = mapNotificationViewModel(customLabel);
  expect("uses server actionLabel verbatim", viewModel.actionLabel, "Custom server label");
  expect("id from server unchanged", viewModel.id, "recipient-42:fresh_update");
}

section("server order preserved");
{
  const notifications: NotificationItem[] = [
    { ...NOTIFICATION, id: "alpha:birthday", recipientId: "alpha", title: "First" },
    { ...NOTIFICATION, id: "beta:fresh_update", recipientId: "beta", title: "Second" },
    { ...NOTIFICATION, id: "gamma:inactivity", recipientId: "gamma", title: "Third" },
  ];

  const viewModels = mapNotificationsViewModels(notifications);
  expect(
    "order preserved",
    viewModels.map((item) => item.id),
    ["alpha:birthday", "beta:fresh_update", "gamma:inactivity"],
  );
  expect(
    "titles follow server order",
    viewModels.map((item) => item.title),
    ["First", "Second", "Third"],
  );
}

section("empty response maps safely");
{
  const emptyResponse: NotificationsResponse = {
    version: 1,
    generatedAt: "2026-07-09T12:00:00.000Z",
    unreadCount: 0,
    notifications: [],
  };

  const viewModels = mapNotificationsViewModels(emptyResponse.notifications);
  expect("empty notifications", viewModels, []);
}

section("Brain internals are not present on mapped items");
{
  const viewModel = mapNotificationViewModel(NOTIFICATION);
  expectTrue("view model is plain presentation shape", Object.keys(viewModel).sort().join(",") === [
    "actionLabel",
    "body",
    "createdAt",
    "href",
    "id",
    "priority",
    "readState",
    "recipientId",
    "recipientName",
    "source",
    "title",
  ].sort().join(","));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
