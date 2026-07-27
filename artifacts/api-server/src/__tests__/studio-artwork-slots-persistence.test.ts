/**
 * Studio artwork slots API persistence integration tests (Product Sprint 002).
 *
 * Requires DATABASE_URL and applied studio_collections / studio_artwork_slots schema.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/studio-artwork-slots-persistence.test.ts
 */

import { randomUUID } from "node:crypto";
import type { Server } from "node:http";

const DATABASE_URL = process.env.DATABASE_URL;

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

async function startServer(): Promise<{ server: Server; baseUrl: string }> {
  const { default: app } = await import("../app.js");
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not resolve test server address"));
        return;
      }
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}/api` });
    });
    server.on("error", reject);
  });
}

async function stopServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function jsonRequest(
  baseUrl: string,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: unknown }> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

async function run(): Promise<void> {
  if (!DATABASE_URL) {
    console.error("\nBLOCKER: DATABASE_URL is not set. Cannot run persistence integration tests.");
    process.exit(1);
  }

  const { db, studioArtworkSlotsTable, studioCollectionsTable } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");

  const collectionName = `Sprint 002 persistence ${randomUUID()}`;
  let collectionId: string | null = null;
  const createdSlotIds: string[] = [];
  let server: Server | null = null;
  let baseUrl = "";

  try {
    section("setup — create test collection");
    {
      const [created] = await db
        .insert(studioCollectionsTable)
        .values({
          name: collectionName,
          occasion: "birthday",
          relationship: "grandmother",
          status: "planning",
          updatedAt: new Date(),
        })
        .returning();
      collectionId = created.id;
      expectTrue("collection created", Boolean(collectionId));
    }

    ({ server, baseUrl } = await startServer());

    section("GET list — empty collection returns empty list");
    {
      const result = await jsonRequest(
        baseUrl,
        "GET",
        `/studio/collections/${collectionId}/artwork-slots`,
      );
      expect("status", result.status, 200);
      const slots = (result.data as { artworkSlots?: unknown[] }).artworkSlots ?? [];
      expect("empty list", slots.length, 0);
    }

    section("POST — create first slot with default quantity");
    {
      const result = await jsonRequest(
        baseUrl,
        "POST",
        `/studio/collections/${collectionId}/artwork-slots`,
        { name: "Birthday Cake Scene" },
      );
      expect("status", result.status, 201);
      const slot = (result.data as { artworkSlot?: Record<string, unknown> }).artworkSlot;
      expectTrue("slot returned", Boolean(slot));
      if (slot?.id) createdSlotIds.push(String(slot.id));
      expect("quantity default", slot?.quantity, 1);
      expect("sort_order first", slot?.sortOrder, 0);
      expect("collection_id", slot?.collectionId, collectionId);
    }

    section("POST — create second slot with explicit quantity");
    {
      const result = await jsonRequest(
        baseUrl,
        "POST",
        `/studio/collections/${collectionId}/artwork-slots`,
        {
          name: "Floral Bouquet Scene",
          brief: "Soft watercolor flowers suitable for a grandmother birthday card.",
          quantity: 2,
        },
      );
      expect("status", result.status, 201);
      const slot = (result.data as { artworkSlot?: Record<string, unknown> }).artworkSlot;
      if (slot?.id) createdSlotIds.push(String(slot.id));
      expect("quantity", slot?.quantity, 2);
      expect("sort_order second", slot?.sortOrder, 1);
      expect("brief", slot?.brief, "Soft watercolor flowers suitable for a grandmother birthday card.");
    }

    section("GET list — ordering");
    {
      const result = await jsonRequest(
        baseUrl,
        "GET",
        `/studio/collections/${collectionId}/artwork-slots`,
      );
      expect("status", result.status, 200);
      const slots = (result.data as { artworkSlots?: Array<{ name: string; sortOrder: number }> })
        .artworkSlots ?? [];
      expect("slot count", slots.length, 2);
      expect("first slot name", slots[0]?.name, "Birthday Cake Scene");
      expect("second slot name", slots[1]?.name, "Floral Bouquet Scene");
      expectTrue("sort order ascending", slots[0]!.sortOrder < slots[1]!.sortOrder);
    }

    section("GET by id — read created slot");
    {
      const slotId = createdSlotIds[0];
      const result = await jsonRequest(
        baseUrl,
        "GET",
        `/studio/collections/${collectionId}/artwork-slots/${slotId}`,
      );
      expect("status", result.status, 200);
      const slot = (result.data as { artworkSlot?: Record<string, unknown> }).artworkSlot;
      expect("name", slot?.name, "Birthday Cake Scene");
    }

    section("GET by id — wrong collection returns 404");
    {
      const slotId = createdSlotIds[0];
      const wrongCollectionId = randomUUID();
      const result = await jsonRequest(
        baseUrl,
        "GET",
        `/studio/collections/${wrongCollectionId}/artwork-slots/${slotId}`,
      );
      expect("status", result.status, 404);
    }

    section("GET list — missing collection returns 404");
    {
      const result = await jsonRequest(
        baseUrl,
        "GET",
        `/studio/collections/${randomUUID()}/artwork-slots`,
      );
      expect("status", result.status, 404);
    }

    section("POST — invalid input returns 400");
    {
      const result = await jsonRequest(
        baseUrl,
        "POST",
        `/studio/collections/${collectionId}/artwork-slots`,
        { quantity: 1 },
      );
      expect("status", result.status, 400);
    }
  } finally {
    if (createdSlotIds.length > 0) {
      for (const slotId of createdSlotIds) {
        await db.delete(studioArtworkSlotsTable).where(eq(studioArtworkSlotsTable.id, slotId));
      }
    }
    if (collectionId) {
      await db.delete(studioArtworkSlotsTable).where(eq(studioArtworkSlotsTable.collectionId, collectionId));
      await db.delete(studioCollectionsTable).where(eq(studioCollectionsTable.id, collectionId));
    }
    if (server) {
      await stopServer(server);
    }
    const { pool } = await import("@workspace/db");
    await pool.end();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("Failures:", failures.join(", "));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
