import { Router } from "express";
import { db } from "@workspace/db";
import { aiCardLibraryTable } from "@workspace/db";
import { eq, sql, and, inArray } from "drizzle-orm";
import { generateLibraryCards, regenerateLibraryCard, CARD_DESIGNS } from "../services/ai-card-library-generator";
import { logger } from "../lib/logger";

const router = Router();

// ── List cards ────────────────────────────────────────────────────────────────

router.get("/admin/card-library", async (req, res) => {
  const { category, active } = req.query;
  let query = db.select().from(aiCardLibraryTable).$dynamic();

  const conditions = [];
  if (category && typeof category === "string") {
    conditions.push(eq(aiCardLibraryTable.category, category));
  }
  if (active !== undefined) {
    conditions.push(eq(aiCardLibraryTable.active, active === "true"));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const cards = await query.orderBy(aiCardLibraryTable.createdAt);
  res.json({ cards });
});

// ── Get available categories and counts ───────────────────────────────────────

router.get("/admin/card-library/categories", async (_req, res) => {
  const rows = await db
    .select({
      category: aiCardLibraryTable.category,
      count: sql<number>`count(*)::int`,
      activeCount: sql<number>`count(*) filter (where ${aiCardLibraryTable.active})::int`,
    })
    .from(aiCardLibraryTable)
    .groupBy(aiCardLibraryTable.category);

  const defined = [
    { key: "home_purchase_anniversary", label: "Home Purchase Anniversary", target: 12 },
    { key: "business_relationship_anniversary", label: "Business Relationship Anniversary", target: 10 },
    { key: "closing_anniversary", label: "Closing Anniversary", target: 8 },
    { key: "general_milestone", label: "General Business Milestone", target: 5 },
    { key: "holiday", label: "Holiday", target: 5 },
    { key: "just_because", label: "Just Because", target: 10 },
    { key: "humor", label: "Humor & Funny", target: 15 },
    { key: "thinking_of_you", label: "Thinking of You", target: 8 },
    { key: "encouragement", label: "Encouragement", target: 8 },
    { key: "congratulations_personal", label: "Congratulations (Personal)", target: 6 },
    { key: "new_baby", label: "New Baby", target: 6 },
    { key: "get_well", label: "Get Well", target: 6 },
    { key: "miss_you", label: "Miss You", target: 6 },
  ];

  const byKey = new Map(rows.map(r => [r.category, r]));
  const categories = defined.map(d => ({
    key: d.key,
    label: d.label,
    target: d.target,
    count: byKey.get(d.key)?.count ?? 0,
    activeCount: byKey.get(d.key)?.activeCount ?? 0,
  }));

  res.json({ categories });
});

// ── Trigger batch generation ──────────────────────────────────────────────────

router.post("/admin/card-library/generate", async (req, res) => {
  const { categories, force } = req.body as { categories?: string[]; force?: boolean };

  // Stream progress via SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let closed = false;
  req.on("close", () => { closed = true; });

  // Silent send — swallow write errors when the proxy/browser cuts the connection.
  // Generation continues regardless; the client polls for progress.
  const send = (data: object) => {
    if (closed) return;
    try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch { closed = true; }
  };

  // Keepalive comment every 20 s to prevent intermediate proxies from closing early
  const keepalive = setInterval(() => {
    if (closed) { clearInterval(keepalive); return; }
    try { res.write(": keepalive\n\n"); } catch { closed = true; clearInterval(keepalive); }
  }, 20_000);

  send({ type: "start", message: "Starting generation…" });

  try {
    const result = await generateLibraryCards({
      categories,
      force: force ?? false,
      onProgress: (msg) => send({ type: "progress", message: msg }),
    });

    send({ type: "done", result });
    logger.info({ succeeded: result.succeeded.length, failed: result.failed.length }, "ai-card-library: batch generation complete");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    send({ type: "error", message: msg });
    logger.error({ err }, "ai-card-library: batch generation error");
  }

  clearInterval(keepalive);
  try { res.end(); } catch { /* already closed */ }
});

// ── Update a card ─────────────────────────────────────────────────────────────

router.patch("/admin/card-library/:id", async (req, res) => {
  const { id } = req.params;
  const { active, title } = req.body as { active?: boolean; title?: string };

  const updates: Partial<typeof aiCardLibraryTable.$inferInsert> = {};
  if (active !== undefined) updates.active = active;
  if (title !== undefined) updates.title = title;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  await db.update(aiCardLibraryTable).set(updates).where(eq(aiCardLibraryTable.id, id));
  res.json({ ok: true });
});

// ── Delete a card ─────────────────────────────────────────────────────────────

router.delete("/admin/card-library/:id", async (req, res) => {
  const { id } = req.params;
  await db.delete(aiCardLibraryTable).where(eq(aiCardLibraryTable.id, id));
  res.json({ ok: true });
});

// ── Regenerate a single card ──────────────────────────────────────────────────

router.post("/admin/card-library/:id/regenerate", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await regenerateLibraryCard(id);
    res.json({ ok: true, card: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err, id }, "ai-card-library: regenerate failed");
    res.status(500).json({ error: msg });
  }
});

// ── Track stats ───────────────────────────────────────────────────────────────

router.post("/admin/card-library/:id/track", async (req, res) => {
  const { id } = req.params;
  const { event } = req.body as { event: "shown" | "selected" | "rejected" };

  if (!["shown", "selected", "rejected"].includes(event)) {
    res.status(400).json({ error: "event must be shown, selected, or rejected" });
    return;
  }

  const col =
    event === "shown"    ? aiCardLibraryTable.timesShown :
    event === "selected" ? aiCardLibraryTable.timesSelected :
                           aiCardLibraryTable.timesRejected;

  await db
    .update(aiCardLibraryTable)
    .set({ [col.name]: sql`${col} + 1` })
    .where(eq(aiCardLibraryTable.id, id));

  res.json({ ok: true });
});

export default router;
