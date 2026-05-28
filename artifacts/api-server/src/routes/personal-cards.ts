import { Router } from "express";

const router = Router();

router.get("/personal-cards/pick-card", async (req, res) => {
  const eventType  = (req.query.eventType  as string | undefined) ?? "";
  const excludeIds = ((req.query.excludeIds as string | undefined) ?? "")
    .split(",").map(s => s.trim()).filter(Boolean);
  const cardMessage = (req.query.cardMessage as string | undefined) ?? null;

  try {
    const { pickPersonalCard } = await import("../services/personal-card-picker");
    const card = await pickPersonalCard(eventType, excludeIds, cardMessage);
    res.json({ card: card ?? null });
  } catch {
    res.json({ card: null });
  }
});

export default router;
