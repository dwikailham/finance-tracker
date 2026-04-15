import apiClient from "./client";
import type { ApiResponse } from "../types/api.types";
import type { User, LoginPayload, RegisterPayload, LoginResponse } from "../types/auth.types";

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<ApiResponse<User>>("/auth/register", data),

  login: (data: LoginPayload) =>
    apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data),

  logout: () => apiClient.post<ApiResponse>("/auth/logout"),

  getProfile: () => apiClient.get<ApiResponse<User>>("/auth/me"),

  refreshToken: () => apiClient.post<ApiResponse<{ accessToken: string }>>("/auth/refresh"),
};
