import { useQuery } from "@tanstack/react-query";
import { reportApi } from "../api/report.api";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["reports", "dashboard-summary"],
    queryFn: async () => {
      const { data } = await reportApi.getDashboardSummary();
      return data.data;
    },
  });
}

export function useMonthlyReport(month: number, year: number) {
  return useQuery({
    queryKey: ["reports", "monthly", month, year],
    queryFn: async () => {
      const { data } = await reportApi.getMonthlyReport(month, year);
      return data.data;
    },
    enabled: !!month && !!year,
  });
}

export function useTrend(months: number = 6) {
  return useQuery({
    queryKey: ["reports", "trend", months],
    queryFn: async () => {
      const { data } = await reportApi.getTrend(months);
      return data.data;
    },
  });
}

export function useCategoryBreakdown(month: number, year: number) {
  return useQuery({
    queryKey: ["reports", "category-breakdown", month, year],
    queryFn: async () => {
      const { data } = await reportApi.getCategoryBreakdown(month, year);
      return data.data;
    },
    enabled: !!month && !!year,
  });
}

export function useBudgetVsActual(month: number, year: number) {
  return useQuery({
    queryKey: ["reports", "budget-vs-actual", month, year],
    queryFn: async () => {
      const { data } = await reportApi.getBudgetVsActual(month, year);
      return data.data;
    },
    enabled: !!month && !!year,
  });
}
