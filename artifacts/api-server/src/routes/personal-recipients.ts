import { Router } from "express";
import { db, usersTable, personalRecipientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

router.post("/auth/session", async (req, res) => {
  const { email, name } = req.body as { email?: string; name?: string };
  if (!email) { res.status(400).json({ error: "email required" }); return; }
  const normalizedEmail = email.toLowerCase().trim();

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);

  if (existing) {
    res.json({ userId: existing.id });
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({ id: randomUUID(), email: normalizedEmail, name: name ?? null })
    .returning({ id: usersTable.id });

  res.json({ userId: user.id });
});

router.get("/recipients", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) { res.status(401).json({ error: "x-user-id required" }); return; }
  const rows = await db
    .select()
    .from(personalRecipientsTable)
    .where(eq(personalRecipientsTable.userId, userId))
    .orderBy(personalRecipientsTable.createdAt);
  res.json({ recipients: rows.map(r => r.data) });
});

router.put("/recipients/:id", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) { res.status(401).json({ error: "x-user-id required" }); return; }
  const { id } = req.params;
  const data = req.body;
  await db
    .insert(personalRecipientsTable)
    .values({ id, userId, data })
    .onConflictDoUpdate({
      target: personalRecipientsTable.id,
      set: { data, updatedAt: new Date() },
    });
  res.json({ ok: true });
});

router.delete("/recipients/:id", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) { res.status(401).json({ error: "x-user-id required" }); return; }
  const { id } = req.params;
  await db
    .delete(personalRecipientsTable)
    .where(eq(personalRecipientsTable.id, id));
  res.json({ ok: true });
});

export default router;
