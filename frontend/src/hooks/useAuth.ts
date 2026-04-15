import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { LoginPayload, RegisterPayload } from "../types/auth.types";
import { message } from "antd";

export function useProfile() {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUTH, "profile"],
    queryFn: async () => {
      const { data } = await authApi.getProfile();
      return data.data;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await authApi.login(payload);
      return data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      queryClient.setQueryData(["auth", "profile"], data.user);
      message.success("Login berhasil!");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Login gagal");
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await authApi.register(payload);
      return data.data;
    },
    onSuccess: () => {
      message.success("Registrasi berhasil! Silakan login.");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Registrasi gagal");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}
