import { Router } from "express";
import { db, businessSettingsTable, insertBusinessSettingsSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Look up a business account by email — used to recover businessId on sign-in
router.get("/business-settings/by-email", async (req, res) => {
  const email = (req.query.email as string | undefined)?.toLowerCase().trim();
  if (!email) { res.status(400).json({ error: "email required" }); return; }
  const [settings] = await db
    .select()
    .from(businessSettingsTable)
    .where(eq(businessSettingsTable.email, email));
  res.json({ settings: settings ?? null });
});

router.get("/business-settings", async (req, res) => {
  const businessId = req.query.businessId as string;
  if (!businessId) { res.status(400).json({ error: "businessId required" }); return; }
  const [settings] = await db
    .select()
    .from(businessSettingsTable)
    .where(eq(businessSettingsTable.businessId, businessId));
  res.json({ settings: settings ?? null });
});

router.post("/business-settings", async (req, res) => {
  const businessId = req.body.businessId as string;
  if (!businessId) { res.status(400).json({ error: "businessId required" }); return; }

  const payload = {
    ...req.body,
    notifyTiming: Array.isArray(req.body.notifyTiming)
      ? JSON.stringify(req.body.notifyTiming)
      : req.body.notifyTiming,
  };

  const parsed = insertBusinessSettingsSchema.safeParse(payload);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }

  const [existing] = await db
    .select()
    .from(businessSettingsTable)
    .where(eq(businessSettingsTable.businessId, businessId));

  if (existing) {
    const [updated] = await db
      .update(businessSettingsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(businessSettingsTable.businessId, businessId))
      .returning();
    res.json({ settings: updated });
    return;
  }

  const [created] = await db
    .insert(businessSettingsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json({ settings: created });
});

export default router;
