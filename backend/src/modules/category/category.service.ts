import prisma from "../../config/database.js";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.schema.js";

export class CategoryService {
  async getAll(userId: string) {
    // Ambil default categories + custom categories milik user
    const categories = await prisma.category.findMany({
      where: {
        OR: [{ isDefault: true }, { userId }],
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
    return categories;
  }

  async create(userId: string, data: CreateCategoryInput) {
    const category = await prisma.category.create({
      data: {
        ...data,
        userId,
        isDefault: false,
      },
    });
    return category;
  }

  async update(userId: string, categoryId: string, data: UpdateCategoryInput) {
    // Pastikan kategori milik user dan bukan default
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId, isDefault: false },
    });

    if (!category) {
      throw {
        statusCode: 404,
        message: "Kategori tidak ditemukan atau tidak boleh diubah",
      };
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data,
    });
    return updated;
  }

  async delete(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId, isDefault: false },
    });

    if (!category) {
      throw {
        statusCode: 404,
        message: "Kategori tidak ditemukan atau tidak boleh dihapus",
      };
    }

    // Cek apakah ada transaksi yang menggunakan kategori ini
    const transactionCount = await prisma.transaction.count({
      where: { categoryId },
    });

    if (transactionCount > 0) {
      throw {
        statusCode: 400,
        message: `Kategori tidak bisa dihapus karena masih digunakan oleh ${transactionCount} transaksi`,
      };
    }

    await prisma.category.delete({ where: { id: categoryId } });
  }
}

export const categoryService = new CategoryService();
