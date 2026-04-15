import apiClient from "./client";
import type { ApiResponse } from "../types/api.types";
import type { Account, CreateAccountPayload, UpdateAccountPayload } from "../types/account.types";

export const accountApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Account[]>>("/accounts"),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Account>>(`/accounts/${id}`),

  create: (data: CreateAccountPayload) =>
    apiClient.post<ApiResponse<Account>>("/accounts", data),

  update: (id: string, data: UpdateAccountPayload) =>
    apiClient.put<ApiResponse<Account>>(`/accounts/${id}`, data),

  archive: (id: string) =>
    apiClient.delete<ApiResponse>(`/accounts/${id}`),
};
