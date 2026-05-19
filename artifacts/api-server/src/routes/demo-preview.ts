import { Router } from "express";
import { getDemoPreview } from "../services/demo-preview-store";

const router = Router();

router.get("/demo-preview/:id", (req, res) => {
  const data = getDemoPreview(req.params.id ?? "");
  if (!data) {
    res.status(404).json({ error: "not_found", message: "Preview not found or expired." });
    return;
  }
  res.json(data);
});

export default router;
