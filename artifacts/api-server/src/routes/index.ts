import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateCardRouter from "./generate-card";
import editCardRouter from "./edit-card";
import adminRouter from "./admin";
import approvalRouter from "./approval";
import demoEmailRouter from "./demo-email";
import cardProxyRouter from "./card-proxy";
import cardImageRouter from "./card-image";
import demoPreviewRouter from "./demo-preview";
import refineMessageRouter from "./refine-message";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateCardRouter);
router.use(editCardRouter);
router.use(adminRouter);
router.use(approvalRouter);
router.use(demoEmailRouter);
router.use(cardProxyRouter);
router.use(cardImageRouter);
router.use(demoPreviewRouter);
router.use(refineMessageRouter);

export default router;
