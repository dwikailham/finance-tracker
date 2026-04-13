import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nama kategori wajib diisi").max(50),
    type: z.enum(["income", "expense"], {
      message: "Type harus 'income' atau 'expense'",
    }),
    icon: z.string().max(10).optional().default("📦"),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Format warna harus hex (#RRGGBB)")
      .optional()
      .default("#6B7280"),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    icon: z.string().max(10).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
