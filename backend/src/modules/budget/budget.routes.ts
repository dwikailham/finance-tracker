import { Router } from "express";
import { budgetController } from "./budget.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  createBudgetSchema,
  updateBudgetSchema,
  getBudgetQuerySchema,
  copyBudgetSchema,
} from "./budget.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(getBudgetQuerySchema), budgetController.getByMonth);
router.get("/summary", validate(getBudgetQuerySchema), budgetController.getSummary);
router.post("/", validate(createBudgetSchema), budgetController.create);
router.post("/copy", validate(copyBudgetSchema), budgetController.copy);
router.put("/:id", validate(updateBudgetSchema), budgetController.update);
router.delete("/:id", budgetController.delete);

export default router;
