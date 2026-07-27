/**
 * Studio artwork candidates API persistence integration tests (Product Sprint 003).
 *
 * Requires DATABASE_URL and applied studio_artwork_candidates schema.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/studio-artwork-candidates-persistence.test.ts
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

  const {
    db,
    studioArtworkCandidatesTable,
    studioArtworkSlotsTable,
    studioCollectionsTable,
  } = await import("@workspace/db");
  const { eq } = await import("drizzle-orm");

  const collectionName = `Sprint 003 persistence ${randomUUID()}`;
  let collectionId: string | null = null;
  let slotId: string | null = null;
  const createdCandidateIds: string[] = [];
  let server: Server | null = null;
  let baseUrl = "";

  try {
    section("setup — create test collection and slot");
    {
      const [createdCollection] = await db
        .insert(studioCollectionsTable)
        .values({
          name: collectionName,
          occasion: "birthday",
          relationship: "grandmother",
          status: "planning",
          updatedAt: new Date(),
        })
        .returning();
      collectionId = createdCollection.id;

      const [createdSlot] = await db
        .insert(studioArtworkSlotsTable)
        .values({
          collectionId,
          name: "Birthday Cake Scene",
          brief: "Warm watercolor birthday cake scene.",
          quantity: 1,
          sortOrder: 0,
          updatedAt: new Date(),
        })
        .returning();
      slotId = createdSlot.id;
      expectTrue("collection and slot created", Boolean(collectionId && slotId));
    }

    ({ server, baseUrl } = await startServer());

    const candidatesPath = `/studio/collections/${collectionId}/artwork-slots/${slotId}/artwork-candidates`;

    section("GET list — empty slot returns empty list");
    {
      const result = await jsonRequest(baseUrl, "GET", candidatesPath);
      expect("status", result.status, 200);
      const candidates =
        (result.data as { artworkCandidates?: unknown[] }).artworkCandidates ?? [];
      expect("empty list", candidates.length, 0);
    }

    section("POST — create first candidate");
    {
      const result = await jsonRequest(baseUrl, "POST", candidatesPath, {
        name: "Soft watercolor bouquet",
        brief: "Warm flowers around a birthday table.",
      });
      expect("status", result.status, 201);
      const candidate = (result.data as { artworkCandidate?: Record<string, unknown> })
        .artworkCandidate;
      expectTrue("candidate returned", Boolean(candidate));
      if (candidate?.id) createdCandidateIds.push(String(candidate.id));
      expect("sort_order first", candidate?.sortOrder, 0);
      expect("collection_id", candidate?.collectionId, collectionId);
      expect("artwork_slot_id", candidate?.artworkSlotId, slotId);
    }

    section("POST — create second candidate");
    {
      const result = await jsonRequest(baseUrl, "POST", candidatesPath, {
        name: "Family table scene",
      });
      expect("status", result.status, 201);
      const candidate = (result.data as { artworkCandidate?: Record<string, unknown> })
        .artworkCandidate;
      if (candidate?.id) createdCandidateIds.push(String(candidate.id));
      expect("sort_order second", candidate?.sortOrder, 1);
      expect("brief null", candidate?.brief, null);
    }

    section("GET list — ordering");
    {
      const result = await jsonRequest(baseUrl, "GET", candidatesPath);
      expect("status", result.status, 200);
      const candidates = (
        result.data as { artworkCandidates?: Array<{ name: string; sortOrder: number }> }
      ).artworkCandidates ?? [];
      expect("candidate count", candidates.length, 2);
      expect("first candidate name", candidates[0]?.name, "Soft watercolor bouquet");
      expect("second candidate name", candidates[1]?.name, "Family table scene");
      expectTrue("sort order ascending", candidates[0]!.sortOrder < candidates[1]!.sortOrder);
    }

    section("GET by id — read created candidate");
    {
      const candidateId = createdCandidateIds[0];
      const result = await jsonRequest(
        baseUrl,
        "GET",
        `${candidatesPath}/${candidateId}`,
      );
      expect("status", result.status, 200);
      const candidate = (result.data as { artworkCandidate?: Record<string, unknown> })
        .artworkCandidate;
      expect("name", candidate?.name, "Soft watercolor bouquet");
    }

    section("GET by id — wrong collection returns 404");
    {
      const candidateId = createdCandidateIds[0];
      const wrongCollectionId = randomUUID();
      const result = await jsonRequest(
        baseUrl,
        "GET",
        `/studio/collections/${wrongCollectionId}/artwork-slots/${slotId}/artwork-candidates/${candidateId}`,
      );
      expect("status", result.status, 404);
    }

    section("GET list — wrong slot in collection returns 404");
    {
      const result = await jsonRequest(
        baseUrl,
        "GET",
        `/studio/collections/${collectionId}/artwork-slots/${randomUUID()}/artwork-candidates`,
      );
      expect("status", result.status, 404);
    }

    section("GET list — missing collection returns 404");
    {
      const result = await jsonRequest(
        baseUrl,
        "GET",
        `/studio/collections/${randomUUID()}/artwork-slots/${slotId}/artwork-candidates`,
      );
      expect("status", result.status, 404);
    }

    section("POST — invalid input returns 400");
    {
      const result = await jsonRequest(baseUrl, "POST", candidatesPath, { brief: "No name" });
      expect("status", result.status, 400);
    }
  } finally {
    if (createdCandidateIds.length > 0) {
      for (const candidateId of createdCandidateIds) {
        await db
          .delete(studioArtworkCandidatesTable)
          .where(eq(studioArtworkCandidatesTable.id, candidateId));
      }
    }
    if (slotId) {
      await db
        .delete(studioArtworkCandidatesTable)
        .where(eq(studioArtworkCandidatesTable.artworkSlotId, slotId));
      await db.delete(studioArtworkSlotsTable).where(eq(studioArtworkSlotsTable.id, slotId));
    }
    if (collectionId) {
      await db
        .delete(studioArtworkCandidatesTable)
        .where(eq(studioArtworkCandidatesTable.collectionId, collectionId));
      await db
        .delete(studioArtworkSlotsTable)
        .where(eq(studioArtworkSlotsTable.collectionId, collectionId));
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
