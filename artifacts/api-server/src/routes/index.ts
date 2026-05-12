import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateCardRouter from "./generate-card";
import editCardRouter from "./edit-card";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateCardRouter);
router.use(editCardRouter);

export default router;
