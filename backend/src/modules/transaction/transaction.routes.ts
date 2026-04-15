import { Router } from "express";
import { transactionController } from "./transaction.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { createTransactionSchema, updateTransactionSchema, listTransactionSchema } from "./transaction.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listTransactionSchema), transactionController.getAll);
router.get("/:id", transactionController.getById);
router.post("/", validate(createTransactionSchema), transactionController.create);
router.put("/:id", validate(updateTransactionSchema), transactionController.update);
router.delete("/:id", transactionController.delete);

export default router;
