import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { normalizedSyncErrors } from "./personal-recipients";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, normalizedSyncErrors });
});

export default router;
