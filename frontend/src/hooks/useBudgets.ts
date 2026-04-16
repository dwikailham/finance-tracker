import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetApi } from "../api/budget.api";
import type { CreateBudgetPayload, CopyBudgetPayload } from "../types/budget.types";
import { message } from "antd";

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: ["budgets", month, year],
    queryFn: async () => {
      const { data } = await budgetApi.getByMonth(month, year);
      return data.data;
    },
  });
}

export function useBudgetSummary(month: number, year: number) {
  return useQuery({
    queryKey: ["budgets", "summary", month, year],
    queryFn: async () => {
      const { data } = await budgetApi.getSummary(month, year);
      return data.data;
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) =>
      budgetApi.create(payload).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      message.success("Budget berhasil ditambahkan");
    },
    onError: (err: any) =>
      message.error(err.response?.data?.message || "Gagal menambahkan budget"),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      budgetApi.update(id, amount).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      message.success("Budget berhasil diperbarui");
    },
    onError: (err: any) =>
      message.error(err.response?.data?.message || "Gagal memperbarui budget"),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      message.success("Budget berhasil dihapus");
    },
  });
}

export function useCopyBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CopyBudgetPayload) =>
      budgetApi.copy(payload).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      message.success(`${data.count} budget berhasil di-copy`);
    },
    onError: (err: any) =>
      message.error(err.response?.data?.message || "Gagal copy budget"),
  });
}
