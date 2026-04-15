import prisma from "../../config/database.js";
import { Prisma } from "@prisma/client";
import { CreateTransactionInput, UpdateTransactionInput, ListTransactionQuery } from "./transaction.schema.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";

export class TransactionService {
  /**
   * GET ALL — dengan filter, search, pagination, sorting
   */
  async getAll(userId: string, query: ListTransactionQuery) {
    const { skip, take, page, limit } = getPagination({ page: query.page, limit: query.limit });

    // Build where clause
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(query.type && { type: query.type }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.accountId && {
        OR: [{ accountId: query.accountId }, { toAccountId: query.accountId }],
      }),
      ...(query.startDate || query.endDate
        ? {
            transactionDate: {
              ...(query.startDate && { gte: new Date(query.startDate) }),
              ...(query.endDate && { lte: new Date(query.endDate) }),
            },
          }
        : {}),
      ...(query.search && {
        description: { contains: query.search, mode: "insensitive" as const },
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true, type: true } },
          account: { select: { id: true, name: true, icon: true, type: true } },
          toAccount: { select: { id: true, name: true, icon: true, type: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: getPaginationMeta(total, page, limit),
    };
  }

  /**
   * GET BY ID
   */
  async getById(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      include: {
        category: true,
        account: true,
        toAccount: true,
      },
    });

    if (!transaction) {
      throw { statusCode: 404, message: "Transaksi tidak ditemukan" };
    }

    return transaction;
  }

  /**
   * CREATE — buat transaksi baru + update saldo rekening
   *
   * Logic saldo:
   * - income  → account.balance += amount
   * - expense → account.balance -= amount
   * - transfer → account.balance -= amount, toAccount.balance += amount
   */
  async create(userId: string, data: CreateTransactionInput) {
    // Verifikasi account milik user
    const account = await prisma.account.findFirst({
      where: { id: data.accountId, userId, isArchived: false },
    });
    if (!account) {
      throw { statusCode: 404, message: "Rekening sumber tidak ditemukan" };
    }

    // Jika transfer, verifikasi toAccount
    if (data.type === "transfer" && data.toAccountId) {
      const toAccount = await prisma.account.findFirst({
        where: { id: data.toAccountId, userId, isArchived: false },
      });
      if (!toAccount) {
        throw { statusCode: 404, message: "Rekening tujuan tidak ditemukan" };
      }

      // Cek saldo cukup
      if (account.balance.toNumber() < data.amount) {
        throw { statusCode: 400, message: "Saldo rekening tidak mencukupi untuk transfer" };
      }
    }

    // Cek saldo untuk expense
    if (data.type === "expense" && account.balance.toNumber() < data.amount) {
      throw { statusCode: 400, message: "Saldo rekening tidak mencukupi" };
    }

    // Verifikasi category
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ isDefault: true }, { userId }],
      },
    });
    if (!category) {
      throw { statusCode: 404, message: "Kategori tidak ditemukan" };
    }

    // Jalankan dalam transaction atomik
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat record transaksi
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          toAccountId: data.toAccountId || null,
          categoryId: data.categoryId,
          type: data.type,
          amount: data.amount,
          description: data.description || null,
          transactionDate: new Date(data.transactionDate),
        },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, icon: true } },
          toAccount: { select: { id: true, name: true, icon: true } },
        },
      });

      // 2. Update saldo rekening
      if (data.type === "income") {
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: data.amount } },
        });
      } else if (data.type === "expense") {
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { decrement: data.amount } },
        });
      } else if (data.type === "transfer" && data.toAccountId) {
        // Kurangi saldo sumber
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { decrement: data.amount } },
        });
        // Tambah saldo tujuan
        await tx.account.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });
      }

      return transaction;
    });

    return result;
  }

  /**
   * UPDATE — update transaksi + recalculate saldo jika amount berubah
   *
   * ⚠️ NOTE: Update hanya boleh mengubah amount, category, description, date.
   * TIDAK boleh mengubah type, accountId, atau toAccountId.
   * Kalau mau ubah itu → hapus transaksi lama, buat baru.
   */
  async update(userId: string, transactionId: string, data: UpdateTransactionInput) {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: "Transaksi tidak ditemukan" };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Jika amount berubah, harus adjust saldo
      if (data.amount !== undefined && data.amount !== existing.amount.toNumber()) {
        const diff = data.amount - existing.amount.toNumber();

        if (existing.type === "income") {
          // Income bertambah → saldo bertambah (diff positif)
          // Income berkurang → saldo berkurang (diff negatif)
          await tx.account.update({
            where: { id: existing.accountId },
            data: { balance: { increment: diff } },
          });
        } else if (existing.type === "expense") {
          // Expense bertambah → saldo berkurang (diff negatif)
          // Expense berkurang → saldo bertambah (diff positif)
          await tx.account.update({
            where: { id: existing.accountId },
            data: { balance: { decrement: diff } },
          });
        } else if (existing.type === "transfer" && existing.toAccountId) {
          await tx.account.update({
            where: { id: existing.accountId },
            data: { balance: { decrement: diff } },
          });
          await tx.account.update({
            where: { id: existing.toAccountId },
            data: { balance: { increment: diff } },
          });
        }
      }

      // Update transaksi
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.transactionDate && { transactionDate: new Date(data.transactionDate) }),
        },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, icon: true } },
          toAccount: { select: { id: true, name: true, icon: true } },
        },
      });

      return updated;
    });

    return result;
  }

  /**
   * DELETE — hapus transaksi + rollback saldo
   */
  async delete(userId: string, transactionId: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: "Transaksi tidak ditemukan" };
    }

    await prisma.$transaction(async (tx) => {
      // Rollback saldo
      if (existing.type === "income") {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { decrement: existing.amount } },
        });
      } else if (existing.type === "expense") {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: existing.amount } },
        });
      } else if (existing.type === "transfer" && existing.toAccountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: existing.amount } },
        });
        await tx.account.update({
          where: { id: existing.toAccountId },
          data: { balance: { decrement: existing.amount } },
        });
      }

      // Hapus transaksi
      await tx.transaction.delete({ where: { id: transactionId } });
    });
  }
}

export const transactionService = new TransactionService();
