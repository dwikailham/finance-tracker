import apiClient from "./client";
import type { ApiResponse } from "../types/api.types";
import type { Category } from "../types/category.types";

export const categoryApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Category[]>>("/categories"),

  create: (data: { name: string; type: "income" | "expense"; icon?: string; color?: string }) =>
    apiClient.post<ApiResponse<Category>>("/categories", data),

  update: (id: string, data: { name?: string; icon?: string; color?: string }) =>
    apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/categories/${id}`),
};
