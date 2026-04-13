import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { createCategorySchema, updateCategorySchema } from "./category.schema.js";

const router = Router();

// Semua route perlu autentikasi
router.use(authenticate);

router.get("/", categoryController.getAll);
router.post("/", validate(createCategorySchema), categoryController.create);
router.put("/:id", validate(updateCategorySchema), categoryController.update);
router.delete("/:id", categoryController.delete);

export default router;
