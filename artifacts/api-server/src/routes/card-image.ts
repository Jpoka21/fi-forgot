import { Router } from "express";
import { getCardImage } from "../services/card-image-store";

const router = Router();

router.get("/card-image/:id", (req, res) => {
  const image = getCardImage(req.params.id ?? "");
  if (!image) {
    res.status(404).end();
    return;
  }
  res.setHeader("Content-Type", image.mime);
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(image.data);
});

export default router;
