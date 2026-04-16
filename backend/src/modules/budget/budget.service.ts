import prisma from "../../config/database.js";
import { Prisma } from "@prisma/client";
import {
  CreateBudgetInput,
  UpdateBudgetInput,
  GetBudgetQuery,
  CopyBudgetInput,
} from "./budget.schema.js";

export class BudgetService {
  /**
   * GET BUDGETS — untuk bulan & tahun tertentu
   * Return: daftar budget + total terpakai per kategori
   */
  async getByMonth(userId: string, query: GetBudgetQuery) {
    const month = Number(query.month);
    const year = Number(query.year);

    // Ambil semua budget untuk bulan ini
    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true, type: true } },
      },
      orderBy: { amount: "desc" },
    });

    // Hitung awal dan akhir bulan
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    // Hitung total pengeluaran per kategori di bulan ini
    const expenses = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "expense",
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    // Map expenses ke object { categoryId: totalSpent }
    const expenseMap = new Map<string, number>();
    for (const exp of expenses) {
      expenseMap.set(exp.categoryId, exp._sum.amount?.toNumber() ?? 0);
    }

    // Total semua pengeluaran bulan ini
    const totalSpent = Array.from(expenseMap.values()).reduce((sum, val) => sum + val, 0);

    // Gabungkan budget + spent
    const result = budgets.map((budget) => {
      const spent = budget.categoryId
        ? (expenseMap.get(budget.categoryId) ?? 0)
        : totalSpent;
      const percentage =
        budget.amount.toNumber() > 0 ? (spent / budget.amount.toNumber()) * 100 : 0;

      return {
        id: budget.id,
        categoryId: budget.categoryId,
        category: budget.category,
        month: budget.month,
        year: budget.year,
        amount: budget.amount.toNumber(),
        spent,
        remaining: budget.amount.toNumber() - spent,
        percentage: Math.round(percentage * 100) / 100,
        status: percentage >= 100 ? "over" : percentage >= 75 ? "warning" : "safe",
      };
    });

    return result;
  }

  /**
   * GET SUMMARY — ringkasan budget vs realisasi
   */
  async getSummary(userId: string, query: GetBudgetQuery) {
    const budgets = await this.getByMonth(userId, query);

    const totalBudgetEntry = budgets.find((b) => b.categoryId === null);
    const categoryBudgets = budgets.filter((b) => b.categoryId !== null);

    // Hitung total budget dari per-kategori
    const totalCategoryBudget = categoryBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalCategorySpent = categoryBudgets.reduce((sum, b) => sum + b.spent, 0);

    return {
      totalBudget: totalBudgetEntry?.amount ?? totalCategoryBudget,
      totalSpent: totalBudgetEntry?.spent ?? totalCategorySpent,
      totalRemaining:
        (totalBudgetEntry?.amount ?? totalCategoryBudget) -
        (totalBudgetEntry?.spent ?? totalCategorySpent),
      percentage:
        totalBudgetEntry?.percentage ??
        (totalCategoryBudget > 0 ? (totalCategorySpent / totalCategoryBudget) * 100 : 0),
      status: totalBudgetEntry?.status ?? "safe",
      categories: categoryBudgets,
    };
  }

  /**
   * CREATE BUDGET
   */
  async create(userId: string, data: CreateBudgetInput) {
    // Cek apakah budget untuk kategori + bulan + tahun ini sudah ada
    const existing = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: data.categoryId ?? null,
        month: data.month,
        year: data.year,
      },
    });

    if (existing) {
      throw {
        statusCode: 409,
        message: "Budget untuk kategori dan bulan ini sudah ada. Gunakan update.",
      };
    }

    // Jika categoryId ada, verifikasi kategori valid
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ isDefault: true }, { userId }],
          type: "expense", // Budget hanya untuk expense
        },
      });

      if (!category) {
        throw { statusCode: 404, message: "Kategori pengeluaran tidak ditemukan" };
      }
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId ?? null,
        month: data.month,
        year: data.year,
        amount: data.amount,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    return budget;
  }

  /**
   * UPDATE BUDGET — hanya update amount
   */
  async update(userId: string, budgetId: string, data: UpdateBudgetInput) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      throw { statusCode: 404, message: "Budget tidak ditemukan" };
    }

    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data: { amount: data.amount },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    });

    return updated;
  }

  /**
   * DELETE BUDGET
   */
  async delete(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) {
      throw { statusCode: 404, message: "Budget tidak ditemukan" };
    }

    await prisma.budget.delete({ where: { id: budgetId } });
  }

  /**
   * COPY BUDGET — copy semua budget dari bulan lain
   */
  async copyFromMonth(userId: string, data: CopyBudgetInput) {
    // Ambil budget dari bulan sumber
    const sourceBudgets = await prisma.budget.findMany({
      where: { userId, month: data.fromMonth, year: data.fromYear },
    });

    if (sourceBudgets.length === 0) {
      throw { statusCode: 404, message: "Tidak ada budget di bulan sumber" };
    }

    // Cek apakah bulan tujuan sudah ada budget
    const existingCount = await prisma.budget.count({
      where: { userId, month: data.toMonth, year: data.toYear },
    });

    if (existingCount > 0) {
      throw {
        statusCode: 409,
        message: "Bulan tujuan sudah ada budget. Hapus dulu atau update manual.",
      };
    }

    // Copy semua budget
    const created = await prisma.budget.createMany({
      data: sourceBudgets.map((b) => ({
        userId,
        categoryId: b.categoryId,
        month: data.toMonth,
        year: data.toYear,
        amount: b.amount,
      })),
    });

    return { count: created.count };
  }
}

export const budgetService = new BudgetService();
