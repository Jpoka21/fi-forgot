/**
 * Unit tests for Notification Center Brain inbox wiring (Step 2d).
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/notification-inbox-wiring.test.ts
 */

import { countUnreadNotifications } from "../app/notification/notificationEngine.js";
import type { FiNotification } from "../app/notification/notificationDomain.js";
import { seedNotifications } from "../app/notification/notificationDomain.js";
import { applyLocalNotificationOverrides } from "../app/notifications-brain/applyLocalNotificationOverrides.js";
import { buildNotificationInboxForDisplay } from "../app/notifications-brain/buildNotificationInboxForDisplay.js";
import type { NotificationsResponse } from "../app/notifications-brain/notificationsTypes.js";
import type { ApiResult } from "../app/api/shared/types.js";

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

const LEGACY_INBOX: FiNotification[] = [
  {
    id: "legacy-1",
    title: "Legacy seed notification",
    category: "relationship",
    readState: "unread",
    createdAt: "2026-07-09T10:00:00.000Z",
  },
];

const BRAIN_RESPONSE: NotificationsResponse = {
  version: 1,
  generatedAt: "2026-07-09T12:00:00.000Z",
  unreadCount: 2,
  notifications: [
    {
      id: "alpha:birthday",
      recipientId: "alpha",
      recipientName: "Alice",
      title: "First",
      body: "Body one",
      href: "/relationship/alpha",
      actionLabel: "Prepare for birthday",
      priority: "high",
      createdAt: "2026-07-09T12:00:00.000Z",
      source: "brain",
    },
    {
      id: "beta:fresh_update",
      recipientId: "beta",
      recipientName: "Bob",
      title: "Second",
      body: "Body two",
      href: "/relationship/beta",
      actionLabel: "Add a fresh update",
      priority: "medium",
      createdAt: "2026-07-09T12:00:00.000Z",
      source: "brain",
    },
  ],
};

function okResult(data: NotificationsResponse): ApiResult<NotificationsResponse> {
  return {
    ok: true,
    status: 200,
    data,
    error: null,
    response: new Response(null, { status: 200 }),
  };
}

function failedResult(): ApiResult<NotificationsResponse> {
  return {
    ok: false,
    status: 500,
    data: null,
    error: { message: "Server error", status: 500, code: "server_error" },
    response: new Response(null, { status: 500 }),
  };
}

async function runAsyncTests(): Promise<void> {
  section("flag off uses seed/localStorage path");
  {
    let legacyCalled = false;
    const inbox = await buildNotificationInboxForDisplay(
      {},
      {
        brainEnabled: false,
        loadLegacyInbox: () => {
          legacyCalled = true;
          return LEGACY_INBOX;
        },
      },
    );

    expectTrue("legacy loader called", legacyCalled);
    expect("returns legacy inbox", inbox, LEGACY_INBOX);
  }

  section("flag on uses Brain API path");
  {
    let fetchCalled = false;
    const inbox = await buildNotificationInboxForDisplay(
      {},
      {
        brainEnabled: true,
        fetchNotifications: async () => {
          fetchCalled = true;
          return okResult(BRAIN_RESPONSE);
        },
        loadLegacyInbox: () => {
          throw new Error("legacy inbox should not be used");
        },
      },
    );

    expectTrue("fetch called", fetchCalled);
    expect("two brain notifications", inbox.length, 2);
    expect("uses server actionLabel", inbox[0]?.actions?.[0]?.label, "Prepare for birthday");
    expect("category relationship", inbox[0]?.category, "relationship");
  }

  section("flag on does not fallback to seeds on fetch failure");
  {
    const inbox = await buildNotificationInboxForDisplay(
      {},
      {
        brainEnabled: true,
        fetchNotifications: async () => failedResult(),
        loadLegacyInbox: () => seedNotifications,
      },
    );

    expect("empty inbox on failure", inbox, []);
  }

  section("server order preserved");
  {
    const inbox = await buildNotificationInboxForDisplay(
      {},
      {
        brainEnabled: true,
        fetchNotifications: async () => okResult(BRAIN_RESPONSE),
      },
    );

    expect(
      "ids in server order",
      inbox.map((item) => item.id),
      ["alpha:birthday", "beta:fresh_update"],
    );
  }

  section("local read/dismiss overrides still apply by id");
  {
    const inbox = await buildNotificationInboxForDisplay(
      {},
      {
        brainEnabled: true,
        fetchNotifications: async () => okResult(BRAIN_RESPONSE),
      },
    );

    const withOverrides = applyLocalNotificationOverrides(inbox, {
      getReadStateMap: () => ({ "alpha:birthday": "read" }),
      getDismissedIds: () => ["beta:fresh_update"],
    });

    expect("dismissed item removed", withOverrides.length, 1);
    expect("remaining id", withOverrides[0]?.id, "alpha:birthday");
    expect("read override applied", withOverrides[0]?.readState, "read");
  }

  section("empty response safe");
  {
    const inbox = await buildNotificationInboxForDisplay(
      {},
      {
        brainEnabled: true,
        fetchNotifications: async () =>
          okResult({
            version: 1,
            generatedAt: "2026-07-09T12:00:00.000Z",
            unreadCount: 0,
            notifications: [],
          }),
      },
    );

    expect("empty inbox", inbox, []);
    expect("unread count zero", countUnreadNotifications(inbox), 0);
  }

  section("fetch failure safe");
  {
    const inbox = await buildNotificationInboxForDisplay(
      {},
      {
        brainEnabled: true,
        fetchNotifications: async () => {
          throw new Error("network down");
        },
      },
    );

    expect("returns empty inbox", inbox, []);
    expect("unread count zero", countUnreadNotifications(inbox), 0);
  }

  section("unread count correct after local overrides");
  {
    const inbox = await buildNotificationInboxForDisplay(
      {},
      {
        brainEnabled: true,
        fetchNotifications: async () => okResult(BRAIN_RESPONSE),
      },
    );

    const withOverrides = applyLocalNotificationOverrides(inbox, {
      getReadStateMap: () => ({ "alpha:birthday": "read" }),
      getDismissedIds: () => [],
    });

    expect("one unread remains", countUnreadNotifications(withOverrides), 1);
    expect("unread item id", withOverrides.find((item) => item.readState === "unread")?.id, "beta:fresh_update");
  }

  section("Brain internals are not exposed on adapted notifications");
  {
    const inbox = await buildNotificationInboxForDisplay(
      {},
      {
        brainEnabled: true,
        fetchNotifications: async () => okResult(BRAIN_RESPONSE),
      },
    );

    const item = inbox[0]!;
    expectTrue("no sourceRuleId", !("sourceRuleId" in item));
    expectTrue("no outcome", !("outcome" in item));
    expectTrue("no confidence", !("confidence" in item));
    expectTrue("actionLabel only on action", item.actions?.[0]?.label === "Prepare for birthday");
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
