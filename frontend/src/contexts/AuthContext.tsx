import React, { createContext, useContext } from "react";
import { useProfile } from "../hooks/useAuth";
import type { User } from "../types/auth.types";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  refreshUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useProfile();
  const hasToken = !!localStorage.getItem("accessToken");
  const queryClient = useQueryClient();

  const refreshUser = () => {
    queryClient.invalidateQueries({ queryKey: ["auth", "get-profile"] });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user && !isError,
        isLoading: hasToken && isLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
