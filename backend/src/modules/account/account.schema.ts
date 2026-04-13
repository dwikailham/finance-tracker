import { z } from "zod";

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nama rekening wajib diisi").max(50),
    type: z.enum(["cash", "bank", "e_wallet", "credit_card", "other"], {
      message: "Tipe rekening tidak valid",
    }),
    initialBalance: z.number().min(0, "Saldo awal tidak boleh negatif").default(0),
    icon: z.string().max(10).optional().default("💰"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default("#3B82F6"),
  }),
});

export const updateAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    icon: z.string().max(10).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>["body"];
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>["body"];
