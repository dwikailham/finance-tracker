import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionApi } from "../api/transaction.api";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { CreateTransactionPayload, UpdateTransactionPayload, TransactionFilters } from "../types/transaction.types";
import { message } from "antd";

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, filters],
    queryFn: async () => {
      const { data } = await transactionApi.getAll(filters);
      return { data: data.data, meta: data.meta };
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, id],
    queryFn: async () => {
      const { data } = await transactionApi.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      transactionApi.create(payload).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS }); // Saldo berubah
      message.success("Transaksi berhasil ditambahkan");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Gagal menambahkan transaksi");
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionPayload }) =>
      transactionApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      message.success("Transaksi berhasil diperbarui");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Gagal memperbarui transaksi");
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      message.success("Transaksi berhasil dihapus");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Gagal menghapus transaksi");
    },
  });
}
