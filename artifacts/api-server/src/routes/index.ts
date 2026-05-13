import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateCardRouter from "./generate-card";
import editCardRouter from "./edit-card";
import adminRouter from "./admin";
import approvalRouter from "./approval";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateCardRouter);
router.use(editCardRouter);
router.use(adminRouter);
router.use(approvalRouter);

export default router;
