import apiClient from "./client";
import type { ApiResponse } from "../types/api.types";

export const reportApi = {
  getDashboardSummary: () =>
    apiClient.get<ApiResponse<any>>("/reports/dashboard/summary"),

  getMonthlyReport: (month: number, year: number) =>
    apiClient.get<ApiResponse<any>>("/reports/monthly", { params: { month, year } }),

  getTrend: (months: number = 6) =>
    apiClient.get<ApiResponse<any>>("/reports/trend", { params: { months } }),

  getCategoryBreakdown: (month: number, year: number) =>
    apiClient.get<ApiResponse<any>>("/reports/category-breakdown", { params: { month, year } }),

  getBudgetVsActual: (month: number, year: number) =>
    apiClient.get<ApiResponse<any>>("/reports/budget-vs-actual", { params: { month, year } }),
};
