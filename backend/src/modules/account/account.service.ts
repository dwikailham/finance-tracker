import prisma from "../../config/database.js";
import { CreateAccountInput, UpdateAccountInput } from "./account.schema.js";

export class AccountService {
  async getAll(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: "asc" },
    });
    return accounts;
  }

  async getById(userId: string, accountId: string) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw { statusCode: 404, message: "Rekening tidak ditemukan" };
    }

    return account;
  }

  async create(userId: string, data: CreateAccountInput) {
    const account = await prisma.account.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        balance: data.initialBalance,
        initialBalance: data.initialBalance,
        icon: data.icon,
        color: data.color,
      },
    });

    return account;
  }

  async update(userId: string, accountId: string, data: UpdateAccountInput) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw { statusCode: 404, message: "Rekening tidak ditemukan" };
    }

    const updated = await prisma.account.update({
      where: { id: accountId },
      data,
    });

    return updated;
  }

  async archive(userId: string, accountId: string) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw { statusCode: 404, message: "Rekening tidak ditemukan" };
    }

    await prisma.account.update({
      where: { id: accountId },
      data: { isArchived: true },
    });
  }
}

export const accountService = new AccountService();
