import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateCardRouter from "./generate-card";
import editCardRouter from "./edit-card";
import adminRouter from "./admin";
import approvalRouter from "./approval";
import demoEmailRouter from "./demo-email";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateCardRouter);
router.use(editCardRouter);
router.use(adminRouter);
router.use(approvalRouter);
router.use(demoEmailRouter);

export default router;
