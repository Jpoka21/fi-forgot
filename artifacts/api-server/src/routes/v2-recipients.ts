import { Router } from "express";
import { db, usersTable, recipientsV2Table, recipientMemoryTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";

const router = Router();

function requireUserId(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): string | null {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.status(401).json({ error: "x-user-id header required" }); return null; }
  return userId;
}

// ── Check for duplicate name ──────────────────────────────────────────────────

router.post("/api/v2/recipients/check", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { firstName } = req.body as { firstName?: string };
  if (!firstName?.trim()) { res.status(400).json({ error: "firstName required" }); return; }

  const rows = await db
    .select()
    .from(recipientsV2Table)
    .where(and(
      eq(recipientsV2Table.userId, userId),
      ilike(recipientsV2Table.firstName, firstName.trim()),
    ));

  if (rows.length > 0) {
    res.json({ duplicate: true, existing: rows.map(r => ({ id: r.id, firstName: r.firstName, relationshipType: r.relationshipType })) });
  } else {
    res.json({ duplicate: false });
  }
});

// ── Create recipient ──────────────────────────────────────────────────────────

router.post("/api/v2/recipients", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { firstName, relationshipType, birthday } = req.body as {
    firstName?: string;
    relationshipType?: string;
    birthday?: string;
  };

  if (!firstName?.trim() || !relationshipType?.trim()) {
    res.status(400).json({ error: "firstName and relationshipType required" });
    return;
  }

  const id = randomUUID();
  const [created] = await db
    .insert(recipientsV2Table)
    .values({
      id,
      userId,
      firstName: firstName.trim(),
      relationshipType: relationshipType.trim(),
      birthday: birthday?.trim() || null,
    })
    .returning();

  logger.info({ id, userId, firstName: created.firstName }, "v2-recipients: created");
  res.json({ recipient: created });
});

// ── List recipients ───────────────────────────────────────────────────────────

router.get("/api/v2/recipients", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const rows = await db
    .select()
    .from(recipientsV2Table)
    .where(eq(recipientsV2Table.userId, userId))
    .orderBy(recipientsV2Table.createdAt);

  res.json({ recipients: rows });
});

// ── Get single recipient with memory ─────────────────────────────────────────

router.get("/api/v2/recipients/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const [recipient] = await db
    .select()
    .from(recipientsV2Table)
    .where(and(eq(recipientsV2Table.id, id), eq(recipientsV2Table.userId, userId)))
    .limit(1);

  if (!recipient) { res.status(404).json({ error: "Not found" }); return; }

  const [memory] = await db
    .select()
    .from(recipientMemoryTable)
    .where(eq(recipientMemoryTable.recipientId, id))
    .limit(1);

  res.json({ recipient, memory: memory ?? null });
});

// ── Update recipient memory ───────────────────────────────────────────────────

router.patch("/api/v2/recipients/:id/memory", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  const { category, data } = req.body as {
    category: "permanentFacts" | "relationshipDna" | "cardFuel" | "cardPreferences";
    data: Record<string, unknown>;
  };

  const [recipient] = await db
    .select({ id: recipientsV2Table.id })
    .from(recipientsV2Table)
    .where(and(eq(recipientsV2Table.id, id), eq(recipientsV2Table.userId, userId)))
    .limit(1);
  if (!recipient) { res.status(404).json({ error: "Not found" }); return; }

  const [existing] = await db
    .select()
    .from(recipientMemoryTable)
    .where(eq(recipientMemoryTable.recipientId, id))
    .limit(1);

  const colMap = {
    permanentFacts: { permanentFacts: data },
    relationshipDna: { relationshipDna: data },
    cardFuel: { cardFuel: data },
    cardPreferences: { cardPreferences: data },
  };

  if (existing) {
    await db
      .update(recipientMemoryTable)
      .set({ ...colMap[category], updatedAt: new Date() })
      .where(eq(recipientMemoryTable.recipientId, id));
  } else {
    await db.insert(recipientMemoryTable).values({
      id: randomUUID(),
      recipientId: id,
      ...colMap[category],
    });
  }

  res.json({ ok: true });
});

// ── Update recipient ──────────────────────────────────────────────────────────

router.patch("/api/v2/recipients/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  const { firstName, birthday } = req.body as { firstName?: string; birthday?: string };

  await db
    .update(recipientsV2Table)
    .set({
      ...(firstName?.trim() && { firstName: firstName.trim() }),
      ...(birthday !== undefined && { birthday: birthday?.trim() || null }),
      updatedAt: new Date(),
    })
    .where(and(eq(recipientsV2Table.id, id), eq(recipientsV2Table.userId, userId)));

  res.json({ ok: true });
});

// ── Delete recipient ──────────────────────────────────────────────────────────

router.delete("/api/v2/recipients/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  await db
    .delete(recipientsV2Table)
    .where(and(eq(recipientsV2Table.id, id), eq(recipientsV2Table.userId, userId)));

  res.json({ ok: true });
});

export default router;
