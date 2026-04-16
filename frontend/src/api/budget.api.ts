import apiClient from "./client";
import type { ApiResponse } from "../types/api.types";
import type {
  BudgetItem,
  BudgetSummary,
  CreateBudgetPayload,
  CopyBudgetPayload,
} from "../types/budget.types";

export const budgetApi = {
  getByMonth: (month: number, year: number) =>
    apiClient.get<ApiResponse<BudgetItem[]>>("/budgets", { params: { month, year } }),

  getSummary: (month: number, year: number) =>
    apiClient.get<ApiResponse<BudgetSummary>>("/budgets/summary", {
      params: { month, year },
    }),

  create: (data: CreateBudgetPayload) =>
    apiClient.post<ApiResponse<BudgetItem>>("/budgets", data),

  update: (id: string, amount: number) =>
    apiClient.put<ApiResponse<BudgetItem>>(`/budgets/${id}`, { amount }),

  delete: (id: string) => apiClient.delete<ApiResponse>(`/budgets/${id}`),

  copy: (data: CopyBudgetPayload) =>
    apiClient.post<ApiResponse<{ count: number }>>("/budgets/copy", data),
};
