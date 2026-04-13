import { Router } from "express";
import { accountController } from "./account.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { createAccountSchema, updateAccountSchema } from "./account.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", accountController.getAll);
router.get("/:id", accountController.getById);
router.post("/", validate(createAccountSchema), accountController.create);
router.put("/:id", validate(updateAccountSchema), accountController.update);
router.delete("/:id", accountController.archive); // Soft delete (archive)

export default router;
