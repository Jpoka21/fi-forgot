import { Router } from "express";
import { listHandwryttenFonts } from "../services/handwrytten";

const router = Router();

router.get("/handwrytten-fonts", async (req, res) => {
  try {
    const fonts = await listHandwryttenFonts();
    res.json({ fonts });
  } catch (err) {
    req.log.error({ err }, "Failed to list Handwrytten fonts");
    res.status(500).json({ error: "Failed to load fonts" });
  }
});

export default router;
