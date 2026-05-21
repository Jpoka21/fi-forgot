import { Router } from "express";
import { db, businessClientsTable, insertBusinessClientSchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/business-clients", async (req, res) => {
  const businessId = req.query.businessId as string;
  if (!businessId) { res.status(400).json({ error: "businessId required" }); return; }
  const clients = await db
    .select()
    .from(businessClientsTable)
    .where(eq(businessClientsTable.businessId, businessId))
    .orderBy(businessClientsTable.createdAt);

  // Self-healing: if no clients found, suggest the real businessId from DB so the
  // client can repair a corrupted/missing workspace businessId.
  let suggestedBusinessId: string | undefined;
  if (clients.length === 0) {
    const [any] = await db
      .select({ businessId: businessClientsTable.businessId })
      .from(businessClientsTable)
      .limit(1);
    if (any && any.businessId !== businessId) suggestedBusinessId = any.businessId;
  }

  res.json({ clients, suggestedBusinessId });
});

router.post("/business-clients", async (req, res) => {
  const parsed = insertBusinessClientSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }
  const [client] = await db.insert(businessClientsTable).values(parsed.data).returning();
  res.status(201).json({ client });
});

router.patch("/business-clients/:id", async (req, res) => {
  const { id } = req.params;
  const businessId = req.body.businessId as string;
  if (!businessId) { res.status(400).json({ error: "businessId required" }); return; }
  const partial = insertBusinessClientSchema.partial().safeParse(req.body);
  if (!partial.success) { res.status(400).json({ error: partial.error.issues }); return; }
  const [client] = await db
    .update(businessClientsTable)
    .set({ ...partial.data, updatedAt: new Date() })
    .where(and(eq(businessClientsTable.id, id), eq(businessClientsTable.businessId, businessId)))
    .returning();
  if (!client) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ client });
});

router.delete("/business-clients/:id", async (req, res) => {
  const { id } = req.params;
  const businessId = req.query.businessId as string;
  if (!businessId) { res.status(400).json({ error: "businessId required" }); return; }
  await db
    .delete(businessClientsTable)
    .where(and(eq(businessClientsTable.id, id), eq(businessClientsTable.businessId, businessId)));
  res.json({ ok: true });
});

export default router;
