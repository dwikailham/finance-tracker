import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z
    .object({
      type: z.enum(["income", "expense", "transfer"], {
        message: "Type harus 'income', 'expense', atau 'transfer'",
      }),
      amount: z.number().positive("Jumlah harus lebih dari 0"),
      accountId: z.string().uuid("Account ID tidak valid"),
      toAccountId: z.string().uuid("Target Account ID tidak valid").optional(),
      categoryId: z.string().uuid("Category ID tidak valid"),
      description: z.string().max(255).optional(),
      transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Format tanggal tidak valid (gunakan YYYY-MM-DD)",
      }),
    })
    .refine(
      (data) => {
        // Jika type = transfer, toAccountId wajib ada
        if (data.type === "transfer" && !data.toAccountId) return false;
        return true;
      },
      { message: "Untuk transfer, rekening tujuan wajib diisi", path: ["toAccountId"] }
    )
    .refine(
      (data) => {
        // Jika type = transfer, accountId tidak boleh sama dengan toAccountId
        if (data.type === "transfer" && data.accountId === data.toAccountId) return false;
        return true;
      },
      { message: "Rekening sumber dan tujuan tidak boleh sama", path: ["toAccountId"] }
    ),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    categoryId: z.string().uuid().optional(),
    description: z.string().max(255).optional().nullable(),
    transactionDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)))
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listTransactionSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    type: z.enum(["income", "expense", "transfer"]).optional(),
    categoryId: z.string().uuid().optional(),
    accountId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["transactionDate", "amount", "createdAt"]).default("transactionDate"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>["body"];
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>["body"];
export type ListTransactionQuery = z.infer<typeof listTransactionSchema>["query"];
