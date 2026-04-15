import React, { createContext, useContext } from "react";
import { useProfile } from "../hooks/useAuth";
import type { User } from "../types/auth.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useProfile();
  const hasToken = !!localStorage.getItem("accessToken");

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user && !isError,
        isLoading: hasToken && isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
