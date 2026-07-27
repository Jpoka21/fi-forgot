/**
 * Studio collections API persistence integration tests (Product Sprint 001.1).
 *
 * Requires DATABASE_URL and an applied studio_collections schema.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/studio-collections-persistence.test.ts
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

  const { db, studioCollectionsTable } = await import("@workspace/db");
  const { eq, sql } = await import("drizzle-orm");

  const testName = `Sprint 001.1 persistence ${randomUUID()}`;
  const payload = {
    name: testName,
    occasion: "birthday",
    relationship: "grandmother",
    style: "watercolor",
    description: "Warm birthday artwork for grandmothers.",
  };

  let createdId: string | null = null;
  let server: Server | null = null;
  let baseUrl = "";

  try {
    section("schema — studio_collections table exists");
    {
      const columns = await db.execute<{ column_name: string }>(sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'studio_collections'
        ORDER BY ordinal_position
      `);

      const names = columns.rows.map((row) => row.column_name);
      for (const column of [
        "id",
        "name",
        "occasion",
        "relationship",
        "style",
        "description",
        "status",
        "created_at",
        "updated_at",
      ]) {
        expectTrue(`column ${column}`, names.includes(column));
      }
    }

    section("POST /studio/collections — creates persisted collection");
    {
      ({ server, baseUrl } = await startServer());
      const result = await jsonRequest(baseUrl, "POST", "/studio/collections", payload);
      expect("status", result.status, 201);

      const collection = (result.data as { collection?: Record<string, unknown> }).collection;
      expectTrue("collection returned", Boolean(collection));
      createdId = typeof collection?.id === "string" ? collection.id : null;
      expectTrue("id assigned", Boolean(createdId));
      expect("status default", collection?.status, "planning");
      expect("name", collection?.name, payload.name);
      expect("occasion", collection?.occasion, payload.occasion);
      expect("relationship", collection?.relationship, payload.relationship);
      expect("style", collection?.style, payload.style);
      expect("description", collection?.description, payload.description);
    }

    section("GET /studio/collections — created collection appears in list");
    {
      const result = await jsonRequest(baseUrl, "GET", "/studio/collections");
      expect("status", result.status, 200);
      const collections = (result.data as { collections?: Array<{ id: string }> }).collections ?? [];
      expectTrue("list contains created id", collections.some((row) => row.id === createdId));
    }

    section("GET /studio/collections/:id — reads created collection");
    {
      const result = await jsonRequest(baseUrl, "GET", `/studio/collections/${createdId}`);
      expect("status", result.status, 200);
      const collection = (result.data as { collection?: Record<string, unknown> }).collection;
      expect("name", collection?.name, payload.name);
      expect("occasion", collection?.occasion, payload.occasion);
      expect("relationship", collection?.relationship, payload.relationship);
      expect("style", collection?.style, payload.style);
      expect("description", collection?.description, payload.description);
      expect("status", collection?.status, "planning");
    }

    section("GET /studio/collections/:id — unknown id returns 404");
    {
      const unknownId = randomUUID();
      const result = await jsonRequest(baseUrl, "GET", `/studio/collections/${unknownId}`);
      expect("status", result.status, 404);
    }

    section("POST /studio/collections — invalid input returns 400");
    {
      const result = await jsonRequest(baseUrl, "POST", "/studio/collections", {
        occasion: "birthday",
        relationship: "grandmother",
      });
      expect("status", result.status, 400);
    }
  } finally {
    if (createdId) {
      await db.delete(studioCollectionsTable).where(eq(studioCollectionsTable.id, createdId));
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
