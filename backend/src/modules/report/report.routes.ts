import { Router } from "express";
import { reportController, getMonthYearSchema, getTrendSchema } from "./report.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/dashboard/summary", reportController.getDashboardSummary);
router.get("/monthly", validate(getMonthYearSchema), reportController.getMonthlyReport);
router.get("/trend", validate(getTrendSchema), reportController.getTrend);
router.get("/category-breakdown", validate(getMonthYearSchema), reportController.getCategoryBreakdown);
router.get("/budget-vs-actual", validate(getMonthYearSchema), reportController.getBudgetVsActual);

export default router;
