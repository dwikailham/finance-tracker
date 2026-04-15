import apiClient from "./client";
import type { ApiResponse } from "../types/api.types";
import type {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionFilters,
} from "../types/transaction.types";

export const transactionApi = {
  getAll: (filters?: TransactionFilters) =>
    apiClient.get<ApiResponse<Transaction[]>>("/transactions", { params: filters }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`),

  create: (data: CreateTransactionPayload) =>
    apiClient.post<ApiResponse<Transaction>>("/transactions", data),

  update: (id: string, data: UpdateTransactionPayload) =>
    apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/transactions/${id}`),
};
