import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../api/category.api";
import { QUERY_KEYS } from "../constants/queryKeys";
import { message } from "antd";

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: async () => {
      const { data } = await categoryApi.getAll();
      return data.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; type: "income" | "expense"; icon?: string; color?: string }) =>
      categoryApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      message.success("Kategori berhasil ditambahkan");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Gagal menambahkan kategori");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; icon?: string; color?: string } }) =>
      categoryApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      message.success("Kategori berhasil diperbarui");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Gagal memperbarui kategori");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      message.success("Kategori berhasil dihapus");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Gagal menghapus kategori");
    },
  });
}
