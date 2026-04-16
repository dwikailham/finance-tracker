import { z } from "zod";

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("Category ID tidak valid").optional().nullable(),
    // categoryId = null → total budget bulanan (semua kategori)
    // categoryId = uuid → budget per kategori
    month: z.number().int().min(1).max(12, "Bulan harus 1-12"),
    year: z.number().int().min(2020).max(2100, "Tahun tidak valid"),
    amount: z.number().positive("Jumlah anggaran harus lebih dari 0"),
  }),
});

export const updateBudgetSchema = z.object({
  body: z.object({
    amount: z.number().positive("Jumlah anggaran harus lebih dari 0"),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getBudgetQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2100),
  }),
});

export const copyBudgetSchema = z.object({
  body: z.object({
    fromMonth: z.number().int().min(1).max(12),
    fromYear: z.number().int().min(2020).max(2100),
    toMonth: z.number().int().min(1).max(12),
    toYear: z.number().int().min(2020).max(2100),
  }),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>["body"];
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>["body"];
export type GetBudgetQuery = z.infer<typeof getBudgetQuerySchema>["query"];
export type CopyBudgetInput = z.infer<typeof copyBudgetSchema>["body"];
