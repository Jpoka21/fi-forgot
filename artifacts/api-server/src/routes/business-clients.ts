import { Router } from "express";
import { db, businessClientsTable, insertBusinessClientSchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/business-clients", async (req, res) => {
  const businessId = req.query.businessId as string;
  if (!businessId) return res.status(400).json({ error: "businessId required" });
  const clients = await db
    .select()
    .from(businessClientsTable)
    .where(eq(businessClientsTable.businessId, businessId))
    .orderBy(businessClientsTable.createdAt);
  res.json({ clients });
});

router.post("/business-clients", async (req, res) => {
  const parsed = insertBusinessClientSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const [client] = await db.insert(businessClientsTable).values(parsed.data).returning();
  res.status(201).json({ client });
});

router.patch("/business-clients/:id", async (req, res) => {
  const { id } = req.params;
  const businessId = req.body.businessId as string;
  if (!businessId) return res.status(400).json({ error: "businessId required" });
  const partial = insertBusinessClientSchema.partial().safeParse(req.body);
  if (!partial.success) return res.status(400).json({ error: partial.error.issues });
  const [client] = await db
    .update(businessClientsTable)
    .set({ ...partial.data, updatedAt: new Date() })
    .where(and(eq(businessClientsTable.id, id), eq(businessClientsTable.businessId, businessId)))
    .returning();
  if (!client) return res.status(404).json({ error: "Not found" });
  res.json({ client });
});

router.delete("/business-clients/:id", async (req, res) => {
  const { id } = req.params;
  const businessId = req.query.businessId as string;
  if (!businessId) return res.status(400).json({ error: "businessId required" });
  await db
    .delete(businessClientsTable)
    .where(and(eq(businessClientsTable.id, id), eq(businessClientsTable.businessId, businessId)));
  res.json({ ok: true });
});

export default router;
