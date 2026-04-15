import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "../api/account.api";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { CreateAccountPayload, UpdateAccountPayload } from "../types/account.types";
import { message } from "antd";

export function useAccounts() {
  return useQuery({
    queryKey: QUERY_KEYS.ACCOUNTS,
    queryFn: async () => {
      const { data } = await accountApi.getAll();
      return data.data;
    },
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ["accounts", id],
    queryFn: async () => {
      const { data } = await accountApi.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      accountApi.create(payload).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      message.success("Rekening berhasil ditambahkan");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Gagal menambahkan rekening");
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountPayload }) =>
      accountApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      message.success("Rekening berhasil diperbarui");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Gagal memperbarui rekening");
    },
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      message.success("Rekening berhasil diarsipkan");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Gagal mengarsipkan rekening");
    },
  });
}
