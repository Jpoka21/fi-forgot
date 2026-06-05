import { Router } from "express";
import { db, usersTable, personalRecipientsTable, recipientsTable, recipientProfileTable } from "@workspace/db";
import { eq, and, ilike, ne } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";

const router = Router();

// In-process counter incremented whenever a normalized write fails.
// Exposed on /api/healthz so silent failures are detectable without log diving.
export let normalizedSyncErrors = 0;

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
  const data = req.body as Record<string, unknown>;

  // ── 1. Primary write: personal_recipients blob (existing behavior, unchanged) ──
  await db
    .insert(personalRecipientsTable)
    .values({ id, userId, data })
    .onConflictDoUpdate({
      target: personalRecipientsTable.id,
      set: { data, updatedAt: new Date() },
    });

  // ── 2. Normalized writes — additive, failures never break the primary sync ────
  let warning: string | undefined;
  try {
    const now = new Date();

    // Derive normalized fields from the blob
    const fullName = ((data.name as string) ?? "").trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.slice(1).join(" ") || null;
    const nickname = (data.petName as string) ?? null;
    const relationshipType = (data.relationship as string) ?? "";
    const birthday = (data.birthday as string) ?? null;
    const anniversary = (data.anniversaryDate as string) ?? (data.marriageDate as string) ?? null;
    const active = (data.active as boolean) ?? true;

    const addr = data.mailingAddress as {
      line1?: string; line2?: string; city?: string; state?: string; zip?: string;
    } | undefined;

    // ── 2a. Duplicate warning (new recipients only, warning only — save always proceeds) ──
    const [alreadyNormalized] = await db
      .select({ id: recipientsTable.id })
      .from(recipientsTable)
      .where(eq(recipientsTable.id, id))
      .limit(1);

    if (!alreadyNormalized) {
      const nameMatches = await db
        .select({ id: recipientsTable.id, birthday: recipientsTable.birthday })
        .from(recipientsTable)
        .where(
          and(
            eq(recipientsTable.userId, userId),
            ilike(recipientsTable.firstName, firstName),
            ne(recipientsTable.id, id),
          ),
        );
      const isDupe = nameMatches.some(
        d => Boolean(birthday && d.birthday && d.birthday === birthday),
      );
      if (isDupe) warning = "possible_duplicate";
    }

    // ── 2b. Upsert recipients (normalized) ──
    await db
      .insert(recipientsTable)
      .values({
        id,
        userId,
        firstName,
        lastName,
        nickname,
        relationshipType,
        relationshipLabel: relationshipType || null,
        birthday,
        anniversary,
        email: null,
        phone: null,
        addressLine1: addr?.line1 ?? null,
        addressLine2: addr?.line2 ?? null,
        city: addr?.city ?? null,
        state: addr?.state ?? null,
        postalCode: addr?.zip ?? null,
        country: "US",
        active,
        archivedAt: active ? null : now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: recipientsTable.id,
        set: {
          firstName,
          lastName,
          nickname,
          relationshipType,
          relationshipLabel: relationshipType || null,
          birthday,
          anniversary,
          addressLine1: addr?.line1 ?? null,
          addressLine2: addr?.line2 ?? null,
          city: addr?.city ?? null,
          state: addr?.state ?? null,
          postalCode: addr?.zip ?? null,
          active,
          archivedAt: active ? null : now,
          updatedAt: now,
        },
      });

    // ── 2c. Upsert recipient_profile ──
    const emotionalOpenness = typeof data.emotionalLevel === "number" ? data.emotionalLevel : null;
    const previewDays = typeof data.previewDays === "number" ? data.previewDays : null;

    await db
      .insert(recipientProfileTable)
      .values({
        id,
        recipientId: id,
        personalityNotes: (data.personalityNotes as string) ?? null,
        personalityTraits: (data.personality as string[]) ?? null,
        interests: (data.interests as string[]) ?? null,
        hobbies: null,
        dislikes: null,
        favoriteMemories: (data.favoriteMemories as string) ?? null,
        insideJokes: (data.insideJokes as string) ?? null,
        preferredTone: (data.tonePreference as string) ?? null,
        emotionalOpenness,
        thingsToAvoid: (data.thingsToAvoid as string) ?? null,
        thingsToAlwaysInclude: null,
        senderNickname: (data.senderName as string) ?? null,
        signOff: null,
        deliveryPreference: (data.deliveryPreference as string) ?? null,
        previewDays,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: recipientProfileTable.id,
        set: {
          personalityNotes: (data.personalityNotes as string) ?? null,
          personalityTraits: (data.personality as string[]) ?? null,
          interests: (data.interests as string[]) ?? null,
          favoriteMemories: (data.favoriteMemories as string) ?? null,
          insideJokes: (data.insideJokes as string) ?? null,
          preferredTone: (data.tonePreference as string) ?? null,
          emotionalOpenness,
          thingsToAvoid: (data.thingsToAvoid as string) ?? null,
          senderNickname: (data.senderName as string) ?? null,
          deliveryPreference: (data.deliveryPreference as string) ?? null,
          previewDays,
          updatedAt: now,
        },
      });
  } catch (err) {
    logger.error({ err, recipientId: id }, "normalized recipient sync failed — primary write succeeded");
    normalizedSyncErrors++;
  }

  res.json({ ok: true, ...(warning ? { warning } : {}) });
});

router.delete("/recipients/:id", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) { res.status(401).json({ error: "x-user-id required" }); return; }
  const { id } = req.params;

  // Primary delete — scoped to userId so users cannot delete each other's recipients
  await db
    .delete(personalRecipientsTable)
    .where(and(eq(personalRecipientsTable.id, id), eq(personalRecipientsTable.userId, userId)));

  // ── 2. Normalized tables: soft-archive, not hard-delete ──────────────────────
  // Keeps the identity and profile rows intact so future intelligence and card
  // history joins can still reference this recipient's profile.
  try {
    const now = new Date();

    // recipients: mark as archived, scoped by both id and user_id
    await db
      .update(recipientsTable)
      .set({ active: false, archivedAt: now, updatedAt: now })
      .where(and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId)));

    // recipient_profile: left completely intact — no changes
  } catch (err) {
    logger.error({ err, recipientId: id }, "normalized recipient soft-archive failed");
    normalizedSyncErrors++;
  }

  res.json({ ok: true });
});

export default router;
