import type { Category } from "./category.types";
import type { Account } from "./account.types";

export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  transactionDate: string;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations (included in API response)
  category: Pick<Category, "id" | "name" | "icon" | "color" | "type">;
  account: Pick<Account, "id" | "name" | "icon" | "type">;
  toAccount: Pick<Account, "id" | "name" | "icon" | "type"> | null;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId?: string;
  categoryId: string;
  description?: string;
  transactionDate: string; // YYYY-MM-DD
}

export interface UpdateTransactionPayload {
  amount?: number;
  categoryId?: string;
  description?: string | null;
  transactionDate?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "transactionDate" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
}
